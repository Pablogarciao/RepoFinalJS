import startRepl from "./lpp/repl.mjs";

function imprimirBienvenida() {
    const bienvenida= [
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

function main(){
    imprimirBienvenida();
    console.log("Presione enter para empezar")
    startRepl();
}

main();
