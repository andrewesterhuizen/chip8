// @ts-check

import RomLoader from "./RomLoader.js";
import VM from "../lib/VM.js";
import Assembler from "../lib/Assembler.js";

const main = async () => {
  const romLoader = new RomLoader();
  const rom = await romLoader.load("/c8games/INVADERS");

  const vm = new VM();
  vm.loadRom(rom);
  vm.start();
};

main();
