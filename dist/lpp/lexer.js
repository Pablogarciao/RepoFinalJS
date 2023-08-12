"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const tokens_1 = require("./tokens");
class Lexer {
    constructor(source) {
        this._character = '';
        this._position = 0;
        this._read_position = 0;
        this._source = source;
        this._readCharacter();
    }
    nextToken() {
        this._skipWhitespace();
        let token;
        if (this._character.match(/^=$/)) {
            if (this._peekCharacter() === '=')
                token = this._makeTwoCharacterToken(tokens_1.TokenType.EQ);
            else
                token = new tokens_1.Token(tokens_1.TokenType.ASSING, this._character);
        }
        else if (this._character.match(/^,$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.COMMA, this._character);
        }
        else if (this._character.match(/^;$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.SEMICOLON, this._character);
        }
        else if (this._character.match(/^\{$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.LBRACE, this._character);
        }
        else if (this._character.match(/^\}$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.RBRACE, this._character);
        }
        else if (this._character.match(/^\($/)) {
            token = new tokens_1.Token(tokens_1.TokenType.LPAREN, this._character);
        }
        else if (this._character.match(/^\)$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.RPAREN, this._character);
        }
        else if (this._character.match(/^<$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.LT, this._character);
        }
        else if (this._character.match(/^>$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.GT, this._character);
        }
        else if (this._character.match(/^\!$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.NEGATION, this._character);
        }
        else if (this._character.match(/^\+$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.PLUS, this._character);
        }
        else if (this._character.match(/^\-$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.MINUS, this._character);
        }
        else if (this._character.match(/^\*$/)) {
            token = new tokens_1.Token(tokens_1.TokenType.MULTIPLICATION, this._character);
        }
        else if (this._character.match(/^\//)) {
            token = new tokens_1.Token(tokens_1.TokenType.DIVISION, this._character);
        }
        else if (this._character === '') {
            token = new tokens_1.Token(tokens_1.TokenType.EOF, this._character);
        }
        else if (this._isLetter(this._character)) {
            const literal = this._readIdentifier();
            const tokenType = (0, tokens_1.lookupTokenType)(literal);
            return new tokens_1.Token(tokenType, literal);
        }
        else if (this._isNumber(this._character)) {
            const literal = this._readNumber();
            return new tokens_1.Token(tokens_1.TokenType.INT, literal);
        }
        else {
            token = new tokens_1.Token(tokens_1.TokenType.ILLEGAL, this._character);
        }
        this._readCharacter();
        return token;
    }
    _isLetter(character) {
        return /^[a-zA-Z]$/.test(character);
    }
    _isNumber(character) {
        return /^\d$/.test(character);
    }
    _makeTwoCharacterToken(tokenType) {
        const prefix = this._character;
        this._readCharacter();
        const suffix = this._character;
        return new tokens_1.Token(tokenType, `${prefix}${suffix}`);
    }
    _peekCharacter() {
        if (this._read_position >= this._source.length) {
            return '';
        }
        return this._source[this._read_position];
    }
    _readCharacter() {
        if (this._read_position >= this._source.length) {
            this._character = '';
        }
        else {
            this._character = this._source[this._read_position];
        }
        this._position = this._read_position;
        this._read_position++;
    }
    _readIdentifier() {
        const initialPosition = this._position;
        while (this._isLetter(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    }
    _readNumber() {
        const initialPosition = this._position;
        while (this._isNumber(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    }
    _skipWhitespace() {
        while (/^\s$/.test(this._character)) {
            this._readCharacter();
        }
    }
}
exports.Lexer = Lexer;
