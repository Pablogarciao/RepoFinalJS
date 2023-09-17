import { Program, LetStatement, ReturnStatement } from '../lpp/ast';
import Lexer from '../lpp/lexer';
import Parser from '../lpp/parser';

describe('Parser', () => {
  test('should parse a program', () => {
    const source = 'variable x=5;';
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(program).not.toBeNull();
    expect(program).toBeInstanceOf(Program);
  });

  test('should parse let statements', () => {
    const source = `
      variable c=10;
      variable sa=25;
      variable otra=3244;
    `;
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(program.statements.length).toBe(3);
    program.statements.forEach((statement) => {
      expect(statement.token_literal()).toBe('variable');
    });
  });

  test('should parse names in let statements', () => {
    const source = `
      variable c=10;
      variable sa=25;
      variable otra=3244;
    `;
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const names: string[] = [];
    program.statements.forEach((statement) => {
      const letStatement = statement as LetStatement;
      expect(letStatement.name).not.toBeNull();
      names.push(letStatement.name!.value);
    });
    const expectedNames = ['c', 'sa', 'otra'];
    expect(names).toEqual(expectedNames);
  });

  test('should report errors', () => {
    const source = 'variable x 5';
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(parser.errors.length).toBe(1);
  });

  test('should parse return statements', () => {
    const source = `
      regresa 5;
      regresa x;
    `;
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    expect(program.statements.length).toBe(2);
    program.statements.forEach((statement) => {
      expect(statement).toBeInstanceOf(ReturnStatement);
    });
  });
});
