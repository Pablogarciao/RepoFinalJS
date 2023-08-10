import { Lexer } from './lexer';
import { Token, TokenType } from './tokens';
import * as readline from "readline"

const EOF_TOKEN: Token = new Token(TokenType.EOF, '');

async function startRepl(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.setPrompt('>> ');
    
    for await (const source of rl) {
        rl.setPrompt('>> ');

        if (source === 'salir()') {
            rl.close();
            return;
        }

        const lexer: Lexer = new Lexer(source);

        let token: Token = lexer.nextToken();
        while (!token.equals(EOF_TOKEN)) {
            console.log(token.toString());
            token = lexer.nextToken();
        }

        rl.prompt();
    }

    rl.on('close', () => {
        console.log('Hasta luego!');
        process.exit(0);
    });

    rl.prompt();
}

export { startRepl }
