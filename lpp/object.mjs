import { BlockStatement, Identifier } from './ast.mjs';

export const ObjectType = {
    BOOLEAN: 0,
    ERROR: 1,
    INTEGER: 2,
    NULL: 3,
    RETURN: 4,
    FUNCTION: 5,
    STRING: 6,
    BUILTIN: 7,
}

// Obtener y retornar el nombre del TOKEN 
export function obtenerNombreDeEnum(valor) {
    return obtenerNombreDeEnum2(ObjectType, valor);
}
function obtenerNombreDeEnum2(enumObj, valor) {
    for (const nombre in enumObj) {
        if (enumObj[nombre] === valor) {
            return nombre;
        }
    }
    return undefined;
}

export class Objeto {
    type() {
      throw new Error("Method not implemented.");
    }
    inspect() {
      throw new Error("Method not implemented.");
    }
  }

export class Integer extends Objeto {
    constructor( value) {
        super();
        this.value=value
    }

    type() {
        return ObjectType.INTEGER;
    }

    inspect() {
        return this.value.toString();
    }
}

export class BooleanObjeto extends Objeto {
    constructor( value) {
        super();
        this.value=value
    }

    type() {
        return ObjectType.BOOLEAN;
    }

    inspect() {
        return this.value ? 'verdadero' : 'falso';
    }
}

export class Null extends Objeto {
    type() {
        return ObjectType.NULL;
    }

    inspect() {
        return 'nulo';
    }
}

export class Return extends Objeto {
    constructor(value) {
        super();
        this.value=value
    }
  
    type() {
        return ObjectType.RETURN;
    }
  
    inspect() {
        return this.value.inspect();
    }
}

export class Error extends Objeto {
    constructor(message) {
        super();
        this.message=message
    }

    type() {
        return ObjectType.ERROR;
    }

    inspect() {
        return `Error: ${this.message}`;
    }
}

export class Environment extends Object {
     _store;
     _outer;

    constructor(outer= null) {
        super();
        this._outer = outer;
        this._store = {};
    }

    get(key) {
        try {
            return this._store[key];
        } catch (e) {
            if (this._outer !== null) {
                return this._outer.get(key);
            }

            throw e;
        }
    }

    set(key, value) {
        this._store[key] = value;
    }

    delete(key) {
        delete this._store[key];
    }
}

export class Function extends Objeto {
     parameters;
     body;
     env;
     name;

    constructor(parameters, body, env, name) {
        super();
        this.parameters = parameters;
        this.body = body;
        this.env = env;
        this.name = name;
    }

    type() {
        return ObjectType.FUNCTION;
    }

    inspect() {
        const params = this.parameters.map((param) => param.toString()).join(', ');
        return `procedimiento ${this.name}(${params}) {\n${this.body.toString()}\n}`;
    }
}

export class String extends Objeto {
    constructor( value) {
        super();
        this.value=value
    }

    type() {
        return ObjectType.STRING;
    }

    inspect() {
        return this.value;
    }
}
/*
export interface BuiltinFunction {
    (...args: Object[]): Object;
}
*/
export class Builtin extends Objeto {
    constructor( fn) {
        super();
        this.fn=fn
    }
  
    type() {
        return ObjectType.BUILTIN;
    }
  
    inspect() {
        return "función incorporada";
    }
}