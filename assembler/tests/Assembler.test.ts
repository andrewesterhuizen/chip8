import Assembler from "../Assembler";
const fs = require("fs");

const source = fs.readFileSync("./assembler/tests/IBM Logo.asm", { encoding: "utf8" });
const rom = fs.readFileSync("./assembler/tests/IBM Logo.ch8");

const matchBin = (a: any, b: any, ln: number, l: string) => {
  if (a !== b) {
    throw new Error(`
failed at line ${ln} | ${l}
expected 0x${a.toString(16)}, got: 0x${b.toString(16)}`);
  }
};

const to2ByteStrings = (ins: Uint8Array) => {
  const strs: string[] = [];

  let tmp: number[] = [];

  ins.forEach((i) => {
    tmp.push(i);

    if (tmp.length === 2) {
      strs.push(
        tmp
          .map((n) => n.toString(16))
          .join("")
          .padStart(4, "0")
      );
      tmp = [];
    }
  });

  return strs;
};

// test("compiles IBM logo source", () => {
//   const a = new Assembler(source);

//   let out = new Uint8Array(0);

//   expect(() => {
//     out = a.getInstructions();
//   }).not.toThrow();

//   const romHex = to2ByteStrings(rom);
//   const instrHex = to2ByteStrings(out);
//   const sourceLines = source
//     .split("\n")
//     .filter((l) => !l.includes(":"))
//     .map((l) => l.trim());

//   for (let i = 0; i < romHex.length; i++) {
//     expect(() => matchBin(romHex[i], instrHex[i], i + 1, sourceLines[i])).not.toThrow();
//   }
// });

const u8a = (a) => new Uint8Array(a);
const td = (i: string, o: number) => ({ input: i, output: o });

