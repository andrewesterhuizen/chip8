// @ts-check
import Screen from "./peripherals/Screen.js";
import Keyboard from "./peripherals/Keyboard.js";
import Sound from "./peripherals/Sound.js";
import CPU from "./CPU.js";

export default class VM {
  constructor(debug = false) {
    this.debug = debug;
    const screen = new Screen();
    const keyboard = new Keyboard();
    const sound = new Sound();
    this.cpu = new CPU(screen, keyboard, sound);
  }

  loadRom(rom) {
    this.cpu.load(rom);
    if (this.debug) {
      this.cpu.printRAM();
    }
  }

  start() {
    this.cpu.start();
  }
}
