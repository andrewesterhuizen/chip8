export class StringBuilder {
  private _string = "";

  addLine(line: string) {
    this._string += line + "\n";
  }

  string() {
    return this._string;
  }
}
