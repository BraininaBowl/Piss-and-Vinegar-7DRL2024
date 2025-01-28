function Kick(context) {
	this.context = context;
}

Kick.prototype.setup = function () {
	this.osc = this.context.createOscillator();
	this.gain = this.context.createGain();
	this.osc.connect(this.gain);
	this.gain.connect(this.context.destination);
};

Kick.prototype.trigger = function (time = context.currentTime) {
	this.setup();

	this.osc.frequency.setValueAtTime(150, time);
	this.gain.gain.setValueAtTime(1, time);

	this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
	this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

	this.osc.start(time);

	this.osc.stop(time + 0.5);
};

function Snare(context) {
	this.context = context;
}

Snare.prototype.setup = function () {
	this.noise = this.context.createBufferSource();
	this.noise.buffer = this.noiseBuffer();

	var noiseFilter = this.context.createBiquadFilter();
	noiseFilter.type = "highpass";
	noiseFilter.frequency.value = 1000;
	this.noise.connect(noiseFilter);

	this.noiseEnvelope = this.context.createGain();
	noiseFilter.connect(this.noiseEnvelope);

	this.noiseEnvelope.connect(this.context.destination);

	this.osc = this.context.createOscillator();
	this.osc.type = "triangle";

	this.oscEnvelope = this.context.createGain();
	this.osc.connect(this.oscEnvelope);
	this.oscEnvelope.connect(this.context.destination);
};

Snare.prototype.noiseBuffer = function () {
	var bufferSize = this.context.sampleRate;
	var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
	var output = buffer.getChannelData(0);

	for (var i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}

	return buffer;
};

Snare.prototype.trigger = function (time = context.currentTime) {
	this.setup();

	this.noiseEnvelope.gain.setValueAtTime(1, time);
	this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
	this.noise.start(time);

	this.osc.frequency.setValueAtTime(100, time);
	this.oscEnvelope.gain.setValueAtTime(0.7, time);
	this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
	this.osc.start(time);

	this.osc.stop(time + 0.2);
	this.noise.stop(time + 0.2);
};

var context = new AudioContext();

var setupMusic = function () {
	var kick = new Kick(context);
	var snare = new Snare(context);

	kick.trigger();
};

setupMusic();
