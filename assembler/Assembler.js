// @ts-check

const nibblesToByte4 = (a, b, c, d) => {
  return (a << 12) | (b << 8) | (c << 4) | d;
};

export default class Assembler {
  program = "";
  constructor(program) {
    this.program = program;
  }

  labels = {};

  parseLine(line) {
    const split = line.split(" ");
    const op = split.shift();

    console.log(split);

    let [a, b, c] = split.join("").split(",");

    switch (op) {
      case "CLS": {
        return nibblesToByte4(0, 0, 0xe, 0);
      }

      case "LD": {
        if (a === "I") {
          if (b.startsWith("0x")) {
            const nnn = b.split("0x")[1];
            const na = parseInt(nnn[0], 16);
            const nb = parseInt(nnn[1], 16);
            const nc = parseInt(nnn[2], 16);
            const i = nibblesToByte4(0xa, na, nb, nc);
            return i;
          } else {
            const address = this.labels[b];
            if (typeof address === "undefined") {
              throw new Error(`label ${b} could not be found`);
            }
            const addressHex = address.toString(16).padStart("3", 0);
            return nibblesToByte4(0xa, addressHex[0], addressHex[1], addressHex[2]);
          }
        } else if (a === "ST") {
          return nibblesToByte4(0xf, parseInt(b[1]), 1, 8);
        } else if (a === "DT") {
          return nibblesToByte4(0xf, parseInt(b[1]), 1, 5);
        }
        const byte = parseInt(b.split("0x")[1], 16);
        return nibblesToByte4(0x6, parseInt(a[1]), (byte & 0xff00) << 4, byte & 0xff);
      }

      case "ADD": {
        if (b.startsWith("V")) {
          return nibblesToByte4(0x8, parseInt(a[1]), parseInt(b[1]), 4);
        } else {
          const byte = parseInt(b.split("0x")[1], 16);

          return nibblesToByte4(0x7, parseInt(a[1]), (byte & 0xff00) << 4, byte & 0xff);
        }
      }

      case "JP": {
        // TODO: there is another version of JP
        const address = this.labels[a];
        if (typeof address === "undefined") {
          throw new Error(`label ${a} could not be found`);
        }
        const addressHex = address.toString(16).padStart("3", 0);
        return nibblesToByte4(0x1, addressHex[0], addressHex[1], addressHex[2]);
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

        return nibblesToByte4(0xc, parseInt(a[1]), (byte & 0xff00) << 4, byte & 0xff);
      }

      //
      case "DRW": {
        const byte = parseInt(c.split("0x")[1], 16);

        return nibblesToByte4(0xd, parseInt(a[1]), parseInt(b[2]), byte);
      }

      case "DB": {
        return parseInt(a.split("0x")[1], 16);
      }

      //
      case "HALT": {
        return 0x00ff;
      }

      default:
        throw new Error(`Unknown opcode ${op} found`);
    }
  }

  getLabels() {
    const lines = this.program.split("\n");

    let instructionNumber = 0x200;

    lines.forEach((line) => {
      line = line.split(";")[0];
      line = line.trim();
      if (line == "") return;

      if (line.endsWith(":")) {
        const label = line.split(":")[0];
        this.labels[label] = instructionNumber;
      } else {
        instructionNumber++;
      }
    });

    console.log("labels:", this.labels);
  }

  getInstructions() {
    this.getLabels();
    console.log("* assembler starting");
    const instructions = [];
    const lines = this.program.split("\n");

    let instructionNumber = 0x200;

    lines.forEach((line) => {
      line = line.split(";")[0];
      line = line.trim();
      if (line == "") return;

      // label
      if (line.endsWith(":")) {
        // const label = line.split(":")[0];
        // this.labels[label] = instructionNumber;
      } else {
        const ins = this.parseLine(line);
        // @ts-ignore
        console.log(line.padEnd(12), " => ", `0x${ins.toString(16)}`);
        const high = (ins & 0xff00) >> 8;
        const low = ins & 0xff;

        //   console.log(high.toString(16), low.toString(16));

        instructions.push(high);
        instructions.push(low);

        instructionNumber++;
      }
    });

    console.log("* assembler finished");
    return new Uint8Array(instructions);
  }
}
