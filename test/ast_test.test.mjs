import { Program, LetStatement, ReturnStatement, Identifier } from '../lpp/ast.mjs';
import { Token, TokenType } from '../lpp/tokens.mjs';

describe('AST', () => {
  test('should create a LetStatement', () => {
    const program = new Program([
      new LetStatement(
        new Token(TokenType.LET, 'variable'),
        new Identifier(new Token(TokenType.IDENT, 'mi_var'), 'mi_var'),
        new Identifier(new Token(TokenType.IDENT, 'otra_var'), 'otra_var')
      ),
    ]);

    const programStr = program.toString();

    expect(programStr).toBe('variable mi_var = otra_var;');
  });

  test('should create a ReturnStatement', () => {
    const program = new Program([
      new ReturnStatement(
        new Token(TokenType.RETURN, 'regresa'),
        new Identifier(new Token(TokenType.IDENT, 'mi_var'), 'mi_var')
      ),
    ]);

    const programStr = program.toString();

    expect(programStr).toBe('regresa mi_var;');
  });
});
