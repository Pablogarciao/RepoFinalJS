import { Builtin, Error, Integer, Objeto, String, obtenerNombreDeEnum } from './object.mjs';

const _UNSUPPORTED_ARGUMENT_TYPE = 'argumento para longitud sin soporte, se recibió {}';
const _WRONG_NUMBER_OF_ARGS = 'número incorrecto de argumentos para longitud, se recibieron {}, se requieren {}';

export function longitud(...args) {
  if (args.length !== 1) {
    return new Error(_WRONG_NUMBER_OF_ARGS.replace('{}', args.length.toString()).replace('{}', '1'));
  } else if (args[0] instanceof String) {
    const argument = args[0];
    return new Integer(argument.value.length);
  } else {
    return new Error(_UNSUPPORTED_ARGUMENT_TYPE.replace('{}', obtenerNombreDeEnum(args[0].type())));
  }
}

export const BUILTINS = {
  'longitud': new Builtin(longitud)
};
