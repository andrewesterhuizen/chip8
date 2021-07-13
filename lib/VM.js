var FrameBuffer = /** @class */ (function () {
    function FrameBuffer(rows, columns) {
        this.rows = 0;
        this.columns = 0;
        this.rows = rows;
        this.columns = columns;
        this.buffer = new Uint8Array(this.columns * this.rows);
    }
    FrameBuffer.prototype.getPixelIndex = function (x, y) {
        return y * this.columns + x;
    };
    FrameBuffer.prototype.getPixel = function (x, y) {
        return this.buffer[this.getPixelIndex(x, y)];
    };
    FrameBuffer.prototype.setPixel = function (x, y, value) {
        // console.log(`FrameBuffer: setPixel(x: ${x}, y: ${y}, value: ${value})`);
        value = value ? 1 : 0;
        this.buffer[this.getPixelIndex(x, y)] = value ? 1 : 0;
    };
    FrameBuffer.prototype.clearBuffer = function () {
        // console.log("FrameBuffer: clearBuffer");
        var emptyBuffer = new Uint8Array(this.columns * this.rows);
        console.log({ emptyBuffer: emptyBuffer });
        this.buffer = emptyBuffer;
    };
    FrameBuffer.prototype.getBuffer = function () {
        return this.buffer;
    };
    return FrameBuffer;
}());
var DOMRenderer = /** @class */ (function () {
    function DOMRenderer(rows, columns) {
        var _this = this;
        this.rows = 0;
        this.columns = 0;
        this.getBuffer = function () { return new Uint8Array(0); };
        this.rows = rows;
        this.columns = columns;
        this.canvas = document.querySelector("#screen");
        this.context = this.canvas.getContext("2d");
        var renderCallback = function () {
            _this.renderBuffer();
            requestAnimationFrame(renderCallback);
        };
        requestAnimationFrame(renderCallback);
    }
    DOMRenderer.prototype.setRequestBufferHandler = function (callback) {
        this.getBuffer = callback;
    };
    DOMRenderer.prototype.renderBuffer = function () {
        var buffer = this.getBuffer();
        for (var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                if (buffer[y * this.columns + x]) {
                    this.context.fillStyle = "white";
                }
                else {
                    this.context.fillStyle = "black";
                }
                this.context.fillRect(x, y, 1, 1);
            }
        }
    };
    return DOMRenderer;
}());
var Screen = /** @class */ (function () {
    function Screen(frameBuffer, renderer) {
        var _this = this;
        this.frameBuffer = frameBuffer;
        this.renderer = renderer;
        this.renderer.setRequestBufferHandler(function () { return _this.frameBuffer.getBuffer(); });
    }
    Screen.prototype.getPixelFromByte = function (byte, pos) {
        return (byte >> (7 - pos)) & 0x1;
    };
    Screen.prototype.xorPixel = function (x, y, value) {
        value = value ? 1 : 0;
        var currentValue = this.frameBuffer.getPixel(x, y);
        this.frameBuffer.setPixel(x, y, currentValue ^ value);
    };
    Screen.prototype.drawSprite = function (dx, dy, sprite) {
        for (var y = 0; y < sprite.length; y++) {
            var row = sprite[y];
            for (var x = 0; x < 8; x++) {
                var pixel = this.getPixelFromByte(row, x);
                this.xorPixel(dx + x, dy + y, pixel);
            }
        }
    };
    Screen.prototype.clear = function () {
        this.frameBuffer.clearBuffer();
    };
    return Screen;
}());
var newDOMScreen = function () {
    var rows = 32;
    var columns = 64;
    var frameBuffer = new FrameBuffer(rows, columns);
    var renderer = new DOMRenderer(rows, columns);
    return new Screen(frameBuffer, renderer);
};

