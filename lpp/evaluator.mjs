import {
    ASTNode,
    Program,
    Expression,
    ExpressionStatement,
    IntegerLiteral,
    BooleanLiteral,
    PrefixExpression as Prefix,
    InfixExpression as Infix,
    BlockStatement,
    Identifier,
    IfExpression,
    ReturnStatement,
    LetStatement,
    FunctionLiteral,
    CallExpression,
    StringLiteral,
} from "./ast.mjs";
import {
    BooleanObjeto as Boolean,
    Environment,
    Error,
    Integer as IntegerObject ,
    Null,
    Objeto as Object,
    ObjectType,
    Return,
    String,
    Builtin,
    Function,
} from "./object.mjs";
import { BUILTINS } from "./builtins.mjs"

const TRUE = new Boolean(true);
const FALSE = new Boolean(false);
const NULL = new Null();

const NOT_A_FUNCTION = 'No es una función: {}';
const TYPE_MISMATCH = 'Discrepancia de tipos: {} {} {}';
const UNKNOWN_PREFIX_OPERATOR = 'Operador desconocido: {}{}';
const UNKNOWN_INFIX_OPERATOR = 'Operador desconocido: {} {} {}';
const UNKNOWN_IDENTIFIER = 'Identificador no encontrado: {}';


export function evaluate(node, env) {
    if (node === null) {
        return null;
    }

    switch (node.constructor) {
        case Program:
            return evaluateProgram(node , env);

        case ExpressionStatement:
            const expressionStatement = node ;
            if (expressionStatement.expression) {
                return evaluate(expressionStatement.expression, env);
            }
            break; 

            //por acá está el problema
        case IntegerLiteral:
            const integer = node;  
            if (integer.value !== undefined) {
                return new IntegerObject(integer.value);
            }
            break;

        case BooleanLiteral:
            const boolean = node ;
            if (boolean.value !== undefined) {
                return toBooleanObject(boolean.value);
            }
            break;

        case Prefix:
            const prefix = node ;
            if (prefix.right) {
                const right = evaluate(prefix.right, env);
                if (right) {
                    return evaluatePrefixExpression(prefix.operator, right);
                }
            }
            break;

        case Infix:
            const infix = node ;
            if (infix.left && infix.right) {
                const left = evaluate(infix.left, env);
                const right = evaluate(infix.right, env);
                if (left && right) {
                    return evaluateInfixExpression(infix.operator, left, right);
                }
            }
            break;

        case BlockStatement:
            const block = node ;
            return evaluateBlockStatement(block, env);

        case IfExpression:
            const ifExpression = node ;
            return evaluateIfExpression(ifExpression, env);

        case ReturnStatement:
            const returnStatement = node ;
            if (returnStatement.returnValue) {
                const value = evaluate(returnStatement.returnValue, env);
                if (value) {
                    return new Return(value);
                }
            }
            break;
        
        case LetStatement:
            const letStatement = node ;
            if (letStatement.value) {
                const value = evaluate(letStatement.value, env);
                if (value && letStatement.name) {
                    env[letStatement.name.value] = value;
                }
            }
            break;

        case Identifier:
            const identifier = node ;
            return evaluateIdentifier(identifier, env);

        case FunctionLiteral:
            const functionNode = node ;
            if (functionNode?.body && functionNode?.name) {
                env[functionNode.name.value] = functionNode;
                return new Function(functionNode.parameters, functionNode.body, env, functionNode.name);
            }
            break;

        case CallExpression:
            const callNode = node ;
            const func = evaluate(callNode.function_name, env);
            
            if (callNode.args) {
                const args = evaluateExpressions(callNode.args, env);
        
                if (func && args) {
                    return applyFunction(func, args);
                }
            }
            break;

        case StringLiteral:
            const stringNode = node ;
            return new String(stringNode.value);

        default:
            return null;
    }
}
//de aca esta retornando el result como undefined
function evaluateProgram(program, env) {
    let result = null;

    for (const statement of program.statements) {
        result = evaluate(statement, env);

        if (result instanceof Return) {
            let resultado  = result ;
            return resultado.value;
        } else if (result instanceof Error) {
            return result;
        }
    }

    return result;
}

function evaluateBangOperatorExpression(right){
    if (right === TRUE) {
        return FALSE;
    } else if (right === FALSE) {
        return TRUE;
    } else if (right === NULL) {
        return FALSE;
    } else {
        return TRUE;
    }
}

function evaluateBlockStatement(block, env) {
    let result = null;

    for (const statement of block.statements) {
        result = evaluate(statement, env);

        if (result !== null &&
            (result.type() === ObjectType.RETURN || result.type() === ObjectType.ERROR)) {
            return result;
        }
    }

    return result;
}

function evaluateIdentifier(node, env){
    try {
        return env[node.value];
    } catch (error) {
        const builtin = BUILTINS[node.value];
        if (builtin) {
            return builtin;
        }
        return newError(UNKNOWN_IDENTIFIER, [node.value]);
    }
}

