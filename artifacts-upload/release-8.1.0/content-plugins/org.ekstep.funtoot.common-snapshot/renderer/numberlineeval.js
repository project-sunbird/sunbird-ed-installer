//@ sourceURL=numberlineeval.js
/**
 * Reusable numberline evaluator
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
/**
 * Constructs the NumberLineEval object
 * @constructor
 */
function NumberLineEval(model) {
    this.model = model;
}

NumberLineEval.prototype.evaluate = function (model, models) {
    //check if user answers are correct
    if (NumberLineEval.prototype.isCorrect(model))
        return true;
    var strategy = NumberLineEval.prototype.getNumberlineEvalStrategy(model);
    for (i = 0; i < strategy.length; i++) {
        var result = eval(NumberLineEval.prototype.numberLineRuleSet[strategy[i]])(model, models);
        if (result != true)
            return result;
    }
    return true;
}

/**
 * @todo use pipeline pattern instead of this.
 */
NumberLineEval.prototype.numberLineRuleSet = {
    onlyOperands: "NumberLineEval.prototype.onlyOperands",
    directAnswer: "NumberLineEval.prototype.directAnswer",
    oneRandomNumber: "NumberLineEval.prototype.oneRandomNumber",
    twoRandomNumbers: "NumberLineEval.prototype.twoRandomNumbers",
    oneOfTheOperands: "NumberLineEval.prototype.oneOfTheOperands",
    subtracted: "NumberLineEval.prototype.subtracted",
    hopTillAnswer: "NumberLineEval.prototype.hopTillAnswer",
    sum: "NumberLineEval.prototype.sum",
    largerOperand: "NumberLineEval.prototype.largerOperand",
    smallerOperand: "NumberLineEval.prototype.smallerOperand"

}

NumberLineEval.prototype.getNumberlineEvalStrategy = function (model) {
    if (model.operation == "Addition")
        var evalRuleSet = ["subtracted", "onlyOperands", "oneOfTheOperands", "directAnswer", "hopTillAnswer", "twoRandomNumbers", "oneRandomNumber"];
    else if (model.operation == "Subtraction")
        var evalRuleSet = ["sum", "onlyOperands", "largerOperand", "smallerOperand", "directAnswer", "hopTillAnswer", "twoRandomNumbers", "oneRandomNumber"];
    else if (model.operation == "Multiplication")
        var evalRuleSet = ["sum", "subtracted", "onlyOperands", "largerOperand", "smallerOperand", "directAnswer", "twoRandomNumbers", "oneRandomNumber"];
    return evalRuleSet;
}
/**
 * Checks if user has clicked on only the operands
 * @param {object} model
 * @returns {object} model
 */
NumberLineEval.prototype.onlyOperands = function (model) {
    var startNum = model.nums[0].numericalValue;
    if ((startNum == 0 && model.userHops.length - 1 == model.operands.length) || (startNum != 0 && model.userHops.length == model.operands.length)) {
        var onlyOps = [];
        if (startNum == 0)
            onlyOps.push(model.nums[0].displayValue, model.operands[0].displayValue, model.operands[1].displayValue);
        else
            onlyOps.push(model.operands[0].displayValue, model.operands[1].displayValue);
        var matching = [];
        _.each(onlyOps, function (hop, index) {
            if (model.userHops[index] == hop)
                matching.push(true);
            else
                matching.push(false);
        });
        if (_.every(matching, function (l) { return l == true; })) {
            var uHops = model.userHopDetails;
            if (startNum == 0)
                uHops.splice(0, 1);
            return result = {
                id: "onlyOperands_" + model.operation,
                hops: uHops,
            }
        }
        else
            return true;
    }
    else
        return true;
}
/**
 *
 */
NumberLineEval.prototype.directAnswer = function (model) {
    var startNum = model.nums[0].numericalValue;
    if ((startNum == 0 && model.userHops.length - 1 == 1 && model.userHops[1] == model.ans.displayValue) || (startNum != 0 && model.userHops.length == 1 && model.userHops[0] == model.ans.displayValue)) {
        var directHop = [];
        _.each(model.userHops, function (n, index) {
            if (n == model.ans.displayValue)
                directHop.push(model.userHopDetails[index]);
        });
        return result = {
            id: "directAnswer_" + model.operation,
            hops: directHop,
        }
    }
    else
        return true;
}
/**
 *
 */
