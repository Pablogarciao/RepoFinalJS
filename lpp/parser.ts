import {
    TokenType,
    Token,
} from './tokens';

import {
    Identifier,
    LetStatement,
    Statement,
    Expression,
    Program,
    ReturnStatement,
    CallExpression,
    ExpressionStatement,
    FunctionLiteral,
    IfExpression,
    InfixExpression,
    PrefixExpression,
    IntegerLiteral,
    BooleanLiteral,
    BlockStatement,
} from './ast';

import Lexer from './lexer';

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (left: Expression) => Expression | null;
type PrefixParseFns = { [tokenType: string]: PrefixParseFn };
type InfixParseFns = { [tokenType: string]: InfixParseFn };

class Precedence {
    static LOWEST = 1;
    static EQUALS = 2;
    static LESSGREATER = 3;
    static SUM = 4;
    static PRODUCT = 5;
    static PREFIX = 6;
    static CALL = 7;
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

        this.nextToken();
        this.nextToken();
    }

    private nextToken(): void {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    private peekPrecedence(): Precedence {
        if (this.peekToken) {
            const precedence = Precedence[this.peekToken.tokenType];
            if (precedence !== undefined) {
                return precedence;
            }
        }
        return Precedence.LOWEST;
    }

    private currentPrecedence(): Precedence {
        if (this.currentToken) {
            const precedence = PRECEDENCES[this.currentToken.tokenType];
            if (precedence !== undefined) {
                return precedence;
            }
        }
        return Precedence.LOWEST;
    }

    private expectPeek(tokenType: TokenType): boolean {
        if (this.peekToken && this.peekToken.tokenType === tokenType) {
            this.nextToken();
            return true;
        }
        this.peekError(tokenType);
        return false;
    }

    private peekError(tokenType: TokenType): void {
        const msg = `expected next token to be ${tokenType}, got ${this.peekToken?.tokenType} instead`;
        this.errors.push(msg);
    }

    private noPrefixParseFnError(tokenType: TokenType): void {
        const msg = `no prefix parse function for ${tokenType} found`;
        this.errors.push(msg);
    }

    parseProgram(): Program {
        const program = new Program([]);
        while (this.currentToken?.tokenType !== TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }
        return program;
    }

    private parseStatement(): Statement | null {
        switch (this.currentToken?.tokenType) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): LetStatement | null {
        const stmt = new LetStatement(this.currentToken);
        if (!this.expectPeek(TokenType.IDENT)) {
            return null;
        }
        stmt.name = new Identifier(this.currentToken, this.currentToken?.literal || "");
        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }
        this.nextToken();
        stmt.value = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }

    private parseReturnStatement(): ReturnStatement | null {
        const stmt = new ReturnStatement(this.currentToken);
        this.nextToken();
        stmt.return_value = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }

    private parseExpressionStatement(): ExpressionStatement | null {
        const stmt = new ExpressionStatement(this.currentToken);
        stmt.expression = this.parseExpression(Precedence.LOWEST);
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }

    private parseExpression(precedence: Precedence): Expression | null {
        const prefix = this.prefixParseFns[this.currentToken?.tokenType];
        if (!prefix) {
            this.noPrefixParseFnError(this.currentToken?.tokenType || TokenType.ILLEGAL);
            return null;
        }
        let leftExp = prefix.call(this);
        while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
            const infix = this.infixParseFns[this.peekToken?.tokenType];
            if (!infix) {
                return leftExp;
            }
            this.nextToken();
            if (!leftExp) {
                return null;
            }
            leftExp = infix.call(this, leftExp);
        }
        return leftExp;
    }

    private parseIdentifier(): Identifier | null {
        return this.currentToken ? new Identifier(this.currentToken, this.currentToken.literal) : null;
    }

    private parseIntegerLiteral(): IntegerLiteral | null {
        const lit = new IntegerLiteral(this.currentToken);
        if (!this.currentToken) {
            return null;
        }
        const value = parseInt(this.currentToken.literal, 10);
        if (isNaN(value)) {
            const msg = `could not parse ${this.currentToken.literal} as integer`;
            this.errors.push(msg);
            return null;
        }
        lit.value = value;
        return lit;
    }

    private parseBoolean(): BooleanLiteral | null {
        if (!this.currentToken) {
            return null;
        }
        return new BooleanLiteral(this.currentToken, this.currentTokenIs(TokenType.TRUE));
    }

    private parsePrefixExpression(): PrefixExpression | null {
        const expression = new PrefixExpression(this.currentToken, this.currentToken?.literal || "");
        this.nextToken();
        expression.right = this.parseExpression(Precedence.PREFIX);
        return expression;
    }

    private parseInfixExpression(left: Expression): InfixExpression | null {
        if (this.currentToken == null) return null;

        const infix = new InfixExpression(this.currentToken, left, this.currentToken.literal || "");
      
        const precedence = this.currentPrecedence();
      
        this.nextToken();
      
        infix.right = this.parseExpression(precedence);
      
        return infix;
    }

    private parseGroupedExpression(): Expression | null {
        this.nextToken();
        const exp = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }
        return exp;
    }

    private parseIfExpression(): IfExpression | null {
        const expression = new IfExpression(this.currentToken);
        if (!this.expectPeek(TokenType.LPAREN)) {
            return null;
        }
        this.nextToken();
        expression.condition = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(TokenType.RPAREN) || !this.expectPeek(TokenType.LBRACE)) {
            return null;
        }
        expression.consequence = this.parseBlockStatement();
        if (this.peekTokenIs(TokenType.ELSE)) {
            this.nextToken();
            if (!this.expectPeek(TokenType.LBRACE)) {
                return null;
            }
            expression.alternative = this.parseBlockStatement();
        }
        return expression;
    }

    private parseBlockStatement(): BlockStatement {
        const block = new BlockStatement(this.currentToken, []);
        this.nextToken();
        while (!this.currentTokenIs(TokenType.RBRACE) && !this.currentTokenIs(TokenType.EOF)) {
            const stmt = this.parseStatement();
            if (stmt) {
                block.statements.push(stmt);
            }
            this.nextToken();
        }
        return block;
    }

    private currentTokenIs(tokenType: TokenType): boolean {
        return this.currentToken ? this.currentToken.tokenType === tokenType : false;
    }

    private peekTokenIs(tokenType: TokenType): boolean {
        return this.peekToken ? this.peekToken.tokenType === tokenType : false;
    }

    private parseCall(functionExpression: Expression): CallExpression {
        if (!this.currentToken) {
          throw new Error('Token actual no definido');
        }
      
        const call = new CallExpression(this.currentToken, functionExpression);
        call.arguments_list = this.parseCallArguments();
      
        return call;
      }
      
      private parseCallArguments(): Expression[] | null {
        const arguments_list: Expression[] = [];
      
        if (!this.peekToken) {
          throw new Error('Token siguiente no definido');
        }
      
        if (this.peekToken.tokenType === TokenType.RPAREN) {
          this.nextToken();
          return arguments_list;
        }
      
        this.nextToken();
        const expression = this.parseExpression(Precedence.LOWEST);
        if (expression) {
          arguments_list.push(expression);
        }
      
        while (this.peekToken && this.peekToken.tokenType === TokenType.COMMA) {
          this.nextToken();
          this.nextToken();
      
          const expression = this.parseExpression(Precedence.LOWEST);
          if (expression) {
            arguments_list.push(expression);
          }
        }
      
        if (!this.expectPeek(TokenType.RPAREN)) {
          return null;
        }
      
        return arguments_list;
    }

    private parseFunction(): FunctionLiteral | null {
        if (!this.currentToken) {
            throw new Error('Token actual no definido');
        }
    
        const functionLiteral = new FunctionLiteral(this.currentToken);
        
        if (!this.expectPeek(TokenType.LPAREN)) {
            return null;
        }
        
        functionLiteral.parameters = this.parseFunctionParameters();
        
        if (!this.expectPeek(TokenType.LBRACE)) {
            return null;
        }
        
        functionLiteral.body = this.parseBlockStatement();
        
        return functionLiteral;
    }
      
    private parseFunctionParameters(): Identifier[] {
        const parameters: Identifier[] = [];
        
        if (!this.peekToken) {
            throw new Error('Token siguiente no definido');
        }
        
        if (this.peekToken.tokenType === TokenType.RPAREN) {
            this.nextToken();
            return parameters;
        }
        
        this.nextToken();
        
        if (!this.currentToken) {
            throw new Error('Token actual no definido');
        }
        
        const identifier = new Identifier(this.currentToken, this.currentToken.literal);
        parameters.push(identifier);
        
        while (this.peekToken && this.peekToken.tokenType === TokenType.COMMA) {
            this.nextToken();
            this.nextToken();
        
            if (!this.currentToken) {
            throw new Error('Token actual no definido');
            }
        
            const identifier = new Identifier(this.currentToken, this.currentToken.literal);
            parameters.push(identifier);
        }
        
        if (!this.expectPeek(TokenType.RPAREN)) {
            return [];
        }
        
        return parameters;
    }
      

    private registerInfixFns(): InfixParseFns {
        return {
            [TokenType.PLUS]: this.parseInfixExpression,
            [TokenType.MINUS]: this.parseInfixExpression,
            [TokenType.DIVISION]: this.parseInfixExpression,
            [TokenType.MULTIPLICATION]: this.parseInfixExpression,
            [TokenType.EQ]: this.parseInfixExpression,
            [TokenType.DIF]: this.parseInfixExpression,
            [TokenType.LT]: this.parseInfixExpression,
            [TokenType.LTE]: this.parseInfixExpression,
            [TokenType.GT]: this.parseInfixExpression,
            [TokenType.GTE]: this.parseInfixExpression,
            [TokenType.LPAREN]: this.parseCall,
        };
    }
    
    private registerPrefixFns(): PrefixParseFns {
        return {
            [TokenType.FALSE]: this.parseBoolean,
            [TokenType.FUNCTION]: this.parseFunction,
            [TokenType.IDENT]: this.parseIdentifier,
            [TokenType.IF]: this.parseIfExpression,
            [TokenType.INT]: this.parseIntegerLiteral,
            [TokenType.LPAREN]: this.parseGroupedExpression,
            [TokenType.MINUS]: this.parsePrefixExpression,
            [TokenType.NEGATION]: this.parsePrefixExpression,
            [TokenType.TRUE]: this.parseBoolean,
        };
    }
    
}

export default Parser;