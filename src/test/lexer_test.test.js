"use strict";
exports.__esModule = true;
var tokens_1 = require("../lpp/tokens");
var lexer_1 = require("../lpp/lexer");
var globals_1 = require("@jest/globals");
// Para ejecutar test: npx jest
(0, globals_1.describe)('LexerTest', function () {
    (0, globals_1.test)('one_character_operator', function () {
        var source = '=+-/*<>!';
        var lexer = new lexer_1.Lexer(source);
        var tokens = [];
        for (var i = 0; i < source.length; i++) {
            tokens.push(lexer.nextToken());
        }
        var expectedTokens = [
            new tokens_1.Token(tokens_1.TokenType.ASSING, '='),
            new tokens_1.Token(tokens_1.TokenType.PLUS, '+'),
            new tokens_1.Token(tokens_1.TokenType.MINUS, '-'),
            new tokens_1.Token(tokens_1.TokenType.DIVISION, '/'),
            new tokens_1.Token(tokens_1.TokenType.MULTIPLICATION, '*'),
            new tokens_1.Token(tokens_1.TokenType.LT, '<'),
            new tokens_1.Token(tokens_1.TokenType.GT, '>'),
            new tokens_1.Token(tokens_1.TokenType.NEGATION, '!'),
        ];
        (0, globals_1.expect)(tokens).toStrictEqual(expectedTokens);
    });
});