NumberLineEval.prototype.oneRandomNumber = function (model) {
    var startNum = model.nums[0].numericalValue;
    var randomHop = [];
    if (startNum == 0 && model.userHops.length - 1 == 1) {
        if (model.userHops[1] != model.operands[0].displayValue && model.userHops[1] != model.operands[1].displayValue && model.userHops[1] != model.ans.displayValue) {
            randomHop.push(model.userHopDetails[1]);
        }
    }
    if (startNum != 0 && model.userHops.length == 1) {
        if (model.userHops[0] != model.operands[0].displayValue && model.userHops[0] != model.operands[1].displayValue && model.userHops[0] != model.ans.displayValue) {
            randomHop.push(model.userHopDetails[0]);
        }
    }
    if (randomHop.length > 0)
        return result = {
            id: "oneRandomNumber_" + model.operation,
            hops: randomHop,
        };
    else
        return true;
}
/**
 *
 */
NumberLineEval.prototype.twoRandomNumbers = function (model) {
    var startNum = model.nums[0].numericalValue;
    var randomHop = [];
    if (startNum == 0 && model.userHops.length == 3) {
        model.userHops.splice(0, 1);
        _.each(model.userHops, function (uh, index) {
            if (model.userHops[index] != model.operands[0].displayValue && model.userHops[index] != model.operands[1].displayValue && model.userHops[index] != model.ans.displayValue) {
                randomHop.push(model.userHopDetails[index + 1]);
            }
        });
    }
    if ((startNum != 0 && model.userHops.length == 2)) {
        _.each(model.userHops, function (uh, index) {
            if (model.userHops[index] != model.operands[0].displayValue && model.userHops[index] != model.operands[1].displayValue && model.userHops[index] != model.ans.displayValue) {
                randomHop.push(model.userHopDetails[index]);
            }
        });
    }
    if (randomHop.length > 0)
        return result = {
            id: "twoRandomNumbers_" + model.operation,
            hops: randomHop,
        };
    else
        return true;
}
/**
 * Checks if user has clicked on only the operands
 * @param {object} model
 * @returns {object} model
 */
NumberLineEval.prototype.oneOfTheOperands = function (model) {
    var startNum = model.nums[0].numericalValue;
    var onlyOps = [];
    if (startNum == 0 && model.userHops.length - 1 == 1) {
        if (model.userHops[1] == model.operands[0].displayValue || model.userHops[1] == model.operands[1].displayValue) {
            onlyOps.push(model.userHopDetails[1]);
        }
    }
    if (startNum != 0 && model.userHops.length == 1) {
        if (model.userHops[0] == model.operands[0].displayValue || model.userHops[0] == model.operands[1].displayValue) {
            onlyOps.push(model.userHopDetails[0]);
        }
    }
    if (onlyOps.length > 0)
        return result = {
            id: "oneOfTheOperands_" + model.operation,
            hops: onlyOps,
        };
    else
        return true;
}
/**
 * Checks if user has clicked on only the operands
 * @param {object} model
 * @returns {object} model
 */
NumberLineEval.prototype.subtracted = function (model) {
    var startNum = model.nums[0].numericalValue;
    if ((startNum == 0 && model.userHops.length == 3) || (startNum != 0 && model.userHops.length == 2)) {
        var sub = [];
        if (startNum == 0) {
            if (model.userHops[1] == model.ans.displayValue && (model.userHops[2] == model.operands[0].displayValue || model.userHops[2] == model.operands[1].displayValue)) {
                sub.push(model.userHopDetails[2]);
                return result = {
                    id: "subtracted_" + model.operation,
                    hops: sub,
                }
            }
            else
                return true;
        }
        if (startNum != 0) {
            if (model.userHops[0] == model.ans.displayValue && (model.userHops[1] == model.operands[0].displayValue || model.userHops[1] == model.operands[1].displayValue)) {
                sub.push(model.userHopDetails[1]);
                return result = {
                    id: "subtracted",
                    hops: sub,
                }
            }
            else
                return true;
        }
    }
    else
        return true;
}

