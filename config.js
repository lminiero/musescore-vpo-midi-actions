var config = {};

// This is where we save the .mscx file to work on
config.tmpFolder = '/tmp';

// Set of MIDI actions we'll add to a score using this configuration,
// indexed by instrumentId: e.g., the object associated to 'strings.group'
// would be added to violins, violas, celli and basses, while 'brass.tuba'
// would be the actions to add to the tuba instead. Notice that the objects
// must be compliant with what xml2js makes use of when building XMLs:
//		https://www.npmjs.com/package/xml2js#xml-builder-usage
// These actions correspond to something our custom .sfz files can handle
// and react to accordingly. In all of those files, we always use CC 14
// (which is apparently unassigned), and use these values to trigger the
// following behaviours:
//		0 = sustain
//		1 = tremolo
//		2 = mod-wheel
//		3 = accent
//		4 = staccato
//		5 = pizzicato
// so we create some objects for each of the above, and for the different
// instruments we just specify what to add (e.g., pizzicato will be needed
// for strings, but not for woodwinds). Should you need a different
// behaviour, e.g., different CC numbers and values for different
// instruments, create a different config file and set the MIDI action
// objects directly on the related group, instead of templating as we do
var sustain = {
	$: { name: "cc14_0" },
	descr: "Send CC14 0-19 (sustain)",
	controller: { $: { ctrl: "14", value: "0" } }
};
var tremolo = {
	$: { name: "cc14_1" },
	descr: "Send CC14 20-39 (tremolo)",
	controller: { $: { ctrl: "14", value: "20" } }
};
var modWheel = {
	$: { name: "cc14_2" },
	descr: "Send CC14 40-59 (mod-wheel)",
	controller: { $: { ctrl: "14", value: "40" } }
};
var accent = {
	$: { name: "cc14_3" },
	descr: "Send CC14 60-79 (accent)",
	controller: { $: { ctrl: "14", value: "60" } }
};
var staccato = {
	$: { name: "cc14_4" },
	descr: "Send CC14 80-99 (staccato)",
	controller: { $: { ctrl: "14", value: "80" } }
};
var pizzicato = {
	$: { name: "cc14_5" },
	descr: "Send CC14 100-119 (pizzicato)",
	controller: { $: { ctrl: "14", value: "100" } }
}
// This is where we actually set which action to add to which instrument:
// notice that, even in the case of a single action, you'll need an array
config.midiActions = {
	// Flute
	'wind.flutes.flute': [
		sustain, modWheel, accent, staccato
	],
	// Oboe
	'wind.reed.oboe': [
		sustain, modWheel, accent, staccato
	],
	// Clarinet
	'wind.reed.clarinet.bflat': [
		sustain, modWheel, accent, staccato
	],
	// Bassoon
	'wind.reed.bassoon': [
		sustain, modWheel, accent, staccato
	],
	// French Horn
	'brass.french-horn': [
		sustain, modWheel, accent, staccato
	],
	// Trumpet
	'brass.trumpet.bflat': [
		sustain, modWheel, accent, staccato
	],
	// Trombone
	'brass.trombone': [
		sustain, modWheel, accent, staccato
	],
	// Tuba
	'brass.tuba': [
		sustain, modWheel, accent, staccato
	],
	// Violin
	'strings.violin': [
		sustain, tremolo, modWheel, accent, staccato, pizzicato
	],
	// Viola
	'strings.viola': [
		sustain, tremolo, modWheel, accent, staccato, pizzicato
	],
	// Viola
	'strings.viola': [
		sustain, tremolo, modWheel, accent, staccato, pizzicato
	],
	// Cello
	'strings.cello': [
		sustain, tremolo, modWheel, accent, staccato, pizzicato
	],
	// Contrabass
	'strings.contrabass': [
		sustain, tremolo, modWheel, accent, staccato, pizzicato
	],
	// Violins, violas, cellos, contrabasses
	'strings.group': [
		sustain, tremolo, modWheel, accent, staccato, pizzicato
	]
};

module.exports = config;