function evaluateIfExpression(ifExpression, env) {
    if (ifExpression.condition) {
        const condition = evaluate(ifExpression.condition, env);

        if (condition) {
            
            if (isTruthy(condition)) {
                if (ifExpression.consequence) return evaluate(ifExpression.consequence, env);
            } else if (ifExpression.alternative) {
                return evaluate(ifExpression.alternative, env);
            }

        }
    }
    return NULL;
}

function isTruthy(obj){
    if (obj === NULL) {
        return false;
    } else if (obj === TRUE) {
        return true;
    } else if (obj === FALSE) {
        return false;
    } else {
        return true;
    }
}

function evaluateInfixExpression(operator, left, right) {
    if (left.type() === ObjectType.INTEGER && right.type() === ObjectType.INTEGER) {
        return evaluateIntegerInfixExpression(operator, left, right);
    } else if (left.type() === ObjectType.STRING && right.type() === ObjectType.STRING) {
        return evaluateStringInfixExpression(operator, left, right);
    } else if (operator === '==') {
        return toBooleanObject(left === right);
    } else if (operator === '!=') {
        return toBooleanObject(left !== right);
    } else if (left.type() !== right.type()) {
        return newError(TYPE_MISMATCH, [left.type().toString(), operator, right.type().toString()]);
    } else {
        return newError(UNKNOWN_INFIX_OPERATOR, [left.type().toString(), operator, right.type().toString()]);
    }
}

function evaluateIntegerInfixExpression(operator, left, right) {
    if (left.type() !== ObjectType.INTEGER || right.type() !== ObjectType.INTEGER) {
        return NULL;
    }

    const leftValue = (left ).value;
    const rightValue = (right ).value;

    switch (operator) {
        case "+":
            return new IntegerObject(leftValue + rightValue);
        case "-":
            return new IntegerObject(leftValue - rightValue);
        case "*":
            return new IntegerObject(leftValue * rightValue);
        case "/":
            if (rightValue === 0) {
                return NULL;
            }
            return new IntegerObject(Math.floor(leftValue / rightValue));
        case "<":
            return leftValue < rightValue ? TRUE : FALSE;
        case ">":
            return leftValue > rightValue ? TRUE : FALSE;
        case "<=":
            return leftValue <= rightValue ? TRUE : FALSE;
        case ">=":
            return leftValue >= rightValue ? TRUE : FALSE;
        case "==":
            return leftValue === rightValue ? TRUE : FALSE;
        case "!=":
            return leftValue !== rightValue ? TRUE : FALSE;
        default:
            return newError(UNKNOWN_INFIX_OPERATOR, [left.type().toString(), operator, right.type().toString()]);
    }
}

function evaluateMinusOperatorExpression(right) {
    if (right.type() !== ObjectType.INTEGER) {
        return newError(UNKNOWN_PREFIX_OPERATOR, ['-', right.type().toString()]);
    }

    const value = (right ).value;
    return new IntegerObject(-value);
}

function evaluatePrefixExpression(operator, right) {
    if (operator === '!') {
        return evaluateBangOperatorExpression(right);
    } else if (operator === '-') {
        return evaluateMinusOperatorExpression(right);
    } else {
        return newError(UNKNOWN_PREFIX_OPERATOR, [operator, right.type().toString()]);
    }
}

function newError(message, args) {
    return new Error(message.replace('{}', args.toString()));
}

function toBooleanObject(value){
    return value ? TRUE : FALSE;
}

function applyFunction(fn, args) {
    // AQUIIIII
    if (fn?.type() === ObjectType.FUNCTION) {
        const fnObject = fn;
        const extendedEnvironment = extendFunctionEnvironment(fnObject, args);
        const evaluated = evaluate(fnObject.body, extendedEnvironment);

        if (evaluated !== null) {
            return unwrapReturnValue(evaluated);
        }
    } else if (fn.type() === ObjectType.BUILTIN) {
        const fnObject = fn;
        return fnObject.fn(...args);
    } else {
        return newError(NOT_A_FUNCTION, [fn.type().toString()]);
    }
}

function extendFunctionEnvironment(fn, args) {
    const env = new Environment(fn.env);

    for (let idx = 0; idx < fn.parameters.length; idx++) {
        env[fn.parameters[idx].value] = args[idx];
    }

    return env;
}

function unwrapReturnValue(obj) {
    if (obj instanceof Return) {
        return (obj ).value;
    }

    return obj;
}

function evaluateExpressions(expressions, env) {
    const result = [];

    for (const expression of expressions) {
        const evaluated = evaluate(expression, env);

        if (evaluated) {
            result.push(evaluated);
        }
    }

    return result;
}

function evaluateStringInfixExpression(operator, left, right) {
    const leftValue = (left ).value;
    const rightValue = (right ).value;

    if (operator === '+') {
        return new String(leftValue + rightValue);
    } else if (operator === '==') {
        return toBooleanObject(leftValue === rightValue);
    } else if (operator === '!=') {
        return toBooleanObject(leftValue !== rightValue);
    } else {
        return newError(UNKNOWN_INFIX_OPERATOR, [left.type().toString(), operator, right.type().toString()]);
    }
}
