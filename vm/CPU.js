// @ts-check

import { digits } from "./sprites.js";
import { getNibbles, nibblesToByte } from "./utils.js";

const infoEl = document.querySelector("#info");

export default class CPU {
  ram = new Uint8Array(4096);
  stack = new Uint16Array(16);
  registers = new Uint8Array(16);
  iRegister = 0;
  pc = 0x200; // 512
  sp = 0;

  delayTimer = 0;

  soundTimer = 0;
  soundPlaying = false;
  sound;

  halted = false;

  screen;

  keyboard;

  constructor(screen, keyboard, sound) {
    this.screen = screen;
    this.keyboard = keyboard;
    this.sound = sound;

    for (let i = 0; i < digits.length; i++) {
      this.ram[i] = digits[i];
    }

    setInterval(() => {
      if (this.delayTimer > 0) {
        this.delayTimer--;
      }
    }, 1 / 60);

    setInterval(() => {
      if (this.soundTimer > 0) {
        this.soundTimer--;

        if (!this.soundPlaying) {
          this.soundPlaying = true;
          this.sound.start();
        }
      } else {
        if (this.soundPlaying) {
          this.soundPlaying = false;
          this.sound.stop();
        }
      }
    }, 1 / 60);
  }

  load(program) {
    for (let i = 0; i < program.length; i++) {
      this.ram[0x200 + i] = program[i];
    }
  }

  renderInfo() {
    infoEl.innerHTML = "";
    infoEl.innerHTML += `${this.registers.reduce((p, r, i) => {
      p += `V${i.toString(16).toUpperCase()}|`;
      return p;
    }, "|")}`;

    infoEl.innerHTML += " I  |";
    infoEl.innerHTML += "PC |";
    infoEl.innerHTML += "SP|";
    infoEl.innerHTML += "DT|";
    infoEl.innerHTML += "ST|";
    infoEl.innerHTML += "<br>";

    infoEl.innerHTML += `${this.registers.reduce((p, r, i) => {
      p += `${r.toString(16).padStart(2, "0")}|`;
      return p;
    }, "|")}`;

    infoEl.innerHTML += `${this.iRegister.toString(16).padStart(3, "0")}|`;
    infoEl.innerHTML += `${this.pc.toString(16).padStart(3, "0")}|`;
    infoEl.innerHTML += `${this.sp.toString(16).padStart(2, "0")}|`;
    infoEl.innerHTML += `${this.delayTimer.toString(16).padStart(2, "0")}|`;
    infoEl.innerHTML += `${this.soundTimer.toString(16).padStart(2, "0")}|`;

    infoEl.innerHTML += "<br>";

    infoEl.innerHTML += "key: " + this.keyboard.keyPressed;
  }

  start() {
    console.log("cpu starting");

    const run = () => {
      if (this.halted) return;
      const a = this.ram[this.pc++];
      const b = this.ram[this.pc++];
      const instruction = (a << 8) | b;
      //@ts-ignore
      const ins = instruction.toString(16).padStart(4, "0");

      this.execute(instruction);

      this.renderInfo();
      setTimeout(run, 1);
    };

    run();

    console.log("cpu finished");
  }

