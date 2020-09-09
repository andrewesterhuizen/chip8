import Compiler from "../compiler";
import Lexer from "../lexer";
import Parser from "../Parser";

test("Compiler", () => {
  const program = `
    u8 num = 5;
    V0 = num;
  `;

  const lexer = new Lexer(program);

  const tokens = lexer.getTokens();
  const parser = new Parser(tokens);

  const ast = parser.getAST();

  console.log(JSON.stringify(ast, null, 2));

  const compiler = new Compiler(ast);
  const asm = compiler.compileToASM();
  console.log(asm);
});