const basicInstructionsTestData2 = [
  // 00E0 - CLS
  td("CLS", 0x00e0),
  // 00EE - RET
  td("RET", 0x00ee),
  // 1nnn - JP addr
  td("JP 0xfff", 0x1fff),
  td("JP 0xf0f", 0x1f0f),
  td("JP 0xff", 0x10ff),
  td("JP 0xf0", 0x10f0),
  td("JP 0x0f", 0x100f),
  td("JP 0x0", 0x1000),
  // 2nnn - CALL addr
  td("CALL 0xfff", 0x2fff),
  td("CALL 0xf0f", 0x2f0f),
  td("CALL 0xff", 0x20ff),
  td("CALL 0xf0", 0x20f0),
  td("CALL 0x0f", 0x200f),
  td("CALL 0x0", 0x2000),
  // 3xkk - SE Vx, byte
  td("SE V0, 0xff", 0x30ff),
  td("SE V0, 0xf0", 0x30f0),
  td("SE V0, 0x0f", 0x300f),
  td("SE V0, 0x0", 0x3000),
  td("SE V1, 0x0", 0x3100),
  td("SE VA, 0x0", 0x3a00),
  td("SE VF, 0x0", 0x3f00),
  // 4xkk - SNE Vx, byte
  td("SNE V0, 0xff", 0x40ff),
  td("SNE V0, 0xf0", 0x40f0),
  td("SNE V0, 0x0f", 0x400f),
  td("SNE V0, 0x0", 0x4000),
  td("SNE V1, 0x0", 0x4100),
  td("SNE VA, 0x0", 0x4a00),
  td("SNE VF, 0x0", 0x4f00),
  // 5xy0 - SE Vx, Vy
  td("SE V0, V0", 0x5000),
  td("SE V0, V1", 0x5010),
  td("SE V1, V0", 0x5100),
  td("SE VA, VA", 0x5aa0),
  td("SE Vf, Vf", 0x5ff0),
  // 6xkk - LD Vx, byte
  td("LD V0, 0x1", 0x6001),
  td("LD V1, 0x1", 0x6101),
  td("LD VA, 0x1", 0x6a01),
  td("LD Vf, 0x1", 0x6f01),
  td("LD V1, 0x01", 0x6101),
  td("LD V1, 0x10", 0x6110),
  td("LD V1, 0x11", 0x6111),
  td("LD V1, 0xf", 0x610f),
  td("LD V1, 0xf0", 0x61f0),
  td("LD V1, 0xff", 0x61ff),
  // 7xkk - ADD Vx, byte
  td("ADD V0, 0x1", 0x7001),
  td("ADD V1, 0x1", 0x7101),
  td("ADD VA, 0x1", 0x7a01),
  td("ADD Vf, 0x1", 0x7f01),
  td("ADD V1, 0x01", 0x7101),
  td("ADD V1, 0x10", 0x7110),
  td("ADD V1, 0x11", 0x7111),
  td("ADD V1, 0xf", 0x710f),
  td("ADD V1, 0xf0", 0x71f0),
  td("ADD V1, 0xff", 0x71ff),
  // 8xy0 - LD Vx, Vy
  td("LD V0, V0", 0x8000),
  td("LD V0, V1", 0x8010),
  td("LD V1, V0", 0x8100),
  td("LD V1, V1", 0x8110),
  td("LD V0, VA", 0x80a0),
  td("LD VA, V0", 0x8a00),
  td("LD VA, VA", 0x8aa0),
  // 8xy1 - OR Vx, Vy
  td("OR V0, V0", 0x8001),
  td("OR V0, V1", 0x8011),
  td("OR V1, V0", 0x8101),
  td("OR V1, V1", 0x8111),
  td("OR V0, VA", 0x80a1),
  td("OR VA, V0", 0x8a01),
  td("OR VA, VA", 0x8aa1),
  // 8xy2 - AND Vx, Vy
  td("AND V0, V0", 0x8002),
  td("AND V0, V1", 0x8012),
  td("AND V1, V0", 0x8102),
  td("AND V1, V1", 0x8112),
  td("AND V0, VA", 0x80a2),
  td("AND VA, V0", 0x8a02),
  td("AND VA, VA", 0x8aa2),
  // 8xy3 - XOR Vx, Vy
  td("XOR V0, V0", 0x8003),
  td("XOR V0, V1", 0x8013),
  td("XOR V1, V0", 0x8103),
  td("XOR V1, V1", 0x8113),
  td("XOR V0, VA", 0x80a3),
  td("XOR VA, V0", 0x8a03),
  td("XOR VA, VA", 0x8aa3),
  // 8xy4 - ADD Vx, Vy
  td("ADD V0, V0", 0x8004),
  td("ADD V0, V1", 0x8014),
  td("ADD V1, V0", 0x8104),
  td("ADD V1, V1", 0x8114),
  td("ADD V0, VA", 0x80a4),
  td("ADD VA, V0", 0x8a04),
  td("ADD VA, VA", 0x8aa4),
  // 8xy5 - SUB Vx, Vy
  td("SUB V0, V0", 0x8005),
  td("SUB V0, V1", 0x8015),
  td("SUB V1, V0", 0x8105),
  td("SUB V1, V1", 0x8115),
  td("SUB V0, VA", 0x80a5),
  td("SUB VA, V0", 0x8a05),
  td("SUB VA, VA", 0x8aa5),
  // 8xy6 - SHR Vx {, Vy}
  td("SHR V0, V0", 0x8006),
  td("SHR V0, V1", 0x8016),
  td("SHR V1, V0", 0x8106),
  td("SHR V1, V1", 0x8116),
  td("SHR V0, VA", 0x80a6),
  td("SHR VA, V0", 0x8a06),
  td("SHR VA, VA", 0x8aa6),
  td("SHR V0", 0x8006),
  // 8xy7 - SUBN Vx, Vy
  td("SUBN V0, V0", 0x8007),
  td("SUBN V0, V1", 0x8017),
  td("SUBN V1, V0", 0x8107),
  td("SUBN V1, V1", 0x8117),
  td("SUBN V0, VA", 0x80a7),
  td("SUBN VA, V0", 0x8a07),
  td("SUBN VA, VA", 0x8aa7),
  // 8xyE - SHL Vx {, Vy}
  td("SHL V0, V0", 0x800e),
  td("SHL V0, V1", 0x801e),
  td("SHL V1, V0", 0x810e),
  td("SHL V1, V1", 0x811e),
  td("SHL V0, VA", 0x80ae),
  td("SHL VA, V0", 0x8a0e),
  td("SHL VA, VA", 0x8aae),
  td("SHL V0", 0x800e),
  // 9xy0 - SNE Vx, Vy
  td("SNE V0, V0", 0x9000),
  td("SNE V0, V1", 0x9010),
  td("SNE V1, V0", 0x9100),
  td("SNE V1, V1", 0x9110),
  td("SNE V0, VA", 0x90a0),
  td("SNE VA, V0", 0x9a00),
  td("SNE VA, VA", 0x9aa0),
  // Annn - LD I, addr
  td("LD I, 0x1", 0xa001),
  td("LD I, 0x10", 0xa010),
  td("LD I, 0x100", 0xa100),
  td("LD I, 0x101", 0xa101),
  td("LD I, 0x011", 0xa011),
  td("LD I, 0x111", 0xa111),
  td("LD I, 0xa", 0xa00a),
  td("LD I, 0xa0", 0xa0a0),
  td("LD I, 0xa00", 0xaa00),
  td("LD I, 0xa0a", 0xaa0a),
  td("LD I, 0x0aa", 0xa0aa),
  td("LD I, 0xaaa", 0xaaaa),
  // Bnnn - JP V0, addr
  td("JP V0, 0x1", 0xb001),
  td("JP V0, 0x10", 0xb010),
  td("JP V0, 0x100", 0xb100),
  td("JP V0, 0x101", 0xb101),
  td("JP V0, 0x011", 0xb011),
  td("JP V0, 0x111", 0xb111),
  td("JP V0, 0xa", 0xb00a),
  td("JP V0, 0xa0", 0xb0a0),
  td("JP V0, 0xa00", 0xba00),
  td("JP V0, 0xa0a", 0xba0a),
  td("JP V0, 0x0aa", 0xb0aa),
  td("JP V0, 0xaaa", 0xbaaa),
  // Cxkk - RND Vx, byte
  td("RND V0, 0x1", 0xc001),
  td("RND V1, 0x1", 0xc101),
  td("RND VA, 0x1", 0xca01),
  td("RND Vf, 0x1", 0xcf01),
  td("RND V1, 0x01", 0xc101),
  td("RND V1, 0x10", 0xc110),
  td("RND V1, 0x11", 0xc111),
  td("RND V1, 0xf", 0xc10f),
  td("RND V1, 0xf0", 0xc1f0),
  td("RND V1, 0xff", 0xc1ff),
  // Dxyn - DRW Vx, Vy, nibble
  td("DRW V0, V0, 0x1", 0xd001),
  td("DRW V1, V0, 0x1", 0xd101),
  td("DRW V0, V1, 0x1", 0xd011),
  // Ex9E - SKP Vx
  td("SKP V0", 0xe09e),
  td("SKP V1", 0xe19e),
  td("SKP VA", 0xea9e),
  td("SKP VF", 0xef9e),
  // ExA1 - SKNP Vx
  td("SKNP V0", 0xe0a1),
  td("SKNP V1", 0xe1a1),
  td("SKNP VA", 0xeaa1),
  td("SKNP VF", 0xefa1),
  // Fx07 - LD Vx, DT
  td("LD V0, DT", 0xf007),
  td("LD V1, DT", 0xf107),
  td("LD VA, DT", 0xfa07),
  td("LD VF, DT", 0xff07),
  // Fx0A - LD Vx, K
  td("LD V0, K", 0xf00a),
  td("LD V1, K", 0xf10a),
  td("LD VA, K", 0xfa0a),
  td("LD VF, K", 0xff0a),
  // Fx15 - LD DT, Vx
  td("LD DT, V0", 0xf015),
  td("LD DT, V1", 0xf115),
  td("LD DT, VA", 0xfa15),
  td("LD DT, VF", 0xff15),
  // Fx18 - LD ST, Vx
  td("LD ST, V0", 0xf018),
  td("LD ST, V1", 0xf118),
  td("LD ST, VA", 0xfa18),
  td("LD ST, VF", 0xff18),
  // Fx1E - ADD I, Vx
  td("ADD I, V0", 0xf01e),
  td("ADD I, V1", 0xf11e),
  td("ADD I, VA", 0xfa1e),
  td("ADD I, VF", 0xff1e),
  // Fx29 - LD F, Vx
  td("LD F, V0", 0xf029),
  td("LD F, V1", 0xf129),
  td("LD F, VA", 0xfa29),
  td("LD F, VF", 0xff29),
  // Fx33 - LD B, Vx
  td("LD B, V0", 0xf033),
  td("LD B, V1", 0xf133),
  td("LD B, VA", 0xfa33),
  td("LD B, VF", 0xff33),
  // Fx55 - LD [I], Vx
  td("LD [I], V0", 0xf055),
  td("LD [I], V1", 0xf155),
  td("LD [I], VA", 0xfa55),
  td("LD [I], VF", 0xff55),
  // Fx65 - LD Vx, [I]
  td("LD V0, [I]", 0xf065),
  td("LD V1, [I]", 0xf165),
  td("LD VA, [I]", 0xfa65),
  td("LD VF, [I]", 0xff65),
];

const ths = (n: number, p: number = 0) => n.toString(16).padStart(p, "0");

basicInstructionsTestData2.forEach((t) => {
  test("assembles instruction " + t.input, () => {
    const a = new Assembler(t.input);

    let out = new Uint8Array(0);

    expect(() => {
      out = a.getInstructions();
    }).not.toThrow();

    const highByteString = ths(out[0], 2);
    const lowByteString = ths(out[1], 2);
    const instructionHex = `0x${(highByteString + lowByteString).padStart(4, "0")}`;
    const outHex = `0x${ths(t.output, 4)}`;
    expect(instructionHex).toBe(outHex);
  });
});
