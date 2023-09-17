import { Token } from "./tokens";

export class ASTNode {
    token_literal(): string {
        throw new Error("Method not implemented.");
    }

    toString(): string {
        throw new Error("Method not implemented.");
    }
}

export class Statement extends ASTNode {
    constructor(public token: Token) {
        super();
    }

    token_literal(): string {
        return this.token.literal;
    }
}

export class Expression extends ASTNode {
    constructor(public token: Token) {
        super();
    }

    token_literal(): string {
        return this.token.literal;
    }
}

export class Program extends ASTNode {
    constructor(public statements: Statement[]) {
        super();
    }

    token_literal(): string {
        if (this.statements.length > 0) {
            return this.statements[0].token_literal();
        }
        return "";
    }

    toString(): string {
        const out: string[] = [];
        for (const statement of this.statements) {
            out.push(statement.toString());
        }
        return out.join("");
    }
}

export class Identifier extends Expression {
    constructor(public token: Token, public value: string) {
        super(token);
    }

    toString(): string {
        return this.value;
    }
}

export class LetStatement extends Statement {
    constructor(
        public token: Token,
        public name: Identifier | null = null,
        public value: Expression | null = null
    ) {
        super(token);
    }

    toString(): string {
        return `${this.token_literal()} ${this.name} = ${this.value};`;
    }
}

export class ReturnStatement extends Statement {
    constructor(public token: Token, public return_value: Expression | null = null) {
        super(token);
        this.return_value = return_value;
    }

    toString(): string {
        return `${this.token_literal()} ${this.return_value};`;
    }
}

export class ExpressionStatement extends Statement {
    constructor(public token: Token, public expression: Expression | null = null) {
        super(token);
    }

    toString(): string {
        return this.expression ? this.expression.toString() : "";
    }
}

export class IntegerLiteral extends Expression {
    constructor(public token: Token, public value: number | null = null) {
        super(token);
    }

    toString(): string {
        return this.value ? this.value.toString() : "";
    }
}

export class PrefixExpression extends Expression {
    constructor(
        public token: Token,
        public operator: string,
        public right: Expression | null = null
    ) {
        super(token);
    }

    toString(): string {
        return `(${this.operator}${this.right})`;
    }
}

export class InfixExpression extends Expression {
    constructor(
        public token: Token,
        public left: Expression,
        public operator: string,
        public right: Expression | null = null
    ) {
        super(token);
    }

    toString(): string {
        return `(${this.left} ${this.operator} ${this.right})`;
    }
}

export class BooleanLiteral extends Expression {
    constructor(public token: Token, public value: boolean | null = null) {
        super(token);
    }

    toString(): string {
        return this.token_literal();
    }
}

export class BlockStatement extends Statement {
    constructor(public token: Token, public statements: Statement[]) {
        super(token);
    }

    toString(): string {
        const out: string[] = [];
        for (const statement of this.statements) {
            out.push(statement.toString());
        }
        return out.join("");
    }
}

export class IfExpression extends Expression {
    constructor(
        public token: Token,
        public condition: Expression | null = null,
        public consequence: BlockStatement | null = null,
        public alternative: BlockStatement | null = null
    ) {
        super(token);
    }

    toString(): string {
        let out = `si ${this.condition} ${this.consequence}`;
        if (this.alternative) {
            out += `si_no ${this.alternative}`;
        }
        return out;
    }
}

export class FunctionLiteral extends Expression {
    constructor(
        public token: Token,
        public parameters: Identifier[] = [],
        public body: BlockStatement | null = null
    ) {
        super(token);
    }

    toString(): string {
        const params = this.parameters.join(", ");
        return `${this.token_literal()}(${params}) ${this.body}`;
    }
}

export class CallExpression extends Expression {
    constructor(
        public token: Token,
        public function_name: Expression,
        public arguments_list: Expression[] = []
    ) {
        super(token);
    }

    toString(): string {
        const args = this.arguments_list.join(", ");
        return `${this.function_name}(${args})`;
    }
}

export class StringLiteral extends Expression {
    constructor(public token: Token, public value: string | null = null) {
        super(token);
    }

    toString(): string {
        return this.value ? `"${this.value}"` : "";
    }
}
