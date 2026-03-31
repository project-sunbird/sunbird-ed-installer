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
        this.evalStrategy(data);
    },
    /**
     * model :{
     * operands :[],
     * isHorizontal :"",
     * carry:{
     *      userCarry:[],
     *      expectedCarry:[]
     * },
     * borrow:{
     *      userborrow:[],
     *      expectedborrow:[]
     * },
     * expectedAnswer:"",
     * userAnswer:"",
     * operator:""
     * }
     */

    ruleSet: function (model) {
        isSingleDigitSameNumber: this.isSingleDigitSameNumber(model);

        isSingleDigitDefault: this.isSingleDigitDefault(model);

        isMultiplesOfHundreds: this.isMultiplesOfHundreds(model);

        isReverseCarry: this.isReverseCarry(model);

        isCarryMissing: this.isCarryMissing(model);

        isReverseAddition: this.isReverseAddition(model);

        isCarryInAnswerBox: this.isCarryInAnswerBox(model);

        isSumOfIndividualDigits: this.isSumOfIndividualDigits(model);

        joinNumbers: this.joinNumbers(model);

    },
    evalStrategy: function (data) {
        var singleDigit = "";// true/false
        var operandsMultipleof100s = "";//true/false
        var lengthOfOperands = "";//
        var evalRuleSet = "";
        if (singleDigit)
            evalRuleSet = [isReverseCarry, isCarryMissing, isSingleDigitDefault, isSingleDigitSameNumber];
        else if (operandsMultipleof100s)
            evalRuleSet = [isMultiplesOfHundreds];
        else
            evalRuleSet = [isReverseCarry, isCarryMissing, isReverseAddition, isCarryInAnswerBox, isSumOfIndividualDigits, joinNumbers]

    },
    isSingleDigitDefault: function (model) {

    },
    isSingleDigitSameNumber: function (model) {

    },
    /**
     * If the addends are multiples of 100s
     * @param {Object} model addition evaluation model
     * @returns {boolean}
     */
    isMultiplesOfHundreds: function (model) {

    },
    /**
     * Carry is reversed - units digit of the sum is considered as carry digit
     * eg:23 + 59 
     * =>91 (23 + 59 = 82)
     * @param {Object} model addition evaluation model
     * @returns {boolean} 
     */
    isReverseCarry: function (model) {

    },
    /**
     * Carry is missed - carry digit is not considered in addition
     * eg: 53 + 69 
     * => 112 (left the carryover at the tens place.)
     * @param {Object} model addition evaluation model
     * @returns {boolean}
     */
    isCarryMissing: function (model) {

    },
    /**
     * Adding from higher placevalue and go to lower placevalue
     * eg:
     * 53 + 69
     * =>113 - adding from the tens and go to units.
     * @param {Object} model addition evaluation model
     * @returns {boolean} 
     */
    isReverseAddition: function (model) {

    },
    /**
     * 
     */
    isCarryInAnswerBox: function (model) {

    },
    /**
     * 
     */
    isSumOfIndividualDigits: function (model) {

    },
    /**
     * 
     */
    joinNumbers: function (model) {

    }

});
