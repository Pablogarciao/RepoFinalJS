"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repl_1 = require("./lpp/repl");
function imprimirBienvenida() {
    const bienvenida = [
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
function main() {
    imprimirBienvenida();
    console.log("Presione enter para empezar");
    (0, repl_1.startRepl)();
}
main();
