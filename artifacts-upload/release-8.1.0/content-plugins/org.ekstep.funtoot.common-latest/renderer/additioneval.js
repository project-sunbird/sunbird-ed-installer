//@ sourceURL=additioneval.js
/**
 * Reusable addition evaluator - used for both Vertical and Horizontal evaluations
 * @author Henrietta D (henrietta.d@funtoot.com)
 * @author Amulya K (amulya.k@funtoot.com)
 */
/**
 * Constructs the AdditionEval object
 * @constructor
 */
function AdditionEval(model) {
    this.model = model;
}

AdditionEval.prototype.evaluate = function (model) {
    //check if user answers are correct
    if (AdditionEval.prototype.isCorrect(model))
        return true;
    var carry = [];
    var hasCarry = false;
    for (i = 0; i < model.digits; i++) {
        var sum = 0;
        _.each(model.operands, function (operand) {
            sum += Number(operand[i]) || 0;
        });
        if (i != 0)
            sum = sum + carry[i - 1];
        if (sum >= 10) {
            carry.push(Math.floor(sum / 10));
            hasCarry = true;
        }
        else carry.push('');
    }
    model.hasCarry = hasCarry;
    if (model.expected.carry == null) {
        model.expected.carry = carry;
    }
    if (_.isUndefined(model.errorAnsCol)) {
        model.errorAnsCol = AdditionEval.prototype.getAnsErrorCol(model.expected.answer.toString(), model.user.answer.toString());
    }
    var strategy = AdditionEval.prototype.getEvalStrategy(model);
    for (i = 0; i < strategy.length; i++) {
        var result = eval(AdditionEval.prototype.ruleSet[strategy[i]])(model);
        if (result != true)
            return result;
    }
    return true;
}

/**
 * @todo use pipeline pattern instead of this.
 */
AdditionEval.prototype.ruleSet = {
    isSingleDigitSameNumber: "AdditionEval.prototype.isSingleDigitSameNumber",
    isSingleDigitDefault: "AdditionEval.prototype.isSingleDigitDefault",
    isMultiplesOfHundreds: "AdditionEval.prototype.isMultiplesOfHundreds",
    isReverseCarry: "AdditionEval.prototype.isReverseCarry",
    isCarryMissing: "AdditionEval.prototype.isCarryMissing",
    isReverseAddition: "AdditionEval.prototype.isReverseAddition",
    isCarryInAnswerBox: "AdditionEval.prototype.isCarryInAnswerBox",
    isSumOfIndividualDigits: "AdditionEval.prototype.isSumOfIndividualDigits",
    joinNumbers: "AdditionEval.prototype.joinNumbers",
    isAddendZero: "AdditionEval.prototype.isAddendZero",
    isSum: "AdditionEval.prototype.isSum",
    isSameNumber: "AdditionEval.prototype.isSameNumber",
    isSubtrahendDigitZero: "AdditionEval.prototype.isSubtrahendDigitZero",
    subtractFromLargerNumber: "AdditionEval.prototype.subtractFromLargerNumber",
    notDecrementingAfterBorrow: "AdditionEval.prototype.notDecrementingAfterBorrow",
}

AdditionEval.prototype.getAnsErrorCol = function (expectedAns, userAns) {
    for (i = 0; i < Math.max(expectedAns.length, userAns.length); i++) {
        if (expectedAns[expectedAns.length - 1 - i] != userAns[userAns.length - 1 - i]) {
            return i;
        }
    }
}

