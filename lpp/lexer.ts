import { Token, TokenType, lookupTokenType } from './tokens';

class Lexer {
    private _source: string;
    private _character: string = '';
    private _position: number = 0;
    private _read_position: number = 0;

    constructor(source: string) {
        this._source = source;
        this._readCharacter();
    }

    nextToken(): Token {
        this._skipWhitespace();
        let token : Token;

        if (this._character.match(/^=$/)) {
            if (this._peekCharacter() === '=')
                token = this._makeTwoCharacterToken(TokenType.EQ);
            else
                token = new Token(TokenType.ASSING, this._character);
        } else if (this._character.match(/^,$/)) {
            token = new Token(TokenType.COMMA, this._character);
        } else if (this._character.match(/^;$/)) {
            token = new Token(TokenType.SEMICOLON, this._character);
        } else if (this._character.match(/^\{$/)) {
            token = new Token(TokenType.LBRACE, this._character);
        } else if (this._character.match(/^\}$/)) {
            token = new Token(TokenType.RBRACE, this._character);
        } else if (this._character.match(/^\($/)) {
            token = new Token(TokenType.LPAREN, this._character);
        } else if (this._character.match(/^\)$/)) {
            token = new Token(TokenType.RPAREN, this._character);
        } else if (this._character.match(/^<$/)) {
            token = new Token(TokenType.LT, this._character);
        } else if (this._character.match(/^>$/)) {
            token = new Token(TokenType.GT, this._character);
        } else if (this._character.match(/^\!$/)) {
            token = new Token(TokenType.NEGATION, this._character);
        } else if (this._character.match(/^\+$/)) {
            token = new Token(TokenType.PLUS, this._character);
        } else if (this._character.match(/^\-$/)) {
            token = new Token(TokenType.MINUS, this._character);
        } else if (this._character.match(/^\*$/)) {
            token = new Token(TokenType.MULTIPLICATION, this._character);
        } else if (this._character.match(/^\//)) {
            token = new Token(TokenType.DIVISION, this._character);
        } else if (this._character === '') {
            token = new Token(TokenType.EOF, this._character);
        } else if (this._isLetter(this._character)) {
            const literal = this._readIdentifier();
            const tokenType = lookupTokenType(literal);
            return new Token(tokenType, literal);
        } else if (this._isNumber(this._character)) {
            const literal = this._readNumber();
            return new Token(TokenType.INT, literal);
        } else {
            token = new Token(TokenType.ILLEGAL, this._character);
        }
        this._readCharacter()
        return token;
    }
    

    private _isLetter(character: string): boolean {
        return /^[a-záéíóúA-ZñÑ_]$/.test(character);
    }

    private _isNumber(character: string): boolean {
        return /^\d$/.test(character);
    }

    private _makeTwoCharacterToken(tokenType: TokenType): Token {
        const prefix = this._character;
        this._readCharacter();
        const suffix = this._character;
        return new Token(tokenType, `${prefix}${suffix}`);
    }

    private _peekCharacter(): string {
        if (this._read_position >= this._source.length) {
            return '';
        }
        return this._source[this._read_position];
    }

    private _readCharacter(): void {
        if (this._read_position >= this._source.length) {
            this._character = '';
        } else {
            this._character = this._source[this._read_position];
        }
        this._position = this._read_position;
        this._read_position++;
    }

    private _readIdentifier(): string {
        const initialPosition = this._position;
        while (this._isLetter(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    }

    private _readNumber(): string {
        const initialPosition = this._position;
        while (this._isNumber(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    }

    private _skipWhitespace(): void {
        while (/^\s$/.test(this._character)) {
            this._readCharacter();
        }
    }
}

export { Lexer }