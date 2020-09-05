import Arg from "../Arg";

test("identifies empty value", () => {
  const arg = new Arg(undefined);
  expect(arg.isRegister()).toBe(false);
  expect(arg.isNumber()).toBe(false);
  expect(arg.isEmpty()).toBe(true);
  expect(arg.is("I")).toBe(false);
});

test("identifies register", () => {
  const arg = new Arg("V1");
  expect(arg.isRegister()).toBe(true);
  expect(arg.isEmpty()).toBe(false);
});

test("parses register (V1)", () => {
  const arg = new Arg("V1");
  expect(arg.getRegister()).toBe(1);
});

test("parses register (VA)", () => {
  const arg = new Arg("VA");
  expect(arg.getRegister()).toBe(10);
});

test(`identifies number`, () => {
  const arg = new Arg("0x1");
  expect(arg.isNumber()).toBe(true);
  expect(arg.isRegister()).toBe(false);
});

const numberTestData = [
  { in: "0x1", out: 1 },
  { in: "0x10", out: 16 },
  { in: "0x010", out: 16 },
  { in: "0x100", out: 256 },
  { in: "0x101", out: 257 },
  { in: "0xf", out: 15 },
  { in: "0xff", out: 255 },
  { in: "0xfff", out: 4095 },
];

numberTestData.forEach((t) => {
  test(`parses number (${t.in})`, () => {
    const arg = new Arg(t.in);
    expect(arg.getNumber()).toBe(t.out);
  });
});

numberTestData.forEach((t) => {
  test(`returns expect nibbles for number (${t.in})`, () => {
    const arg = new Arg(t.in);
    const [c, b, a] = arg.getNibbles();
    expect(a).toBe(t.out & 0xf);
    expect(b).toBe((t.out & 0xf0) >> 4);
    expect(c).toBe((t.out & 0xf00) >> 8);
  });
});

test("is returns true", () => {
  const arg = new Arg("I");
  expect(arg.is("I")).toBe(true);
});

test("is returns false", () => {
  const arg = new Arg("I");
  expect(arg.is("DT")).toBe(false);
});
