//@ sourceURL=numberlinebase-renderer.js
/* global PluginManager */
/* global NumberLineEval */
/**
 * This plugin is used to generate number line problems
 * @extends ftFibBasePlugin
 * @author Henrietta D <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.numberlinebase',
    _isContainer: !0,
    _render: !0,
    /**
     * initializes the plugin
     * @param {object} data the data for the plugin
     */
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var variables = item.getModelValue("variables");
        var numberFontSize = this.getFontSize(data.isSolution, 2);
        var stepFontSize = this.getFontSize(data.isSolution, 2.7);
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
            //create fib model
            this._item.setModelValue("fibModels", {});
        }
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var operation = item.getModelValue("operation");
        var question = item.getModelValue("question");
        var operationSymbol = (operation == "Addition" ? "+" : (operation == "Subtraction" ? "-" : (operation == "Multiplication" ? "x" : "\u00F7")));
        this._nums = new org.ekstep.generators().getNumberArray(variables.$start, 10, variables.$scale);
        var numericLangId = item.getModelValue("numericLangId");
        this._nums = i18n.translateNumber(this._nums, numericLangId);
        this._operands = variables.$nums;
        this._operands = i18n.translateNumber(this._operands, numericLangId);
        var ops = _.pluck(this._operands, 'displayValue');
        var lhs = ops.join().replace(/,/g, operationSymbol);
        this._ans = i18n.translateNumber(variables.$ans, numericLangId);
        var step = lhs + " = " + this._ans.displayValue;
        var tokens = step.split(" ").filter(Boolean);
        var maskedArray = this.getMask(step);
        var modelArray = [];
        _.each(tokens, function (token, i) {
            modelArray.push({
                //build object which will be consumed by inlineFib in creating the layout
                id: "c" + i,
                content: token.trim(),
                w: maskedArray[i]
            });
        });
        this._item.setModelValue("modelArray", modelArray);
        var numberlineContainerObj = {
            id: "numberlineContainer",
            w: 100,
            h: 70,
            y: 0,
            x: 0,
            align: "center",
            valign: "middle",
            // stroke: "black"
        }
        PluginManager.invoke('g', numberlineContainerObj, contentContainer, this._stage, this._theme);
        var numberlineContainer = PluginManager.getPluginObject(numberlineContainerObj.id);

        var qtext = {
            id: "questionText",
            w: 100,
            h: 20,
            y: 0,
            x: 0,
            align: "center",
            valign: "middle",
            fontsize: this.getFontSize(data.isSolution, 2.5),
            $t: i18n.translate(question),
            //stroke: "black"
        }
        PluginManager.invoke('text', qtext, numberlineContainer, this._stage, this._theme);
        var numberlineScaleContainerObj = {
            id: "numberlineScaleContainer",
            w: 100,
            h: 20,
            y: 50,
            x: 0,
            align: "center",
            valign: "middle",
            //stroke: "black"
        }
        PluginManager.invoke('g', numberlineScaleContainerObj, contentContainer, this._stage, this._theme);
        // var numberlineScaleContainer = PluginManager.getPluginObject(numberlineScaleContainerObj.id);

        var numberlineStepContainer = {
            id: "numberlineStepContainer",
            w: 100,
            h: 20,
            y: 80,
            x: 0,
            align: "center",
            valign: "middle",
            //stroke: "black"
        }
        PluginManager.invoke('g', numberlineStepContainer, contentContainer, this._stage, this._theme);
        var stepContainer = PluginManager.getPluginObject(numberlineStepContainer.id);


        //invoke numberline plugin
        var numberLine = {};
        numberLine.fontSize = numberFontSize;
        numberLine.id = "nLine";
        numberLine.operands = this._operands;
        numberLine.start = variables.$start;
        numberLine.ans = this._ans;
        numberLine.operation = operation;
        numberLine.content = this._nums;
        numberLine.count = this._nums.length;
        numberLine.isSolution = data.isSolution;
        PluginManager.invoke('numberline', numberLine, numberlineContainer, instance._stage, instance._theme);


        //invoke inline fib
        var inlineFib = {};
        inlineFib.id = "inline";
        inlineFib.tokens = modelArray;
        inlineFib.fontSize = stepFontSize;
        inlineFib.align = "center";
        PluginManager.invoke('inlineFib', inlineFib, stepContainer, instance._stage, instance._theme);

        var layout = PluginManager.getPluginObject(inlineFib.id);
        _.each(tokens, function (token, index) {
            var cell = layout.getCell(index);
            var key = "fib" + cell._data.id;
            if (!data.isSolution) {
                var fibData = {
                    e: modelArray[index].content,
                    u: maskedArray[index] ? '' : modelArray[index].content,
                    w: maskedArray[index],
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false,
                }
                var fibM = instance._item.getModelValue().model.fibModels;
                fibM[key] = fibData;
            }
            instance._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
            var fib = {};
            fib.id = key;
            fib.model = "fibModels." + key;
            fib.w = 100;
            fib.x = 0;
            fib.h = 100;
            fib.y = 0;
            fib.options = {
                readonly: {
                    showBgImg: false
                }
            };
            fib.fontsize = stepFontSize;
            PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
        });
    },

    /**
     * custom evaluation for numberline
     * populates the micro hint message and mmc depending on the user answer
     * refer: <https://docs.google.com/document/d/1I7LIGbgAQZCHIX8GfZQj7zYvqhFnegtBcSE53k-Mhk0/edit>
     * @param {object} model associated with the FIB plugin
     * @returns {boolean} boolean value
     */
    evaluate: function (model) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var operation = this._item.getModelValue("operation");
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER");
            model['mmc'] = 'O1';
            return !1;
        } else if (model.u.trim() != model.e.trim()) {
            if (operation == "Addition") {
                model['mh'] = i18n.translate("GENERIC_ADD_FIB");
                model['mmc'] = "C241";
            } else if (operation == "Subtraction") {
                model['mh'] = i18n.translate("GENERIC_SUB_FIB");
                model['mmc'] = "C255";
            } else {
                model['mh'] = i18n.translate("GENERIC_MUL_FIB");
                model['mmc'] = "C269";
            }
            return !1;
        } else {
            model['mh'] = null;
            model['mmc'] = null;
            return !0;
        }
    },

    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} instance the instance of the plugin
     * @returns {object} problem state(correct/ wrong), array of mmcs and reponse values
     */
    onSubmit: function () {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var operation = this._item.getModelValue("operation");
        var nLine = PluginManager.getPluginObject("nLine");
        var userHops = [];
        var instance = this;
        this.clearAllMicroHintsOnNumLine(this._hopDetails);
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        this._hopDetails = nLine.getHopDetails();
        _.each(this._hopDetails, function (h) {
            var textId = _.filter(h.hop._childIds, function (n) {
                return n.includes("numberlinetxt");
            });
            userHops.push(PluginManager.getPluginObject(textId)._self.text);
        });
        if (this.onEvaluate(userHops, instance)) {
            var variables = this._item.getModelValue("variables");
            var expectedHopsArray = this.getExpectedHops();
            var isUserHopsCorrect = false;
            for (var e = 0; e < expectedHopsArray.length; e++) {
                var hopResults = [];
                if (userHops.length == expectedHopsArray[e].length) {
                    for (var h = 0; h < expectedHopsArray[e].length; h++) {
                        hopResults.push({
                            u: userHops[h],
                            e: expectedHopsArray[e][h],
                            result: false
                        });
                        if (userHops[h] == expectedHopsArray[e][h])
                            hopResults[h].result = true;
                    }
                    if (_.every(_.pluck(hopResults, 'result'), function (l) {
                        return l == true;
                    })) {
                        isUserHopsCorrect = true;
                        break;
                    }

                }
            }

            //var result = { isSolved: true, resValues: [], mmc: [] };
            if (!isUserHopsCorrect) {
                result.isSolved = false;
                var mh = "";

                if (instance._hopDetails.length == 0) {
                    mh = i18n.translate("NO_ANSWER");
                    var numberlineScaleContainer = PluginManager.getPluginObject("numberlineScaleContainer");
                    var attachErrorIconTo = numberlineScaleContainer.id;
                    instance.createMicroHint(numberlineScaleContainer, instance, attachErrorIconTo, mh, "01");
                } else {
                    var numLineModel = {
                        userHops: userHops,
                        userHopDetails: instance._hopDetails,
                        operands: this._operands,
                        scale: variables.$scale,
                        start: variables.$start,
                        nums: this._nums,
                        ans: this._ans,
                        operation: operation
                    };
                    var ruleToMmcMhMap = {
                        onlyOperands_Addition: {
                            mmc: "C241",
                            mh: "ONLY_OPERANDS_SMALL_NUM"
                        },
                        directAnswer_Addition: {
                            mmc: "C241",
                            mh: "DIRECT_ANSWER_ADDITION"
                        },
                        oneRandomNumber_Addition: {
                            mmc: "C241",
                            mh: "ONE_RANDOM_NUMBER_ADDITION"
                        },
                        twoRandomNumbers_Addition: {
                            mmc: "C241",
                            mh: "TWO_RANDOM_NUMBER_ADDITION"
                        },
                        oneOfTheOperands_Addition: {
                            mmc: "C241",
                            mh: "ONE_OF_THE_OPERANDS_ADDITION"
                        },
                        subtracted_Addition: {
                            mmc: "C241",
                            mh: "SUBTRACTED"
                        },
                        hopTillAnswer_Addition: {
                            mmc: "C241",
                            mh: "HOP_TILL_ANSWER_ADDITION"
                        },
                        sum_Subtraction: {
                            mmc: "C255",
                            mh: "SUM"
                        },
                        directAnswer_Subtraction: {
                            mmc: "C255",
                            mh: "DIRECT_ANSWER_SUBTRACTION"
                        },
                        oneRandomNumber_Subtraction: {
                            mmc: "C255",
                            mh: "ONE_RANDOM_NUMBER_SUBTRACTION"
                        },
                        twoRandomNumbers_Subtraction: {
                            mmc: "C255",
                            mh: "TWO_RANDOM_NUMBER_SUBTRACTION"
                        },
                        largerOperand_Subtraction: {
                            mmc: "C255",
                            mh: "LARGER_SUBTRAHEND"
                        },
                        smallerOperand_Subtraction: {
                            mmc: "C255",
                            mh: "SMALLER_SUBTRAHEND"
                        },
                        onlyOperands_Subtraction: {
                            mmc: "C255",
                            mh: "ONLY_OPERANDS_SUBTRACTION"
                        },
                        hopTillAnswer_Subtraction: {
                            mmc: "C255",
                            mh: "HOP_TILL_ANSWER_SUBTRACTION"
                        },
                        onlyOperands_Multiplication: {
                            mmc: "C269",
                            mh: "ONLY_OPERANDS_MULTIPLICATION"
                        },
                        directAnswer_Multiplication: {
                            mmc: "C269",
                            mh: "DIRECT_ANSWER_MULTIPLICATION"
                        },
                        oneRandomNumber_Multiplication: {
                            mmc: "C269",
                            mh: "ONE_RANDOM_NUMBER_MULTIPLICATION"
                        },
                        twoRandomNumbers_Multiplication: {
                            mmc: "C269",
                            mh: "TWO_RANDOM_NUMBER_MULTIPLICATION"
                        },
                        largerOperand_Multiplication: {
                            mmc: "C269",
                            mh: "LARGER_MULTIPLICAND"
                        },
                        smallerOperand_Multiplication: {
                            mmc: "C269",
                            mh: "SMALLER_MULTIPLICAND"
                        },
                        sum_Multiplication: {
                            mmc: "C269",
                            mh: "SUM_MULTIPLICATION"
                        },
                        subtracted_Multiplication: {
                            mmc: "C269",
                            mh: "SUBTRACTED_MULTIPLICATION"
                        },
                    };
                    var evalModel = new NumberLineEval().evaluate(numLineModel);
                    if (!_.isUndefined(evalModel) && evalModel != true) {
                        _.each(evalModel.hops, function (h) {
                            var numberContainer = PluginManager.getPluginObject(h.hop.id);
                            var attachErrorTo = numberContainer.id;
                            if (!h.result) {
                                mh = i18n.translate(ruleToMmcMhMap[evalModel.id].mh);
                                var mmc = ruleToMmcMhMap[evalModel.id].mmc;
                                result.mmc.push(mmc);
                                instance.createMicroHint(numberContainer, instance, attachErrorTo, mh, mmc);
                            }
                        });
                    } else {
                        var errorContainer = PluginManager.getPluginObject(instance._hopDetails[0].hop.id);
                        var attachTo = errorContainer.id;
                        var mmc = "";
                        if (Number(variables.$scale) > 1 && Number(variables.$start) == 0) {
                            if (operation == "Addition") {
                                mh = i18n.translate("GENERIC_ADD_SCALE_MORE_THAN_1");
                                mmc = "C241";
                            } else if (operation == "Subtraction") {
                                mh = i18n.translate("GENERIC_SUB_SCALE_MORE_THAN_1");
                                mmc = "C255";
                            } else {
                                mh = i18n.translate("GENERIC_MUL_SCALE_MORE_THAN_1");
                                mmc = "C269";
                            }
                        } else if (Number(variables.$scale) > 1 && Number(variables.$start) != 0) {
                            if (operation == "Addition") {
                                mh = i18n.translate("GENERIC_ADD_SCALE_MORE_THAN_1_AND_START_NOT_0");
                                mmc = "C241";
                            } else if (operation == "Subtraction") {
                                mh = i18n.translate("GENERIC_SUB_SCALE_MORE_THAN_1_AND_START_NOT_0");
                                mmc = "C255";
                            } else {
                                mh = i18n.translate("GENERIC_MUL_SCALE_MORE_THAN_1_AND_START_NOT_0");
                                mmc = "C269";
                            }
                        } else {
                            if (operation == "Addition") {
                                mh = i18n.translate("GENERIC_ADD_NUMBERLINE");
                                mmc = "C241";
                            } else if (operation == "Subtraction") {
                                mh = i18n.translate("GENERIC_SUB_NUMBERLINE");
                                mmc = "C255";
                            } else {
                                mh = i18n.translate("GENERIC_MUL_NUMBERLINE");
                                mmc = "C269";
                            }
                        }
                        result.mmc.push(mmc);
                        instance.createMicroHint(errorContainer, instance, attachTo, mh, mmc);
                    }
                }
            }
            var model = instance._item.getModelValue();
            // for each fib model call evaluate
            _.each(model.model.fibModels, function (m, k) {
                if (m.w) {
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);
                    m.isCorrect = instance.evaluate(m);
                    if (!m.isCorrect) {
                        result.mmc.push(m.mmc);
                        result.isSolved = false;
                    }
                    var fibObject = PluginManager.getPluginObject(k);
                    fibObject.onEvaluate();
                }
            });
            return result;
        } else return false
    },
    /**
     * returns an array of boolean values. Each of the boolean flags denote whether the
     * FIB in the cell is editable or not.
     * @param {string} number number
     * @returns {array} boolean array
     */
    getMask: function (number) {
        var tokens = number.split(" ").filter(Boolean);
        var mask = new Array(tokens.length).fill(!1); //initially fill array with false
        //mask rhs of the expression
        mask[tokens.length - 1] = !0;
        return mask;
    },
    /**
     * If any microhints are visible on the number then hide them
     * @param {array} hopDetails array of objects
     */
    clearAllMicroHintsOnNumLine: function (hopDetails) {
        _.each(hopDetails, function (h) {
            var tbcobj = PluginManager.getPluginObject(h.hop.id + '-mh-mhicon');
            if (!_.isUndefined(tbcobj)) {
                tbcobj._self.visible = false;
                tbcobj._data.visible = false;
                Renderer.update = !0;
            }
        });
        var numberlineScaleContainer = PluginManager.getPluginObject("numberlineScaleContainer" + '-mh-mhicon');
        if (!_.isUndefined(numberlineScaleContainer)) {
            numberlineScaleContainer._self.visible = false;
            numberlineScaleContainer._data.visible = false;
            Renderer.update = !0;
        }
    },
    /**
     *creates microhint on a provided container and makes it visible and also attach error message to it
     *@param {object} numberContainer container on which numberline is drawn
     *@param {object} instance this is the instance
     *@param {id} attachTo id to which microhint should be attached
     *@param {string} mh micro hint message
     */
    createMicroHint: function (numberContainer, instance, attachTo, mh, mmc) {
        numberContainer.onMicroHint = function () {
            //var model = this.itemCtrl.getModelValue(this._data.model);
            var mhData = {};
            mhData.title = 'Micro hint';
            mhData.type = "mh";
            mhData.containerId = '_ft_microhint_content_container__';
            mhData.x = 10;
            mhData.y = 10;
            mhData.w = 80;
            mhData.h = 60;
            mhData.content = mh;
            mhData.mmc = mmc;
            return mhData;
        }
        var microhint = Object.create(null);
        microhint.id = attachTo + '-mh';
        microhint.attachTo = attachTo;
        microhint.mhPos = 'top-left';
        microhint.visible = true;
        PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);


        var tbcobj = PluginManager.getPluginObject(attachTo + '-mh-mhicon');
        tbcobj._self.visible = true;
        tbcobj._data.visible = true;
        Renderer.update = !0;
    },
    /**
     * Computes all possible answers on the numberline
     * @returns {array} array of possible correct answers
     */
    getExpectedHops: function () {
        var inst = this;
        var variables = this._item.getModelValue("variables");
        var operation = this._item.getModelValue("operation");
        var expectedHopsArray = [];
        var expectedHops = [];

        if (operation == "Addition") {
            for (var p = 0; p < 4; p++) {
                if (variables.$start == "0")
                    expectedHops.push(this._nums[0].displayValue);
                //hop from operand to direct answer
                if (p == 0 || p == 1)
                    expectedHops.push(this._operands[p].displayValue, this._ans.displayValue);
                else { // multiple hops to reach answer from one of the operands
                    var i = p == 2 ? this._operands[0].numericalValue : this._operands[1].numericalValue;
                    var isNumOnNumberLine = _.filter(this._nums, function (n) {
                        return n.numericalValue == i
                    });
                    if (isNumOnNumberLine.length > 0) {
                        expectedHops.push(p == 2 ? this._operands[0].displayValue : this._operands[1].displayValue);
                        var previousHop = p == 2 ? this._operands[0].numericalValue : this._operands[1].numericalValue;
                        while (i < this._ans.numericalValue) {
                            var numericNum = previousHop + Number(variables.$scale);
                            var displayNumArray = _.filter(this._nums, function (n) {
                                if (n.numericalValue == numericNum)
                                    return n.displayValue;
                            });
                            expectedHops.push(displayNumArray[0].displayValue);
                            i = i + Number(variables.$scale);
                            previousHop = numericNum;
                        }
                    }
                }
                if (expectedHops.length > 0)
                    expectedHopsArray.push(expectedHops);
                expectedHops = [];
            }
        } else if (operation == "Subtraction") {
            for (p = 0; p < 2; p++) {
                if (variables.$start == "0")
                    expectedHops.push(this._nums[0].displayValue);
                //hop from operand to direct answer
                if (p == 0)
                    expectedHops.push(this._operands[p].displayValue, this._ans.displayValue);
                else { // multiple hops to reach answer from one of the operands
                    i = this._operands[0].numericalValue;
                    isNumOnNumberLine = _.filter(this._nums, function (n) {
                        return n.numericalValue == i
                    });
                    if (isNumOnNumberLine.length > 0) {
                        expectedHops.push(this._operands[0].displayValue);
                        previousHop = this._operands[0].numericalValue;
                        while (i > this._ans.numericalValue) {
                            numericNum = previousHop - Number(variables.$scale);
                            displayNumArray = _.filter(this._nums, function (n) {
                                if (n.numericalValue == numericNum)
                                    return n.displayValue;
                            });
                            expectedHops.push(displayNumArray[0].displayValue);
                            i = i - Number(variables.$scale);
                            previousHop = numericNum;
                        }
                    }
                }
                if (expectedHops.length > 0)
                    expectedHopsArray.push(expectedHops);
                expectedHops = [];
            }
        } else if (operation == "Multiplication") {
            var hops = [];
            for (p = 0; p < 3; p++) {
                if (variables.$start == "0")
                    expectedHops.push(this._nums[0].displayValue);
                //hop from operand to direct answer
                if (p == 0 || p == 1)
                    expectedHops.push(this._operands[p].displayValue, this._ans.displayValue);
                else {
                    for (i = 1; i <= this._operands[1].numericalValue; i++) {
                        hops.push(this._operands[0].numericalValue * i);
                    }
                    _.each(hops, function (hop) {
                        var num = _.filter(inst._nums, function (n) {
                            if (n.numericalValue == hop)
                                return n.displayValue;
                        });
                        expectedHops.push(num[0].displayValue);
                    });
                }
                if (expectedHops.length > 0)
                    expectedHopsArray.push(expectedHops);
                expectedHops = [];
            }

        }

        return expectedHopsArray;
    },
    /**
     * checks if user has answered completely
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (userhops, instance) {
        var blkCount = 0;
        var answeredBlkCount = 0;
        var blanks = instance._item.getModelValue().model.fibModels;

        _.each(blanks, function (b) {
            if (b.w) {
                blkCount++;
                if (b.u != "")
                    answeredBlkCount++;
            }
        })

        if (userhops.length > 0 & (blkCount == answeredBlkCount))
            return true
        else return false
    }
});