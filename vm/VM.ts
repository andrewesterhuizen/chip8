import Screen, { newDOMScreen } from "./peripherals/Screen.js";
import Keyboard from "./peripherals/Keyboard.js";
import Sound from "./peripherals/Sound.js";
import CPU from "./CPU.js";

export default class VM {
  debug = false;
  cpu: CPU;
  screen: Screen;

  constructor(debug: boolean) {
    this.debug = debug;
    this.screen = newDOMScreen();
    const keyboard = new Keyboard();
    const sound = new Sound();
    this.cpu = new CPU(this.screen, keyboard, sound);
  }

  loadRom(rom: Uint8Array) {
    this.cpu.load(rom);
    if (this.debug) {
      this.cpu.printRAM();
    }
  }

  start(clockSpeedMS: number) {
    setInterval(() => {
      this.cpu.tick();
    }, clockSpeedMS);
  }
}
