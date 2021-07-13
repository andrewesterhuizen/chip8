import VM from "./lib/VM.js";

const loadRom = async (url) => {
  const request = await fetch(url);
  const buffer = await request.arrayBuffer();
  return new Uint8Array(buffer);
};

const rom = await loadRom("./c8games/PONG");
const vm = new VM();
vm.loadRom(rom);
vm.start(1 / 60);
