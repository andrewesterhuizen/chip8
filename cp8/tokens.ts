export enum TokenType {
  Number = "Number",
  Keyword = "Keyword",
  Identifier = "Identifier",
  LeftParen = "LeftParen",
  RightParen = "RightParen",
  LeftBracket = "LeftBracket",
  RightBracket = "RightBracket",
  LeftBrace = "LeftBrace",
  RightBrace = "RightBrace",
  Semicolon = "Semicolon",
  Equals = "Equals",
  Plus = "Plus",
  Minus = "Minus",
  Asterisk = "Asterisk",
  Divide = "Divide",
}

export class Token {
  type: TokenType;
  value?: string;

  constructor(type: TokenType, value?: string) {
    this.type = type;
    this.value = value;
  }
}

export class TokenMaker {
  createNumberToken(value: string) {
    return new Token(TokenType.Number, value);
  }

  createPlusToken() {
    return new Token(TokenType.Plus);
  }

  createMinusToken() {
    return new Token(TokenType.Minus);
  }

  createAsteriskToken() {
    return new Token(TokenType.Asterisk);
  }

  createDivideToken() {
    return new Token(TokenType.Divide);
  }

  createEqualsToken() {
    return new Token(TokenType.Equals);
  }

  createSemicolonToken() {
    return new Token(TokenType.Semicolon);
  }

  createKeywordToken(value: string) {
    return new Token(TokenType.Keyword, value);
  }

  createIdentifierToken(value: string) {
    return new Token(TokenType.Identifier, value);
  }

  createLeftParen() {
    return new Token(TokenType.LeftParen);
  }

  createRightParen() {
    return new Token(TokenType.RightParen);
  }

  createLeftBracketToken() {
    return new Token(TokenType.LeftBracket);
  }

  createRightBracketToken() {
    return new Token(TokenType.RightBracket);
  }

  createLeftBraceToken() {
    return new Token(TokenType.LeftBrace);
  }

  createRightBraceToken() {
    return new Token(TokenType.RightBrace);
  }
}
