enum TokenType {
    ASSIGN,
    COMMA,
    DIVISION,
    ELSE,
    EOF,
    EQ,
    FALSE,
    FUNCTION,
    GT,
    GTE,
    IDENT,
    IF,
    ILLEGAL,
    INT,
    LBRACE,
    LET,
    LPAREN,
    LT,
    LTE,
    MINUS,
    MULTIPLICATION,
    NEGATION,
    NOT_EQ,
    PLUS,
    RBRACE,
    RETURN,
    RPAREN,
    SEMICOLON,
    STRING,
    TRUE,
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
        public tokenType: TokenType,
        public literal: string
    ) {}

    toString(): string {
        return `Type TokenType.${obtenerNombreDeEnum(TokenType, this.tokenType)}, Literal ${this.literal}`;
    }

    equals(t: Token): boolean {
        return (this.tokenType==t.tokenType) && (this.literal==t.literal);
    }
}

// Se utiliza para determinar el tipo de TOKEN correspondiente a una palabra clave
function lookupTokenType(literal: string): TokenType {
    const keywords: { [key: string]: TokenType } = {
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

export { Token, TokenType, lookupTokenType }