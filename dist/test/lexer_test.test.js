"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokens_1 = require("../lpp/tokens");
const lexer_1 = require("../lpp/lexer");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('LexerTest', () => {
    (0, globals_1.test)('one_character_operator', () => {
        const source = '=+-/*<>!';
        const lexer = new lexer_1.Lexer(source);
        const tokens = [];
        for (let i = 0; i < source.length; i++) {
            tokens.push(lexer.nextToken());
        }
        const expectedTokens = [
            new tokens_1.Token(tokens_1.TokenType.ASSING, '='),
            new tokens_1.Token(tokens_1.TokenType.PLUS, '+'),
            new tokens_1.Token(tokens_1.TokenType.MINUS, '-'),
            new tokens_1.Token(tokens_1.TokenType.DIVISION, '/'),
            new tokens_1.Token(tokens_1.TokenType.MULTIPLICATION, '*'),
            new tokens_1.Token(tokens_1.TokenType.LT, '<'),
            new tokens_1.Token(tokens_1.TokenType.GT, '>'),
            new tokens_1.Token(tokens_1.TokenType.NEGATION, '!'),
        ];
        (0, globals_1.expect)(tokens).toBe(expectedTokens);
    });
});
