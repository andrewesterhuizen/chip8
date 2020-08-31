export default class Screen {
  canvas;
  context;

  rows = 32;
  columns = 64;

  buffer = new Uint8Array(this.columns * this.rows);

  constructor() {
    this.canvas = document.querySelector("#screen");
    // @ts-ignore
    this.context = this.canvas.getContext("2d");

    const renderCallback = () => {
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.columns; x++) {
          if (this.buffer[y * this.columns + x]) {
            this.context.fillStyle = "white";
            this.context.fillRect(x, y, 1, 1);
          }
        }
      }

      requestAnimationFrame(renderCallback);
    };

    renderCallback();
  }

  clear() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getPixelFromByte(byte, pos) {
    return (byte >> (7 - pos)) & 0x1;
  }

  xorPixel(x, y, value) {
    const pixelIndex = y * this.columns + x;
    this.buffer[pixelIndex] = this.buffer[pixelIndex] ^ value;
  }

  drawSprite(dx, dy, sprite) {
    for (let y = 0; y < sprite.length; y++) {
      const row = sprite[y];
      for (let x = 0; x < 8; x++) {
        const pixel = this.getPixelFromByte(row, x);
        this.xorPixel(dx + x, dy + y, pixel);
      }
    }
  }
}
