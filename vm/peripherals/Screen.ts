export class FrameBuffer {
  private rows = 0;
  private columns = 0;
  private buffer: Uint8Array;

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.buffer = new Uint8Array(this.columns * this.rows);
  }

  private getPixelIndex(x: number, y: number) {
    return y * this.columns + x;
  }

  getPixel(x: number, y: number) {
    return this.buffer[this.getPixelIndex(x, y)];
  }

  setPixel(x: number, y: number, value: number) {
    // console.log(`FrameBuffer: setPixel(x: ${x}, y: ${y}, value: ${value})`);
    value = value ? 1 : 0;
    this.buffer[this.getPixelIndex(x, y)] = value ? 1 : 0;
  }

  clearBuffer() {
    // console.log("FrameBuffer: clearBuffer");
    const emptyBuffer = new Uint8Array(this.columns * this.rows);
    console.log({ emptyBuffer });
    this.buffer = emptyBuffer;
  }

  getBuffer() {
    return this.buffer;
  }
}

export interface Renderer {
  setRequestBufferHandler(callback: () => Uint8Array): void;
}

class DOMRenderer implements Renderer {
  rows = 0;
  columns = 0;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  getBuffer = () => new Uint8Array(0);

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.canvas = document.querySelector("#screen");
    this.context = this.canvas.getContext("2d");

    const renderCallback = () => {
      this.renderBuffer();
      requestAnimationFrame(renderCallback);
    };

    requestAnimationFrame(renderCallback);
  }

  setRequestBufferHandler(callback: () => Uint8Array) {
    this.getBuffer = callback;
  }

  renderBuffer() {
    const buffer = this.getBuffer();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (buffer[y * this.columns + x]) {
          this.context.fillStyle = "white";
        } else {
          this.context.fillStyle = "black";
        }

        this.context.fillRect(x, y, 1, 1);
      }
    }
  }
}

export default class Screen {
  frameBuffer: FrameBuffer;
  renderer: Renderer;

  constructor(frameBuffer: FrameBuffer, renderer: Renderer) {
    this.frameBuffer = frameBuffer;
    this.renderer = renderer;

    this.renderer.setRequestBufferHandler(() => this.frameBuffer.getBuffer());
  }

  private getPixelFromByte(byte, pos) {
    return (byte >> (7 - pos)) & 0x1;
  }

  private xorPixel(x: number, y: number, value: number) {
    value = value ? 1 : 0;
    const currentValue = this.frameBuffer.getPixel(x, y);
    this.frameBuffer.setPixel(x, y, currentValue ^ value);
  }

  drawSprite(dx: number, dy: number, sprite: Uint8Array) {
    for (let y = 0; y < sprite.length; y++) {
      const row = sprite[y];
      for (let x = 0; x < 8; x++) {
        const pixel = this.getPixelFromByte(row, x);
        this.xorPixel(dx + x, dy + y, pixel);
      }
    }
  }

  clear() {
    this.frameBuffer.clearBuffer();
  }
}

export const newDOMScreen = () => {
  const rows = 32;
  const columns = 64;
  const frameBuffer = new FrameBuffer(rows, columns);
  const renderer = new DOMRenderer(rows, columns);

  return new Screen(frameBuffer, renderer);
};
