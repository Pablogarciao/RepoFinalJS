import { BlockStatement, Identifier } from './ast';

export enum ObjectType {
    BOOLEAN,
    ERROR,
    INTEGER,
    NULL,
    RETURN,
    FUNCTION,
    STRING,
    BUILTIN,
}

// Obtener y retornar el nombre del TOKEN 
export function obtenerNombreDeEnum(valor: number): string | undefined {
    return obtenerNombreDeEnum2(ObjectType, valor);
}
function obtenerNombreDeEnum2(enumObj: any, valor: number): string | undefined {
    for (const nombre in enumObj) {
        if (enumObj[nombre] === valor) {
            return nombre;
        }
    }
    return undefined;
}

export abstract class Objeto {
    abstract type(): ObjectType;
    abstract inspect(): string;
}

export class Integer extends Objeto {
    constructor(public value: number) {
        super();
    }

    type(): ObjectType {
        return ObjectType.INTEGER;
    }

    inspect(): string {
        return this.value.toString();
    }
}

export class BooleanObjeto extends Objeto {
    constructor(public value: boolean) {
        super();
    }

    type(): ObjectType {
        return ObjectType.BOOLEAN;
    }

    inspect(): string {
        return this.value ? 'verdadero' : 'falso';
    }
}

export class Null extends Objeto {
    type(): ObjectType {
        return ObjectType.NULL;
    }

    inspect(): string {
        return 'nulo';
    }
}

export class Return extends Objeto {
    constructor(public value: Objeto) {
        super();
    }
  
    type(): ObjectType {
        return ObjectType.RETURN;
    }
  
    inspect(): string {
        return this.value.inspect();
    }
}

export class Error extends Objeto {
    constructor(public message: string) {
        super();
    }

    type(): ObjectType {
        return ObjectType.ERROR;
    }

    inspect(): string {
        return `Error: ${this.message}`;
    }
}

export class Environment extends Object {
    private _store: { [key: string]: Objeto } = {};
    private _outer: Environment | null;

    constructor(outer: Environment | null = null) {
        super();
        this._outer = outer;
    }

    get(key: string) {
        try {
            return this._store[key];
        } catch (e) {
            if (this._outer !== null) {
                return this._outer.get(key);
            }

            throw e;
        }
    }

    set(key: string, value: Objeto) {
        this._store[key] = value;
    }

    delete(key: string) {
        delete this._store[key];
    }
}

export class Function extends Objeto {
    public parameters: Identifier[];
    public body: BlockStatement;
    public env: Environment;

    constructor(parameters: Identifier[], body: BlockStatement, env: Environment) {
        super();
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }

    type(): ObjectType {
        return ObjectType.FUNCTION;
    }

    inspect(): string {
        const params: string = this.parameters.map((param) => param.toString()).join(', ');
        return `procedimiento(${params}) {\n${this.body.toString()}\n}`;
    }
}

export class String extends Objeto {
    constructor(public value: string) {
        super();
    }

    type(): ObjectType {
        return ObjectType.STRING;
    }

    inspect(): string {
        return this.value;
    }
}

export interface BuiltinFunction {
    (...args: Object[]): Object;
}

export class Builtin extends Objeto {
    constructor(public fn: BuiltinFunction) {
        super();
    }
  
    type(): ObjectType {
        return ObjectType.BUILTIN;
    }
  
    inspect(): string {
        return "función incorporada";
    }
}