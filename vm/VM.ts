import Screen, { newDOMScreen } from "./peripherals/Screen.js";
import Keyboard from "./peripherals/Keyboard.js";
import Sound from "./peripherals/Sound.js";
import CPU from "./CPU.js";

const infoEl = document.querySelector("#info");

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

  renderInfo() {
    infoEl.innerHTML = "";
    infoEl.innerHTML += `${this.cpu.registers.reduce((p, r, i) => {
      p += `V${i.toString(16).toUpperCase()}|`;
      return p;
    }, "|")}`;

    infoEl.innerHTML += " I  |";
    infoEl.innerHTML += "PC |";
    infoEl.innerHTML += "SP|";
    infoEl.innerHTML += "DT|";
    infoEl.innerHTML += "ST|";
    infoEl.innerHTML += "<br>";

    infoEl.innerHTML += `${this.cpu.registers.reduce((p, r, i) => {
      p += `${r.toString(16).padStart(2, "0")}|`;
      return p;
    }, "|")}`;

    infoEl.innerHTML += `${this.cpu.iRegister.toString(16).padStart(3, "0")}|`;
    infoEl.innerHTML += `${this.cpu.pc.toString(16).padStart(3, "0")}|`;
    infoEl.innerHTML += `${this.cpu.sp.toString(16).padStart(2, "0")}|`;
    infoEl.innerHTML += `${this.cpu.delayTimer.toString(16).padStart(2, "0")}|`;
    infoEl.innerHTML += `${this.cpu.soundTimer.toString(16).padStart(2, "0")}|`;

    infoEl.innerHTML += "<br>";

    const keyNumber = this.cpu.keyboard.getKeyNumber();
    const keyString = keyNumber ? keyNumber.toString(16)[0] : "-";
    infoEl.innerHTML += "key: " + keyString + " | " + this.cpu.keyboard.keyPressed;
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

    if (this.debug) {
      setInterval(() => {
        this.renderInfo();
      }, 1 / 20);
    }
  }
}
