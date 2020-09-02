// 1 2 3 4
// Q W E R
// A S D F
// Z X C V

export default class Keyboard {
  keys = ["1", "2", "3", "4", "q", "w", "e", "r", "a", "s", "d", "f", "z", "x", "c", "v"];
  keyPressed = null;
  constructor() {
    document.addEventListener("keydown", (e) => {
      if (this.keys.includes(e.key)) {
        this.keyPressed = e.key;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (this.keys.includes(e.key)) {
        if (this.keyPressed === e.key) {
          this.keyPressed = null;
        }
      }
    });
  }
}
