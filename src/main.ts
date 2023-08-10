import { startRepl } from "./lpp/repl";

function imprimirBienvenida(): void {
    const bienvenida: string[] = [
        "  ***     * *    ***    * *      *** ",
        " *   *   *   *  *   *  *   *    *   *",
        " *       *****  *      *****    *",
        " *       *   *  *      *   *     *",
        " *   *   *   *  *   *  *   *    *   *",
        "  ***    *   *   ***   *   *     *** ",
    ];
    for (const linea of bienvenida) {
        console.log(linea);
    }
}

function main(): void {
    imprimirBienvenida();
    console.log("Presione enter para empezar")
    startRepl();
}

main();