AdditionEval.prototype.getEvalStrategy = function (model) {
    model.opLength = [];
    model.operands.forEach(function (o, i, a) {
        model.opLength.push(o.toString().length);
    });
    var singleDigit = _.every(model.opLength, function (l) { return l == 1; });
    var evalRuleSet = [];
    if (model.operation == 'Addition') {
        if (singleDigit)
            evalRuleSet = ["isSingleDigitSameNumber", "isReverseCarry", "isCarryMissing", "isAddendZero", "isSingleDigitDefault"];
        else
            evalRuleSet = ["isMultiplesOfHundreds", "isReverseCarry", "isCarryMissing", "isReverseAddition", "isCarryInAnswerBox", "isSumOfIndividualDigits", "isAddendZero", "joinNumbers"];
    }
    else if (model.operation == 'Subtraction') {
        evalRuleSet = ["isSum", "isSameNumber", "isSubtrahendDigitZero", "subtractFromLargerNumber", "notDecrementingAfterBorrow"];
    }
    else
        evalRuleSet = null;
    return evalRuleSet;
}
/**
 * Checks if all digits are same, if all digits are same then checks if user answer is same as expected answer,
 * if not return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isSingleDigitSameNumber = function (model) {
    //Check if all operands are same
    for (i = 0; i < model.operands.length; i++) {
        if (model.operands[i] !== model.operands[0])
            return true;
    }
    if (Number(model.expected.answer) !== Number(model.user.answer))
        return result = {
            id: "isSingleDigitSameNumber",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else
        return true;
}
/**
 * Checks if user answer is same as expected answer and one of the operands is zero, if not return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isAddendZero = function (model) {
    if (model.operands.length == 2 && (model.operands[1] == 0 || model.operands[0] == 0)) {
        return result = {
            id: "isAddendZero",
            context: [{
                loc: "ans",
                index: null
            }]
        }
    }
    else
        return true;
}
AdditionEval.prototype.isSingleDigitDefault = function (model) {
    if (Number(model.expected.answer) !== Number(model.user.answer))
        return result = {
            id: "isSingleDigitDefault",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else
        return true;
}
/**
 * Checks if all numbers are multiples of 100, if so then checks if user answer is same as expected answer,
 * if not return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isMultiplesOfHundreds = function (model) {
    var operandsMultipleof100s = _.every(model.operands, function (o) { return o % 100 == 0; });
    if (operandsMultipleof100s && Number(model.expected.answer) !== Number(model.user.answer))
        return result = {
            id: "isMultiplesOfHundreds",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else
        return true;
}
/**
 * Checks if units digit of a column's sum is assigned as carry.
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isReverseCarry = function (model) {
    console.log("isReverseCarry");
    if (model.hasCarry) {
        var correctAnswer = model.expected.answer.toString();
        var userAnswer = model.user.answer.toString();
        // calculate sum of the digits in error column
        var colAns = 0;
        _.each(model.operands, function (operand) {
            var opStr = operand.toString();
            colAns = colAns + (Number(opStr[opStr.length - 1 - model.errorAnsCol]) || 0);
        });
        if (model.errorAnsCol != 0) {
            colAns = colAns + Number(model.expected.carry[model.errorAnsCol - 1]);
        }
        // check for reverse carry only if sum of the digits in error column is greater than 10. 
        if (colAns >= 10) {
            // check if the given number is the tens place of the column sum
            if (colAns.toString()[0] == userAnswer[userAnswer.length - 1 - model.errorAnsCol]) {
                // check if the carry is given
                if (model.user.carry && Number(model.user.carry[model.errorAnsCol]) > 0) {
                    // check if the carry is units digit of the sum
                    if (Number(model.user.carry[model.errorAnsCol]) == colAns % 10) {
                        var rule = {
                            id: "isReverseCarry",
                            context: [
                                {
                                    loc: "carry",
                                    index: model.errorAnsCol + 1
                                }
                            ]
                        }
                        return rule;
                    }
                    else return true;
                }
                // check if the wrong carry is being used to calculate next column sum
                else {
                    var nextColAns = 0;
                    _.each(model.operands, function (operand) {
                        var opStr = operand.toString();
                        nextColAns = nextColAns + (Number(opStr[opStr.length - 2 - model.errorAnsCol]) || 0);
                    });
                    var nextColSum = nextColAns + colAns % 10;
                    if (nextColSum.toString().includes(userAnswer[userAnswer.length - 2 - model.errorAnsCol])) {
                        var rule = {
                            id: "isReverseCarry",
                            context: [
                                {
                                    loc: "ans",
                                    index: model.errorAnsCol
                                }
                            ]
                        }
                        return rule;
                    }
                    else return true;
                }
            }
            else return true;
        }
        else return true;
    }
    else return true;
}
/**
 *Check if addition s=is done without considering carry 
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isCarryMissing = function (model) {
    console.log("isCarryMissing");
    if (model.hasCarry) {
        var correctAnswer = model.expected.answer.toString();
        var userAnswer = model.user.answer.toString();
        // proceed only if error is not there in units place
        if (model.errorAnsCol != 0) {
            // calculate the column sum by adding the operands digits only
            var colAns = 0;
            _.each(model.operands, function (operand) {
                var opStr = operand.toString();
                colAns = colAns + (Number(opStr[opStr.length - 1 - model.errorAnsCol]) || 0);
            });
            // check if units digits of the sum is given as answer in error column
            if (colAns % 10 == (Number(userAnswer[userAnswer.length - 1 - model.errorAnsCol]) || 0)) {
                if (model.user.carry[model.errorAnsCol - 1] == "") {
                    var rule = {
                        id: "isCarryMissing",
                        context: [{
                            loc: "ans",
                            index: model.errorAnsCol
                        }
                        ]
                    }
                    return rule;
                }
            }
            return true;
        }
        return true;
    }
    else return true;
}
/**
 * Checks if the addition is done from left to right instead of the other way round.
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isReverseAddition = function (model) {
    if (model.hasCarry) {
        console.log("isReverseAddition");
        var correctAnswer = model.expected.answer.toString();
        var userAnswer = model.user.answer.toString();
        var rule = {
            id: "isReverseAddition",
            context: [{
                loc: "ans",
                index: userAnswer.length - 1
            }
            ]
        }
        // reverse the operands, get their sum and reverse the calculated sum
        var reverseSum = 0;
        _.each(model.operands, function (operand) {
            reverseSum = reverseSum + Number(operand.toString().split("").reverse().join(""));
        });
        reverseSum = Number(reverseSum.toString().split("").reverse().join(""));
        if (reverseSum == model.user.answer) return rule;
        else {
            var reverseStr = reverseSum.toString()
            var reverseStr2 = reverseStr.substr(0, reverseStr.length - 2) + reverseStr[reverseStr.length - 1] + reverseStr[reverseStr.length - 2];
            if (Number(reverseStr2) == model.user.answer) return rule;
            else return true;
        }
    }
    else return true;

}
/**
 * Checks if the carry is being entered in the answer box itself 
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isCarryInAnswerBox = function (model) {
    if (model.hasCarry) {
        console.log("isCarryInAnswerBox");
        var expectedAnswer = model.expected.answer.toString();
        var userAnswer = model.user.answer.toString();
        if (model.errorAnsCol != 0) {
            // calculate sum of the digits in the column before error
            var colAns = 0;
            _.each(model.operands, function (operand) {
                var numStr = operand.toString();
                colAns = colAns + (Number(numStr[numStr.length - model.errorAnsCol]) || 0);
            });
            if (model.errorAnsCol != 1) {
                colAns = colAns + model.expected.carry[model.errorAnsCol - 2];
            }
            // check if the carry of previous column is given as answer 
            if (colAns >= 10 && colAns.toString()[0] == userAnswer[userAnswer.length - 1 - model.errorAnsCol]) {
                var rule = {
                    id: "isCarryInAnswerBox",
                    context: [{
                        loc: "ans",
                        index: model.errorAnsCol
                    }
                    ]
                }
                return rule;
            }
            else return true;
        }
        else return true;
    }
    else return true;
}
/**
 * Checks if user answers is sum of all individual digits, if so return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isSumOfIndividualDigits = function (model) {
    var numberString = ""
    //conact all the operands
    var array = [];
    _.map(model.operands, function (op) {
        var a = _.toArray(op.toString());
        array.push(a.join().replace(/,/g, '+'));
    });
    var individualDigitSum = eval(array.join().replace(/,/g, '+'));
    if (Number(model.user.answer) === individualDigitSum)
        return result = {
            id: "isSumOfIndividualDigits",
            context: [{
                loc: "ans",
                index: null
            }]
        }
    else
        return true;
}
/**
 * Checks if user answers is just concatenation of numbers , if so return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.joinNumbers = function (model) {
    var concatedNumbers = ""
    //conact all the operands
    _.each(model.operands, function (o) {
        concatedNumbers = concatedNumbers + o.toString();
    })
    if (Number(model.user.answer) === Number(concatedNumbers))
        return result = {
            id: "joinNumbers",
            context: [{
                loc: "ans",
                index: null
            }]
        }
    else
        return true;
}
/**
 * Check if user answers(sum/difference, carry/borrow) are correct
 * @param {Object} model
 * @param {boolean} 
 */
