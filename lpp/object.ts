export enum ObjectType {
    BOOLEAN,
    INTEGER,
    NULL,
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
