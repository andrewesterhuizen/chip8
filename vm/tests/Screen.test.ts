import Screen, { FrameBuffer, Renderer } from "../peripherals/Screen";

class MockRenderer implements Renderer {
  setRequestBufferHandler() {}
}

const pixelSprite = new Uint8Array([1 << 7]);

test("Screen xors pixel", () => {
  const fb = new FrameBuffer(1, 1);
  const screen = new Screen(fb, new MockRenderer());

  expect(fb.getBuffer()[0]).toBe(0);
  screen.drawSprite(0, 0, pixelSprite);
  expect(fb.getBuffer()[0]).toBe(1);
  screen.drawSprite(0, 0, pixelSprite);
  expect(fb.getBuffer()[0]).toBe(0);
});

test("Screen clears buffer", () => {
  const fb = new FrameBuffer(1, 1);
  const screen = new Screen(fb, new MockRenderer());

  screen.drawSprite(0, 0, pixelSprite);
  expect(fb.getBuffer()[0]).toBe(1);

  screen.clear();
  expect(fb.getBuffer()[0]).toBe(0);
});

test("Sprite is removed when drawn twice", () => {
  const fb = new FrameBuffer(32, 64);
  const screen = new Screen(fb, new MockRenderer());
  const sprite = new Uint8Array([0xf0, 0x90, 0x90, 0x90, 0xf0]);

  screen.drawSprite(16, 16, sprite);
  screen.drawSprite(16, 16, sprite);

  const buffer = fb.getBuffer();

  for (let i = 0; i < buffer.length; i++) {
    expect(buffer[i]).toBe(0);
  }
});
