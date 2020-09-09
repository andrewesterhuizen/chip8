import {
  Program,
  Statement,
  DeclarationStatement,
  AssignmentStatement,
  Expression,
  IntegerLiteralExpression,
  IdentifierExpression,
} from "./ast";
import { StringBuilder } from "./util";

export default class Compiler {
  program: Program;

  nextRegister = 4;
  variables = {
    V0: 0,
    V1: 1,
    V2: 2,
    V3: 3,
  };

  constructor(program: Program) {
    this.program = program;
  }

  compileExpression(node: Expression) {
    switch (true) {
      case node instanceof IntegerLiteralExpression: {
        const integerLiteralExpression = node as IntegerLiteralExpression;
        return "0x" + integerLiteralExpression.value.toString(16);
      }
      case node instanceof IdentifierExpression: {
        const identifierExpression = node as IdentifierExpression;

        if (!(identifierExpression.value in this.variables)) {
          console.log(this.variables);
          throw new Error(`identifier ${identifierExpression.value} has not been declared`);
        }

        const register = this.variables[identifierExpression.value];

        return "V" + register.toString(16);
      }
    }
  }

  compileStatement(node: Statement) {
    let asm = new StringBuilder();

    switch (true) {
      case node instanceof DeclarationStatement: {
        const declarationStatement = node as DeclarationStatement;
        const identifier = declarationStatement.identifier;

        if (!(identifier in this.variables)) {
          this.variables[identifier] = this.nextRegister;
          this.nextRegister++;
        }

        const register = this.variables[identifier];

        const value = this.compileExpression(declarationStatement.value);

        asm.addLine(`LD V${register.toString(16)}, ${value}`);
        return asm.string();
      }
      case node instanceof AssignmentStatement: {
        const assignmentStatement = node as AssignmentStatement;
        const identifier = assignmentStatement.identifier;

        if (!(identifier in this.variables)) {
          throw new Error(`identifier ${identifier} has not been declared`);
        }

        const register = this.variables[identifier];

        const value = this.compileExpression(assignmentStatement.value);

        asm.addLine(`LD V${register.toString(16)}, ${value}`);
        return asm.string();
      }
      default:
        console.log(node);
        throw new Error("trying to compile unknown statement node type");
    }
  }

  compileToASM() {
    let asm = new StringBuilder();
    asm.addLine("start:");

    this.program.statements.forEach((statement) => {
      asm.addLine(this.compileStatement(statement));
    });

    asm.addLine("loop:");
    asm.addLine("  JP loop");

    return asm.string();
  }
}
