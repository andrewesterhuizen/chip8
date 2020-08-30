// @ts-check

const nibblesToByte4 = (a, b, c, d) => {
  return (a << 12) | (b << 8) | (c << 4) | d;
};

export default class Assembler {
  program = "";
  constructor(program) {
    this.program = program;
  }

  parseLine(line) {
    const split = line.split(" ");
    const op = split.shift();

    let [a, b] = split.join("").split(",");
    if (!b) b = 0;

    switch (op) {
      case "LD": {
        const byte = parseInt(b.split("0x")[1], 16);
        return nibblesToByte4(
          0x6,
          parseInt(a[1]),
          (byte & 0xff00) << 4,
          byte & 0xff
        );
      }

      case "ADD": {
        if (b.startsWith("V")) {
          return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 4);
        } else {
          const byte = parseInt(b.split("0x")[1], 16);

          return nibblesToByte4(
            0x7,
            parseInt(a[1]),
            (byte & 0xff00) << 4,
            byte & 0xff
          );
        }
      }

      // 0x8
      case "MOV": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 0);
      }

      case "OR": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 1);
      }

      case "AND": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 2);
      }

      case "XOR": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 3);
      }

      case "SUB": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 5);
      }

      case "SUBN": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 7);
      }

      case "SHR": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 6);
      }

      case "SHL": {
        return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 0xe);
      }

      //
      case "RND": {
        const byte = parseInt(b.split("0x")[1], 16);

        return nibblesToByte4(
          0xc,
          parseInt(a[1]),
          (byte & 0xff00) << 4,
          byte & 0xff
        );
      }

      //
      case "HALT": {
        return 0x00ff;
      }

      default:
        throw new Error(`Unknown opcode ${op} found`);
    }

    return 0;
  }

  getInstructions() {
    console.log("* assembler starting");
    const instructions = [];
    const lines = this.program.split("\n");

    lines.forEach((line) => {
      line = line.trim();
      if (line == "") return;
      const ins = this.parseLine(line);
      // @ts-ignore
      console.log(line.padEnd(12), " => ", `0x${ins.toString(16)}`);
      const high = (ins & 0xff00) >> 8;
      const low = ins & 0xff;

      //   console.log(high.toString(16), low.toString(16));

      instructions.push(high);
      instructions.push(low);
    });

    console.log("* assembler finished");
    return new Uint8Array(instructions);
  }
}
