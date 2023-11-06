export const TokenType = {
    ASSIGN: "ASSIGN",
    COMMA: "COMMA",
    DIVISION: "DIVISION",
    ELSE: "ELSE",
    EOF: "EOF",
    EQ: "EQ",
    FALSE: "FALSE",
    FUNCTION: "FUNCTION",
    GT: "GT",
    GTE: "GTE",
    IDENT: "IDENT",
    IF: "IF",
    ILLEGAL: "ILLEGAL",
    INT: "INT",
    LBRACE: "LBRACE",
    LET: "LET",
    LPAREN: "LPAREN",
    LT: "LT",
    LTE: "LTE",
    MINUS: "MINUS",
    MULTIPLICATION: "MULTIPLICATION",
    NEGATION: "NEGATION",
    NOT_EQ: "NOT_EQ",
    PLUS: "PLUS",
    RBRACE: "RBRACE",
    RETURN: "RETURN",
    RPAREN: "RPAREN",
    SEMICOLON: "SEMICOLON",
    STRING: "STRING",
    TRUE: "TRUE"
};

// Obtener y retornar el nombre del TOKEN 
export function obtenerNombreEnum(valor) {
    return _obtenerNombreDeEnum(TokenType, valor)
}
function _obtenerNombreDeEnum(enumObj, valor){
    for (const nombre in enumObj) {
        if (enumObj[nombre] === valor) {
            return nombre;
        }
    }
    return undefined;
}

// Se encarga de representar los TOKEN generados por el lexer
export class Token {
    constructor(tokenType,literal,) {
        this.tokenType = tokenType;
        this.literal = literal;
    }

    toString() {
        return `Type TokenType.${obtenerNombreEnum(this.tokenType)}, Literal ${this.literal}`;
    }

    equals(t) {
        return (this.tokenType==t.tokenType) && (this.literal==t.literal);
    }
}

// Se utiliza para determinar el tipo de TOKEN correspondiente a una palabra clave
export function lookupTokenType(literal) {
    const keywords = {
        'falso': TokenType.FALSE,
        'procedimiento': TokenType.FUNCTION,
        'regresa': TokenType.RETURN,
        'si': TokenType.IF,
        'si_no': TokenType.ELSE,
        'variable': TokenType.LET,
        'verdadero': TokenType.TRUE,
    };
    return keywords[literal] || TokenType.IDENT;
}

//export { Token, TokenType, lookupTokenType }