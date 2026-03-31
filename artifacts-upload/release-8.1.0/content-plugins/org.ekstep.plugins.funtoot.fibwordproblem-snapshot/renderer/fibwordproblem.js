//@ sourceURL= fibwordproblem-renderer.js
// Renderer plugin can't be tested as of now
// Please move the logic to other classes and test them independently
// Let the plugin class delegate functionality to these classes
/**
 * This plugin is used to generate word problems.
 * @extends ftPlugin
 * @fires ftFibBasePlugin, ftb
 * @author Swathi <swathi.jayaprakash@funtoot.com>
 */

org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.fibwordproblem',
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
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var langId = item.getModelValue("langId");
        var langobj = item.getModelValue("i18n")[langId];
        var variables = item.getModelValue("variables");
        var defaultFontSize = this.getFontSize(data.isSolution);

        var numericLangId = item.getModelValue("numericLangId"); // var numericLangId = 'mr';

        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
            var hintMsg = langobj[this._item.getModelValue("hintMsg")] == null ? this._item.setModelValue("hintMsg", "") : new org.ekstep.generators().replaceVariables(langobj[this._item.getModelValue("hintMsg")], numericLangId != 'en' ? tran_variables : variables);
            this._item.setModelValue("hintMsg", hintMsg);
            this._item.setModelValue("fibModels", {});

            var finalStep = this._item.getModelValue("model").steps[0];
            _.each(finalStep.responses, function (fr, index) {
                if (fr.response != null) {
                    var res = eval(new org.ekstep.generators().replaceVariables(fr.response[0], variables));
                }
                if (res != "" && !_.isUndefined(res)) {
                    finalStep.responses[index].response[0] = instance.getTranNum(res, 1);
                }
            });
            this._item.setModelValue("finalStep", finalStep);
        }

        //numerals translation
        if (numericLangId != 'en') {
            var tran_variables = {};
            for (var k in variables) {
                tran_variables[k] = typeof (variables[k]) == "number" ? i18n.translateNumber(variables[k], numericLangId).displayValue : variables[k];
            }
        }
        this._item.setModelValue("variables", variables);
        this._item.setModelValue("tran_variables", tran_variables);

        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance
            // debug: true
        };
        gridData.layout = [];
        /** Build the first row with 1 or 2 columns based on the availability of the question image */
        var qImgKey = this._item.getModelValue().questionImage;
        var questionRow;
        if (qImgKey != "" && qImgKey != undefined) {
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
        } else {
            questionRow = {
                type: "row",
                h: 25,
                cols: [{
                    type: "column",
                    id: "questionText",
                    w: 12
                }]
            };
            gridData.layout.push(questionRow);
        }

        gridData.layout.push({
            type: "gutter",
            h: 6
        });
        var ansColObjAry = [];
        var model = this._item.getModelValue().model;

        var unitItem = langobj[model.steps[0].unit];


        var unitItemPlacement;
        if (unitItem != "" && unitItem != undefined) {
            unitItemPlacement = model.steps[0].unitPlacement;
            unitItemPlacement == "pre" ?
                ansColObjAry.push({
                    type: "column",
                    id: "txtVal",
                    w: unitItem != undefined && unitItem.length >= 2 ? 6 : 7
                }, {
                        type: "column",
                        id: "eqTxt",
                        w: 1
                    }, {
                        type: "column",
                        id: "unit",
                        w: 1
                    }, {
                        type: "column",
                        id: "ansEntered",
                        w: 3
                    }) :
                ansColObjAry.push({
                    type: "column",
                    id: "txtVal",
                    w: unitItem != undefined && unitItem.length >= 2 ? 6 : 7
                }, {
                        type: "column",
                        id: "eqTxt",
                        w: 1
                    }, {
                        type: "column",
                        id: "ansEntered",
                        w: 3
                    }, {
                        type: "column",
                        id: "unit",
                        w: 1
                    });
        } else {
            ansColObjAry.push({
                type: "column",
                id: "txtVal",
                w: unitItem != undefined && unitItem.length >= 2 ? 7 : 8
            }, {
                    type: "column",
                    id: "eqTxt",
                    w: 1
                }, {
                    type: "column",
                    id: "ansEntered",
                    w: 3
                });
        }
        var ansRow = {
            type: "row",
            h: 8,
            cols: ansColObjAry,
            id: "answerRow"
        };
        gridData.layout.push(ansRow);
        //  gridData.debug = true;
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        //  var grid = PluginManager.getPluginObject(gridData.id);

        /** Check if the question image exist, invoke plugin manager for image if Yes */
        if (qImgKey != "" && qImgKey != undefined) {
            var qImage = PluginManager.getPluginObject("qImg");
            var tileImageObj = {
                w: 100,
                x: 0,
                y: 0,
                asset: qImgKey //this._item.questionImage
            };
            if (this._item.getModelValue().flags != undefined && JSON.parse(this._item.getModelValue().flags).isZoomable && !data.isSolution) {
                PluginManager.invoke('org.ekstep.funtoot.zoomableImage', tileImageObj, qImage, this._stage, this._theme);
            } else {
                PluginManager.invoke('image', tileImageObj, qImage, this._stage, this._theme);
            }
        }

        /** Invoke plugin manager for the question text field */
        var questionTextObj = PluginManager.getPluginObject("questionText");
        var questionObj = {
            id: this._ftTitleTextId,
            identifier: _.uniqueId("mathtext-q"),
            align: "left",
            fontsize: defaultFontSize,
            "isSolution": data.isSolution,
            content: new org.ekstep.generators().replaceVariables(langobj[this._item.getModelValue().question], numericLangId != 'en' ? tran_variables : variables),
            x: 0,
            y: 0,
            w: 100,
            h: 100
        };
        PluginManager.invoke('mathtext', questionObj, questionTextObj, this._stage, this._theme);

        /** Invoke plugin manager for the answer text val field */
        var ansTextObj = PluginManager.getPluginObject("txtVal");
        var ansTxtValObj = {
            id: 'ansTxtVal',
            identifier: _.uniqueId('mathtext-step'),
            align: "right",
            valign: "middle",
            // color: "#4c4c4c",
            fontsize: defaultFontSize,
            "isSolution": data.isSolution,
            content: new org.ekstep.generators().replaceVariables(langobj[model.steps[0].text], numericLangId != 'en' ? tran_variables : variables),
            x: 0,
            y: 0,
            w: 100,
            h: 100
        };
        PluginManager.invoke('mathtext', ansTxtValObj, ansTextObj, this._stage, this._theme);


        /** Invoke plugin manager for the equal (=) sign field */
        var ansEqTextObj = PluginManager.getPluginObject("eqTxt");
        var ansEqTxtValObj = {
            id: 'eqTxtSign',
            align: "center",
            valign: "middle",
            color: "#4c4c4c",
            fontsize: defaultFontSize,
            $t: "=",

            x: 0,
            y: 0,
            w: 100,
            h: 100
        };
        PluginManager.invoke('text', ansEqTxtValObj, ansEqTextObj, this._stage, this._theme);


        /** Invoke plugin manager for the unit field of second row */
        if (unitItem != undefined && unitItem != "") {
            var unitTextObj = PluginManager.getPluginObject("unit");
            var unitObj = {
                "id": _.uniqueId("mathtext-id"),
                "identifier": "mathtext-id" + (1 + 1),
                align: unitItemPlacement == "pre" ? "right" : "left",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                content: unitItem != undefined ? unitItem : '',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                "isSolution": data.isSolution,
            };
            PluginManager.invoke('mathtext', unitObj, unitTextObj, this._stage, this._theme);
        }

        /** Invoke FIB model and plugin manager for the answer field */
        var ansFIB = PluginManager.getPluginObject("ansEntered");
        var key = "fib" + ansFIB._data.id;

        if (!data.isSolution) {
            var evalExpVal = this.getTranNum(eval(new org.ekstep.generators().replaceVariables(model.steps[0].answer, variables)), 1);
            var fibData = {
                e: evalExpVal,
                u: '',
                w: true,
                isSolution: data.isSolution,
                isEvaluated: false,
                isCorrect: false
            }
            var fibM = this._item.getModelValue("fibModels");
            fibM[key] = fibData;
        }
        this._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
        var fib = Object.create(data);
        fib.id = key;
        fib.model = "fibModels." + key;
        fib.w = 100;
        fib.x = 0;
        fib.h = 100;
        fib.y = 0;
        //  fib.valign = "middle";
        fib.fontsize = defaultFontSize;
        fib.state = "deselected";
        PluginManager.invoke('ftFib', fib, ansFIB, this._stage, this._theme);
    },

    /**
     * handles number translation
     * @param {object} num the number
     * @returns {object} the result
     * @param {object} isTran 1 for i18n.translateNumber method and 0 for i18n.toNumber method
     */
    getTranNum: function (num, isTran) {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var numericLangId = this._item.getModelValue("numericLangId");
        var resNum;
        if (num.toString().indexOf(".") != -1) {
            var splitedVal = num.toString().split(".");
            resNum = isTran ? (i18n.translateNumber(splitedVal[0], numericLangId).displayValue) + '.' + (i18n.translateNumber(splitedVal[1], numericLangId).displayValue) :
                (i18n.toNumber(splitedVal[0], numericLangId)) + '.' + (i18n.toNumber(splitedVal[1], numericLangId));
        } else {
            resNum = isTran ? i18n.translateNumber(num, numericLangId).displayValue : i18n.toNumber(num, numericLangId);
        }
        return resNum;
    },
    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @returns {object} the result
     * @param {object} instance the instance of the plugin
     */
    onSubmit: function (evt, instance) {
        var model = instance._stage._stageController.getModelValue();
        var fibModelData = model.model.fibModels.fibansEntered;
        var langId = model.model.langId;
        var langobj = model.i18n[langId];
        var variables = instance._item.getModelValue("variables");
        var numericLangId = instance._item.getModelValue("numericLangId");
        var tran_variables = instance._item.getModelValue("tran_variables");
        var result = {
            isSolved: false,
            resValues: [],
            mmc: []
        };
        model = instance._item.getModelValue().model;
        var finalStep = model.finalStep;
        var expectedValue = fibModelData.e;
        var userValue = fibModelData.u;
        if (this.onEvaluate(instance)) {
            if (userValue == '') {
                fibModelData['mh'] = langobj["NO_ANSWER"]; //'Please answer'
                fibModelData['mmc'] = 'O1';
                fibModelData.isCorrect = false;
                result.isSolved = false;
                result.mmc.push(fibModelData.mmc);
            } else if (expectedValue == userValue) {
                result.isSolved = true;
                fibModelData.isCorrect = true;
            } else if (finalStep.responses.length > 0) {
                // var respValFlag = false;
                var nonDefaultResponses = _.filter(finalStep.responses, function (r) {
                    return !r.default || r.default == undefined;
                });
                var respMatched = false;
                var matchedResponse = undefined;
                if (nonDefaultResponses != undefined) {
                    matchedResponse = _.find(nonDefaultResponses, function (r) {
                        var mr = _.find(r.response, function (resp) {
                            return resp == userValue;
                        });
                        return !_.isUndefined(mr);
                    });
                    if (matchedResponse) {
                        respMatched = true;
                        fibModelData["mh"] = langobj[matchedResponse.mh] == null ? "" : new org.ekstep.generators().replaceVariables(langobj[matchedResponse.mh], numericLangId != 'en' ? tran_variables : variables);
                        fibModelData["mmc"] = matchedResponse.mmc;
                    }
                }
                if (!respMatched) {
                    var defaultResponse = _.find(finalStep.responses, function (r) {
                        return r.default == true;
                    });
                    fibModelData["mh"] = langobj[defaultResponse.mh] == null ? "" : new org.ekstep.generators().replaceVariables(langobj[defaultResponse.mh], numericLangId != 'en' ? tran_variables : variables);
                    fibModelData["mmc"] = defaultResponse.mmc;
                }
                fibModelData.isCorrect = false;
                result.isSolved = false;
                if (Array.isArray(fibModelData.mmc))
                    result.mmc.push.apply(result.mmc, fibModelData.mmc)
                else
                    result.mmc.push(fibModelData.mmc);
            } else {
                // console.error("There are no responses for this step! Question is buggy!!");
            }
            result.resValues.push({ 'userValue': userValue });
            fibModelData.isEvaluated = true;
            var fibObject = PluginManager.getPluginObject("fibansEntered");
            fibObject.onEvaluate();
            return result;
        } else return false
    },

    /**
     * checks if user has given any input
     * @param {object} instance current instance
     */
    onEvaluate: function (instance) {
        var model = instance._stage._stageController.getModelValue();
        var fibModelData = model.model.fibModels.fibansEntered;
        if (fibModelData.u.toString().length == 0) {
            return false
        } else return true
    }
});