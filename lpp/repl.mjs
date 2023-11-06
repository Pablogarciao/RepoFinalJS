import { Program } from './ast.mjs';
import { evaluate } from './evaluator.mjs';
import Lexer from './lexer.mjs';
import { Environment } from './object.mjs';
import Parser from './parser.mjs';
import * as readline from "readline"

function printParseErrors(errors){
    for (const error of errors) {
        console.log(error);
    }
}

// Definición de una función asincrónica para iniciar el interprete
async function startRepl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    
    // Bucle para leer las lineas de entrada del usuario
    for await (const source of rl) {
        rl.setPrompt('>> ');

        if (source === 'salir()') {
            rl.close();
            return;
        }

        const lexer = new Lexer(source);
        const parser = new Parser(lexer);

        const program= parser.parseProgram();
        const env= new Environment()

        if (parser.errors.length > 0) {
            printParseErrors(parser.errors);
            break;
        }

        const evaluated = evaluate(program, env);
        //acá esta el problema pq está llegando el evaluated como undefined (llega del evaluate program)
        //entonces no está entrando al if de la impresion
        if (evaluated !== null && evaluated !== undefined) {
            console.log(evaluated?.inspect());
        }

        rl.prompt();
    }
}

export default startRepl;