// 1 2 3 4
// Q W E R
// A S D F
// Z X C V
// maps to:
// 1 2 3 C
// 4 5 6 D
// 7 8 9 E
// A 0 B F
var Keyboard = /** @class */ (function () {
    function Keyboard() {
        var _this = this;
        this.keymap = {
            "1": 0x1,
            "2": 0x2,
            "3": 0x3,
            "4": 0xc,
            q: 0x4,
            w: 0x5,
            e: 0x6,
            r: 0xd,
            a: 0x7,
            s: 0x8,
            d: 0x9,
            f: 0xe,
            z: 0xa,
            x: 0x0,
            c: 0xb,
            v: 0xf,
        };
        this.keyPressed = null;
        var validKeys = Object.keys(this.keymap);
        document.addEventListener("keydown", function (e) {
            if (validKeys.includes(e.key)) {
                _this.keyPressed = e.key;
            }
        });
        document.addEventListener("keyup", function (e) {
            if (validKeys.includes(e.key)) {
                if (_this.keyPressed === e.key) {
                    _this.keyPressed = null;
                }
            }
        });
    }
    Keyboard.prototype.getKeyNumber = function () {
        return this.keymap[this.keyPressed];
    };
    return Keyboard;
}());

var Sound = /** @class */ (function () {
    function Sound() {
        this.volume = 0.25;
        this.context = new AudioContext();
        var oscNode = this.context.createOscillator();
        oscNode.frequency.value = 200;
        oscNode.type = "square";
        oscNode.start();
        var gainNode = this.context.createGain();
        gainNode.gain.value = 0;
        oscNode.connect(gainNode);
        gainNode.connect(this.context.destination);
        gainNode.gain.value = 0;
        this.gainNode = gainNode;
    }
    Sound.prototype.start = function () {
        // console.log("Sound: start");
        this.gainNode.gain.value = this.volume;
    };
    Sound.prototype.stop = function () {
        // console.log("Sound: stop");
        this.gainNode.gain.value = 0;
    };
    return Sound;
}());

var digits = [
    0xf0,
    0x90,
    0x90,
    0x90,
    0xf0,
    0x20,
    0x60,
    0x20,
    0x20,
    0x70,
    0xf0,
    0x10,
    0xf0,
    0x80,
    0xf0,
    0xf0,
    0x10,
    0xf0,
    0x10,
    0xf0,
    0x90,
    0x90,
    0xf0,
    0x10,
    0x10,
    0xf0,
    0x80,
    0xf0,
    0x10,
    0xf0,
    0xf0,
    0x80,
    0xf0,
    0x90,
    0xf0,
    0xf0,
    0x10,
    0x20,
    0x40,
    0x40,
    0xf0,
    0x90,
    0xf0,
    0x90,
    0xf0,
    0xf0,
    0x90,
    0xf0,
    0x10,
    0xf0,
    0xf0,
    0x90,
    0xf0,
    0x90,
    0x90,
    0xe0,
    0x90,
    0xe0,
    0x90,
    0xe0,
    0xf0,
    0x80,
    0x80,
    0x80,
    0xf0,
    0xe0,
    0x90,
    0x90,
    0x90,
    0xe0,
    0xf0,
    0x80,
    0xf0,
    0x80,
    0xf0,
    0xf0,
    0x80,
    0xf0,
    0x80,
    0x80,
];

var getNibbles = function (instruction) {
    var a = (instruction & 0xf000) >> 12;
    var b = (instruction & 0x0f00) >> 8;
    var c = (instruction & 0x00f0) >> 4;
    var d = instruction & 0x000f;
    return [a, b, c, d];
};
var nibblesToByte = function (a, b) {
    return (a << 4) | b;
};

