import { TokenMaker, Token } from "./tokens";

export default class Lexer {
  source: string = "";
  index = 0;

  tokens: Token[] = [];

  tokenMaker: TokenMaker = new TokenMaker();

  constructor(source) {
    this.source = source;
  }

  private getNumber() {
    let c = this.source[this.index];
    const numberRegex = new RegExp(/[0-9]/);

    let n = "";

    while (numberRegex.test(c)) {
      n += c;

      if (!numberRegex.test(this.source[this.index + 1])) {
        break;
      }

      this.index++;
      c = this.source[this.index];
    }

    return n;
  }

  private getText() {
    let c = this.source[this.index];

    const textRegex = new RegExp(/[a-zA-Z0-9]/);

    let n = "";

    while (c && textRegex.test(c)) {
      n += c;

      if (!textRegex.test(this.source[this.index + 1])) {
        break;
      }

      this.index++;
      c = this.source[this.index];
    }

    return n;
  }

  private isKeyword(keyword: string) {
    const keywords = ["u8"];
    return keywords.includes(keyword);
  }

  parse() {
    let c = this.source[this.index];
    while (c) {
      switch (c) {
        // skip
        case "":
        case " ":
        case "\n":
          break;

        case "+": {
          this.tokens.push(this.tokenMaker.createPlusToken());
          break;
        }
        case "-": {
          this.tokens.push(this.tokenMaker.createMinusToken());
          break;
        }
        case "*": {
          this.tokens.push(this.tokenMaker.createAsteriskToken());
          break;
        }
        case "/": {
          this.tokens.push(this.tokenMaker.createDivideToken());
          break;
        }
        case "=": {
          this.tokens.push(this.tokenMaker.createEqualsToken());
          break;
        }
        case "(": {
          this.tokens.push(this.tokenMaker.createLeftParen());
          break;
        }
        case ")": {
          this.tokens.push(this.tokenMaker.createRightParen());
          break;
        }
        case "[": {
          this.tokens.push(this.tokenMaker.createLeftBracketToken());
          break;
        }
        case "]": {
          this.tokens.push(this.tokenMaker.createRightBracketToken());
          break;
        }
        case ";": {
          this.tokens.push(this.tokenMaker.createSemicolonToken());
          break;
        }
      }
      const textRegex = new RegExp(/[a-zA-Z0-9]/);
      const numberRegex = new RegExp(/[0-9]/);
      if (numberRegex.test(c)) {
        const number = this.getNumber();
        this.tokens.push(this.tokenMaker.createNumberToken(number));
      } else if (textRegex.test(c)) {
        const text = this.getText();
        if (this.isKeyword(text)) {
          this.tokens.push(this.tokenMaker.createKeywordToken(text));
        } else {
          this.tokens.push(this.tokenMaker.createIdentifierToken(text));
        }
      }
      this.index++;
      c = this.source[this.index];
    }
  }

  getTokens() {
    this.parse();
    return this.tokens;
  }
}
