"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupTokenType = exports.TokenType = exports.Token = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["ASSING"] = 0] = "ASSING";
    TokenType[TokenType["COMMA"] = 1] = "COMMA";
    TokenType[TokenType["DIVISION"] = 2] = "DIVISION";
    TokenType[TokenType["EQ"] = 3] = "EQ";
    TokenType[TokenType["EOF"] = 4] = "EOF";
    TokenType[TokenType["FOR"] = 5] = "FOR";
    TokenType[TokenType["FUNCTION"] = 6] = "FUNCTION";
    TokenType[TokenType["GT"] = 7] = "GT";
    TokenType[TokenType["GTE"] = 8] = "GTE";
    TokenType[TokenType["IDENT"] = 9] = "IDENT";
    TokenType[TokenType["ILLEGAL"] = 10] = "ILLEGAL";
    TokenType[TokenType["INT"] = 11] = "INT";
    TokenType[TokenType["LBRACE"] = 12] = "LBRACE";
    TokenType[TokenType["LET"] = 13] = "LET";
    TokenType[TokenType["LPAREN"] = 14] = "LPAREN";
    TokenType[TokenType["LT"] = 15] = "LT";
    TokenType[TokenType["LTE"] = 16] = "LTE";
    TokenType[TokenType["NEGATION"] = 17] = "NEGATION";
    TokenType[TokenType["MINUS"] = 18] = "MINUS";
    TokenType[TokenType["MULTIPLICATION"] = 19] = "MULTIPLICATION";
    TokenType[TokenType["NEQ"] = 20] = "NEQ";
    TokenType[TokenType["PLUS"] = 21] = "PLUS";
    TokenType[TokenType["RBRACE"] = 22] = "RBRACE";
    TokenType[TokenType["RPAREN"] = 23] = "RPAREN";
    TokenType[TokenType["SEMICOLON"] = 24] = "SEMICOLON";
})(TokenType || (TokenType = {}));
exports.TokenType = TokenType;
function obtenerNombreDeEnum(enumObj, valor) {
    for (const nombre in enumObj) {
        if (enumObj[nombre] === valor) {
            return nombre;
        }
    }
    return undefined;
}
class Token {
    constructor(token_type, literal) {
        this.token_type = token_type;
        this.literal = literal;
    }
    toString() {
        return `Type TokenType.${obtenerNombreDeEnum(TokenType, this.token_type)}, Literal ${this.literal}`;
    }
    equals(t) {
        return (this.token_type == t.token_type) && (this.literal == t.literal);
    }
}
exports.Token = Token;
function lookupTokenType(literal) {
    const keywords = {
        'variable': TokenType.LET,
        'funcion': TokenType.FUNCTION,
        'para': TokenType.FOR
    };
    return keywords[literal] || TokenType.IDENT;
}
exports.lookupTokenType = lookupTokenType;
