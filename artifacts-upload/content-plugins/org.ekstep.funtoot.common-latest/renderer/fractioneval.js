//@ sourceURL=fractioneval.js
/**
 * Reusable fraction evaluator
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
/**
 * Constructs the FractionEval object
 * @constructor
 */
function FractionEval() {
}

FractionEval.prototype.evaluate = function (model, variables) {
    //check if user answers are correct
    var correctAns = true;
    if (FractionEval.prototype.isCorrect(model, variables))
        return true;
    else
        correctAns = false;
    var strategy = FractionEval.prototype.getEvalStrategy(model, variables);
    var resultArray = [];
    for (i = 0; i < strategy.length; i++) {
        var result = eval(FractionEval.prototype.ruleSet[strategy[i]])(model, variables);
        resultArray.push(result);
        if (result != true)
            return result;
    }
    return (!correctAns && resultArray.reduce(function (a, b) { return (a === b) ? a : false; })) ? undefined : true;
}

FractionEval.prototype.isCorrect = function (model, variables) {
    if (model.u == model.e)
        return true;
    else {
        //parse latex and get numbers in array format
        var userAnsInArray = FractionEval.prototype.parseFraction(model.u.toString());
        var fracTypeArray = !_.isUndefined(variables.$fractionType) ? variables.$fractionType : [];
        _.each(fracTypeArray, function (n, i) {
            fracTypeArray[i] = n.toLowerCase();
        });
        var isUserAnsMixedFrac = userAnsInArray.length > 2 ? true : false;
        var ExpectedAnsInReducedForm = FractionEval.prototype.getReducedFrac(model.e);
        var ExpectedAnsInMixedForm = FractionEval.prototype.getMixedFrac(model.e);
        var ExpectedAnsInImproperForm = FractionEval.prototype.getImproperFrac(model.e);
        var isCorrectInAnyform = true;
        var isReducedOrNotReducedForm = true;
        if (!_.isUndefined(variables.$fractionType) && fracTypeArray.length > 0) {
            if (_.indexOf(fracTypeArray, "mixed") > -1 && ExpectedAnsInMixedForm == model.u) {
                return true
            }
            else if (_.indexOf(fracTypeArray, "improper") > -1 && ExpectedAnsInImproperForm == model.u) {
                return true
            }
            else if (_.indexOf(fracTypeArray, "any") > -1 && (ExpectedAnsInImproperForm == model.u || ExpectedAnsInMixedForm == model.u)) {
                return true
            }
            else
                isCorrectInAnyform = false;
        }
        else { // if $fractionType is not specified accept  answer in any form (improper/mixed)
            if (ExpectedAnsInMixedForm == model.u || ExpectedAnsInImproperForm == model.u)
                return true;
            else
                isCorrectInAnyform = false;
        }
        if (!_.isUndefined(variables.$fractionIsReduced) && (variables.$fractionIsReduced.toLowerCase() == "true")) {
            if (ExpectedAnsInReducedForm == model.u)
                return true;
            else
                isReducedOrNotReducedForm = false;
        }
        else {// if $fractionIsReduced is not specified accept all equivalent fraction
            if (ExpectedAnsInReducedForm == FractionEval.prototype.getReducedFrac(model.u))
                return true;
        }
        if (!isCorrectInAnyform || !isReducedOrNotReducedForm)
            return false;
    }
}

/**
 * @todo use pipeline pattern instead of this.
 */
