import {
    BlockStatement as Block,
    BooleanLiteral as Boolean,
    CallExpression as Call,
    Identifier,
    Expression,
    ExpressionStatement,
    FunctionLiteral as Function,
    IfExpression as If,
    InfixExpression as Infix,
    IntegerLiteral as Integer,
    LetStatement,
    PrefixExpression as Prefix,
    Program,
    ReturnStatement,
    Statement,
} from "./ast";

import { Token, TokenType } from "./tokens";
import Lexer from "./lexer";

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (left: Expression) => Expression | null;
type PrefixParseFns = { [tokenType: string]: PrefixParseFn };
type InfixParseFns = { [tokenType: string]: InfixParseFn };

enum Precedence {
    LOWEST,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL
}

const PRECEDENCES: Partial<Record<TokenType, Precedence>> = {
    [TokenType.EQ]: Precedence.EQUALS,
    [TokenType.DIF]: Precedence.EQUALS,
    [TokenType.LT]: Precedence.LESSGREATER,
    [TokenType.LTE]: Precedence.LESSGREATER,
    [TokenType.GT]: Precedence.LESSGREATER,
    [TokenType.GTE]: Precedence.LESSGREATER,
    [TokenType.PLUS]: Precedence.SUM,
    [TokenType.MINUS]: Precedence.SUM,
    [TokenType.DIVISION]: Precedence.PRODUCT,
    [TokenType.MULTIPLICATION]: Precedence.PRODUCT,
    [TokenType.LPAREN]: Precedence.CALL,
};


class Parser {
    public lexer: Lexer;
    public currentToken: Token | null = null;
    public peekToken: Token | null = null;
    public errors: string[] = [];

    public prefixParseFns: PrefixParseFns = {};
    public infixParseFns: InfixParseFns = {};

    constructor(lexer: Lexer) {
        this.lexer = lexer;
        
        this.prefixParseFns = this.registerPrefixFns();
        this.infixParseFns = this.registerInfixFns();

        this.advanceTokens();
        this.advanceTokens();
    }

    parseProgram(): Program {
        const program: Program = new Program([]);
        
        if (!this.currentToken) {
            return program;
        }

        while (this.currentToken.tokenType !== TokenType.EOF) {
            const statement = this.parseStatement();
            if (statement !== null) {
                program.statements.push(statement);
            }

            this.advanceTokens();
        }

        return program;
    }

