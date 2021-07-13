import RomLoader from "./RomLoader.js";
import VM from "../lib/VM.js";

const main = async () => {
  const romLoader = new RomLoader();
  const rom = await romLoader.load("/c8games/PONG");
  const vm = new VM();
  vm.loadRom(rom);
  vm.start(1 / 60);
};

main();
