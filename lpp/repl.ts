import { Lexer } from './lexer';
import { Token, TokenType } from './tokens';
import * as readline from "readline"

// Creación de un token EOF (fin de archivo) para marcar el final de la entrada
const EOF_TOKEN: Token = new Token(TokenType.EOF, '');

// Definición de una función asincrónica para iniciar el interprete
async function startRepl(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.setPrompt('>> ');
    
     // Bucle para leer las lineas de entrada del usuario
    for await (const source of rl) {
        rl.setPrompt('>> ');

        if (source === 'salir()') {
            rl.close();
            return;
        }

        const lexer: Lexer = new Lexer(source);

        let token: Token = lexer.nextToken();

        // Bucle para imprimir los TOKEN generados por el lexer
        while (!token.equals(EOF_TOKEN)) {
            console.log(token.toString());
            token = lexer.nextToken();
        }

        rl.prompt();
    }
}

export { startRepl }
