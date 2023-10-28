import { Builtin, Error, Integer, Objeto, String, obtenerNombreDeEnum, ObjectType } from './object';

const _UNSUPPORTED_ARGUMENT_TYPE = 'argumento para longitud sin soporte, se recibió {}';
const _WRONG_NUMBER_OF_ARGS = 'número incorrecto de argumentos para longitud, se recibieron {}, se requieren {}';

export function longitud(...args: Objeto[]): Objeto {
  if (args.length !== 1) {
    return new Error(_WRONG_NUMBER_OF_ARGS.replace('{}', args.length.toString()).replace('{}', '1'));
  } else if (args[0] instanceof String) {
    const argument = args[0] as String;
    return new Integer(argument.value.length);
  } else {
    return new Error(_UNSUPPORTED_ARGUMENT_TYPE.replace('{}', args[0].type().toString()));
  }
}

export const BUILTINS: Record<string, Builtin> = {
  'longitud': new Builtin(longitud)
};