    private advanceTokens(): void {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    private currentPrecedence(): Precedence {
        if (!this.currentToken) {
            return Precedence.LOWEST;
        }
        try {
            return PRECEDENCES[this.currentToken.tokenType];
        } catch (error) {
            return Precedence.LOWEST;
        }
    }

    private expectedToken(tokenType: TokenType): boolean {
        if (!this.peekToken) {
            return false;
        }

        if (this.peekToken.tokenType === tokenType) {
            this.advanceTokens();
            return true;
        }

        this.expectedTokenError(tokenType);
        return false;
    }

    private expectedTokenError(tokenType: TokenType): void {
        if (!this.peekToken) {
            return;
        }
        const error = `Se esperaba que el siguiente token fuera ${tokenType}, ` +
            `pero se obtuvo ${this.peekToken.tokenType}`;
        this.errors.push(error);
    }

    private parseBlock(): Block {
        if (!this.currentToken) {
            throw new Error('Current token is null.');
        }
    
        const blockStatement = new Block(this.currentToken, []);
    
        this.advanceTokens();
    
        while (
            this.currentToken?.tokenType !== TokenType.RBRACE &&
            this.currentToken?.tokenType !== TokenType.EOF
        ) {
            const statement = this.parseStatement();
    
            if (statement) {
                blockStatement.statements.push(statement);
            }
    
            this.advanceTokens();
        }
    
        return blockStatement;
    }

    private parseBoolean(): Boolean {
        if (!this.currentToken) {
            throw new Error('Current token is null.');
        }
    
        return new Boolean(this.currentToken, this.currentToken.tokenType === TokenType.TRUE);
    }
    
    private parseCall(functionExpression: Expression): Call {
        if (!this.currentToken) {
            throw new Error('Current token is null.');
        }
    
        const call = new Call(this.currentToken, functionExpression);
        call.args = this.parseCallArguments();
    
        return call;
    }

    private parseCallArguments(): Expression[] | null {
        const args: Expression[] = [];
    
        if (!this.peekToken) {
            throw new Error('Peek token is null.');
        }
    
        if (this.peekToken.tokenType === TokenType.RPAREN) {
            this.advanceTokens();
    
            return args;
        }
    
        this.advanceTokens();
    
        const expression = this.parseExpression(Precedence.LOWEST);
    
        if (expression) {
            args.push(expression);
        }
    
        while (this.peekToken.tokenType === TokenType.COMMA) {
            this.advanceTokens();
            this.advanceTokens();
    
            const expression = this.parseExpression(Precedence.LOWEST);
    
            if (expression) {
                args.push(expression);
            }
        }
    
        if (!this.expectedToken(TokenType.RPAREN)) {
            return null;
        }
    
        return args;
    }
    
    private parseExpression(precedence: Precedence): Expression | null {
        if (!this.currentToken) {
            throw new Error('Current token is null.');
        }
    
        const prefixParseFn = this.prefixParseFns[this.currentToken.tokenType];
    
        if (!prefixParseFn) {
            const message = `No se encontró ninguna función para analizar ${this.currentToken.literal}`;
            this.errors.push(message);
            return null;
        }
    
        let leftExpression = prefixParseFn();
    
        if (!this.peekToken) {
            throw new Error('Peek token is null.');
        }
    
        while (this.peekToken.tokenType !== TokenType.SEMICOLON && precedence < this.peekPrecedence()) {
            const infixParseFn = this.infixParseFns[this.peekToken.tokenType];
    
            if (!infixParseFn) {
                return leftExpression;
            }
    
            this.advanceTokens();
    
            if (!leftExpression) {
                throw new Error('Left expression is null.');
            }
    
            leftExpression = infixParseFn(leftExpression);
        }
    
        return leftExpression;
    }
    
    private parseExpressionStatement(): ExpressionStatement | null {
        if (!this.currentToken) {
            throw new Error('Current token is null.');
        }
    
        const expressionStatement = new ExpressionStatement(this.currentToken);
    
        expressionStatement.expression = this.parseExpression(Precedence.LOWEST);
    
        if (!this.peekToken) {
            throw new Error('Peek token is null.');
        }
    
        if (this.peekToken.tokenType === TokenType.SEMICOLON) {
            this.advanceTokens();
        }
    
        return expressionStatement;
    }
    
    private parseGroupedExpression(): Expression | null {
        this.advanceTokens();
    
        const expression = this.parseExpression(Precedence.LOWEST);
    
        if (!this.expectedToken(TokenType.RPAREN)) {
            return null;
        }
    
        return expression;
    }
    
    private parseFunction(): Function | null {
        if (!this.currentToken) {
            throw new Error('Current token is null.');
        }
    
        const functionToken = this.currentToken;
        const func = new Function(functionToken);
    
        if (!this.expectedToken(TokenType.LPAREN)) {
            return null;
        }
    
        func.parameters = this.parseFunctionParameters();
    
        if (!this.expectedToken(TokenType.LBRACE)) {
            return null;
        }
    
        func.body = this.parseBlock();
    
        return func;
    }
    
    private parseFunctionParameters(): Identifier[] {
        const parameters: Identifier[] = [];
    
        if (this.peekToken && this.peekToken.tokenType === TokenType.RPAREN) {
            this.advanceTokens();
            return parameters;
        }
    
        this.advanceTokens();
    
        if (this.currentToken) {
            const identifier = new Identifier(this.currentToken, this.currentToken.literal);
            parameters.push(identifier);
        }
    
        while (this.peekToken && this.peekToken.tokenType === TokenType.COMMA) {
            this.advanceTokens();
            this.advanceTokens();
    
            if (this.currentToken) {
                const identifier = new Identifier(this.currentToken, this.currentToken.literal);
                parameters.push(identifier);
            }
        }
    
        if (!this.expectedToken(TokenType.RPAREN)) {
            return [];
        }
    
        return parameters;
    }
    
    private parseIdentifier(): Identifier | null {
        return this.currentToken ? new Identifier(this.currentToken, this.currentToken.literal) : null;
    }    
    
    private parseIf(): If | null {
        if (!this.currentToken) {
            return null;
        }
    
        const ifExpression = new If(this.currentToken);
    
        if (!this.expectedToken(TokenType.LPAREN)) {
            return null;
        }
    
        this.advanceTokens();
    
        ifExpression.condition = this.parseExpression(Precedence.LOWEST);
    
        if (!this.expectedToken(TokenType.RPAREN)) {
            return null;
        }
    
        if (!this.expectedToken(TokenType.LBRACE)) {
            return null;
        }
    
        ifExpression.consequence = this.parseBlock();
    
        if (this.peekToken && this.peekToken.tokenType === TokenType.ELSE) {
            this.advanceTokens();
    
            if (!this.expectedToken(TokenType.LBRACE)) {
                return null;
            }
    
            ifExpression.alternative = this.parseBlock();
        }
    
        return ifExpression;
    }
    
    private parseInfixExpression(left: Expression): Infix {
        if (!this.currentToken) {
            throw new Error('currentToken is null');
        }
    
        const infix = new Infix(this.currentToken, left, this.currentToken.literal);
    
        const precedence = this.currentPrecedence();
    
        this.advanceTokens();
    
        infix.right = this.parseExpression(precedence);
    
        return infix;
    }
    
    private parseInteger(): Integer | null {
        if (!this.currentToken) {
            return null;
        }
    
        const integer = new Integer(this.currentToken);
    
        try {
            integer.value = parseInt(this.currentToken.literal, 10);
        } catch (error) {
            const message = `No se ha podido parsear ${this.currentToken.literal} como entero.`;
            this.errors.push(message);
            return null;
        }
    
        this.advanceTokens();
    
        return integer;
    }
    
    private parseLetStatement(): LetStatement | null {
        if (!this.currentToken) {
            return null;
        }
    
        const letStatement = new LetStatement(this.currentToken);
    
        if (!this.expectedToken(TokenType.IDENT)) {
            return null;
        }
    
        letStatement.name = this.parseIdentifier();
    
        if (!this.expectedToken(TokenType.ASSIGN)) {
            return null;
        }
    
        this.advanceTokens();
    
        letStatement.value = this.parseExpression(Precedence.LOWEST);
    
        if (this.peekToken && this.peekToken.tokenType === TokenType.SEMICOLON) {
            this.advanceTokens();
        }
    
        return letStatement;
    }
    
    private parsePrefixExpression(): Prefix | null {
        if (!this.currentToken) {
            return null;
        }
    
        const prefixExpression = new Prefix(this.currentToken, this.currentToken.literal);
    
        this.advanceTokens();
    
        prefixExpression.right = this.parseExpression(Precedence.PREFIX);
    
        return prefixExpression;
    }
    
    private parseReturnStatement(): ReturnStatement | null {
        if (!this.currentToken) {
            return null;
        }
    
        const returnStatement = new ReturnStatement(this.currentToken);
    
        this.advanceTokens();
    
        returnStatement.returnValue = this.parseExpression(Precedence.LOWEST);
    
        if (this.peekToken && this.peekToken.tokenType === TokenType.SEMICOLON) {
            this.advanceTokens();
        }
    
        return returnStatement;
    }
    
    private parseStatement(): Statement | null {
        if (!this.currentToken) {
            return null;
        }
    
        if (this.currentToken.tokenType === TokenType.LET) {
            return this.parseLetStatement();
        } else if (this.currentToken.tokenType === TokenType.RETURN) {
            return this.parseReturnStatement();
        } else {
            return this.parseExpressionStatement();
        }
    }
    
    private peekPrecedence(): Precedence {
        if (!this.peekToken) {
            return Precedence.LOWEST;
        }
    
        const precedence = PRECEDENCES[this.peekToken.tokenType];
        return precedence !== undefined ? precedence : Precedence.LOWEST;
    }
    
    private registerPrefixFns(): PrefixParseFns {
        return {
            [TokenType.FALSE]: this.parseBoolean.bind(this),
            [TokenType.FUNCTION]: this.parseFunction.bind(this),
            [TokenType.IDENT]: this.parseIdentifier.bind(this),
            [TokenType.IF]: this.parseIf.bind(this),
            [TokenType.INT]: this.parseInteger.bind(this),
            [TokenType.LPAREN]: this.parseGroupedExpression.bind(this),
            [TokenType.MINUS]: this.parsePrefixExpression.bind(this),
            [TokenType.NEGATION]: this.parsePrefixExpression.bind(this),
            [TokenType.TRUE]: this.parseBoolean.bind(this),
        };
    }
    
    private registerInfixFns(): InfixParseFns {
        return {
            [TokenType.PLUS]: this.parseInfixExpression.bind(this),
            [TokenType.MINUS]: this.parseInfixExpression.bind(this),
            [TokenType.DIVISION]: this.parseInfixExpression.bind(this),
            [TokenType.MULTIPLICATION]: this.parseInfixExpression.bind(this),
            [TokenType.EQ]: this.parseInfixExpression.bind(this),
            [TokenType.DIF]: this.parseInfixExpression.bind(this),
            [TokenType.LT]: this.parseInfixExpression.bind(this),
            [TokenType.LTE]: this.parseInfixExpression.bind(this),
            [TokenType.GT]: this.parseInfixExpression.bind(this),
            [TokenType.GTE]: this.parseInfixExpression.bind(this),
            [TokenType.LPAREN]: this.parseCall.bind(this),
        };
    }
}

export default Parser;