var CPU = /** @class */ (function () {
    function CPU(screen, keyboard, sound) {
        var _this = this;
        this.ram = new Uint8Array(4096);
        this.stack = new Uint16Array(16);
        this.registers = new Uint8Array(16);
        this.iRegister = 0;
        this.pc = 0x200; // 512
        this.sp = 0;
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.soundPlaying = false;
        this.screen = screen;
        this.keyboard = keyboard;
        this.sound = sound;
        for (var i = 0; i < digits.length; i++) {
            this.ram[i] = digits[i];
        }
        setInterval(function () {
            if (_this.delayTimer > 0) {
                _this.delayTimer--;
            }
        }, 1 / 60);
        setInterval(function () {
            if (_this.soundTimer > 0) {
                _this.soundTimer--;
                if (!_this.soundPlaying) {
                    _this.soundPlaying = true;
                    _this.sound.start();
                }
            }
            else {
                if (_this.soundPlaying) {
                    _this.soundPlaying = false;
                    _this.sound.stop();
                }
            }
        }, 1 / 60);
    }
    CPU.prototype.load = function (program) {
        for (var i = 0; i < program.length; i++) {
            this.ram[0x200 + i] = program[i];
        }
    };
    CPU.prototype.fetchNextInstruction = function () {
        var a = this.ram[this.pc++];
        var b = this.ram[this.pc++];
        return (a << 8) | b;
    };
    CPU.prototype.tick = function () {
        this.execute(this.fetchNextInstruction());
        // this.renderInfo();
    };
    CPU.prototype.execute = function (instruction) {
        // console.log(`executing: 0x${instruction.toString(16).padStart(4, "0")}`);
        var _a = getNibbles(instruction), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        switch (a) {
            case 0x0: {
                var byte = nibblesToByte(c, d);
                switch (byte) {
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
                        break;
                    }
                }
                break;
            }
            case 0x1: {
                // 1nnn - JP addr
                // Jump to location nnn.
                // The interpreter sets the program counter to nnn.
                var location_1 = (b << 8) | (c << 4) | d;
                // debugger;
                this.pc = location_1;
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
                var x = b;
                var y = c;
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
                        var result = this.registers[x] + this.registers[y];
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
                        var x = b;
                        var y = c;
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
                var nnn = (b << 8) | (c << 4) | d;
                this.iRegister = nnn;
                break;
            }
            case 0xb: {
                // Bnnn - JP V0, addr
                // Jump to location nnn + V0.
                // The program counter is set to nnn plus the value of V0.
                var nnn = (c << 8) | (b << 4) | c;
                this.pc = nnn + this.registers[0];
                break;
            }
            case 0xc: {
                // Cxkk - RND Vx, byte
                // Set Vx = random byte AND kk.
                // The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk. The results are stored in Vx. See instruction 8xy2 for more information on AND.
                var rand = Math.floor(Math.random() * 255);
                this.registers[0] = rand & ((c << 4) | d);
                break;
            }
            case 0xd: {
                // Dxyn - DRW Vx, Vy, nibble
                // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
                // The interpreter reads n bytes from memory, starting at the address stored in I. These bytes are then displayed as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen. See instruction 8xy3 for more information on XOR, and section 2.4, Display, for more information on the Chip-8 screen and sprites.
                var x = this.registers[b];
                var y = this.registers[c];
                var n = d;
                var sprite = new Uint8Array(n);
                for (var i = 0; i < n; i++) {
                    sprite[i] = this.ram[this.iRegister + i];
                }
                this.screen.drawSprite(x, y, sprite);
                break;
            }
            case 0xe: {
                var byte = nibblesToByte(c, d);
                switch (byte) {
                    case 0x9e: {
                        // Ex9E - SKP Vx
                        // Skip next instruction if key with the value of Vx is pressed.
                        // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position, PC is increased by 2.
                        var vx = this.registers[b];
                        if (this.keyboard && this.keyboard.keyPressed) {
                            if (vx === this.keyboard.getKeyNumber()) {
                                this.pc += 2;
                            }
                        }
                        break;
                    }
                    case 0xa1: {
                        // ExA1 - SKNP Vx
                        // Skip next instruction if key with the value of Vx is not pressed.
                        // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the up position, PC is increased by 2.
                        var vx = this.registers[b];
                        if (this.keyboard && this.keyboard.keyPressed) {
                            if (vx !== this.keyboard.getKeyNumber()) {
                                this.pc += 2;
                            }
                        }
                        break;
                    }
                }
                break;
            }
            case 0xf: {
                var byte = nibblesToByte(c, d);
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
                        }
                        else {
                            this.registers[b] = this.keyboard.getKeyNumber();
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
                        var vx = this.registers[b];
                        var first = vx % 10;
                        var second = (vx % 100) - first;
                        var third = (vx % 1000) - first - second;
                        this.ram[this.iRegister] = third / 100;
                        this.ram[this.iRegister + 1] = second / 10;
                        this.ram[this.iRegister + 2] = first;
                        break;
                    }
                    case 0x55: {
                        // Fx55 - LD [I], Vx
                        // Store registers V0 through Vx in memory starting at location I.
                        // The interpreter copies the values of registers V0 through Vx into memory, starting at the address in I.
                        for (var i = 0; i < b; i++) {
                            this.ram[this.iRegister + i] = this.registers[i];
                        }
                        break;
                    }
                    case 0x65: {
                        // Fx65 - LD Vx, [I]
                        // Read registers V0 through Vx from memory starting at location I.
                        // The interpreter reads values from memory starting at location I into registers V0 through Vx.
                        for (var i = 0; i < b; i++) {
                            this.registers[i] = this.ram[this.iRegister + i];
                        }
                        break;
                    }
                }
                break;
            }
            default: {
                throw new Error("instruction 0x" + instruction.toString(16) + " has not been implemented");
            }
        }
    };
    CPU.prototype.printRAM = function () {
        var itemsPerRow = 16;
        for (var i = 0; i < this.ram.length; i += itemsPerRow) {
            var items = [];
            for (var j = 0; j < itemsPerRow; j++) {
                // @ts-ignore
                items.push(this.ram[i + j].toString(16).padStart(2, "0"));
            }
            var groupedItems = [];
            // group items
            for (var x = 0; x < itemsPerRow; x += 2) {
                groupedItems.push("" + items[x] + items[x + 1]);
            }
            console.log(
            // @ts-ignore
            "0x" + i.toString(16).padStart(3, "0") + ": " + groupedItems.join(" "));
        }
    };
    return CPU;
}());

