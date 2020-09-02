// @ts-check

import Assembler from "./Assembler.js";
import RomLoader from "./RomLoader.js";
import Screen from "./peripherals/Screen.js";
import CPU from "./CPU.js";
import Sound from "./peripherals/Sound.js";
import Keyboard from "./peripherals/Keyboard.js";

const main = async () => {
  const romLoader = new RomLoader();
  const rom = await romLoader.load("/roms/IBM Logo.ch8");

  //   const source = `
  // start:
  //     ADD V0, 0x2
  //     LD I, 0x0
  //     DRW V0, V1, 0x5
  //     JP start
  //     `;

  //   const assembler = new Assembler(source);
  //   const instructions = assembler.getInstructions();

  //   console.log(instructions);

  const screen = new Screen();
  const keyboard = new Keyboard();
  const sound = new Sound();
  const cpu = new CPU(screen, keyboard, sound);
  cpu.load(rom);
  cpu.printRAM();
  cpu.start();
};

main();
