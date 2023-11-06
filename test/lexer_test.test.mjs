import { Token, TokenType } from '../lpp/tokens.mjs';
import Lexer from '../lpp/lexer.mjs';

describe('Lexer', () => {
    test('one_character_operator', () => {
        const source: string = '=+-/*<>!';
        const lexer: Lexer = new Lexer(source);

        const tokens: Token[] = [];
        for (let i = 0; i < source.length; i++) {
            tokens.push(lexer.nextToken());
        }

        const expectedTokens: Token[] = [
            new Token(TokenType.ASSIGN, '='),
            new Token(TokenType.PLUS, '+'),
            new Token(TokenType.MINUS, '-'),
            new Token(TokenType.DIVISION, '/'),
            new Token(TokenType.MULTIPLICATION, '*'),
            new Token(TokenType.LT, '<'),
            new Token(TokenType.GT, '>'),
            new Token(TokenType.NEGATION, '!'),
        ];

        expect(tokens).toStrictEqual(expectedTokens);
    });
});
