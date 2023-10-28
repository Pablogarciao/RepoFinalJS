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
} from "./ast";
import {
    BooleanObjeto as Boolean,
    Environment,
    Error,
    Integer as IntegerObject,
    Null,
    Objeto as Object,
    ObjectType,
    Return,
    String,
    Builtin,
    Function,
} from "./object";
import { BUILTINS } from "./builtins"

const TRUE = new Boolean(true);
const FALSE = new Boolean(false);
const NULL = new Null();

const NOT_A_FUNCTION = 'No es una función: {}';
const TYPE_MISMATCH = 'Discrepancia de tipos: {} {} {}';
const UNKNOWN_PREFIX_OPERATOR = 'Operador desconocido: {}{}';
const UNKNOWN_INFIX_OPERATOR = 'Operador desconocido: {} {} {}';
const UNKNOWN_IDENTIFIER = 'Identificador no encontrado: {}';


export function evaluate(node: ASTNode | null, env: Environment | null): Object | null {
    if (node === null) {
        return null;
    }

    switch (node.constructor) {
        case Program:
            return evaluateProgram(node as Program, env);
        case ExpressionStatement:
            const expressionStatement = node as ExpressionStatement;
            if (expressionStatement.expression) {
                return evaluate(expressionStatement.expression, env);
            }
            break;
        case IntegerLiteral:
            const integer = node as IntegerLiteral;
            if (integer.value !== undefined) {
                return new IntegerObject(integer.value);
            }
            break;
        case BooleanLiteral:
            const boolean = node as BooleanLiteral;
            if (boolean.value !== undefined) {
                return toBooleanObject(boolean.value);
            }
            break;
        case Prefix:
            const prefix = node as Prefix;
            if (prefix.right) {
                const right = evaluate(prefix.right, env);
                if (right) {
                    return evaluatePrefixExpression(prefix.operator, right);
                }
            }
            break;
        case Infix:
            const infix = node as Infix;
            if (infix.left && infix.right) {
                const left = evaluate(infix.left, env);
                const right = evaluate(infix.right, env);
                if (left && right) {
                    return evaluateInfixExpression(infix.operator, left, right);
                }
            }
            break;
        case BlockStatement:
            const block = node as BlockStatement;
            return evaluateBlockStatement(block, env);
        case IfExpression:
            const ifExpression = node as IfExpression;
            return evaluateIfExpression(ifExpression, env);
        case ReturnStatement:
            const returnStatement = node as ReturnStatement;
            if (returnStatement.returnValue) {
                const value = evaluate(returnStatement.returnValue, env);
                if (value) {
                    return new Return(value);
                }
            }
            break;
        case LetStatement:
            const letStatement = node as LetStatement;
            if (letStatement.value) {
                const value = evaluate(letStatement.value, env);
                if (value && letStatement.name) {
                    env[letStatement.name.value] = value;
                }
            }
            break;
        case Identifier:
            const identifier = node as Identifier;
            return evaluateIdentifier(identifier, env);
        case FunctionLiteral:
            const functionNode = node as FunctionLiteral;
            if (functionNode?.body) {
                return new Function(functionNode.parameters, functionNode.body, env);
            }
            break;
        case CallExpression:
            const callNode = node as CallExpression;
            const func = evaluate(callNode.function_name, env);
            
            if (callNode.args) {
                const args = evaluateExpressions(callNode.args, env);
        
                if (func && args) {
                    return applyFunction(func, args);
                }
            }
            break;
        case StringLiteral:
            const stringNode = node as StringLiteral;

            return new String(stringNode.value);
        default:
            return null;
    }
}

function evaluateProgram(program: Program, env: Environment): Object | null {
    let result: Object | null = null;

    for (const statement of program.statements) {
        result = evaluate(statement, env);

        if (result instanceof Return) {
            let resultado : Return | null = result as Return;
            return resultado.value;
        } else if (result instanceof Error) {
            return result;
        }
    }

    return result;
}

function evaluateBangOperatorExpression(right: Object): Boolean {
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

function evaluateBlockStatement(block: BlockStatement, env: Environment): Object | null {
    let result: Object | null = null;

    for (const statement of block.statements) {
        result = evaluate(statement, env);

        if (result !== null &&
            (result.type() === ObjectType.RETURN || result.type() === ObjectType.ERROR)) {
            return result;
        }
    }

    return result;
}

function evaluateIdentifier(node: Identifier, env: Environment): Object {
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

function evaluateIfExpression(ifExpression: IfExpression, env: Environment): Object | null {
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

function isTruthy(obj: Object): boolean {
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

function evaluateInfixExpression(operator: string, left: Object, right: Object): Object {
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

function evaluateIntegerInfixExpression(operator: string, left: Object, right: Object): Object | null {
    if (left.type() !== ObjectType.INTEGER || right.type() !== ObjectType.INTEGER) {
        return NULL;
    }

    const leftValue = (left as IntegerObject).value;
    const rightValue = (right as IntegerObject).value;

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

function evaluateMinusOperatorExpression(right: Object): Object | null {
    if (right.type() !== ObjectType.INTEGER) {
        return newError(UNKNOWN_PREFIX_OPERATOR, ['-', right.type().toString()]);
    }

    const value = (right as IntegerObject).value;
    return new IntegerObject(-value);
}

function evaluatePrefixExpression(operator: string, right: Object): Object {
    if (operator === '!') {
        return evaluateBangOperatorExpression(right);
    } else if (operator === '-') {
        return evaluateMinusOperatorExpression(right);
    } else {
        return newError(UNKNOWN_PREFIX_OPERATOR, [operator, right.type().toString()]);
    }
}

function newError(message: string, args: any[]): Error {
    return new Error(message.replace('{}', args.toString()));
}

function toBooleanObject(value: boolean): Boolean {
    return value ? TRUE : FALSE;
}

function applyFunction(fn: Object, args: Object[]): any {
    if (fn.type() === ObjectType.FUNCTION) {
        const fnObject = fn as Function;
        const extendedEnvironment = extendFunctionEnvironment(fnObject, args);
        const evaluated = evaluate(fnObject.body, extendedEnvironment);

        if (evaluated !== null) {
            return unwrapReturnValue(evaluated);
        }
    } else if (fn.type() === ObjectType.BUILTIN) {
        const fnObject = fn as Builtin;
        return fnObject.fn(...args);
    } else {
        return newError(NOT_A_FUNCTION, [fn.type().toString()]);
    }
}

function extendFunctionEnvironment(fn: Function, args: Object[]): Environment {
    const env = new Environment(fn.env);

    for (let idx = 0; idx < fn.parameters.length; idx++) {
        env[fn.parameters[idx].value] = args[idx];
    }

    return env;
}

function unwrapReturnValue(obj: Object): Object {
    if (obj instanceof Return) {
        return (obj as Return).value;
    }

    return obj;
}

function evaluateExpressions(expressions: Expression[], env: Environment): Object[] {
    const result: Object[] = [];

    for (const expression of expressions) {
        const evaluated = evaluate(expression, env);

        if (evaluated) {
            result.push(evaluated);
        }
    }

    return result;
}

function evaluateStringInfixExpression(operator: string, left: Object, right: Object): Object {
    const leftValue = (left as String).value;
    const rightValue = (right as String).value;

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