  execute(instruction) {
    console.log(`executing: 0x${instruction.toString(16).padStart(4, "0")}`);
    const [a, b, c, d] = getNibbles(instruction);

    const ni = () => {
      throw new Error(`instruction 0x${instruction.toString(16)} has not been implemented`);
    };

    switch (a) {
      case 0x0: {
        const byte = nibblesToByte(c, d);

        switch (byte) {
          case 0xff: {
            // TEMP
            this.halted = true;
            break;
          }
          case 0xe0: {
            // 00E0 - CLS
            // Clear the display.
            this.screen.clear();
            break;
          }
          case 0xee: {
            // 00EE - RET
            // Return from a subroutine.
            // The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.
            this.pc = this.stack[this.sp];
            this.sp--;
          }
        }

        break;
      }

      case 0x1: {
        // 1nnn - JP addr
        // Jump to location nnn.
        // The interpreter sets the program counter to nnn.
        const location = (b << 8) | (c << 4) | d;
        // debugger;
        this.pc = location;
        break;
      }

      case 0x2: {
        // 2nnn - CALL addr
        // Call subroutine at nnn.
        // The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
        this.sp++;
        this.stack[this.sp] = this.pc;
        this.pc = (b << 8) | (c << 4) | d;
        break;
      }

      case 0x3: {
        // 3xkk - SE Vx, byte
        // Skip next instruction if Vx = kk.
        // The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.
        if (this.registers[b] == nibblesToByte(c, d)) {
          this.pc += 2;
        }
        break;
      }

      case 0x4: {
        // 4xkk - SNE Vx, byte
        // Skip next instruction if Vx != kk.

        // The interpreter compares register Vx to kk, and if they are not equal, increments the program counter by 2.
        if (this.registers[b] !== nibblesToByte(c, d)) {
          this.pc += 2;
        }
        break;
      }

      case 0x5: {
        // 5xy0 - SE Vx, Vy
        // Skip next instruction if Vx = Vy.
        // The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
        if (this.registers[b] == this.registers[c]) {
          this.pc += 2;
        }
        break;
      }

      case 0x6: {
        // 6xkk - LD Vx, byte
        // Set Vx = kk.
        // The interpreter puts the value kk into register Vx.
        this.registers[b] = nibblesToByte(c, d);
        break;
      }

      case 0x7: {
        // 7xkk - ADD Vx, byte
        // Set Vx = Vx + kk.
        // Adds the value kk to the value of register Vx, then stores the result in Vx.
        this.registers[b] += nibblesToByte(c, d);
        break;
      }

      case 0x8: {
        const x = b;
        const y = c;
        switch (d) {
          case 0x0: {
            // 8xy0 - LD Vx, Vy
            // Set Vx = Vy.
            // Stores the value of register Vy in register Vx.
            this.registers[x] = this.registers[y];
            break;
          }

          case 0x1: {
            // 8xy1 - OR Vx, Vy
            // Set Vx = Vx OR Vy.
            // Performs a bitwise OR on the values of Vx and Vy, then stores the result in Vx. A bitwise OR compares the corrseponding bits from two values, and if either bit is 1, then the same bit in the result is also 1. Otherwise, it is 0.
            this.registers[x] = this.registers[x] | this.registers[y];
            break;
          }

          case 0x2: {
            // 8xy2 - AND Vx, Vy
            // Set Vx = Vx AND Vy.
            // Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx. A bitwise AND compares the corrseponding bits from two values, and if both bits are 1, then the same bit in the result is also 1. Otherwise, it is 0.
            this.registers[x] = this.registers[x] & this.registers[y];
            break;
          }

          case 0x3: {
            // 8xy3 - XOR Vx, Vy
            // Set Vx = Vx XOR Vy.
            // Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx. An exclusive OR compares the corrseponding bits from two values, and if the bits are not both the same, then the corresponding bit in the result is set to 1. Otherwise, it is 0.
            this.registers[x] = this.registers[x] ^ this.registers[y];
            break;
          }

          case 0x4: {
            // 8xy4 - ADD Vx, Vy
            // Set Vx = Vx + Vy, set VF = carry.
            // The values of Vx and Vy are added together. If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0. Only the lowest 8 bits of the result are kept, and stored in Vx.
            const result = this.registers[x] + this.registers[y];
            this.registers[0xf] = result > 255 ? 1 : 0;
            this.registers[x] = result & 0xff;
            break;
          }

          case 0x5: {
            // 8xy5 - SUB Vx, Vy
            // Set Vx = Vx - Vy, set VF = NOT borrow.
            // If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
            this.registers[0xf] = this.registers[x] > this.registers[y] ? 1 : 0;
            this.registers[x] = this.registers[x] - this.registers[y];
            break;
          }

          case 0x6: {
            // 8xy6 - SHR Vx {, Vy}
            // Set Vx = Vx SHR 1.
            // If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2.
            this.registers[0xf] = this.registers[x] & 0x1;
            this.registers[x] = this.registers[x] >> 1;
            break;
          }

          case 0x7: {
            // 8xy7 - SUBN Vx, Vy
            // Set Vx = Vy - Vx, set VF = NOT borrow.
            // If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx.
            this.registers[0xf] = this.registers[y] > this.registers[x] ? 1 : 0;
            this.registers[x] = this.registers[y] - this.registers[x];
            break;
          }

          case 0xe: {
            // 8xyE - SHL Vx {, Vy}
            // Set Vx = Vx SHL 1.
            // If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0. Then Vx is multiplied by 2.
            this.registers[0xf] = this.registers[x] & 0x1;
            this.registers[x] = this.registers[x] << 1;
            break;
          }
        }

        break;
      }

      case 0x9: {
        switch (d) {
          case 0x0: {
            // 9xy0 - SNE Vx, Vy
            // Skip next instruction if Vx != Vy.
            // The values of Vx and Vy are compared, and if they are not equal, the program counter is increased by 2.
            const x = b;
            const y = c;
            if (this.registers[x] !== this.registers[y]) {
              this.pc += 2;
            }
            break;
          }
        }
      }

      case 0xa: {
        // Annn - LD I, addr
        // Set I = nnn.
        // The value of register I is set to nnn.
        const nnn = (b << 8) | (c << 4) | d;
        this.iRegister = nnn;
        break;
      }

      case 0xb: {
        // Bnnn - JP V0, addr
        // Jump to location nnn + V0.
        // The program counter is set to nnn plus the value of V0.
        const nnn = (c << 8) | (b << 4) | c;
        this.pc = nnn + this.registers[0];
        break;
      }

      case 0xc: {
        // Cxkk - RND Vx, byte
        // Set Vx = random byte AND kk.
        // The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk. The results are stored in Vx. See instruction 8xy2 for more information on AND.
        const rand = Math.floor(Math.random() * 255);
        this.registers[0] = rand & ((c << 4) | d);
        break;
      }

      case 0xd: {
        // Dxyn - DRW Vx, Vy, nibble
        // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.

        // The interpreter reads n bytes from memory, starting at the address stored in I. These bytes are then displayed as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen. See instruction 8xy3 for more information on XOR, and section 2.4, Display, for more information on the Chip-8 screen and sprites.
        const x = this.registers[b];
        const y = this.registers[c];
        const n = d;

        const sprite = new Uint8Array(n);

        for (let i = 0; i < n; i++) {
          sprite[i] = this.ram[this.iRegister + i];
        }

        this.screen.drawSprite(x, y, sprite);

        break;
      }

      case 0xe: {
        const byte = nibblesToByte(c, d);
        switch (byte) {
          case 0x9e: {
            // Ex9E - SKP Vx
            // Skip next instruction if key with the value of Vx is pressed.
            // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position, PC is increased by 2.
            const vx = this.registers[b];
            if (this.keyboard && this.keyboard.keyPressed) {
              const n = this.keyboard.keys.indexOf(this.keyboard.keyPressed);
              if (vx === n) {
                this.pc += 2;
              }
            }
            break;
          }

          case 0xa1: {
            // ExA1 - SKNP Vx
            // Skip next instruction if key with the value of Vx is not pressed.
            // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the up position, PC is increased by 2.

            const vx = this.registers[b];
            if (this.keyboard && this.keyboard.keyPressed) {
              const n = this.keyboard.keys.indexOf(this.keyboard.keyPressed);
              if (vx !== n) {
                this.pc += 2;
              }
            }

            break;
          }
        }
        break;
      }

      case 0xf: {
        const byte = nibblesToByte(c, d);

        switch (byte) {
          case 0x07: {
            // Fx07 - LD Vx, DT
            // Set Vx = delay timer value.
            // The value of DT is placed into Vx.
            this.registers[b] = this.delayTimer;
            break;
          }

          case 0x0a: {
            // Fx0A - LD Vx, K
            // Wait for a key press, store the value of the key in Vx.
            // All execution stops until a key is pressed, then the value of that key is stored in Vx.
            if (!this.keyboard.keyPressed) {
              this.pc += 2;
            } else {
              this.registers[b] = this.keyboard.keys.indexOf(this.keyboard.keyPressed);
            }

            break;
          }

          case 0x15: {
            // Fx15 - LD DT, Vx
            // Set delay timer = Vx.
            // DT is set equal to the value of Vx.
            this.delayTimer = this.registers[b];
            break;
          }
          case 0x18: {
            // Fx18 - LD ST, Vx
            // Set sound timer = Vx.
            // ST is set equal to the value of Vx.
            this.soundTimer = this.registers[b];
            break;
          }
          case 0x1e: {
            // Fx1E - ADD I, Vx
            // Set I = I + Vx.
            // The values of I and Vx are added, and the results are stored in I.
            this.iRegister += this.registers[b];
            break;
          }
          case 0x29: {
            // Fx29 - LD F, Vx
            // Set I = location of sprite for digit Vx.
            // The value of I is set to the location for the hexadecimal sprite corresponding to the value of Vx. See section 2.4, Display, for more information on the Chip-8 hexadecimal font.
            this.iRegister = this.registers[b] * 5;
            break;
          }
          case 0x33: {
            // Fx33 - LD B, Vx
            // Store BCD representation of Vx in memory locations I, I+1, and I+2.
            // The interpreter takes the decimal value of Vx, and places the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.

            // FX33: Binary-coded decimal conversionPermalink
            // This instruction is a little involved. It takes the number in VX (which is one byte, so it can be any number from 0 to 255) and converts it to three decimal digits, storing these digits in memory at the address in the index register I. For example, if VX contains 156 (or 9C in hexadecimal), it would put the number 1 at the address in I, 5 in address I + 1, and 6 in address I + 2.
            //
            // Many people seem to struggle with this instruction. You’re lucky; the early CHIP-8 interpreters couldn’t divide by 10 or easily calculate a number modulo 10, but you can probably do both in your programming language. Do it to extract the necessary digits.
            const vx = this.registers[b];
            const first = vx % 10;
            const second = (vx % 100) - first;
            const third = (vx % 1000) - first - second;

            this.ram[this.iRegister] = third / 100;
            this.ram[this.iRegister + 1] = second / 10;
            this.ram[this.iRegister + 2] = first;
            break;
          }
          case 0x55: {
            // Fx55 - LD [I], Vx
            // Store registers V0 through Vx in memory starting at location I.
            // The interpreter copies the values of registers V0 through Vx into memory, starting at the address in I.
            for (let i = 0; i < b; i++) {
              this.ram[this.iRegister + i] = this.registers[i];
            }
            break;
          }
          case 0x65: {
            // Fx65 - LD Vx, [I]
            // Read registers V0 through Vx from memory starting at location I.
            // The interpreter reads values from memory starting at location I into registers V0 through Vx.
            for (let i = 0; i < b; i++) {
              this.registers[i] = this.ram[this.iRegister + i];
            }
            break;
          }
        }
        break;
      }

      default: {
        ni();
      }
    }
  }

  printRAM() {
    const itemsPerRow = 16;
    for (let i = 0; i < this.ram.length; i += itemsPerRow) {
      let items = [];
      for (let j = 0; j < itemsPerRow; j++) {
        // @ts-ignore
        items.push(this.ram[i + j].toString(16).padStart(2, "0"));
      }

      let groupedItems = [];

      // group items
      for (let x = 0; x < itemsPerRow; x += 2) {
        groupedItems.push(`${items[x]}${items[x + 1]}`);
      }

      console.log(
        // @ts-ignore
        `0x${i.toString(16).padStart(3, "0")}: ${groupedItems.join(" ")}`
      );
    }
  }
}
