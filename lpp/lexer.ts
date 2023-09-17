import { Token, TokenType, lookupTokenType } from './tokens';

class Lexer {
    private source: string;
    private character: string = '';
    private readPosition: number = 0;
    private position: number = 0;

    constructor(source: string) {
        this.source = source;
        this.readCharacter();
    }

    public nextToken(): Token {
        this.skipWhitespace();
        let token : Token;

        switch (this.character) {
            case "=":
                if (this.peekCharacter() === '=') {
                    const tokenP = this.makeTwoCharacterToken(TokenType.EQ);
                    this.readCharacter();
                    token = tokenP;
                } else {
                    token = new Token(TokenType.ASSIGN, this.character);
                }
                break;
            case "+":
                token = new Token(TokenType.PLUS, this.character);
                break;
            case "":
                token = new Token(TokenType.EOF, this.character);
                break;
            case "(":
                token = new Token(TokenType.LPAREN, this.character);
                break;
            case ")":
                token = new Token(TokenType.RPAREN, this.character);
                break;
            case '}':
                token = new Token(TokenType.RBRACE, this.character);
                break;
            case ',':
                token = new Token(TokenType.COMMA, this.character);
                break;
            case ';':
                token = new Token(TokenType.SEMICOLON, this.character);
                break;
            case '-':
                token = new Token(TokenType.MINUS, this.character);
                break;
            case '/':
                token = new Token(TokenType.DIVISION, this.character);
                break;
            case '*':
                token = new Token(TokenType.MULTIPLICATION, this.character);
                break;
            case '<':
                if (this.peekCharacter() === '=') {
                    const tokenP = this.makeTwoCharacterToken(TokenType.LTE);
                    this.readCharacter();
                    token = tokenP;
                } else {
                    token = new Token(TokenType.LT, this.character);
                }
                break;
            case '>':
                if (this.peekCharacter() === '=') {
                    const tokenP = this.makeTwoCharacterToken(TokenType.GTE);
                    this.readCharacter();
                    token = tokenP;
                } else {
                    token = new Token(TokenType.GT, this.character);
                }
                break;
            case '!':
                if (this.peekCharacter() === '=') {
                    const tokenP = this.makeTwoCharacterToken(TokenType.NOT_EQ);
                    this.readCharacter();
                    token = tokenP;
                } else {
                    token = new Token(TokenType.NEGATION, this.character);
                }
                break;
            default:
                if (this.isLetter(this.character)) {
                    const literal = this.readIdentifier();
                    const tokenType = lookupTokenType(literal);
                    return new Token(tokenType, literal);
                } else if (this.isNumber(this.character)) {
                    const literal = this.readNumber();
                    return new Token(TokenType.INT, literal);
                }

                token = new Token(TokenType.ILLEGAL, this.character);
        }
        this.readCharacter()
        return token;
    }

    private isLetter(character: string): boolean {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ_]$/.test(character);
    }

    private isNumber(character: string): boolean {
        return /^\d$/.test(character);
    }

    private makeTwoCharacterToken(tokenType: TokenType): Token {
        const prefix = this.character;
        this.readCharacter();
        const suffix = this.character;
        return new Token(tokenType, `${prefix}${suffix}`);
    }

    private readCharacter(): void {
        if (this.readPosition >= this.source.length) {
            this.character = '';
        } else {
            this.character = this.source.charAt(this.readPosition);
        }
        this.position = this.readPosition;
        this.readPosition++;
    }

    private readIdentifier(): string {
        const initialPosition = this.position;
        let isFirstLetter = true;

        while (
            this.isLetter(this.character) ||
            (!isFirstLetter && this.isNumber(this.character))
        ) {
            this.readCharacter();
            isFirstLetter = false;
        }

        return this.source.slice(initialPosition, this.position);
    }

    private readNumber(): string {
        const initialPosition = this.position;

        while (this.isNumber(this.character)) {
            this.readCharacter();
        }

        return this.source.slice(initialPosition, this.position);
    }

    private peekCharacter(): string {
        if (this.readPosition >= this.source.length) {
            return '';
        }
        return this.source.charAt(this.readPosition);
    }

    private skipWhitespace(): void {
        while (/^\s$/.test(this.character)) {
            this.readCharacter();
        }
    }
}

export default Lexer;
