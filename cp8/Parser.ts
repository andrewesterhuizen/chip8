import { Token, TokenType } from "./tokens";
import { ASTNodeMaker } from "./ast";

export default class Parser {
  tokens: Token[] = [];
  index = 0;

  astNodeMaker = new ASTNodeMaker();

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private parseExpression() {
    const token = this.tokens[this.index];
    console.log("parseExpression", token);

    switch (token.type) {
      case TokenType.Number: {
        // TODO: check for NaN
        const int = parseInt(token.value);
        const expression = this.astNodeMaker.createIntegerLiteralExpression(int);

        const nextToken = this.tokens[this.index + 1];

        switch (nextToken.type) {
          case TokenType.Semicolon: {
            this.consumeToken(TokenType.Semicolon);

            return expression;
          }
          case TokenType.Plus: {
            this.consumeToken(TokenType.Plus);
            this.index++;
            const rightExpression = this.parseExpression();
            return this.astNodeMaker.createInfixExpression("+", expression, rightExpression);
          }

          default:
            throw new Error(
              `unexpected next token type ${nextToken.type} when parsing expression starting with number`
            );
        }
      }

      case TokenType.Identifier: {
        const expression = this.astNodeMaker.createIdentifierExpression(token.value);
        const nextToken = this.tokens[this.index + 1];

        switch (nextToken.type) {
          case TokenType.Semicolon: {
            this.consumeToken(TokenType.Semicolon);

            return expression;
          }
          case TokenType.Plus: {
            this.consumeToken(TokenType.Plus);
            this.index++;
            const rightExpression = this.parseExpression();
            return this.astNodeMaker.createInfixExpression("+", expression, rightExpression);
          }

          default:
            throw new Error(
              `unexpected next token type ${nextToken.type} when parsing expression starting with identifier`
            );
        }
      }

      default:
        throw new Error("unable to parse expression starting with Token type: " + token.type);
    }
  }

  consumeToken(expectedType: TokenType) {
    this.index++;
    const token = this.tokens[this.index];
    console.log("consumeToken", expectedType, token);
    if (token.type !== expectedType) {
      throw new Error(`Unexpected token: Expected ${expectedType} and got ${token.type}`);
    }

    return token;
  }

  private parseDeclarationStatement() {
    const keyword = this.tokens[this.index];

    const identifierToken = this.consumeToken(TokenType.Identifier);

    this.consumeToken(TokenType.Equals);

    this.index++;
    const expression = this.parseExpression();

    return this.astNodeMaker.createDeclarationStatement(keyword.value, identifierToken.value, expression);
  }

  private parseAssignmentStatement() {
    console.log("parseAssignmentStatement");
    const identifier = this.tokens[this.index];

    this.consumeToken(TokenType.Equals);

    this.index++;
    const expression = this.parseExpression();

    return this.astNodeMaker.createAssignmentStatement(identifier.value, expression);
  }

  private parseStatement() {
    const token = this.tokens[this.index];
    console.log("parseStatement", token);

    switch (token.type) {
      case TokenType.Keyword: {
        switch (token.value) {
          case "u8": {
            return this.parseDeclarationStatement();
          }

          default:
            throw new Error("unable to parse Keyword statement with token value: " + token.value);
        }
      }

      case TokenType.Identifier: {
        const nextToken = this.tokens[this.index + 1];

        switch (nextToken.type) {
          case TokenType.Equals: {
            return this.parseAssignmentStatement();
          }

          default:
            throw new Error("unable to parse Identifier statement with token type: " + token.type);
        }
      }

      default: {
        throw new Error("unable to parse statement starting with Token type: " + token.type);
      }
    }
  }

  getAST() {
    const root = this.astNodeMaker.createProgram();
    let token = this.tokens[this.index];

    while (token) {
      console.log("loop", token);
      root.statements.push(this.parseStatement());

      this.index++;
      token = this.tokens[this.index];
    }

    return root;

    // tokenMaker.createKeywordToken("u8"),
    // tokenMaker.createIdentifierToken("name"),
    // tokenMaker.createEqualsToken(),
    // tokenMaker.createNumberToken("1"),
    // tokenMaker.createSemicolonToken(),
  }
}
