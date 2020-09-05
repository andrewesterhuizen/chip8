import Arg from "./Arg";

const n4 = (a: number, b: number, c: number, d: number) => {
  return (a << 12) | (b << 8) | (c << 4) | d;
};

export default class Assembler {
  program = "";
  constructor(program: string) {
    this.program = program;
  }

  labels: { [key: string]: number } = {};

  getOpAndArgs(line: string) {
    const split = line.split(" ");
    const op = split.shift();

    let [argA, argB, argC] = split
      .join("")
      .split(",")
      .map((a) => new Arg(a));

    if (!argA) argA = new Arg("");
    if (!argB) argB = new Arg("");
    if (!argC) argC = new Arg("");

    return { op, argA, argB, argC };
  }

  parseLine(line: string) {
    const { op, argA, argB, argC } = this.getOpAndArgs(line);

    switch (op) {
      case "CLS": {
        return 0x00e0;
      }

      case "RET": {
        return 0x00ee;
      }

      case "JP": {
        if (argA.isNumber()) {
          const [c, b, a] = argA.getNibbles();
          return n4(0x1, c, b, a);
        } else if (argA.isRegister()) {
          const [c, b, a] = argB.getNibbles();
          return n4(0xb, c, b, a);
        } else {
          const address = this.labels[argA.rawArg()];
          if (typeof address === "undefined") {
            throw new Error(`label ${argA.rawArg()} could not be found`);
          }
          const addressHex = address.toString(16).padStart(3, "0");
          return n4(0xa, parseInt(addressHex[0], 16), parseInt(addressHex[1], 16), parseInt(addressHex[2], 16));
        }
      }

      case "CALL": {
        const [c, b, a] = argA.getNibbles();
        return n4(0x2, c, b, a);
      }

      case "SE": {
        if (!argA.isRegister()) {
          throw new Error(`SE: expected first arg to be register but got ${argA.rawArg()}`);
        }

        if (argB.isRegister()) {
          return n4(0x5, argA.getRegister(), argB.getRegister(), 0);
        } else {
          const [, b, a] = argB.getNibbles();
          return n4(0x3, argA.getRegister(), b, a);
        }
      }

      case "SNE": {
        if (argB.isRegister()) {
          return n4(0x9, argA.getRegister(), argB.getRegister(), 0x0);
        } else if (argB.isNumber()) {
          const [, b, a] = argB.getNibbles();
          return n4(0x4, argA.getRegister(), b, a);
        } else {
          throw new Error(`SNE: unknown argument type ${argB.rawArg()} found in position b`);
        }
      }

      case "LD": {
        if (argA.isRegister()) {
          if (argB.isNumber()) {
            const [, b, a] = argB.getNibbles();
            return n4(0x6, argA.getRegister(), b, a);
          } else if (argB.isRegister()) {
            return n4(0x8, argA.getRegister(), argB.getRegister(), 0);
          } else if (argB.is("DT")) {
            return n4(0xf, argA.getRegister(), 0, 7);
          } else if (argB.is("K")) {
            return n4(0xf, argA.getRegister(), 0, 0xa);
          } else if (argB.is("[I]")) {
            return n4(0xf, argA.getRegister(), 6, 5);
          } else {
            throw new Error(`LD: unknown argument type ${argB.rawArg()} found in position b`);
          }
        } else if (argA.is("I")) {
          const [c, b, a] = argB.getNibbles();
          return n4(0xa, c, b, a);
        } else if (argA.is("DT")) {
          return n4(0xf, argB.getRegister(), 1, 5);
        } else if (argA.is("ST")) {
          return n4(0xf, argB.getRegister(), 1, 8);
        } else if (argA.is("F")) {
          return n4(0xf, argB.getRegister(), 2, 9);
        } else if (argA.is("B")) {
          return n4(0xf, argB.getRegister(), 3, 3);
        } else if (argA.is("[I]")) {
          return n4(0xf, argB.getRegister(), 5, 5);
        }
      }

      case "ADD": {
        if (argA.is("I")) {
          return n4(0xf, argB.getRegister(), 1, 0xe);
        } else if (argB.isRegister()) {
          return n4(0x8, argA.getRegister(), argB.getRegister(), 0x4);
        } else if (argB.isNumber()) {
          const [, b, a] = argB.getNibbles();
          return n4(0x7, argA.getRegister(), b, a);
        } else {
          throw new Error(`ADD: unknown argument type ${argB.rawArg()} found in position b`);
        }
      }

      case "OR": {
        return n4(0x8, argA.getRegister(), argB.getRegister(), 0x1);
      }

      case "AND": {
        return n4(0x8, argA.getRegister(), argB.getRegister(), 0x2);
      }

      case "XOR": {
        return n4(0x8, argA.getRegister(), argB.getRegister(), 0x3);
      }

      case "SUB": {
        return n4(0x8, argA.getRegister(), argB.getRegister(), 0x5);
      }

      case "SHR": {
        if (argB.isEmpty()) {
          return n4(0x8, argA.getRegister(), 0, 0x6);
        } else {
          return n4(0x8, argA.getRegister(), argB.getRegister(), 0x6);
        }
      }

      case "SUBN": {
        return n4(0x8, argA.getRegister(), argB.getRegister(), 0x7);
      }

      case "SHL": {
        return n4(0x8, argA.getRegister(), argB.getRegister(), 0xe);
      }

      case "RND": {
        const [, b, a] = argB.getNibbles();
        return n4(0xc, argA.getRegister(), b, a);
      }

      case "DRW": {
        const [, , a] = argC.getNibbles();
        return n4(0xd, argA.getRegister(), argB.getRegister(), a);
      }

      case "SKP": {
        return n4(0xe, argA.getRegister(), 0x9, 0xe);
      }
      case "SKNP": {
        return n4(0xe, argA.getRegister(), 0xa, 0x1);
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

    // console.log("labels:", this.labels);
  }

  getInstructions(): Uint8Array {
    this.getLabels();
    // console.log("* assembler starting");
    const instructions: number[] = [];
    const lines = this.program.split("\n");

    lines.forEach((line) => {
      line = line.split(";")[0];
      line = line.trim();
      if (line == "") return;

      // skip labels
      if (!line.endsWith(":")) {
        const ins = this.parseLine(line);
        // @ts-ignore
        // console.log(line.padEnd(12), " => ", `0x${ins.toString(16)}`);
        const high = (ins & 0xff00) >> 8;
        const low = ins & 0xff;

        // console.log(high.toString(16), low.toString(16));

        instructions.push(high);
        instructions.push(low);
      }
    });

    // console.log("* assembler finished");
    return new Uint8Array(instructions);
  }
}
