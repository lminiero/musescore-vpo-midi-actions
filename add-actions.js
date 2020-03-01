var minimist = require('minimist');
var fs = require('fs');
var unzipper = require('unzipper');
var xml2js = require('xml2js');
var admzip = require('adm-zip');

var config = null, input = null, output = null;
var mscx = null;

// Parse the command line arguments
var args = minimist(process.argv.slice(2), {
	alias: {
		h: 'help',
		v: 'version',
		c: 'config',
		i: 'input',
		o: 'output'
	}
});
console.log('MuseScore MidiAction to instruments.xml v0.0.1');
console.log('----------------------------------------------');
if(args.help || args.version || !args.input) {
	console.log('add-actions.js [-h|--help] [-v|--version] [-c|--config custom-config.js] -i input.mscz [-o output.mscz]');
	process.exit(0);
}
config = args.config ? args.config : './config.js';
input = args.input;
output = args.output ? args.output : input;
console.log();
console.log('Configuration: ' + config);
console.log('Input file:    ' + input);
console.log('Output file:   ' + output);
console.log();

// Open the configuration file
var cfg = require(config);
if(!cfg || typeof(cfg) !== 'object') {
	console.log('Invalid configuration file');
	process.exit(1);
}
if(!cfg.tmpFolder || typeof(cfg.tmpFolder) !== 'string') {
	console.log('Invalid configuration file (tmpFolder is not a string)');
	process.exit(1);
}
if(cfg.actions && typeof(cfg.midiActions) !== 'object') {
	console.log('Invalid configuration file (midiActions is not an object)');
	process.exit(1);
}

// Unzip the mscx file
fs.createReadStream(input)
	.pipe(unzipper.Parse())
	.on('entry', function(entry) {
		const filename = entry.path;
		if(filename.toLowerCase().endsWith('.mscx')) {
			console.log('Extracting file:', filename);
			entry.pipe(fs.createWriteStream(cfg.tmpFolder + '/' + filename));
			mscx = filename;
		} else {
			entry.autodrain();
		}
	})
	.on('close', function() {
		openMscx();
	});

// Import the .mscx XML file
function openMscx() {
	console.log('Parsing .mscx file:', mscx);
	var parser = new xml2js.Parser();
	fs.readFile(cfg.tmpFolder + '/' + mscx, function(err, data) {
		parser.parseString(data, function (err, result) {
			addMidiActions(result);
		});
	});
}

// Tweak the XML content by adding the MIDI actions
function addMidiActions(obj) {
	console.log('Processing XML content:', obj);
	if(!obj || !obj.museScore || !obj.museScore['$'] || !obj.museScore.Score) {
		console.error('Not a MuseScore file...');
		process.exit(1);
	}
	// We only support MuseScore 3.x
	if(parseInt(obj.museScore['$'].version) != 3) {
		console.error('Not a MuseScore 3.x file... (score is version ' + obj.museScore['$'].version + ')');
		process.exit(1);
	}
	// Iterate on all parts
	var parts = obj.museScore.Score[0].Part;
	console.log('There are ' + parts.length + ' in the score');
	for(var part of parts) {
		//~ console.log(part);
		var name = part.trackName[0];
		var instrument = part.Instrument[0].instrumentId[0];
		console.log('  -- ' + name + ' (' + instrument + ')');
		if(cfg.midiActions && cfg.midiActions[instrument]) {
			// Add some MIDI actions for groups
			if(Array.isArray(cfg.midiActions[instrument])) {
				if(!part.Instrument[0].MidiAction || part.Instrument[0].MidiAction.length === 0) {
					part.Instrument[0].MidiAction = cfg.midiActions[instrument];
				} else {
					for(var ma in cfg.midiActions[instrument])
						part.Instrument[0].MidiAction.push(ma);
				}
			}
		}
	}
	// Regenerate the XML data and save
	console.log('Regenerating XML data');
	var builder = new xml2js.Builder();
	var xml = builder.buildObject(obj);
	saveToMscz(xml);
}

// Save the XML back to .mscx, and update the content of the .mscz file
function saveToMscz(xml) {
	console.log('Adding .mscx file back to .mscz');
	//~ fs.writeFileSync(cfg.tmpFolder + '/LM-' + mscx, xml);
	if(output !== input)
		fs.copyFileSync(input, output);
	// Open the zip file and replace the old .mscx file
	var zip = new admzip(output);
	zip.updateFile(mscx, Buffer.from(xml));
	zip.writeZip(output);
	var stats = fs.statSync(output);
	console.log('  -- ' + output + ' (' + stats['size'] + ' bytes)');
	// We're done
	console.log('Bye!');
}
