import { Program } from './ast';
import { evaluate } from './evaluator';
import Lexer from './lexer';
import { Environment } from './object';
import Parser from './parser';
import * as readline from "readline"

function printParseErrors(errors: string[]): void {
    for (const error of errors) {
        console.log(error);
    }
}

// Definición de una función asincrónica para iniciar el interprete
async function startRepl(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Se hace esto para que sea multilinea y guarden todos los datos no solo de una línea
    const scanned: string[] = [];
    
    // Bucle para leer las lineas de entrada del usuario
    for await (const source of rl) {
        rl.setPrompt('>> ');

        if (source === 'salir()') {
            rl.close();
            return;
        }

        scanned.push(source);
        const lexer: Lexer = new Lexer(scanned.join(' '));
        const parser: Parser = new Parser(lexer);

        const program: Program = parser.parseProgram();
        const env : Environment = new Environment()

        if (parser.errors.length > 0) {
            printParseErrors(parser.errors);
            rl.prompt();
            continue;
        }

        const evaluated = evaluate(program, env);
        
        if (evaluated !== null && evaluated !== undefined) {
            console.log(evaluated?.inspect());
        }

        rl.prompt();
    }
}

export default startRepl;