AdditionEval.prototype.isCorrect = function (model) {
    var isAnsCorrect = false;
    var isCarryBorrowCorrect = false;
    // Check is sum/ difference is correct
    if (Number(model.expected.answer) != Number(model.user.answer))
        return false
    else {
        isAnsCorrect = true;
        if (model.operation = 'Addition')
            isCarryBorrowCorrect = AdditionEval.prototype.isCarryOrBorrowCorrect(model.expected.carry, model.user.carry);
        else
            isCarryBorrowCorrect = AdditionEval.prototype.isCarryOrBorrowCorrect(model.expected.borrow, model.user.borrow);
    }
    if (isAnsCorrect && isCarryBorrowCorrect)
        return true;
    else
        return false
}
/**
 * Check if user carry/borrow is correct
 * @param {array} expectedCarryBorrow
 * @param {array} userCarryBorrow
 */
AdditionEval.prototype.isCarryOrBorrowCorrect = function (expectedCarryBorrow, userCarryBorrow) {
    if (!userCarryBorrow) {
        //user has not entered anything in carry/borrow field
        return true;
    }
    else {//user has entered carry/borrow
        if (expectedCarryBorrow) {
            //if there is expected carry/borrow
            if (expectedCarryBorrow.length == userCarryBorrow.length) {
                //if there are same number of carry/borrow digits in expected and user entered carry/borrow
                var boolArray = []
                for (i = 0; i < expectedCarryBorrow.length; i++) {
                    //comparing each element in expected carry/borrow and user borrow and update boolArray accordingly
                    if (expectedCarryBorrow[i] == userCarryBorrow[i])
                        boolArray.push(true);
                    else
                        boolArray.push(false);
                }
                return _.every(boolArray, function (a) { return a == true; });
            }
            else
                return false
        }
        else
            return false;
    }
}
/**
 * Check if the subtraction involves borrow
 * @param {Object} model
 * @returns {array}  array of expected borrow digits
 */
