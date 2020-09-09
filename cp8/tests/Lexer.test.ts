import Lexer from "../Lexer";
import { TokenType, Token, TokenMaker } from "../tokens";

const tokenMaker = new TokenMaker();

const mathExpressionTests = [
  {
    input: "1 + 2;",
    expectedOutput: [
      tokenMaker.createNumberToken("1"),
      tokenMaker.createPlusToken(),
      tokenMaker.createNumberToken("2"),
      tokenMaker.createSemicolonToken(),
    ],
  },
  {
    input: "1 - 2;",
    expectedOutput: [
      tokenMaker.createNumberToken("1"),
      tokenMaker.createMinusToken(),
      tokenMaker.createNumberToken("2"),
      tokenMaker.createSemicolonToken(),
    ],
  },
  {
    input: "1 * 2;",
    expectedOutput: [
      tokenMaker.createNumberToken("1"),
      tokenMaker.createAsteriskToken(),
      tokenMaker.createNumberToken("2"),
      tokenMaker.createSemicolonToken(),
    ],
  },
  {
    input: "1 / 2;",
    expectedOutput: [
      tokenMaker.createNumberToken("1"),
      tokenMaker.createDivideToken(),
      tokenMaker.createNumberToken("2"),
      tokenMaker.createSemicolonToken(),
    ],
  },

  {
    input: "1 + (2 + 3);",
    expectedOutput: [
      tokenMaker.createNumberToken("1"),
      tokenMaker.createPlusToken(),
      tokenMaker.createLeftParen(),
      tokenMaker.createNumberToken("2"),
      tokenMaker.createPlusToken(),
      tokenMaker.createNumberToken("3"),
      tokenMaker.createRightParen(),
      tokenMaker.createSemicolonToken(),
    ],
  },
];

const assignmentExpressionTests = [
  {
    input: "u8 name = 1;",
    expectedOutput: [
      tokenMaker.createKeywordToken("u8"),
      tokenMaker.createIdentifierToken("name"),
      tokenMaker.createEqualsToken(),
      tokenMaker.createNumberToken("1"),
      tokenMaker.createSemicolonToken(),
    ],
  },
  {
    input: `
      u8 name;
      name = 1;
    `,
    expectedOutput: [
      tokenMaker.createKeywordToken("u8"),
      tokenMaker.createIdentifierToken("name"),
      tokenMaker.createSemicolonToken(),
      tokenMaker.createIdentifierToken("name"),
      tokenMaker.createEqualsToken(),
      tokenMaker.createNumberToken("1"),
      tokenMaker.createSemicolonToken(),
    ],
  },
  {
    input: "u8 name = 1 + 2;",
    expectedOutput: [
      tokenMaker.createKeywordToken("u8"),
      tokenMaker.createIdentifierToken("name"),
      tokenMaker.createEqualsToken(),
      tokenMaker.createNumberToken("1"),
      tokenMaker.createPlusToken(),
      tokenMaker.createNumberToken("2"),
      tokenMaker.createSemicolonToken(),
    ],
  },
  {
    input: `
      u8[5] name;
    `,
    expectedOutput: [
      tokenMaker.createKeywordToken("u8"),
      tokenMaker.createLeftBracketToken(),
      tokenMaker.createNumberToken("5"),
      tokenMaker.createRightBracketToken(),
      tokenMaker.createIdentifierToken("name"),
      tokenMaker.createSemicolonToken(),
    ],
  },
  {
    input: `
      u8[5] name;
      name[0] = 1;
    `,
    expectedOutput: [
      tokenMaker.createKeywordToken("u8"),
      tokenMaker.createLeftBracketToken(),
      tokenMaker.createNumberToken("5"),
      tokenMaker.createRightBracketToken(),
      tokenMaker.createIdentifierToken("name"),
      tokenMaker.createSemicolonToken(),
      tokenMaker.createIdentifierToken("name"),
      tokenMaker.createLeftBracketToken(),
      tokenMaker.createNumberToken("0"),
      tokenMaker.createRightBracketToken(),
      tokenMaker.createEqualsToken(),
      tokenMaker.createNumberToken("1"),
      tokenMaker.createSemicolonToken(),
    ],
  },
];

const expressionTests = [...mathExpressionTests, ...assignmentExpressionTests];
const t = [
  {
    input: `
    u8 num = 0;
    num = num + 1;
    V0 = num;
  `,
    expectedOutput: [
      // u8 num = 0;
      tokenMaker.createKeywordToken("u8"),
      tokenMaker.createIdentifierToken("num"),
      tokenMaker.createEqualsToken(),
      tokenMaker.createNumberToken("0"),
      tokenMaker.createSemicolonToken(),
      // num = num + 1;
      tokenMaker.createIdentifierToken("num"),
      tokenMaker.createEqualsToken(),
      tokenMaker.createIdentifierToken("num"),
      tokenMaker.createPlusToken(),
      tokenMaker.createNumberToken("1"),
      tokenMaker.createSemicolonToken(),
      // v0 = num;
      tokenMaker.createIdentifierToken("V0"),
      tokenMaker.createEqualsToken(),
      tokenMaker.createIdentifierToken("num"),
      tokenMaker.createSemicolonToken(),
    ],
  },
];

// {
//   input: `
// u8 num = 0;

// while(1) {
//   num = num + 1;
//   if(num == 10) {
//     num = 0;
//   }

//   v0 = v0 + num;
// }
// `,
//   expectedOutput: [
//     tokenMaker.createKeywordToken("u8"),
//     tokenMaker.createIdentifierToken("num"),
//     tokenMaker.createEqualsToken(),
//     tokenMaker.createNumberToken("0"),
//     tokenMaker.createSemicolonToken(),
//     //
//     tokenMaker.createKeywordToken("while"),
//     tokenMaker.createLeftParen(),
//     tokenMaker.createNumberToken("1"),
//     tokenMaker.createRightParen(),
//     tokenMaker.createLeftBraceToken(),
//     //
//     tokenMaker.createIdentifierToken("num"),
//     tokenMaker.createEqualsToken(),
//     tokenMaker.createIdentifierToken("num"),
//     tokenMaker.createPlusToken(),
//     tokenMaker.createNumberToken("1"),
//     tokenMaker.createSemicolonToken(),
//     //
//     tokenMaker.createKeywordToken("if"),
//     tokenMaker.createLeftParen(),
//     tokenMaker.createIdentifierToken("num"),
//     tokenMaker.createEqualityToken(),
//     tokenMaker.createNumberToken("10"),
//     tokenMaker.createRightParen(),
//     tokenMaker.createLeftBraceToken(),

//     //
//     tokenMaker.createRightBraceToken(),
//     //
//     tokenMaker.createRightBraceToken(),
//   ],
// }

for (let testCase of t) {
  test("lexer parses expression: " + testCase.input, () => {
    const lexer = new Lexer(testCase.input);
    const tokens = lexer.getTokens();
    console.log(tokens);
    for (let i = 0; i < testCase.expectedOutput.length; i++) {
      const a = testCase.expectedOutput[i];
      const b = tokens[i];
      expect(a.type).toBe(b.type);
      expect(a.value).toBe(b.value);
    }
  });
}
