enum TokenType {
    ASSING,
    COMMA,
    DIVISION,
    EQ,
    EOF,
    FOR,
    FUNCTION,
    GT,
    GTE,
    IDENT,
    ILLEGAL,
    INT,
    LBRACE,
    LET,
    LPAREN,
    LT,
    LTE,
    NEGATION,
    MINUS,
    MULTIPLICATION,
    NEQ,
    PLUS,
    RBRACE,
    RPAREN,
    SEMICOLON
}

// Obtener y retornar el nombre del TOKEN 
function obtenerNombreDeEnum(enumObj: any, valor: number): string | undefined {
    for (const nombre in enumObj) {
        if (enumObj[nombre] === valor) {
            return nombre;
        }
    }
    return undefined;
}

// Se encarga de representar los TOKEN generados por el lexer
class Token {
    constructor(
        public token_type: TokenType,
        public literal: string
    ) {}

    toString(): string {
        return `Type TokenType.${obtenerNombreDeEnum(TokenType, this.token_type)}, Literal ${this.literal}`;
    }

    equals(t: Token): boolean {
        return (this.token_type==t.token_type) && (this.literal==t.literal);
    }
}

// Se utiliza para determinar el tipo de TOKEN correspondiente a una palabra clave
function lookupTokenType(literal: string): TokenType {
    const keywords: { [key: string]: TokenType } = {
        'variable': TokenType.LET,
        'funcion': TokenType.FUNCTION,
        'para': TokenType.FOR
    };
    return keywords[literal] || TokenType.IDENT;
}

export { Token, TokenType, lookupTokenType }