AdditionEval.prototype.getBorrowDigits = function (model) {
    var digitsArray = []
    _.map(model.operands, function (op) {
        digitsArray.push(_.toArray(op.toString()).reverse());
    });
    var borrowDigits = [];
    for (i = 0; i < digitsArray.length - 1; i++) {
        var isBorrow = [];
        for (j = 0; j < digitsArray[0].length; j++) {
            if (Number(digitsArray[i][j]) < Number(digitsArray[i + 1][j])) {
                isBorrow.push(true);
                if (j != 0 && isBorrow[j - 1])
                    borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                else
                    borrowDigits.push(Number(digitsArray[i][j]) + 10);
            }
            else {
                if (isBorrow[j - 1]) {
                    if (Number(digitsArray[i][j]) - 1 < Number(digitsArray[i + 1][j])) {
                        isBorrow.push(true);
                        borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                    }
                    else {
                        isBorrow.push(false);
                        borrowDigits.push('');
                    }
                }
                else {
                    isBorrow.push(false);
                    borrowDigits.push('');
                }
            }
        }
    }
    return borrowDigits.reverse();
}
/**
 * Computes all possible wrong answers(answer and borrow) for each column
 * @param {object} model
 * @returns {object} allpossible wrong answers
 */
AdditionEval.prototype.getAllPossibleWrongAnswerForEachColumn = function (model) {
    var digitsArray = []
    _.map(model.operands, function (op) {
        digitsArray.push(_.toArray(op.toString()).reverse());
    });
    var borrowDigits = [];
    for (k = 0; k < digitsArray.length - 1; k++) {
        var isBorrow = [];
        var wrongInputModel = [];
        for (l = 0; l < digitsArray[0].length; l++) {
            var subFromLargeNum = null;
            var borrow_notDecrementingAfterBorrow = null;
            var ans_notDecrementingAfterBorrow = null;
            if (Number(digitsArray[k][l]) < Number(digitsArray[k + 1][l])) {
                isBorrow.push(true);
                subFromLargeNum = Number(digitsArray[k + 1][l]) - Number(digitsArray[k][l]);
                ans_notDecrementingAfterBorrow = Number(digitsArray[k][l]) + 10 - Number(digitsArray[k + 1][l]);
                borrow_notDecrementingAfterBorrow = Number(digitsArray[k][l]) + 10;
            }
            else {
                subFromLargeNum = Number(digitsArray[k][l]) - Number(digitsArray[k + 1][l]);
                ans_notDecrementingAfterBorrow = Number(digitsArray[k][l]) - Number(digitsArray[k + 1][l]);
                borrow_notDecrementingAfterBorrow = Number(digitsArray[k][l]);
                isBorrow.push(false);
            }
            wrongInputModel.push({
                "ans_subFromLargeNum": subFromLargeNum,
                "ans_notDecrementingAfterBorrow": ans_notDecrementingAfterBorrow,
                "borrow_notDecrementingAfterBorrow": borrow_notDecrementingAfterBorrow
            });
        }
    }
    return wrongInputModel.reverse();
}
/**
 * Checks if the user answer is sum of the operands instead of difference
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isSum = function (model) {
    var sum = 0;
    _.each(model.operands, function (op) {
        sum = sum + Number(op);
    });
    if (sum === Number(model.user.answer))
        return result = {
            id: "isSum",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else
        return true;
}
/**
 * Checks if all digits are same, if all digits are same then checks if user answer is same as expected answer,
 * if not return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isSameNumber = function (model) {
    //Check if all operands are same
    for (i = 0; i < model.operands.length; i++) {
        if (model.operands[i] !== model.operands[0])
            return true;
    }
    if (Number(model.expected.answer) !== Number(model.user.answer))
        return result = {
            id: "isSameNumber",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else
        return true;
}
/**
 * Checks if Subtrahend then checks if user answer is same as expected answer,
 * if not return a model indicating error
 * @param {object} model
 * @returns {object} model
 */
