export interface Expression {}
export interface Statement {}

export class Program {
  statements: Statement[] = [];
}

export class DeclarationStatement implements Statement {
  type: string;
  identifier: string;
  value: Expression;

  constructor(type: string, identifier: string, value: Expression) {
    this.type = type;
    this.identifier = identifier;
    this.value = value;
  }
}

export class AssignmentStatement implements Statement {
  identifier: string;
  value: Expression;

  constructor(identifier: string, value: Expression) {
    this.identifier = identifier;
    this.value = value;
  }
}

export class IntegerLiteralExpression implements Expression {
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}

export class IdentifierExpression implements Expression {
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

export class InfixExpression implements Expression {
  operator: string;
  leftValue: Expression;
  rightValue: Expression;

  constructor(operator: string, leftValue: Expression, rightValue: Expression) {
    this.operator = operator;
    this.leftValue = leftValue;
    this.rightValue = rightValue;
  }
}

export class ASTNodeMaker {
  createProgram() {
    return new Program();
  }

  createDeclarationStatement(type: string, identifier: string, value: Expression): Statement {
    return new DeclarationStatement(type, identifier, value);
  }

  createAssignmentStatement(identifier: string, value: Expression) {
    return new AssignmentStatement(identifier, value);
  }

  createIntegerLiteralExpression(value: number): Expression {
    return new IntegerLiteralExpression(value);
  }

  createIdentifierExpression(value: string): Expression {
    return new IdentifierExpression(value);
  }

  createInfixExpression(operator: string, leftValue: Expression, rightValue: Expression) {
    return new InfixExpression(operator, leftValue, rightValue);
  }
}
