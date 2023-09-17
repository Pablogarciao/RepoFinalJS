import {
    ASTNode,
    Program,
    ExpressionStatement,
    IntegerLiteral,
    BooleanLiteral,
    PrefixExpression as Prefix,
    InfixExpression as Infix
} from "./ast";
import {
    BooleanObjeto as Boolean,
    Integer as IntegerObject,
    Null,
    Objeto as Object,
    ObjectType,
} from "./object";

const TRUE = new Boolean(true);
const FALSE = new Boolean(false);
const NULL = new Null();

export function evaluate(node: ASTNode | null): Object | null {
    if (node === null) {
        return null;
    }

    switch (node.constructor) {
        case Program:
            return evaluateProgram(node as Program);
        case ExpressionStatement:
            return evaluateExpressionStatement(node as ExpressionStatement);
        case IntegerLiteral:
            return evaluateIntegerLiteral(node as IntegerLiteral);
        case BooleanLiteral:
            return evaluateBooleanLiteral(node as BooleanLiteral);
        case Prefix:
            return evaluatePrefixExpression(node as Prefix);
        case Infix:
            return evaluateInfixExpression(node as Infix);
        default:
            return null;
    }
}

function evaluateProgram(program: Program): Object | null {
    let result: Object | null = null;

    for (const statement of program.statements) {
        result = evaluate(statement);
    }

    return result;
}

function evaluateExpressionStatement(statement: ExpressionStatement): Object | null {
    return evaluate(statement.expression);
}

function evaluateIntegerLiteral(integer: IntegerLiteral): IntegerObject {
    return new IntegerObject(integer.value);
}

function evaluateBooleanLiteral(boolean: BooleanLiteral): Boolean {
    return boolean.value ? TRUE : FALSE;
}

function evaluatePrefixExpression(prefix: Prefix): Object | null {
    const right = evaluate(prefix.right);

    if (right === null) {
        return null;
    }

    switch (prefix.operator) {
        case "!":
            return evaluateBangOperatorExpression(right);
        case "-":
            return evaluateMinusOperatorExpression(right);
        default:
            return NULL;
    }
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

function evaluateMinusOperatorExpression(right: Object): Object | null {
    if (right.type() !== ObjectType.INTEGER) {
        return NULL;
    }

    const value = (right as IntegerObject).value;
    return new IntegerObject(-value);
}

function evaluateInfixExpression(infix: Infix): Object | null {
    const left = evaluate(infix.left);
    const right = evaluate(infix.right);

    if (left === null || right === null) {
        return null;
    }

    switch (infix.operator) {
        case "+":
        case "-":
        case "*":
        case "/":
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "==":
        case "!=":
            return evaluateIntegerInfixExpression(infix.operator, left, right);
        case "&&":
            return evaluateBooleanInfixExpression("&&", left, right);
        case "||":
            return evaluateBooleanInfixExpression("||", left, right);
        default:
            return NULL;
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
            return NULL;
    }
}

function evaluateBooleanInfixExpression(operator: string, left: Object, right: Object): Boolean {
    if (operator === "&&") {
        return left === TRUE && right === TRUE ? TRUE : FALSE;
    }
}
