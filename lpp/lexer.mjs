import { Token, TokenType, lookupTokenType } from './tokens.mjs';

class Lexer {
    source;
    character = '';
    readPosition = 0;
    position = 0;

    constructor(source) {
        this.source = source;
        this.readCharacter();
    }

     nextToken() {
        this.skipWhitespace();
        let token ;

        switch (this.character) {
            case "=":
                if (this.peekCharacter() === '=') {
                    const tokenP = this.makeTwoCharacterToken(TokenType.EQ);
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
            case '{':
                token = new Token(TokenType.LBRACE, this.character);
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
                    token = tokenP;
                } else {
                    token = new Token(TokenType.LT, this.character);
                }
                break;
            case '>':
                if (this.peekCharacter() === '=') {
                    const tokenP = this.makeTwoCharacterToken(TokenType.GTE);
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
            case '"':
                const literal = this.readString();
                token = new Token(TokenType.STRING, literal);
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

    isLetter(character) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ_]$/.test(character);
    }

    isNumber(character) {
        return /^\d$/.test(character);
    }

    makeTwoCharacterToken(tokenType) {
        const prefix = this.character;
        this.readCharacter();
        const suffix = this.character;
        return new Token(tokenType, `${prefix}${suffix}`);
    }

    readCharacter() {
        if (this.readPosition >= this.source.length) {
            this.character = '';
        } else {
            this.character = this.source.charAt(this.readPosition);
        }
        this.position = this.readPosition;
        this.readPosition++;
    }

    readIdentifier() {
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

    readNumber() {
        const initialPosition = this.position;

        while (this.isNumber(this.character)) {
            this.readCharacter();
        }

        return this.source.slice(initialPosition, this.position);
    }

    peekCharacter() {
        if (this.readPosition >= this.source.length) {
            return '';
        }
        return this.source.charAt(this.readPosition);
    }

    skipWhitespace() {
        while (/^\s$/.test(this.character)) {
            this.readCharacter();
        }
    }

    readString() {
        this.readCharacter();
    
        const initialPosition = this.position;
    
        while (this.character !== '"' && this.readPosition <= this.source.length) {
            this.readCharacter();
        }
    
        const string = this.source.substring(initialPosition, this.position);
    
        return string;
    }
}

export default Lexer;