NumberLineEval.prototype.hopTillAnswer = function (model) {
    var nums = model.nums;
    var i = nums[0].numericalValue;
    var previousHop = nums[0].numericalValue;
    var hops = [];
    hops.push(nums[0].displayValue);
    while (i < model.ans.numericalValue) {
        var numericNum = previousHop + Number(model.scale);
        var displayNumArray = _.filter(nums, function (n) {
            if (n.numericalValue == numericNum)
                return n.displayValue;
        });
        hops.push(displayNumArray[0].displayValue);
        i = i + Number(model.scale);
        previousHop = numericNum;
    }
    if (hops.length == model.userHopDetails.length) {
        var matching = [];
        _.each(hops, function (hop, index) {
            if (model.userHops[index] == hop)
                matching.push(true);
            else
                matching.push(false);
        });
        if (_.every(matching, function (l) { return l == true; })) {
            var errorOn = [];//model.userHopDetails;
            if (model.start == 0)
                errorOn.push(model.userHopDetails[1]);
            else
                errorOn.push(model.userHopDetails[0]);
            return result = {
                id: "hopTillAnswer_" + model.operation,
                hops: errorOn,
            }
        }
        else
            return true;
    }
    else
        return true;
}

/**
 * Checks if user done Addition
 * @param {object} model
 * @returns {object} model
 */
NumberLineEval.prototype.sum = function (model) {
    var startNum = model.nums[0].numericalValue;
    var s = model.operands[0].numericalValue + model.operands[1].numericalValue;
    var sm = _.filter(model.nums, function (n) {
        return n.numericalValue == s;
    });
    sm = sm[0];
    if ((startNum == 0 && model.userHops.length == 3) || (startNum != 0 && model.userHops.length == 2)) {
        var sub = [];
        if (startNum == 0) {
            if ((model.userHops[1] == model.operands[0].displayValue || model.userHops[1] == model.operands[1].displayValue) && !_.isUndefined(sm) && model.userHops[2] == sm.displayValue) {
                sub.push(model.userHopDetails[2]);
                return result = {
                    id: "sum_" + model.operation,
                    hops: sub,
                }
            }
            else
                return true;
        }
        if (startNum != 0) {
            if ((model.userHops[0] == model.operands[0].displayValue || model.userHops[0] == model.operands[1].displayValue) && !_.isUndefined(sm) && model.userHops[1] == sm.displayValue) {
                sub.push(model.userHopDetails[1]);
                return result = {
                    id: "sum",
                    hops: sub,
                }
            }
            else
                return true;
        }
    }
    else
        return true;
}
NumberLineEval.prototype.largerOperand = function (model) {
    var startNum = model.nums[0].numericalValue;
    var largerNum = _.max(_.pluck(model.operands, 'numericalValue'));
    var largerOperand = _.filter(model.operands, function (l) { return l.numericalValue == largerNum });
    largerOperand = largerOperand[0];
    var onlyOps = [];
    if (startNum == 0 && model.userHops.length - 1 == 1) {
        if (model.userHops[1] == largerOperand.displayValue) {
            onlyOps.push(model.userHopDetails[1]);
        }
    }
    if (startNum != 0 && model.userHops.length == 1) {
        if (model.userHops[0] == largerOperand.displayValue) {
            onlyOps.push(model.userHopDetails[0]);
        }
    }
    if (onlyOps.length > 0)
        return result = {
            id: "largerOperand_" + model.operation,
            hops: onlyOps,
        };
    else
        return true;
}
NumberLineEval.prototype.smallerOperand = function (model) {
    var startNum = model.nums[0].numericalValue;
    var smallNum = _.min(_.pluck(model.operands, 'numericalValue'));
    var smallOperand = _.filter(model.operands, function (l) { return l.numericalValue == smallNum });
    smallOperand = smallOperand[0];
    var onlyOps = [];
    if (startNum == 0 && model.userHops.length - 1 == 1) {
        if (model.userHops[1] == smallOperand.displayValue) {
            onlyOps.push(model.userHopDetails[1]);
        }
    }
    if (startNum != 0 && model.userHops.length == 1) {
        if (model.userHops[0] == smallOperand.displayValue) {
            onlyOps.push(model.userHopDetails[0]);
        }
    }
    if (onlyOps.length > 0)
        return result = {
            id: "smallerOperand_" + model.operation,
            hops: onlyOps,
        };
    else
        return true;
}
/**
 * Check if user answers(Quotient and Remainder) are correct
 * @param {Object} model
 * @param {boolean}
 */
NumberLineEval.prototype.isCorrect = function (model) {
    if (model.loc == 'Q' && Number(model.expected.quotient) == Number(model.user.quotient))
        return true;
    else if (model.loc == 'R' && Number(model.expected.remainder) == Number(model.user.remainder))
        return true;
    else
        return false;
}