var infoEl = document.querySelector("#info");
var VM = /** @class */ (function () {
    function VM(debug) {
        this.debug = false;
        this.debug = debug;
        this.screen = newDOMScreen();
        var keyboard = new Keyboard();
        var sound = new Sound();
        this.cpu = new CPU(this.screen, keyboard, sound);
    }
    VM.prototype.renderInfo = function () {
        infoEl.innerHTML = "";
        infoEl.innerHTML += "" + this.cpu.registers.reduce(function (p, r, i) {
            p += "V" + i.toString(16).toUpperCase() + "|";
            return p;
        }, "|");
        infoEl.innerHTML += " I  |";
        infoEl.innerHTML += "PC |";
        infoEl.innerHTML += "SP|";
        infoEl.innerHTML += "DT|";
        infoEl.innerHTML += "ST|";
        infoEl.innerHTML += "<br>";
        infoEl.innerHTML += "" + this.cpu.registers.reduce(function (p, r, i) {
            p += r.toString(16).padStart(2, "0") + "|";
            return p;
        }, "|");
        infoEl.innerHTML += this.cpu.iRegister.toString(16).padStart(3, "0") + "|";
        infoEl.innerHTML += this.cpu.pc.toString(16).padStart(3, "0") + "|";
        infoEl.innerHTML += this.cpu.sp.toString(16).padStart(2, "0") + "|";
        infoEl.innerHTML += this.cpu.delayTimer.toString(16).padStart(2, "0") + "|";
        infoEl.innerHTML += this.cpu.soundTimer.toString(16).padStart(2, "0") + "|";
        infoEl.innerHTML += "<br>";
        var keyNumber = this.cpu.keyboard.getKeyNumber();
        var keyString = keyNumber ? keyNumber.toString(16)[0] : "-";
        infoEl.innerHTML += "key: " + keyString + " | " + this.cpu.keyboard.keyPressed;
    };
    VM.prototype.loadRom = function (rom) {
        this.cpu.load(rom);
        if (this.debug) {
            this.cpu.printRAM();
        }
    };
    VM.prototype.start = function (clockSpeedMS) {
        var _this = this;
        setInterval(function () {
            _this.cpu.tick();
        }, clockSpeedMS);
        if (this.debug) {
            setInterval(function () {
                _this.renderInfo();
            }, 1 / 20);
        }
    };
    return VM;
}());

