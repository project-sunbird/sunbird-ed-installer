//@ sourceURL=divisioneval.js
/**
 * Reusable division evaluator - used for Horizontal evaluations
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
/**
 * Constructs the DivisionEval object
 * @constructor
 */
function DivisionEval(model) {
    this.model = model;
}

DivisionEval.prototype.evaluate = function (model, models) {
    //check if user answers are correct
    if (DivisionEval.prototype.isCorrect(model))
        return true;
    var strategy = DivisionEval.prototype.getDivisionEvalStrategy(model);
    for (i = 0; i < strategy.length; i++) {
        var result = eval(DivisionEval.prototype.divRuleSet[strategy[i]])(model, models);
        if (result != true)
            return result;
    }
    return true;
}

/**
 * @todo use pipeline pattern instead of this.
 */
DivisionEval.prototype.divRuleSet = {
    isDivisorOne: "DivisionEval.prototype.isDivisorOne",
    isSubtracted: "DivisionEval.prototype.isSubtracted",
    isDivisorInsteadOfQuotient: "DivisionEval.prototype.isDivisorInsteadOfQuotient",
    isDividentMulOf100AndDivisorIs100: "DivisionEval.prototype.isDividentMulOf100AndDivisorIs100",
    isDividentMulOf10AndDivisorIs10: "DivisionEval.prototype.isDividentMulOf10AndDivisorIs10",
    isDividentNotMulOf10AndDivisorIs10: "DivisionEval.prototype.isDividentNotMulOf10AndDivisorIs10",
    isDividentNotMulOf100AndDivisorIs100: "DivisionEval.prototype.isDividentNotMulOf100AndDivisorIs100",
    isDividentNotMulOf1000AndDivisorIs1000: "DivisionEval.prototype.isDividentNotMulOf1000AndDivisorIs1000",
    isDividentMulOf1000AndDivisorIs1000: "DivisionEval.prototype.isDividentMulOf1000AndDivisorIs1000",
    isExactlyDivisible: "DivisionEval.prototype.isExactlyDivisible",
    interChangedQandR: "DivisionEval.prototype.interChangedQandR",
    incompleteDivision: "DivisionEval.prototype.incompleteDivision"
}

