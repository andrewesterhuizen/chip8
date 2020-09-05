import RomLoader from "./RomLoader.js";
import VM from "../lib/VM.js";
import Assembler from "../lib/Assembler.js";

const main = async () => {
  const romLoader = new RomLoader();
  const rom = await romLoader.load("/c8games/TETRIS");

  const source = `
  LD V3, V0
  LD F, V3

  DRW V0, V1, 0x5

  DRW V0, V1, 0x5

loop:
  JP loop
`;

  const assembler = new Assembler(source);
  // const rom = assembler.getInstructions();

  const vm = new VM();
  vm.loadRom(rom);
  vm.start(1 / 60);
};

main();
