export default class Sound {
  context;
  gainNode;

  volume = 0.25;

  constructor() {
    this.context = new AudioContext();
    const oscNode = this.context.createOscillator();
    oscNode.frequency.value = 200;
    oscNode.type = "square";

    oscNode.start();

    const gainNode = this.context.createGain();
    gainNode.gain.value = 0;

    oscNode.connect(gainNode);
    gainNode.connect(this.context.destination);

    gainNode.gain.value = 0;

    this.gainNode = gainNode;
  }

  start() {
    console.log("Sound: start");
    this.gainNode.gain.value = this.volume;
  }
  stop() {
    console.log("Sound: stop");
    this.gainNode.gain.value = 0;
  }
}