DivisionEval.prototype.getDivisionEvalStrategy = function (model) {
    var evalRuleSet = ["isDividentMulOf100AndDivisorIs100", "isDividentMulOf10AndDivisorIs10", "isDividentNotMulOf10AndDivisorIs10"
        , "isDividentNotMulOf100AndDivisorIs100", "isDividentNotMulOf1000AndDivisorIs1000", "isDividentMulOf1000AndDivisorIs1000"
        , "isExactlyDivisible"];
    if (model.type == 0)//type 0 - only quotient , type 1 - both quotient and remainder
        evalRuleSet.unshift("isSubtracted", "isDivisorInsteadOfQuotient", "isDivisorOne");
    else
        evalRuleSet.unshift("interChangedQandR", "incompleteDivision");
    return evalRuleSet;
}
/**
 * Checks if the divisor is one, if not return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDivisorOne = function (model) {
    if (model.operands.length == 2 && model.operands[1] == 1) {
        return result = {
            id: "isDivisorOne",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks if the user answer is the difference of the operands instead of division
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isSubtracted = function (model) {
    var difference = model.operands[0] - model.operands[1];
    if (difference == Number(model.user.quotient)) {
        return result = {
            id: "isSubtracted",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks if the user answer is divisor instead of quotient
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDivisorInsteadOfQuotient = function (model) {
    var divisor = model.operands[1];
    if (divisor == Number(model.user.quotient)) {
        return result = {
            id: "isDivisorInsteadOfQuotient",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks divident is multiple of 100s and divisor is equal to 100
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDividentMulOf100AndDivisorIs100 = function (model) {
    var dividentMulOf100 = model.operands[0] % 100 == 0;
    var divisorIs100 = model.operands[1] == 100;
    if (dividentMulOf100 && divisorIs100) {
        return result = {
            id: "isDividentMulOf100AndDivisorIs100",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks divident is multiple of 10s and divisor is equal to 10
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDividentMulOf10AndDivisorIs10 = function (model) {
    var dividentMulOf10 = model.operands[0] % 10 == 0;
    var divisorIs10 = model.operands[1] == 10;
    if (dividentMulOf10 && divisorIs10) {
        return result = {
            id: "isDividentMulOf10AndDivisorIs10",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks divident is not multiple of 10s and divisor is equal to 10
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDividentNotMulOf10AndDivisorIs10 = function (model) {
    var dividentNotMulOf10 = model.operands[0] % 10 != 0;
    var divisorIs10 = model.operands[1] == 10;
    if (dividentNotMulOf10 && divisorIs10) {
        return result = {
            id: "isDividentNotMulOf10AndDivisorIs10",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}

/**
 * Checks divident is not multiple of 100s and divisor is equal to 100
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDividentNotMulOf100AndDivisorIs100 = function (model) {
    var dividentNotMulOf100 = model.operands[0] % 100 != 0;
    var divisorIs100 = model.operands[1] == 100;
    if (dividentNotMulOf100 && divisorIs100) {
        return result = {
            id: "isDividentNotMulOf100AndDivisorIs100",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks divident is not multiple of 1000s and divisor is equal to 1000
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDividentNotMulOf1000AndDivisorIs1000 = function (model) {
    var dividentNotMulOf1000 = model.operands[0] % 1000 != 0;
    var divisorIs1000 = model.operands[1] == 1000;
    if (dividentNotMulOf1000 && divisorIs1000) {
        return result = {
            id: "isDividentNotMulOf1000AndDivisorIs1000",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks divident is multiple of 1000s and divisor is equal to 1000
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isDividentMulOf1000AndDivisorIs1000 = function (model) {
    var dividentMulOf1000 = model.operands[0] % 1000 == 0;
    var divisorIs1000 = model.operands[1] == 1000;
    if (dividentMulOf1000 && divisorIs1000) {
        return result = {
            id: "isDividentMulOf1000AndDivisorIs1000",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks the divident is exactly divided by the divisor
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.isExactlyDivisible = function (model) {
    var exactlyDivisible = model.operands[0] % model.operands[1] == 0;
    if (exactlyDivisible && model.loc == 'R') {
        return result = {
            id: "isExactlyDivisible",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks if quotient and remainder are interchanged
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.interChangedQandR = function (model, models) {
    if (model.type == 1 && models[0].user.quotient == models[1].expected.remainder && models[1].user.remainder == models[0].expected.quotient) {
        return result = {
            id: "interChangedQandR",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Checks if user has stopped the division after 1st step
 * @param {object} model
 * @returns {object} model
 */
DivisionEval.prototype.incompleteDivision = function (model, models) {
    var divisorLength = model.operands[1].toString().length;
    // assume initial divident( length og initial divident is equal to length of divisor)
    var intialDivident = model.operands[0].toString().substring(0, divisorLength);
    var remainingDigitsInDivident = model.operands[0].toString().substring(divisorLength);
    if (Number(intialDivident) < Number(model.operands[1])) {
        //if initial divident is less than divisor, take one more digit from the actual divident
        intialDivident = model.operands[0].toString().substring(0, divisorLength + 1);
        remainingDigitsInDivident = model.operands[0].toString().substring(divisorLength + 1);
    }
    var quotient = Math.trunc(Number(intialDivident) / Number(model.operands[1]));
    var remainder = Number(intialDivident) % Number(model.operands[1]);
    //append the remaining digits of the divident to remainder
    remainder = remainder.toString() + remainingDigitsInDivident;
    if (Number(models[0].user.quotient) == quotient && Number(models[1].user.remainder) == Number(remainder)) {
        return result = {
            id: "incompleteDivision",
            context: {
                loc: model.loc,
                index: null
            }
        }
    }
    else
        return true;
}
/**
 * Check if user answers(Quotient and Remainder) are correct
 * @param {Object} model
 * @param {boolean}
 */
DivisionEval.prototype.isCorrect = function (model) {
    if (model.loc == 'Q' && Number(model.expected.quotient) == Number(model.user.quotient))
        return true;
    else if (model.loc == 'R' && Number(model.expected.remainder) == Number(model.user.remainder))
        return true;
    else
        return false;
}