AdditionEval.prototype.isSubtrahendDigitZero = function (model) {
    //Check if Subtrahend digit is zero
    if (Number(model.operands[1]) !== 0)
        return true;
    if (Number(model.expected.answer) !== Number(model.user.answer))
        return result = {
            id: "isSubtrahendDigitZero",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else
        return true;
}
/**
 * Checks if the user has given the answer by always subtracting smaller digit from the larger digit.
 * @param {object} model
 * @returns {object} model
 * eg:72 - 66
 * =>14 (7 - 6 and 6 - 2)
 */
AdditionEval.prototype.subtractFromLargerNumber = function (model) {
    var wrongInputs = AdditionEval.prototype.getAllPossibleWrongAnswerForEachColumn(model);
    var wrongAnswer = [];
    var userAnswer = model.user.answer;
    _.each(wrongInputs, function (input) {
        wrongAnswer.push(input.ans_subFromLargeNum);
    });
    wrongAnswer = wrongAnswer.join().replace(/,/g, '');
    if (Number(userAnswer) === Number(wrongAnswer))
        return result = {
            id: "subtractFromLargerNumber",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else
        return true;
}
/**
 * Checks if the user has decremented the digit after taking a borrow.
 * @param {object} model
 * @returns {object} model
 * eg: 72 - 26 = 56. Not making 7 as 6
 */
AdditionEval.prototype.notDecrementingAfterBorrow = function (model) {
    var wrongInputs = AdditionEval.prototype.getAllPossibleWrongAnswerForEachColumn(model);
    var wrongAnswer = [];
    var wrongBorrow = [];
    var userAnswer = model.user.answer;
    var userBorrow = model.user.borrow;
    _.each(wrongInputs, function (input) {
        wrongAnswer.push(input.ans_notDecrementingAfterBorrow);
        wrongBorrow.push(input.borrow_notDecrementingAfterBorrow);
    });
    wrongAnswer = wrongAnswer.join().replace(/,/g, '');
    wrongBorrow = wrongBorrow.join().replace(/,/g, '');
    if (Number(userAnswer) === Number(wrongAnswer))
        return result = {
            id: "notDecrementingAfterBorrow",
            context: [{
                loc: "ans",
                index: model.errorAnsCol
            }]
        }
    else if (Number(userBorrow) === Number(wrongBorrow))
        return result = {
            id: "notDecrementingAfterBorrow",
            context: [{
                loc: "borrow",
                index: model.errorAnsCol
            }]
        }
    else
        return true
}