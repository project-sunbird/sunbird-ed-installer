//@ sourceURL= genericmfr-renderer.js
/**
 * This plugin is used to generate word problems.
 * @extends ftPlugin
 * @fires ftFibBasePlugin, ftb
 * @author Henrietta D <henrietta.d@funtoot.com>
 */

org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.genericmfr',
    _isContainer: !0,
    _render: !0,
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item) {
            this._item = item;
        }
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var variables = item.getModelValue("variables");
        var translatedVariables = {};
        var defaultFontSize = this.getFontSize(data.isSolution);
        var model = this._item.getModelValue();
        var langId = this._item.getModelValue().model.langId || "en";
        var nLangId = this._item.getModelValue().model.numericLangId || "en";
        var i18n = PluginManager.getPluginObject('i18n_helper');
        this._langId = langId;
        // process the variables only if non-solution display
        if (!data.isSolution) {
            var i18nData = this._item.getModelValue().i18n;
            if (typeof (i18nData) == 'string')
                i18nData = JSON.parse(this._item.getModelValue().i18n);
            this._item.setModelValue("i18n", i18nData);
        }

        var trans = this._item.getModelValue("i18n")[langId];
        if (!data.isSolution) {
            this.processVariables(variables);
            _.each(_.keys(variables), function (v) {
                if (typeof variables[v] == "number") {
                    translatedVariables[v] = i18n.translateNumber(variables[v], nLangId).displayValue;
                } else {
                    translatedVariables[v] = variables[v];
                }
            });
            model.translatedVariables = translatedVariables;
            this._item.setModelValue("hintMsg", new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue("hintMsg")], model.translatedVariables));
            this._item.setModelValue("fibModels", {});
        }

        this._variables = variables;
        this._translatedVariables = model.translatedVariables;
        var qtext = new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue().question], model.translatedVariables);
        // add space before a blank so that blank comes as a seperate token when split by space
        if (qtext.indexOf("__") > -1)
            qtext = qtext.replace("__", " __");
        //Check if question has more than one blanks
        var qWords = qtext.split(" ").filter(Boolean);
        this._blnks = _.filter(qWords, function (w) {
            return w.indexOf("__") > -1;
        });

        qtext = qtext.split(/\n/g).filter(Boolean);
        if (qtext.length > 2) {
            var firstLine = _.first(qtext);
            var tempQtext = _.rest(qtext);
            tempQtext = tempQtext.join("");
            qtext = [];
            qtext.push(firstLine, tempQtext);
        }
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance,
            //debug: true
        };
        gridData.layout = [];
        /** Build the first row with 1 or 2 columns based on the availability of the question image */
        var qImgKey = this._item.getModelValue().questionImage;
        var questionRow = {};
        var lastStep = {};
        if (!_.isUndefined(qImgKey) && qImgKey != "" && qtext.length == 2) {
            questionRow = {
                type: "row",
                h: 27,
                cols: [{
                        type: "column",
                        id: "qImg",
                        w: 4
                    },
                    {
                        type: "column",
                        id: "questionText",
                        w: 8
                    }
                ]
            };
            gridData.layout.push(questionRow);
            gridData.layout.push({
                type: "gutter",
                h: 6
            });
            lastStep = {
                type: "row",
                h: 12,
                cols: [{
                    type: "column",
                    id: "lastStep",
                    w: 12
                }, ],
            };
            gridData.layout.push(lastStep);
        } else if (!_.isUndefined(qImgKey) && qImgKey != "" && qtext.length == 1) {
            questionRow = {
                type: "row",
                h: 26,
                stretch: "false",
                id: "qImg"
            };
            gridData.layout.push(questionRow);
            gridData.layout.push({
                type: "gutter",
                h: 4
            });
            lastStep = {
                type: "row",
                h: 12,
                cols: [{
                    type: "column",
                    id: "lastStep",
                    w: 12
                }, ],
            };
            gridData.layout.push(lastStep);
        } else {
            questionRow = {
                type: "row",
                h: 10,
                cols: [{
                    type: "column",
                    id: "questionText",
                    w: 12
                }, ]
            };
            gridData.layout.push(questionRow);
        }

        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        var questionTextObj = PluginManager.getPluginObject("questionText");
        var lastStepObj = PluginManager.getPluginObject("lastStep");
        /** Check if the question image exist, invoke plugin manager for image if Yes */
        if (!_.isUndefined(qImgKey) && qImgKey != "") {
            var qImage = PluginManager.getPluginObject("qImg");
            var tileImageObj = {
                h: 100,
                x: 0,
                y: 0,
                asset: qImgKey,
                valign: "middle",
                align: "center"
            };
            if (this._item.getModelValue().flags != undefined && JSON.parse(this._item.getModelValue().flags).isZoomable && !data.isSolution) {
                PluginManager.invoke('org.ekstep.funtoot.zoomableImage', tileImageObj, qImage, instance._stage, instance._theme);
            } else {
                PluginManager.invoke('image', tileImageObj, qImage, instance._stage, instance._theme);
            }
        }
        instance._blanksData = [];
        var bId = 1;
        this._mathtextObjsIds = [];
        for (var q = 0; q < qtext.length; q++) {
            var tokens = qtext[q].split(" ").filter(Boolean);
            var fibs = this._item.getModelValue().model.fibs;
            var blanks = _.filter(tokens, function (t) {
                return t.indexOf("__") > -1;
            });
            var qtextWithAnswer = qtext[q];
            _.each(blanks, function (blank) {
                var blankid = instance.replaceAll(blank, "_", "").replace(".", "");
                _.each(fibs, function (fib) {
                    if (fib.identifier == blankid) {
                        qtextWithAnswer = qtextWithAnswer.replace(blank, "__" + fib.answer + "__");
                        instance._blanksData.push({
                            bId: blankid,
                            responses: fib.responses,
                            answer: fib.answer
                        });
                    }
                });
            })

            var position = (!_.isUndefined(qImgKey) && qImgKey != "") ? (qtext.length > 1 ? (q == 0 ? questionTextObj : lastStepObj) : lastStepObj) : questionTextObj;
            var mathtextObj = {
                "id": _.uniqueId("mathtext-id"),
                "identifier": "mathtext-id" + (q + 1),
                "x": 0,
                "y": 0,
                "w": 100,
                "h": 100,
                "visible": true,
                "content": qtext[q],
                "isSolution": data.isSolution,
                "fontsize": defaultFontSize
            }
            PluginManager.invoke('mathtext', mathtextObj, position, instance._stage, instance._theme);
            this._mathtextObjsIds.push(mathtextObj.identifier);
        }
        //_mqBlankObjs contains all mathquill blanks (mathquill)
        instance._blankObjs = {};
        var options = {
            "instance": instance
        };
        //once question content in rendered replace __1__ with mathquill blank.
        _.each(this._mathtextObjsIds, function (m) {
            var div = document.getElementById(m);
            var fibObjects = new org.ekstep.plugins.funtoot.util.FibProcessor().processBlanks(div, options);
            Object.assign(instance._blankObjs, fibObjects);
        });
        var keyData = {
            id: "keyboardAdapter",
            blanks: instance._blankObjs
        };
        PluginManager.invoke('defaultkeyboardadapter', keyData, this, this._stage, this._theme);
        var keyboardAdapter = PluginManager.getPluginObject("keyboardAdapter");
        for (var b = 0; b < this._blnks.length; b++) {
            var key = "fib" + (b + 1);
            if (!data.isSolution) {
                var expectedAnswer = new org.ekstep.generators().replaceVariables(instance._blanksData[b].answer, variables);
                if (expectedAnswer.indexOf("\\") == -1)
                    expectedAnswer = eval(new org.ekstep.generators().replaceVariables(instance._blanksData[b].answer, variables)).toString();
                var fibData = {
                    e: expectedAnswer.indexOf("\\") == -1 ? i18n.translateNumber(expectedAnswer, nLangId).displayValue : expectedAnswer,
                    u: '',
                    w: true,
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false,
                    bId: (b + 1).toString()
                }
                var fibM = instance._item.getModelValue().model.fibModels;
                fibM[key] = fibData;
            }
            instance._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
            //set the model to the FibBlank obj
            instance._blankObjs[key].setModel(instance._item.getModelValue().model.fibModels[key]);
        }
        keyboardAdapter.registerEvents();
    },
    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object} result
     */
    onSubmit: function (evt, instance) {
        for (var u = 0; u < instance._blnks.length; u++) {
            var k = "fib" + (u + 1);
            instance._item.getModelValue().model.fibModels[k].u = instance._blankObjs[k].getUserValue();
        }
        var model = instance._item.getModelValue();
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        var areMicrohintsEnabled = instance._item._data.selectedConfig && !_.isUndefined(instance._item._data.selectedConfig.areMicrohintsEnabled) ? instance._item._data.selectedConfig.areMicrohintsEnabled : true
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                if (m.w) {
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);
                    m.isCorrect = instance.evaluate(m, instance);

                    if (!m.isCorrect) {
                        result.isSolved = false;
                        if (Array.isArray(m.mmc))
                            result.mmc.push.apply(result.mmc, m.mmc);
                        else
                            result.mmc.push(m.mmc)
                    }

                    instance._blankObjs[k].setState(m.isCorrect, areMicrohintsEnabled);
                }
            });
            return result;
        } else return false;
    },
    /**
     *custom evaluation for number counting plugin
     * populates the micro hint message and mmc depending on the user answer
     * @param {object} model the model associated with the FIB plugin
     * @param {object} instance plugin instance
     * @returns {Boolean} true/false
     */
    evaluate: function (model, instance) {
        var evalResult = this.getEvaluatorAndResult(model, instance);
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var mod = this._item.getModelValue();
        var userValue = model.u.trim();
        var expectedValue = model.e.trim();
        if (model.u.indexOf("\\") == -1 && model.e.indexOf("\\") == -1) {
            //if uservalue and expected value are not in latex form
            userValue = i18n.toNumber(model.u.trim());
            expectedValue = i18n.toNumber(model.e.trim());
        }
        var langId = this._item.getModelValue().model.langId || "en";
        var nLangId = this._item.getModelValue().model.numericLangId || "en";
        var trans = this._item.getModelValue("i18n")[langId];
        var ruleToMmcMhMap = {
            isReducedFraction: {
                mmc: "FC082",
                mh: "REDUCE_FRACTION"
            },
            isImproperFraction: {
                mmc: "FC082",
                mh: "IMPROPER_FRACTION"
            },
            isMixedFraction: {
                mmc: "FC082",
                mh: "MIXED_FRACTION"
            },
            likeFractionAddition_numerator: {
                mmc: "FC090",
                mh: "LIKEFRACTIONADDITION_NUMERATOR"
            },
            likeFractionAddition_denominator: {
                mmc: "FC090",
                mh: "LIKEFRACTIONADDITION_DENOMINATOR"
            },
            likeFractionAddition_full: {
                mmc: "FC090",
                mh: "LIKEFRACTIONADDITION_FULL"
            },
            unlikeFractionAddition_numerator: {
                mmc: "FC091",
                mh: "UNLIKEFRACTIONADDITION_NUMERATOR"
            },
            unlikeFractionAddition_denominator: {
                mmc: "FC091",
                mh: "UNLIKEFRACTIONADDITION_DENOMINATOR"
            },
            unlikeFractionAddition_full: {
                mmc: "FC091",
                mh: "UNLIKEFRACTIONADDITION_FULL"
            },
            likeFractionSubtraction_numerator: {
                mmc: "FC090",
                mh: "LIKEFRACTIONSUBTRACTION_NUMERATOR"
            },
            likeFractionSubtraction_denominator: {
                mmc: "FC090",
                mh: "LIKEFRACTIONSUBTRACTION_DENOMINATOR"
            },
            likeFractionSubtraction_full: {
                mmc: "FC090",
                mh: "LIKEFRACTIONSUBTRACTION_FULL"
            },
            unlikeFractionSubtraction_numerator: {
                mmc: "FC091",
                mh: "UNLIKEFRACTIONSUBTRACTION_NUMERATOR"
            },
            unlikeFractionSubtraction_denominator: {
                mmc: "FC091",
                mh: "UNLIKEFRACTIONSUBTRACTION_DENOMINATOR"
            },
            unlikeFractionSubtraction_full: {
                mmc: "FC091",
                mh: "UNLIKEFRACTIONSUBTRACTION_FULL"
            },
            likeMixedFractionAddition_whole: {
                mmc: "FC090",
                mh: "LIKEMIXEDFRACTIONADDITION_WHOLE"
            },
            likeMixedFractionAddition_numerator: {
                mmc: "FC090",
                mh: "LIKEMIXEDFRACTIONADDITION_NUMERATOR"
            },
            likeMixedFractionAddition_denominator: {
                mmc: "FC090",
                mh: "LIKEMIXEDFRACTIONADDITION_DENOMINATOR"
            },
            likeMixedFractionAddition_full: {
                mmc: "FC090",
                mh: "LIKEMIXEDFRACTIONADDITION_FULL"
            },
            likeMixedFractionSubtraction_whole: {
                mmc: "FC100",
                mh: "LIKEMIXEDFRACTIONSUBTRACTION_WHOLE"
            },
            likeMixedFractionSubtraction_numerator: {
                mmc: "FC100",
                mh: "LIKEMIXEDFRACTIONSUBTRACTION_NUMERATOR"
            },
            likeMixedFractionSubtraction_denominator: {
                mmc: "FC100",
                mh: "LIKEMIXEDFRACTIONSUBTRACTION_DENOMINATOR"
            },
            likeMixedFractionSubtraction_full: {
                mmc: "FC100",
                mh: "LIKEMIXEDFRACTIONSUBTRACTION_FULL"
            },
            wholeAndProperFractionAddition_whole: {
                mmc: "FC090",
                mh: "WHOLEANDPROPERFRACTIONADDITION_WHOLE"
            },
            wholeAndProperFractionAddition_numerator: {
                mmc: "FC090",
                mh: "WHOLEANDPROPERFRACTIONADDITION_NUMERATOR"
            },
            wholeAndProperFractionAddition_denominator: {
                mmc: "FC090",
                mh: "WHOLEANDPROPERFRACTIONADDITION_DENOMINATOR"
            },
            wholeAndProperFractionAddition_full: {
                mmc: "FC090",
                mh: "WHOLEANDPROPERFRACTIONADDITION_FULL"
            },
            wholeAndProperFractionSubtraction_whole: {
                mmc: "FC100",
                mh: "WHOLEANDPROPERFRACTIONSUBTRACTION_WHOLE"
            },
            wholeAndProperFractionSubtraction_numerator: {
                mmc: "FC100",
                mh: "WHOLEANDPROPERFRACTIONSUBTRACTION_NUMERATOR"
            },
            wholeAndProperFractionSubtraction_denominator: {
                mmc: "FC100",
                mh: "WHOLEANDPROPERFRACTIONSUBTRACTION_DENOMINATOR"
            },
            wholeAndProperFractionSubtraction_full: {
                mmc: "FC100",
                mh: "WHOLEANDPROPERFRACTIONSUBTRACTION_FULL"
            },
            wholeAndFractionMultiplication_numerator: {
                mmc: "FC115",
                mh: "WHOLEANDFRACTIONMULTIPLICATION_NUMERATOR"
            },
            wholeAndFractionMultiplication_denominator: {
                mmc: "FC115",
                mh: "WHOLEANDFRACTIONMULTIPLICATION_DENOMINATOR"
            },
            wholeAndFractionMultiplication_full: {
                mmc: "FC115",
                mh: "WHOLEANDFRACTIONMULTIPLICATION_FULL"
            },
            fractionMultiplication_numerator: {
                mmc: "FC110",
                mh: "FRACTIONMULTIPLICATION_NUMERATOR"
            },
            fractionMultiplication_denominator: {
                mmc: "FC110",
                mh: "FRACTIONMULTIPLICATION_DENOMINATOR"
            },
            fractionMultiplication_full: {
                mmc: "FC110",
                mh: "FRACTIONMULTIPLICATION_FULL"
            },
            fractionDivision: {
                mmc: "FC130",
                mh: "FRACTIONDIVISION"
            }
        };
        if (model.u.trim() == '') {
            model['mh'] = new org.ekstep.generators().replaceVariables(trans["NO_ANSWER"], mod.translatedVariables);
            model['mmc'] = 'O1';
            return !1;
        } else if (userValue != expectedValue) {
            var responses = _.find(instance._blanksData, function (b) {
                return b.bId == model.bId;
            });
            var defaultResponse;
            var otherResponses = [];
            _.each(responses.responses, function (response) {
                if (!response.default)
                    otherResponses.push(response)
                else
                    defaultResponse = response;
            });
            var matchedResponse = _.find(otherResponses, function (or) {
                if (or.response[0].indexOf("\\") == -1) {
                    var temp = eval(new org.ekstep.generators().replaceVariables(or.response[0], instance._variables));
                    return userValue == i18n.translateNumber(temp, nLangId)
                } else return userValue == new org.ekstep.generators().replaceVariables(or.response[0], instance._variables);
            });
            if (!_.isUndefined(matchedResponse)) {
                model['mh'] = new org.ekstep.generators().replaceVariables(trans[matchedResponse.mh], mod.translatedVariables);
                model['mmc'] = matchedResponse.mmc;
            } else if (!_.isUndefined(evalResult)) {
                if (evalResult != true) {
                    model['mh'] = this._item.getModelValue().i18n[this._langId][ruleToMmcMhMap[evalResult.id].mh];
                    model['mmc'] = ruleToMmcMhMap[evalResult.id].mmc;
                } else {
                    model['mh'] = null;
                    model['mmc'] = null;
                    return !0;
                }
            } else {
                model['mh'] = new org.ekstep.generators().replaceVariables(trans[defaultResponse.mh], mod.translatedVariables);
                model['mmc'] = defaultResponse.mmc;
            }
            return !1;
        } else {
            model['mh'] = null;
            model['mmc'] = null;
            return !0;
        }

    },
    /**
     * replaces all occurrance of a element in a string
     * @param {string} target search in
     * @param {string} search search for
     * @param {string} replacement replace with
     * @returns {string} replaced string
     */
    replaceAll: function (target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement);
    },
    /**
     * checks if user has answered completely
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (instance) {
        var blkCount = 0;
        var answeredBlkCount = 0;
        var blanks = instance._item.getModelValue().model.fibModels;
        blanks = Object.keys(blanks).map(function (val) {
            return blanks[val]
        });
        _.each(blanks, function (b) {
            if (b.w) {
                blkCount++;
                if (b.u != "")
                    answeredBlkCount++;
            }
        })
        if (answeredBlkCount == blkCount)
            return true;
        else return false;
    },

    getEvaluatorAndResult: function (model, instance) {
        if (!_.isUndefined(this._translatedVariables.$evaluator)) {
            switch (this._translatedVariables.$evaluator.toLowerCase()) {
                case "fraction":
                    return new FractionEval().evaluate(model, this._translatedVariables);
                    break;
                default:
                    return undefined;

            }

        } else
            return undefined;

    }
});