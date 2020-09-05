// 1 2 3 4
// Q W E R
// A S D F
// Z X C V

// maps to:

// 1 2 3 C
// 4 5 6 D
// 7 8 9 E
// A 0 B F

export default class Keyboard {
  private keymap = {
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
  keyPressed = null;
  constructor() {
    const validKeys = Object.keys(this.keymap);
    document.addEventListener("keydown", (e) => {
      if (validKeys.includes(e.key)) {
        this.keyPressed = e.key;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (validKeys.includes(e.key)) {
        if (this.keyPressed === e.key) {
          this.keyPressed = null;
        }
      }
    });
  }

  getKeyNumber() {
    return this.keymap[this.keyPressed];
  }
}
