export default class Arg {
  private arg: string = "";
  constructor(arg: string) {
    if (arg) {
      this.arg = arg;
    }
  }

  isEmpty() {
    return this.arg === "";
  }

  isRegister() {
    return this.arg.startsWith("V");
  }

  getRegister() {
    return parseInt(this.arg.split("V")[1], 16);
  }

  isNumber() {
    return this.arg.startsWith("0x");
  }

  getNumber() {
    return parseInt(this.arg.split("0x")[1], 16);
  }

  getNibbles() {
    const n = this.getNumber();
    return [(n & 0xf00) >> 8, (n & 0xf0) >> 4, n & 0xf];
  }

  is(arg) {
    return this.arg === arg;
  }

  // isIRegister() {
  //   return this.arg === "I";
  // }

  // isDT() {
  //   return this.arg === "DT";
  // }

  // isK() {
  //   return this.arg === "K";
  // }

  // isST() {
  //   return this.arg === "ST";
  // }

  // isF() {
  //   return this.arg === "F";
  // }

  // isB() {
  //   return this.arg === "B";
  // }

  // isLocationI() {
  //   return this.arg === "[I]";
  // }

  rawArg() {
    return this.arg;
  }
}
