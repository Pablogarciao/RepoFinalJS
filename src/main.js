"use strict";
exports.__esModule = true;
var repl_1 = require("./lpp/repl");
function imprimirBienvenida() {
    var bienvenida = [
        "  ***     * *    ***    * *      *** ",
        " *   *   *   *  *   *  *   *    *   *",
        " *       *****  *      *****    *",
        " *       *   *  *      *   *     *",
        " *   *   *   *  *   *  *   *    *   *",
        "  ***    *   *   ***   *   *     *** ",
    ];
    for (var _i = 0, bienvenida_1 = bienvenida; _i < bienvenida_1.length; _i++) {
        var linea = bienvenida_1[_i];
        console.log(linea);
    }
}
function main() {
    imprimirBienvenida();
    console.log("Presione enter para empezar");
    (0, repl_1.startRepl)();
}
main();
