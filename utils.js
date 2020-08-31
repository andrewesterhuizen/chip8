export const getNibbles = (instruction) => {
  const a = (instruction & 0xf000) >> 12;
  const b = (instruction & 0x0f00) >> 8;
  const c = (instruction & 0x00f0) >> 4;
  const d = instruction & 0x000f;
  return [a, b, c, d];
};

export const nibblesToByte = (a, b) => {
  return (a << 4) | b;
};
