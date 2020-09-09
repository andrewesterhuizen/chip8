import Lexer from "../lexer";
import Parser from "../Parser";

test("Parser", () => {
  const program = `
  u8 num = 5;
  v0 = num;
`;

  const lexer = new Lexer(program);

  const tokens = lexer.getTokens();
  const parser = new Parser(tokens);

  const ast = parser.getAST();

  console.log(JSON.stringify(ast, null, 2));
});
