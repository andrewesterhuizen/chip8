// @ts-check

import Assembler from "./Assembler.js";
import RomLoader from "./RomLoader.js";
import Screen from "./Screen.js";
import CPU from "./CPU.js";

const main = async () => {
  const romLoader = new RomLoader();
  const rom = await romLoader.load("/roms/IBM Logo.ch8");

  const source = `
          CLS
          LD I, 0xfff
          LD V0, 0x1
          LD V1, 0x1
          DRW V0, V1, 0x1

          HALT
    `;

  const assembler = new Assembler(source);
  const instructions = assembler.getInstructions();

  console.log(instructions);

  const screen = new Screen();
  const cpu = new CPU(screen);
  cpu.load(instructions);
  cpu.start();
};

main();
