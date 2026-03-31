//@ sourceURL=multiplicationeval.js
/**
 * Reusable multiplication evaluator - used for both Vertical and Horizontal evaluations
 * @author Henrietta D (henrietta.d@funtoot.com)
 * @author Amulya K (amulya.k@funtoot.com)
 */
/**
 * Constructs the MultiplicationEval object
 * @constructor
 */
function MultiplicationEval(model) {
    this.model = model;
}

MultiplicationEval.prototype.evaluate = function (model) {
    //check if user answers are correct
    if (MultiplicationEval.prototype.isCorrect(model))
        return true;
    var strategy = MultiplicationEval.prototype.getEvaluationStrategy(model);
    for (var z = 0; z < strategy.length; z++) {
        var result = eval(MultiplicationEval.prototype.multiplicationRuleSet[strategy[z]])(model);
        if (result != true)
            return result;
    }
    return true;
}

/**
 * @todo use pipeline pattern instead of this.
 */
MultiplicationEval.prototype.multiplicationRuleSet = {
    hasSameOperands: "MultiplicationEval.prototype.hasSameOperands",
    multiplicationby1: "MultiplicationEval.prototype.multiplicationby1",
    multiplicationBySingleDigit: "MultiplicationEval.prototype.multiplicationBySingleDigit",
    multiplicationByPowersOfTen: "MultiplicationEval.prototype.multiplicationByPowersOfTen",
    isSum: "MultiplicationEval.prototype.isSum",
    isZeroMissed: "MultiplicationEval.prototype.isZeroMissed",
    isProductMisplaced: "MultiplicationEval.prototype.isProductMisplaced",
    isZeroMissedInTheEnd: "MultiplicationEval.prototype.isZeroMissedInTheEnd",
    isZeroPresent: "MultiplicationEval.prototype.isZeroPresent",
}

MultiplicationEval.prototype.getEvaluationStrategy = function (model) {
    model.opLength = [];
    model.operands.forEach(function (o, i, a) {
        model.opLength.push(o.toString().length);
    });
    var twoOperands = model.operands.length == 2;
    var evalRuleSet = [];
    if (twoOperands)
        evalRuleSet = ["isSum", "isProductMisplaced", "isZeroMissedInTheEnd", "isZeroMissed", "multiplicationby1", "multiplicationBySingleDigit", "multiplicationByPowersOfTen", "hasSameOperands"];
    else
        evalRuleSet = ["isSum", "isZeroMissedInTheEnd", "isZeroMissed", "hasSameOperands", "isZeroPresent"];
    return evalRuleSet;
}
/**
 * Checks if all digits are same
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.hasSameOperands = function (model) {
    //Check if all operands are same
    for (i = 0; i < model.operands.length; i++) {
        if (model.operands[i] !== model.operands[0])
            return true;
    }
    if (Number(model.expected.answer) !== Number(model.user.answer))
        return result = {
            id: "hasSameOperands",
            context: [{
                loc: "ans",
            }]
        }
    else
        return true;
}

/**
 * Checks if answer is the sum of the operands
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.isSum = function (model) {
    var sum = 0;
    _.each(model.operands, function (operand) {
        sum += Number(operand);
    })
    if (sum == Number(model.user.answer))
        return result = {
            id: "isSum",
            context: [{
                loc: "ans",
            }]
        }
    else
        return true;
}

/**
 * Checks if multiplier is 1
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.multiplicationby1 = function (model) {
    var operandIsOne = false;
    _.each(model.operands, function (operand) {
        if (operand == 1) operandIsOne = true;
    })
    if (operandIsOne) {
        return result = {
            id: "multiplicationby1",
            context: [{
                loc: "ans",
            }]
        }
    } else return true;
}

/**
 * Checks if multiplier is a single digit
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.multiplicationBySingleDigit = function (model) {
    var singleDigit = false;
    _.each(model.operands, function (operand) {
        if (operand.toString().length == 1) singleDigit = true;
    })
    if (singleDigit) {
        return result = {
            id: "multiplicationBySingleDigit",
            context: [{
                loc: "ans",
            }]
        }
    } else return true;
}

/**
 * Checks if multiplier is a multiple of 10
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.multiplicationByPowersOfTen = function (model) {
    var operandIsPowersOfTen = false;
    _.each(model.operands, function (operand) {
        if (operand % 10 == 0) operandIsPowersOfTen = true;
    })
    if (operandIsPowersOfTen) {
        return result = {
            id: "multiplicationByPowersOfTen",
            context: [{
                loc: "ans",
            }]
        }
    } else return true;
}

/**
 * Checks if the error is because of the product of the multiplicand with
 * each digit in multiplier being misplaced while adding them
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.isProductMisplaced = function (model) {
    if (model.operands[1] > 10) {
        var productSum = 0;
        _.each(_.range(model.operands[1].toString().length), function (i) {
            productSum += (model.operands[0] * (model.operands[1].toString()[i]));
        });
        if (productSum == Number(model.user.answer)) {
            return result = {
                id: "isProductMisplaced",
                context: [{
                    loc: "ans",
                }]
            }
        }

    }
    return true;
}

/**
 * Checks if trailing zeroes are missed
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.isZeroMissedInTheEnd = function (model) {
    var operandMultipleOf10 = false;
    for (i = 0; i < model.operands; i++) {
        if (Number(model.operands[i]) % 10 == 0) {
            operandMultipleOf10 = true;
            break;
        }
    }
    var ans = Number(model.expected.answer);
    if (model.expected.answer % 10 == 0 && ans != 0 && operandMultipleOf10) {
        while (ans % 10 == 0) {
            ans = ans / 10;
            if (ans == Number(model.user.answer)) {
                return result = {
                    id: "isZeroMissedInTheEnd",
                    context: [{
                        loc: "ans",
                    }]
                }
            }
        }
    } else return true;
}

/**
 * Checks if zeroes in the operands are ignored
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.isZeroMissed = function (model) {
    var containsZero = false;
    var wrongAns = 1;
    _.each(model.operands, function (operand) {
        if (operand.toString().includes("0")) {
            containsZero = true;
            var op = operand.toString().replace("0", "");
            wrongAns = wrongAns * Number(op);
        } else wrongAns = wrongAns * operand;
    })
    if (containsZero && wrongAns == Number(model.user.answer)) {
        return result = {
            id: "isZeroMissed",
            context: [{
                loc: "ans",
            }]
        }
    } else return true;
}

/**
 * Checks if operands contain zero
 * @param {object} model
 * @returns {object} model
 */
MultiplicationEval.prototype.isZeroPresent = function (model) {
    var containsZero = false;
    _.each(model.operands, function (operand) {
        if (operand.toString().includes("0")) {
            containsZero = true;
        }
    })
    if (containsZero) {
        return result = {
            id: "isZeroPresent",
            context: [{
                loc: "ans",
            }]
        }
    } else return true;
}
/**
 * Check if user answers are correct
 * @param {Object} model
 * @param {boolean}
 */
MultiplicationEval.prototype.isCorrect = function (model) {
    if (Number(model.expected.answer) == Number(model.user.answer))
        return true;
    else
        return false;
}