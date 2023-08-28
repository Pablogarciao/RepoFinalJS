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
                token = this._makeTwoCharacterToken(TokenType.EQ); // TOKEN -> '=='
            else
                token = new Token(TokenType.ASSING, this._character); // TOKEN -> '='
        } else if (this._character.match(/^,$/)) { // TOKEN -> ','
            token = new Token(TokenType.COMMA, this._character);
        } else if (this._character.match(/^;$/)) { // TOKEN -> ';'
            token = new Token(TokenType.SEMICOLON, this._character);
        } else if (this._character.match(/^\{$/)) { // TOKEN -> '{'
            token = new Token(TokenType.LBRACE, this._character);
        } else if (this._character.match(/^\}$/)) { // TOKEN -> '}'
            token = new Token(TokenType.RBRACE, this._character);
        } else if (this._character.match(/^\($/)) { // TOKEN -> '('
            token = new Token(TokenType.LPAREN, this._character);
        } else if (this._character.match(/^\)$/)) { // TOKEN -> ')'
            token = new Token(TokenType.RPAREN, this._character);
        } else if (this._character.match(/^<$/)) { // TOKEN -> '<'
            token = new Token(TokenType.LT, this._character);
        } else if (this._character.match(/^>$/)) { // TOKEN -> '>'
            token = new Token(TokenType.GT, this._character);
        } else if (this._character.match(/^\!$/)) { // TOKEN -> '!'
            token = new Token(TokenType.NEGATION, this._character);
        } else if (this._character.match(/^\+$/)) { // TOKEN -> '+'
            token = new Token(TokenType.PLUS, this._character);
        } else if (this._character.match(/^\-$/)) { // TOKEN -> '-'
            token = new Token(TokenType.MINUS, this._character);
        } else if (this._character.match(/^\*$/)) { // TOKEN -> '*'
            token = new Token(TokenType.MULTIPLICATION, this._character);
        } else if (this._character.match(/^\//)) { // TOKEN -> '/'
            token = new Token(TokenType.DIVISION, this._character);
        } else if (this._character === '') { // TOKEN -> Cadena vacía(Final del archivo)
            token = new Token(TokenType.EOF, this._character);
        } else if (this._isLetter(this._character)) { // MÉTODO -> LETRAS
            const literal = this._readIdentifier();
            const tokenType = lookupTokenType(literal);
            return new Token(tokenType, literal);
        } else if (this._isNumber(this._character)) { // MÉTODO -> NÚMEROS
            const literal = this._readNumber();
            return new Token(TokenType.INT, literal);
        } else {
            token = new Token(TokenType.ILLEGAL, this._character);
        }
        this._readCharacter()
        return token;
    }
    
    // Método para identificación de letras
    private _isLetter(character: string): boolean {
        return /^[a-záéíóúA-ZñÑ_]$/.test(character);
    }

    // Método para identificación de números
    private _isNumber(character: string): boolean {
        return /^\d$/.test(character);
    }

    // Método que se encarga de leer dos caracteres consecutivos de la secuencia de entrada y crear un token con ellos
    private _makeTwoCharacterToken(tokenType: TokenType): Token {
        const prefix = this._character;
        this._readCharacter();
        const suffix = this._character;
        return new Token(tokenType, `${prefix}${suffix}`);
    }

    // Método para que el lexer examine el próximo carácter en la secuencia de entrada sin moverse a la siguiente posición de lectura
    private _peekCharacter(): string {
        if (this._read_position >= this._source.length) {
            return '';
        }
        return this._source[this._read_position];
    }

    // Método que se encarga de avanzar la posición de lectura en la secuencia de entrada, actualizar el carácter actual que se está procesando y mantener la posición actual sincronizada con la posición de lectura 
    private _readCharacter(): void {
        if (this._read_position >= this._source.length) {
            this._character = '';
        } else {
            this._character = this._source[this._read_position];
        }
        this._position = this._read_position;
        this._read_position++;
    }

    // Método que se encarga de reconocer y leer un identificador (una secuencia de letras y dígitos) en la secuencia de entrada
    private _readIdentifier(): string {
        const initialPosition = this._position;
        while (this._isLetter(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    }

    // Método que se encarga de reconocer y leer un número (una secuencia de dígitos) en la secuencia de entrada.
    private _readNumber(): string {
        const initialPosition = this._position;
        while (this._isNumber(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    }

    // Método que se encarga de avanzar a través de los espacios en blanco en la secuencia de entrada hasta que se llegue a un carácter que no sea un espacio en blanco.
    private _skipWhitespace(): void {
        while (/^\s$/.test(this._character)) {
            this._readCharacter();
        }
    }
}

export { Lexer }