FractionEval.prototype.ruleSet = {
    isReducedFraction: "FractionEval.prototype.isReducedFraction",
    isImproperFraction: "FractionEval.prototype.isImproperFraction",
    isMixedFraction: "FractionEval.prototype.isMixedFraction",
    wholeAndProperFractionAddition: "FractionEval.prototype.wholeAndProperFractionAddition",
    mixedFractionAddition: "FractionEval.prototype.likeMixedFractionAddition",
    likeFractionAddition: "FractionEval.prototype.likeFractionAddition",
    unlikeFractionAddition: "FractionEval.prototype.unlikeFractionAddition",
    wholeAndProperFractionSubtraction: "FractionEval.prototype.wholeAndProperFractionSubtraction",
    mixedFractionSubtraction: "FractionEval.prototype.likeMixedFractionSubtraction",
    likeFractionSubtraction: "FractionEval.prototype.likeFractionSubtraction",
    unlikeFractionSubtraction: "FractionEval.prototype.unlikeFractionSubtraction",
    wholeAndFractionMultiplication: "FractionEval.prototype.wholeAndFractionMultiplication",
    fractionMultiplication: "FractionEval.prototype.fractionMultiplication",
    fractionDivision: "FractionEval.prototype.fractionDivision"
}

FractionEval.prototype.getEvalStrategy = function (model, variables) {
    var evalRuleSet = [];
    var fracTypeArray = !_.isUndefined(variables.$fractionType) ? variables.$fractionType : [];
    _.each(fracTypeArray, function (n, i) {
        fracTypeArray[i] = n.toLowerCase();
    });
    if (!_.isUndefined(variables.$fractionIsReduced) && (variables.$fractionIsReduced.toLowerCase() == "true"))
        evalRuleSet.push("isReducedFraction");
    if (!_.isUndefined(variables.$fractionType) && variables.$fractionType.length > 0) {
        if (_.indexOf(fracTypeArray, "mixed") > -1 && _.indexOf(fracTypeArray, "improper") < 0)
            evalRuleSet.push("isImproperFraction");
        if (_.indexOf(fracTypeArray, "improper") > -1 && _.indexOf(fracTypeArray, "mixed") < 0)
            evalRuleSet.push("isMixedFraction")
    }
    if (!_.isUndefined(variables.$evalOp) && variables.$evalOp.toLowerCase() == "add")
        evalRuleSet.push("wholeAndProperFractionAddition", "mixedFractionAddition", "likeFractionAddition", "unlikeFractionAddition");
    if (!_.isUndefined(variables.$evalOp) && variables.$evalOp.toLowerCase() == "sub")
        evalRuleSet.push("wholeAndProperFractionSubtraction", "mixedFractionSubtraction", "likeFractionSubtraction", "unlikeFractionSubtraction");
    if (!_.isUndefined(variables.$evalOp) && variables.$evalOp.toLowerCase() == "mul")
        evalRuleSet.push("wholeAndFractionMultiplication", "fractionMultiplication");
    if (!_.isUndefined(variables.$evalOp) && variables.$evalOp.toLowerCase() == "div")
        evalRuleSet.push("fractionDivision");
    return evalRuleSet;
}
FractionEval.prototype.getReducedFrac = function (latex) {
    var fracAsArray = FractionEval.prototype.parseFraction(latex.toString());
    if (fracAsArray.length == 2) {
        var reducedFractionObj = math.fraction(fracAsArray[0], fracAsArray[1]);
        if (reducedFractionObj.d != 1)
            return "\\frac{" + reducedFractionObj.n + "}{" + reducedFractionObj.d + "}";
        else
            return reducedFractionObj.n;
    }
    else
        return latex;

}
FractionEval.prototype.getMixedFrac = function (latex) {
    var fracAsArray = FractionEval.prototype.parseFraction(latex.toString());
    if (fracAsArray.length == 2) {
        var fractionObj = math.fraction(fracAsArray[0], fracAsArray[1]);
        if (fractionObj.n > fractionObj.d) {
            var wholeNum = Math.floor(fractionObj.n / fractionObj.d);
            var numerator = fractionObj.n % fractionObj.d;
            return wholeNum + "\\frac{" + numerator + "}{" + fractionObj.d + "}";

        }
        else
            return latex;
    }
    else
        return latex;

}
FractionEval.prototype.getImproperFrac = function (latex) {
    var fracAsArray = FractionEval.prototype.parseFraction(latex.toString());
    //if mixed fraction
    if (fracAsArray.length == 3) {
        return "\\frac{" + (Number(fracAsArray[0] * fracAsArray[2]) + Number(fracAsArray[1])) + "}{" + fracAsArray[2] + "}"
    }
    else
        return latex;

}
FractionEval.prototype.parseFraction = function (latex) {
    return latex.replace("\\frac{", ",").replace("}{", ",").replace("}", ",").split(",").filter(Boolean);
}
FractionEval.prototype.isReducedFraction = function (model, variables) {
    var userAnsInReducedForm = FractionEval.prototype.getReducedFrac(model.u);
    var ExpectedAnsInReducedForm = FractionEval.prototype.getReducedFrac(model.e);
    if (userAnsInReducedForm == ExpectedAnsInReducedForm) {
        var rule = {
            id: "isReducedFraction"
        }
        return rule;
    }
    else
        return true;
}
FractionEval.prototype.isMixedFraction = function (model, variables) {
    var userAnsInMixedForm = FractionEval.prototype.getMixedFrac(model.u);
    var ExpectedAnsInMixedForm = FractionEval.prototype.getMixedFrac(model.e);
    if (userAnsInMixedForm == ExpectedAnsInMixedForm) {
        var rule = {
            id: "isMixedFraction"
        }
        return rule;
    }
    else
        return true;
}
FractionEval.prototype.isImproperFraction = function (model, variables) {
    var userAnsInImproperForm = FractionEval.prototype.getImproperFrac(model.u);
    var ExpectedAnsInImproperForm = FractionEval.prototype.getImproperFrac(model.e);
    if (userAnsInImproperForm == ExpectedAnsInImproperForm) {
        var rule = {
            id: "isImproperFraction"
        }
        return rule;
    }
    else
        return true;
}
FractionEval.prototype.wholeAndProperFractionAddition = function (model, variables) {
    var rule = true;
    var result = FractionEval.prototype.wholeAndProperFracEval(model, variables);
    if (result != true) {
        var obj = {
            w: "wholeAndProperFractionAddition_whole",
            n: "wholeAndProperFractionAddition_numerator",
            d: "wholeAndProperFractionAddition_denominator",
            full: "wholeAndProperFractionAddition_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.likeMixedFractionAddition = function (model, variables) {
    var result = FractionEval.prototype.likeUnlikeMixedFracEval(model, variables);
    var rule = true;
    if (result != true && result.type == 'like') {
        var obj = {
            w: "likeMixedFractionAddition_whole",
            n: "likeMixedFractionAddition_numerator",
            d: "likeMixedFractionAddition_denominator",
            full: "likeMixedFractionAddition_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.likeFractionAddition = function (model, variables) {
    var result = FractionEval.prototype.likeUnlikeFracEval(model, variables);
    var rule = true;
    if (result != true && result.type == 'like') {
        var obj = {
            n: "likeFractionAddition_numerator",
            d: "likeFractionAddition_denominator",
            full: "likeFractionAddition_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.unlikeFractionAddition = function (model, variables) {
    var result = FractionEval.prototype.likeUnlikeFracEval(model, variables);
    var rule = true;
    if (result != true && result.type == 'unlike') {
        var obj = {
            n: "unlikeFractionAddition_numerator",
            d: "unlikeFractionAddition_denominator",
            full: "unlikeFractionAddition_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.wholeAndProperFractionSubtraction = function (model, variables) {
    var rule = true;
    var result = FractionEval.prototype.wholeAndProperFracEval(model, variables);
    if (result != true) {
        var obj = {
            w: "wholeAndProperFractionSubtraction_whole",
            n: "wholeAndProperFractionSubtraction_numerator",
            d: "wholeAndProperFractionSubtraction_denominator",
            full: "wholeAndProperFractionSubtraction_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.likeMixedFractionSubtraction = function (model, variables) {
    var result = FractionEval.prototype.likeUnlikeMixedFracEval(model, variables);
    var rule = true;
    if (result != true && result.type == 'like') {
        var obj = {
            w: "likeMixedFractionSubtraction_whole",
            n: "likeMixedFractionSubtraction_numerator",
            d: "likeMixedFractionSubtraction_denominator",
            full: "likeMixedFractionSubtraction_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.likeFractionSubtraction = function (model, variables) {
    var result = FractionEval.prototype.likeUnlikeFracEval(model, variables);
    var rule = true;
    if (result != true && result.type == 'like') {
        var obj = {
            n: "likeFractionSubtraction_numerator",
            d: "likeFractionSubtraction_denominator",
            full: "likeFractionSubtraction_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.unlikeFractionSubtraction = function (model, variables) {
    var result = FractionEval.prototype.likeUnlikeFracEval(model, variables);
    var rule = true;
    if (result != true && result.type == 'unlike') {
        var obj = {
            n: "unlikeFractionSubtraction_numerator",
            d: "unlikeFractionSubtraction_denominator",
            full: "unlikeFractionSubtraction_full"
        }
        rule = { id: obj[result.id] };
    }
    return rule;
}
FractionEval.prototype.wholeAndFractionMultiplication = function (model, variables) {
    var iswholeNum = false;
    var isFrac = false;
    var wholeNum;
    var frac;
    var conditionMet = true;
    var rule = true;
    _.each(variables.$nums, function (op) {
        var array = FractionEval.prototype.parseFraction(op.toString());
        if (array.length == 1) {
            wholeNum = op; iswholeNum = true;
        }
        else if (array.length == 2) {
            isFrac = true; frac = op;
        }
        else
            conditionMet = false;
    });
    if (conditionMet && iswholeNum && isFrac) {
        var uAnswerArray = FractionEval.prototype.parseFraction(model.u.toString());
        var eAnswerArray = FractionEval.prototype.parseFraction(model.e.toString());
        if (uAnswerArray.length == 2 && eAnswerArray.length == 2 && uAnswerArray[0] != eAnswerArray[0] && uAnswerArray[1] == eAnswerArray[1])
            rule = { id: "n" }
        else if (uAnswerArray.length == 2 && eAnswerArray.length == 2 && uAnswerArray[0] == eAnswerArray[0] && uAnswerArray[1] != eAnswerArray[1])
            rule = { id: "d" }
        else
            rule = { id: "full" }
        if (rule != true) {
            var obj = {
                n: "wholeAndFractionMultiplication_numerator",
                d: "wholeAndFractionMultiplication_denominator",
                full: "wholeAndFractionMultiplication_full"
            }
            rule = { id: obj[rule.id] };
        }
    }
    return rule;
}
FractionEval.prototype.fractionMultiplication = function (model, variables) {
    var areFractions = []
    _.each(variables.$nums, function (op) {
        var array = FractionEval.prototype.parseFraction(op.toString());
        if (array.length == 2)
            areFractions.push(true);
        else
            return true
    });
    var areAllOperandsFractions;
    if (areFractions.length > 0)
        areAllOperandsFractions = areFractions.reduce(function (a, b) { return (a === b) ? a : "No"; })
    areAllOperandsFractions = areAllOperandsFractions != "No" ? true : false;
    var rule = true;
    if (areAllOperandsFractions) {
        var result = FractionEval.prototype.getFracMhmodel(model);
        if (result != true) {
            var obj = {
                n: "fractionMultiplication_numerator",
                d: "fractionMultiplication_denominator",
                full: "fractionMultiplication_full"
            }
            rule = { id: obj[result.id] };
        }
    }
    return rule;
}
FractionEval.prototype.fractionDivision = function (model, variables) {
    return rule = { id: "fractionDivision" }
}
FractionEval.prototype.likeUnlikeFracEval = function (model, variables) {
    var denominators = [];
    _.each(variables.$nums, function (op) {
        var array = FractionEval.prototype.parseFraction(op.toString());
        if (array.length == 2)
            denominators.push(array[1]);
        else
            denominators.push(false);
    });
    // check if denominators of all fractions are same
    if (denominators.indexOf(false) < 0) {
        var areAllLikeFractions = denominators.reduce(function (a, b) { return (a === b) ? a : "No"; });
        var type = areAllLikeFractions != "No" ? 'like' : 'unlike';
        /*var uAnswerArray = FractionEval.prototype.parseFraction(model.u.toString());
        var eAnswerArray = FractionEval.prototype.parseFraction(model.e.toString());
        var rule = true;
        if (uAnswerArray.length > 1 && uAnswerArray[0] != eAnswerArray[0] && uAnswerArray[1] == eAnswerArray[1])
            rule = { id: "n", type: type }
        else if (uAnswerArray.length > 1 && uAnswerArray[1] != eAnswerArray[1] && uAnswerArray[0] == eAnswerArray[0])
            rule = { id: "d", type: type }
        else
            rule = { id: "full", type: type }*/
        return FractionEval.prototype.getFracMhmodel(model, type);
    }
    else return true;
}
FractionEval.prototype.likeUnlikeMixedFracEval = function (model, variables) {
    var denominators = [];
    _.each(variables.$nums, function (op) {
        var array = FractionEval.prototype.parseFraction(op.toString());
        if (array.length == 3)
            denominators.push(array[2]);
        else
            denominators.push(false);
    });
    // check if denominators of all fractions are same
    if (denominators.indexOf(false) < 0) {
        var areAllLikeFractions = denominators.reduce(function (a, b) { return (a === b) ? a : "No"; });
        var type = areAllLikeFractions != "No" ? 'like' : 'unlike';
        return FractionEval.prototype.getMixedFracMhmodel(model, type);
    }
    else return true;
}
FractionEval.prototype.wholeAndProperFracEval = function (model, variables) {
    var iswholeNum = false;
    var isproperFrac = false;
    var wholeNum;
    var properFrac;
    var conditionMet = true;
    _.each(variables.$nums, function (op) {
        var array = FractionEval.prototype.parseFraction(op.toString());
        if (array.length == 1) {
            wholeNum = op;
            iswholeNum = true;
        }
        else if (array.length == 2) {
            if (array[0] < array[1]) {
                properFrac = op;
                isproperFrac = true;
            }
        }
        else
            conditionMet = false;
    });
    if (conditionMet && iswholeNum && isproperFrac)
        return result = FractionEval.prototype.getMixedFracMhmodel(model);
    return true;
}
FractionEval.prototype.getMixedFracMhmodel = function (model, type) {
    var uAnswerArray = FractionEval.prototype.parseFraction(model.u.toString());
    var eAnswerArray = FractionEval.prototype.parseFraction(model.e.toString());
    var rule = true;
    if (uAnswerArray.length > 1 && uAnswerArray[0] != eAnswerArray[0] && uAnswerArray[1] == eAnswerArray[1] && uAnswerArray[2] == eAnswerArray[2])
        rule = { id: "w", type: type }
    else if (uAnswerArray.length > 1 && uAnswerArray[0] == eAnswerArray[0] && uAnswerArray[1] != eAnswerArray[1] && uAnswerArray[2] == eAnswerArray[2])
        rule = { id: "n", type: type }
    else if (uAnswerArray.length > 1 && uAnswerArray[0] == eAnswerArray[0] && uAnswerArray[1] == eAnswerArray[1] && uAnswerArray[2] != eAnswerArray[2])
        rule = { id: "d", type: type }
    else
        rule = { id: "full", type: type }
    return rule;
}
FractionEval.prototype.getFracMhmodel = function (model, type) {
    var uAnswerArray = FractionEval.prototype.parseFraction(model.u.toString());
    var eAnswerArray = FractionEval.prototype.parseFraction(model.e.toString());
    var rule = true;
    if (uAnswerArray.length > 1 && uAnswerArray[0] != eAnswerArray[0] && uAnswerArray[1] == eAnswerArray[1])
        rule = { id: "n", type: type }
    else if (uAnswerArray.length > 1 && uAnswerArray[1] != eAnswerArray[1] && uAnswerArray[0] == eAnswerArray[0])
        rule = { id: "d", type: type }
    else
        rule = { id: "full", type: type }
    return rule;
}