export default VM;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVk0uanMiLCJzb3VyY2VzIjpbIi4uL3ZtL3BlcmlwaGVyYWxzL1NjcmVlbi50cyIsIi4uL3ZtL3BlcmlwaGVyYWxzL0tleWJvYXJkLnRzIiwiLi4vdm0vcGVyaXBoZXJhbHMvU291bmQudHMiLCIuLi92bS9zcHJpdGVzLnRzIiwiLi4vdm0vdXRpbHMudHMiLCIuLi92bS9DUFUudHMiLCIuLi92bS9WTS50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUtFLHFCQUFZLElBQVksRUFBRSxPQUFlO1FBSmpDLFNBQUksR0FBRyxDQUFDLENBQUM7UUFDVCxZQUFPLEdBQUcsQ0FBQyxDQUFDO1FBSWxCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEQ7SUFFTyxtQ0FBYSxHQUFyQixVQUFzQixDQUFTLEVBQUUsQ0FBUztRQUN4QyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztLQUM3QjtJQUVELDhCQUFRLEdBQVIsVUFBUyxDQUFTLEVBQUUsQ0FBUztRQUMzQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM5QztJQUVELDhCQUFRLEdBQVIsVUFBUyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWE7O1FBRTFDLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFD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SUFDcEIsSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7Q0FDTDs7QUNqRk0sSUFBTSxVQUFVLEdBQUcsVUFBQyxXQUFtQjtJQUM1QyxJQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxNQUFNLEtBQUssRUFBRSxDQUFDO0lBQ3ZDLElBQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFDdEMsSUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUN0QyxJQUFNLENBQUMsR0FBRyxXQUFXLEdBQUcsTUFBTSxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFSyxJQUFNLGFBQWEsR0FBRyxVQUFDLENBQVMsRUFBRSxDQUFTO0lBQ2hELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixDQUFDOztBQ0pEO0lBZ0JFLGFBQVksTUFBYyxFQUFFLFFBQWtCLEVBQUUsS0FBWTtRQUE1RCxpQkE4QkM7UUE3Q0QsUUFBRyxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLFVBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixjQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLE9BQUUsR0FBRyxLQUFLLENBQUM7UUFDWCxPQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRVAsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUVmLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFDZixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQU1uQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QjtRQUVELFdBQVcsQ0FBQztZQUNWLElBQUksS0FBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLEtBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzthQUNuQjtTQUNGLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRVgsV0FBVyxDQUFDO1lBQ1YsSUFBSSxLQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsS0FBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUVsQixJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksRUFBRTtvQkFDdEIsS0FBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQ3pCLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3BCO2FBQ0Y7aUJBQU07Z0JBQ0wsSUFBSSxLQUFJLENBQUMsWUFBWSxFQUFFO29CQUNyQixLQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztvQkFDMUIsS0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDbkI7YUFDRjtTQUNGLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ1o7SUFFRCxrQkFBSSxHQUFKLFVBQUssT0FBTztRQUNWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztLQUNGO0lBRUQsa0NBQW9CLEdBQXBCO1FBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QixJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNyQjtJQUVELGtCQUFJLEdBQUo7UUFDRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7O0tBRTNDO0lBRUQscUJBQU8sR0FBUCxVQUFRLFdBQVc7O1FBRVgsSUFBQSxLQUFlLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBckMsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUEyQixDQUFDO1FBRTdDLFFBQVEsQ0FBQztZQUNQLEtBQUssR0FBRyxFQUFFO2dCQUNSLElBQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRWpDLFFBQVEsSUFBSTtvQkFDVixLQUFLLElBQUksRUFBRTs7O3dCQUdULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ3BCLE1BQU07cUJBQ1A7b0JBQ0QsS0FBSyxJQUFJLEVBQUU7Ozs7d0JBSVQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUNWLE1BQU07cUJBQ1A7aUJBQ0Y7Z0JBRUQsTUFBTTthQUNQO1lBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7Z0JBSVIsSUFBTSxVQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O2dCQUV6QyxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVEsQ0FBQztnQkFDbkIsTUFBTTthQUNQO1lBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7Z0JBSVIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU07YUFDUDtZQUVELEtBQUssR0FBRyxFQUFFOzs7O2dCQUlSLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUM1QyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDZDtnQkFDRCxNQUFNO2FBQ1A7WUFFRCxLQUFLLEdBQUcsRUFBRTs7OztnQkFLUixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ2Q7Z0JBQ0QsTUFBTTthQUNQO1lBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7Z0JBSVIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNkO2dCQUNELE1BQU07YUFDUDtZQUVELEtBQUssR0FBRyxFQUFFOzs7O2dCQUlSLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDeEMsTUFBTTthQUNQO1lBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7Z0JBSVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO2FBQ1A7WUFFRCxLQUFLLEdBQUcsRUFBRTtnQkFDUixJQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ1osSUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNaLFFBQVEsQ0FBQztvQkFDUCxLQUFLLEdBQUcsRUFBRTs7Ozt3QkFJUixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RDLE1BQU07cUJBQ1A7b0JBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7d0JBSVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELE1BQU07cUJBQ1A7b0JBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7d0JBSVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELE1BQU07cUJBQ1A7b0JBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7d0JBSVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELE1BQU07cUJBQ1A7b0JBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7d0JBSVIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNyRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO3dCQUNsQyxNQUFNO3FCQUNQO29CQUVELEtBQUssR0FBRyxFQUFFOzs7O3dCQUlSLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxNQUFNO3FCQUNQO29CQUVELEtBQUssR0FBRyxFQUFFOzs7O3dCQUlSLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7d0JBQzlDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzNDLE1BQU07cUJBQ1A7b0JBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7d0JBSVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELE1BQU07cUJBQ1A7b0JBRUQsS0FBSyxHQUFHLEVBQUU7Ozs7d0JBSVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQzt3QkFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENB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SUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNwQyxNQUFNO3FCQUNQO29CQUNELEtBQUssSUFBSSxFQUFFOzs7O3dCQUlULElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3ZDLE1BQU07cUJBQ1A7b0JBQ0QsS0FBSyxJQUFJLEVBQUU7Ozs7Ozs7O3dCQVNULElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzdCLElBQU0sS0FBSyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7d0JBQ3RCLElBQU0sTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUM7d0JBQ2xDLElBQU0sS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDO3dCQUUzQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO3dCQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQzt3QkFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQzt3QkFDckMsTUFBTTtxQkFDUDtvQkFDRCxLQUFLLElBQUksRUFBRTs7Ozt3QkFJVCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDbEQ7d0JBQ0QsTUFBTTtxQkFDUDtvQkFD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QUFDO1FBQzNCLE1BQU0sQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDO1FBRTNCLE1BQU0sQ0FBQyxTQUFTLElBQUksS0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDdkQsQ0FBQyxJQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBRyxDQUFDO1lBQzNDLE9BQU8sQ0FBQyxDQUFDO1NBQ1YsRUFBRSxHQUFHLENBQUcsQ0FBQztRQUVWLE1BQU0sQ0FBQyxTQUFTLElBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQUcsQ0FBQztRQUMzRSxNQUFNLENBQUMsU0FBUyxJQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFHLENBQUM7UUFDcEUsTUFBTSxDQUFDLFNBQVMsSUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBRyxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxTQUFTLElBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQUcsQ0FBQztRQUM1RSxNQUFNLENBQUMsU0FBUyxJQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFHLENBQUM7UUFFNUUsTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUM7UUFFM0IsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbkQsSUFBTSxTQUFTLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQzlELE1BQU0sQ0FBQyxTQUFTLElBQUksT0FBTyxHQUFHLFNBQVMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO0tBQ2hGO0lBRUQsb0JBQU8sR0FBUCxVQUFRLEdBQWU7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNyQjtLQUNGO0lBRUQsa0JBQUssR0FBTCxVQUFNLFlBQW9CO1FBQTFCLGlCQVVDO1FBVEMsV0FBVyxDQUFDO1lBQ1YsS0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNqQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWpCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNkLFdBQVcsQ0FBQztnQkFDVixLQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDbkIsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDWjtLQUNGO0lBQ0gsU0FBQztBQUFELENBQUM7Ozs7In0=
