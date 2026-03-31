//@ sourceURL=additionevaluation.js
/* global PluginManager */
/**
 * 
 * @extends Plugin
 */
Plugin.extend({
    _type: 'org.ekstep.funtoot.additionevaluation',
    /**
     * initializes the grid plugin
     * @param {Object} data the data for the addition evaluation plugin
     */
    initPlugin: function (data) {

    },
    /**
     * If the addends are multiples of 100s
     * @param {Object} model addition evaluation model
     * @returns {boolean}
     */
    multiplesOfHundreds: function (model) {
        var result = true;
        _.each(model.operands, function (op) {
            if (op % 100 != 0) result = false;
        });
        console.log("multiples of 100:" + result);
    },
    /**
     * Carry is reversed - units digit of the sum is considered as carry digit
     * eg:23 + 59 
     * =>91 (23 + 59 = 82)
     * @param {Object} model addition evaluation model
     * @returns {boolean} 
     */
    reverseCarry: function (model) {
        var correctAnswer = model.correctAnswer.toString();
        var userAnswer = model.userAnswer.toString();
        var operands = [];
        _.each(model.operands, function (num, i) {
            var numStr = num.toString();
            var numArray = [];
            _.each(_.range(numStr.length), function (j) {
                numArray.push(numStr[numStr.length - 1 - j]);
            });
            operands.push(numArray);
        });
        // calculate sum of the digits in error column
        var colAns = 0;
        _.each(operands, function (operand) {
            colAns = colAns + (Number(operand[model.errorColumn]) || 0);
        });
        // check for reverse carry only if sum of the digits in error column is greater than 10. 
        if (colAns > 10) {
            // check if the given number is the tens place of the column sum
            if (colAns.toString()[0] == userAnswer[userAnswer.length - 1 - model.errorColumn]) {
                // check if the carry is given
                if (!_.isUndefined(model.carryArray) && Number(model.carryArray[model.errorColumn]) > 0) {
                    // check if the carry is units digit of the sum
                    if (Number(model.carryArray[model.errorColumn]) == colAns % 10) return true;
                    else return false;
                }
                else {
                    var nextColAns = 0;
                    _.each(operands, function (operand) {
                        nextColAns = nextColAns + (Number(operand[model.errorColumn + 1]) || 0);
                    });
                    var nextColSum = nextColAns + colAns % 10;
                    if (nextColSum.toString().includes(userAnswer[userAnswer.length - 2 - model.errorColumn])) return true;
                    else return false;
                }
            }
            else return false;
        }
        else return false;
    },
    /**
     * Carry is missed - carry digit is not considered in addition
     * eg: 53 + 69 
     * => 112 (left the carryover at the tens place.)
     * @param {Object} model addition evaluation model
     * @returns {boolean}
     */
    carryMissing: function (model) {
        var correctAnswer = model.correctAnswer.toString();
        var userAnswer = model.userAnswer.toString();
        var operands = [];
        if (model.errorColumn != 0) {
            _.each(model.operands, function (num, i) {
                var numStr = num.toString();
                var numArray = [];
                _.each(_.range(numStr.length), function (j) {
                    numArray.push(numStr[numStr.length - 1 - j]);
                });
                operands.push(numArray);
            });
            var colAns = 0;
            _.each(operands, function (operand) {
                colAns = colAns + (Number(operand[model.errorColumn]) || 0);
            });
            if (colAns % 10 == (Number(userAnswer[userAnswer.length - 1 - model.errorColumn]) || 0)) return true;
        }
        return false;
    },
    /**
     * Adding from higher placevalue and go to lower placevalue
     * eg:
     * 53 + 69
     * =>113 - adding from the tens and go to units.
     * @param {Object} model addition evaluation model
     * @returns {boolean} 
     */
    reverseAddition: function (model) {

    },
    /**
     * 
     */
    carryInAnswerBox: function (model) {

    },
    /**
     * 
     */
    additionOfIndividualDigits: function (model) {

    },
    /**
     * 
     */
    joinNumbers: function (model) {

    },


});
