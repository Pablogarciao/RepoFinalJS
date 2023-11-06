import { Token } from "./tokens.mjs";
import { ObjectType } from './object.mjs';
import { brotliCompressSync } from "zlib";


export class ASTNode {
    token_literal() {
        throw new Error("Method not implemented.");
    }

    toString(){
        throw new Error("Method not implemented.");
    }
}

export class Statement extends ASTNode {
    constructor(token) {
        super();
        this.token=token
    }

    token_literal() {
        return this.token.literal;
    }
}

export class Expression extends ASTNode {
    constructor(token) {
        super();
        this.token=token
    }

    token_literal(){
        return this.token.literal;
    }
}

export class Program extends ASTNode {
    constructor(statements) {
        super();
        this.statements = statements
    }

    token_literal(){
        if (this.statements.length > 0) {
            return this.statements[0].token_literal();
        }
        return "";
    }

    toString(){
        const out = [];
        for (const statement of this.statements) {
            out.push(statement.toString());
        }
        return out.join("");
    }
}

export class Identifier extends Expression {
    constructor( token, value) {
        super(token);
        this.token=token
        this.value=value
    }

    toString(){
        return this.value;
    }
}

export class LetStatement extends Statement {
    constructor(
         token,
         name = null,
         value = null
    ) { 
        super(token);
        this.name=name
        this.value=value
       
    }

    toString() {
        return `${this.token_literal()} ${this.name} = ${this.value};`;
    }
}

export class ReturnStatement extends Statement {
    constructor( token,  returnValue = null) {
        super(token);
        this.returnValue = returnValue;
    }

    toString(){
        return `${this.token_literal()} ${this.returnValue};`;
    }
}

export class ExpressionStatement extends Statement {
    constructor( token,  expression = null) {
        super(token);
        this.expression=expression
    }

    toString() {
        return this.expression ? this.expression.toString() : "";
    }
}

export class IntegerLiteral extends Expression {
    constructor( token,  value = null) {
        super(token);
        this.value=value
    }

    toString() {
        return this.value ? this.value.toString() : "";
    }
}

export class PrefixExpression extends Expression {
    constructor(
         token,
         operator,
         right = null
    ) {
        super(token);
        this.operator=operator
        this.right=right
        }

    toString() {
        return `(${this.operator}${this.right})`;
    }
}

export class InfixExpression extends Expression {
    constructor(
         token,
         left,
         operator,
         right = null
    ) {
        super(token);
        this.left=left
        this.operator=operator
        this.right=right
    }

    toString() {
        return `(${this.left} ${this.operator} ${this.right})`;
    }
}

export class BooleanLiteral extends Expression {
    constructor( token,  value = null) {
        super(token);
        this.value=value
    }

    toString() {
        return this.token_literal();
    }
}

export class BlockStatement extends Statement {
    constructor( token,  statements) {
        super(token);
        this.statements=statements
    }

    toString() {
        const out = [];
        for (const statement of this.statements) {
            out.push(statement.toString());
        }
        return out.join("");
    }
}

export class IfExpression extends Expression {
    constructor(
         token,
         condition = null,
         consequence = null,
         alternative = null
    ) {
        super(token);
        this.condition=condition
        this.consequence=consequence
        this.alternative=alternative
    }

    toString() {
        let out = `si ${this.condition} ${this.consequence}`;
        if (this.alternative) {
            out += `si_no ${this.alternative}`;
        }
        return out;
    }
}

export class FunctionLiteral extends Expression {
    constructor(
         token,
         parameters = [],
         body = null,
         name = null
    ) {
        super(token);
        this.parameters=parameters
        this.body=body
        this.name=name
    }

    type(){
        return ObjectType.FUNCTION;
    }

    toString() {
        const params = this.parameters.join(", ");
        return `${this.token_literal()}(${params}) ${this.body}`;
    }
}

export class CallExpression extends Expression {
    constructor(
         token,
         function_name,
         args = []
    ) {
        super(token);
        this.function_name=function_name
        this.args=args
    }

    toString() {
        const args = this.args.join(", ");
        return `${this.function_name}(${args})`;
    }
}

export class StringLiteral extends Expression {
    constructor( token,  valu = null) {
        super(token);
        this.valu=valu
    }

    toString() {
        return super.toString();
    }
}
