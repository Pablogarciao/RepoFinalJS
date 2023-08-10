"use strict";
exports.__esModule = true;
exports.Lexer = void 0;
var tokens_1 = require("./tokens");
var Lexer = /** @class */ (function () {
    function Lexer(source) {
        this._character = '';
        this._position = 0;
        this._read_position = 0;
        this._source = source;
        this._readCharacter();
    }
    Lexer.prototype.nextToken = function () {
        this._skipWhitespace();
        var token;
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
            var literal = this._readIdentifier();
            var tokenType = (0, tokens_1.lookupTokenType)(literal);
            return new tokens_1.Token(tokenType, literal);
        }
        else if (this._isNumber(this._character)) {
            var literal = this._readNumber();
            return new tokens_1.Token(tokens_1.TokenType.INT, literal);
        }
        else {
            token = new tokens_1.Token(tokens_1.TokenType.ILLEGAL, this._character);
        }
        this._readCharacter();
        return token;
    };
    Lexer.prototype._isLetter = function (character) {
        return /^[a-zA-Z]$/.test(character);
    };
    Lexer.prototype._isNumber = function (character) {
        return /^\d$/.test(character);
    };
    Lexer.prototype._makeTwoCharacterToken = function (tokenType) {
        var prefix = this._character;
        this._readCharacter();
        var suffix = this._character;
        return new tokens_1.Token(tokenType, "".concat(prefix).concat(suffix));
    };
    Lexer.prototype._peekCharacter = function () {
        if (this._read_position >= this._source.length) {
            return '';
        }
        return this._source[this._read_position];
    };
    Lexer.prototype._readCharacter = function () {
        if (this._read_position >= this._source.length) {
            this._character = '';
        }
        else {
            this._character = this._source[this._read_position];
        }
        this._position = this._read_position;
        this._read_position++;
    };
    Lexer.prototype._readIdentifier = function () {
        var initialPosition = this._position;
        while (this._isLetter(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    };
    Lexer.prototype._readNumber = function () {
        var initialPosition = this._position;
        while (this._isNumber(this._character)) {
            this._readCharacter();
        }
        return this._source.slice(initialPosition, this._position);
    };
    Lexer.prototype._skipWhitespace = function () {
        while (/^\s$/.test(this._character)) {
            this._readCharacter();
        }
    };
    return Lexer;
}());
exports.Lexer = Lexer;
