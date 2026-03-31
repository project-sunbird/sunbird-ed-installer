//@ sourceURL=stdexp-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate Standard and expanded form problems
 * @extends ftFibBasePlugin
 * @fires inlineFib, grid
 * @author Henrietta (henrietta.d@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.stdexp',
    _isContainer: !0,
    _render: !0,
    _txtObjs: [],
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
        // unique options to be given for the first 10 numbers.

        var variables = item.getModelValue("variables");
        var rows = 1;
        var cols = 1;
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
            //create fib model
            this._item.setModelValue("fibModels", {});
        }
        // get the number
        //var number = generator.expandNumber(723456789); //variables.$n;
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var toMask = item.getModelValue("mask");
        var pvInNumberNames = Boolean(item.getModelValue("pvInNumberNames"));
        var isStandardForm = item.getModelValue("isStandardForm");
        var numericLangId = item.getModelValue("numericLangId");
        var defaultFontSize = this.getFontSize(data.isSolution, 3.0);
        var numberSystem = item.getModelValue("numberSystem");
        var number = isStandardForm ? variables.$ans : variables.$n1;
        var isFrac = item.getModelValue("isFrac");
        var expandedForm = new org.ekstep.generators().expandNumber(number, isFrac, pvInNumberNames, numberSystem, numericLangId);
        number = i18n.translateNumber(number, numericLangId);
        var step = number.displayValue + " = " + expandedForm;
        if (isStandardForm)
            step = expandedForm + " = " + number.displayValue;
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);

        if (isFrac == 1) {
            // invoke grid
            var gridData = {
                id: _.uniqueId('grid'),
                w: 100,
                h: 100,
                x: 0,
                y: 0,
                cbObj: instance,
                // debug: true
            };
            gridData.layout = [];
            gridData.layout.push({
                type: "gutter",
                h: 7
            });
            var stdexpandedFormRow = {
                type: "row",
                h: 16,
                cols: [{
                    type: "column",
                    id: "expandedForm",
                    w: 12
                }]
            };
            gridData.layout.push(stdexpandedFormRow);
            gridData.layout.push({
                type: "gutter",
                h: 10
            });
            var ansRow = {
                type: "row",
                h: 16,
                cols: [{
                    type: "column",
                    id: "emptycell",
                    w: 5
                },
                {
                    type: "column",
                    id: "ansEntered",
                    w: 7
                }
                ]
            };
            gridData.layout.push(ansRow);
            PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

            var expFormTextObj = PluginManager.getPluginObject("expandedForm");
            var mathtextObj = {
                "id": _.uniqueId("mathtext-id"),
                "identifier": "mathtext-id",
                "x": 0,
                "y": 0,
                "w": 100,
                "h": 100,
                "visible": true,
                "content": expandedForm + "=",
                "isSolution": data.isSolution,
                "fontsize": defaultFontSize,
                "valign": "middle",
            }
            PluginManager.invoke('mathtext', mathtextObj, expFormTextObj, this._stage, this._theme);


            /** Invoke plugin manager for the equal (=) sign field */
            /*   var ansEqTextObj = PluginManager.getPluginObject("equalsign");
               var ansEqTxtValObj = {
                   id: 'eqTxtSign',
                   align: "center",
                   valign: "middle",
                   color: "#4c4c4c",
                   fontsize: defaultFontSize,
                   $t: "=",
                   x: 0, y: 0, w: 100, h: 100
               };
               PluginManager.invoke('text', ansEqTxtValObj, ansEqTextObj, this._stage, this._theme); */

            var ansTextObj = PluginManager.getPluginObject("ansEntered");
            var key = "fib" + ansTextObj._data.id;
            if (!data.isSolution) {
                var fibData = {
                    e: number.displayValue,
                    u: '',
                    w: true,
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false
                }
                var fibM = this._item.getModelValue().model.fibModels;
                fibM[key] = fibData;
            }
            this._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
            var fib = {};
            fib.id = key;
            fib.model = "fibModels." + key;
            fib.w = 80;
            fib.x = 0;
            fib.h = 50;
            fib.y = 0;
            fib.align = 'center';
            fib.valign = 'middle';
            fib.options = {
                readonly: {
                    showBgImg: false
                }
            };
            fib.fontsize = defaultFontSize;
            PluginManager.invoke('ftFib', fib, ansTextObj, this._stage, this._theme);
        } else {
            var tokens = step.split(" ").filter(e => String(e).trim());
            var maskedArray = this.getMask(step, toMask, isStandardForm);
            var modelArray = [];
            _.each(tokens, function (token, i) {
                modelArray.push({
                    //build object which will be consumed by inlineFib in creating the layout
                    id: "c" + i,
                    content: token.trim(),
                    w: maskedArray[i]
                });
            });

            // height of content container is 53 units
            var rowHeight = 6; // in units
            var colsPerCell = 12; // in number of columns
            // invoke grid
            var gridData = {
                id: _.uniqueId('grid'),
                w: 100,
                h: 100,
                x: 0,
                y: 0,
                cbObj: instance //, debug: true
            };

            gridData.layout = [];
            //Added ygutter in the begining to middle align the content.
            for (var r = 0; r < rows; r++) {
                if (r == 1) {
                    gridData.layout.push({
                        type: "gutter",
                        h: 7
                    });
                } else {
                    var newRow = {
                        id: 'r' + r,
                        type: "row",
                        h: rowHeight,
                        cols: []
                    };
                    for (var c = 0; c < cols; c++) {
                        newRow.cols.push({
                            id: newRow.id + 'c' + c,
                            type: "column",
                            w: colsPerCell
                        });
                    }
                    gridData.layout.push(newRow);
                }
            }
            PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
            var grid = PluginManager.getPluginObject(gridData.id);
            i18n.onReady().then(function (o) {
                var question = o.translate(instance._item.getModelValue("question"), {});
                var questionRow = grid.getCell(0, 0);
                var questionObj = {
                    id: "question-id",
                    align: "center",
                    valign: "middle",
                    color: "#4c4c4c",
                    fontsize: defaultFontSize,
                    $t: question,
                    x: 0,
                    y: 0,
                    w: 100,
                    h: 100
                };
                PluginManager.invoke('text', questionObj, questionRow, instance._stage, instance._theme);
            });

            var inlineFib = {};
            inlineFib.id = "inline";
            inlineFib.tokens = modelArray;
            PluginManager.invoke('inlineFib', inlineFib, contentContainer, instance._stage, instance._theme);

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
                        isCorrect: false
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
                fib.fontsize = defaultFontSize;
                PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
            });
        }
    },
    /**
     * custom evaluation for face value
     * populates the micro hint message and mmc depending on the user answer
     * refer: <Config spec URL>
     * @param {object} the model associated with the FIB plugin
     * @returns {boolean}
     */
    evaluate: function (model) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var isStandardForm = this._item.getModelValue("isStandardForm");
        var variables = this._item.getModelValue("variables");
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (model.u.trim() != model.e.trim()) {
            var isFraction = this._item.getModelValue().model.isFrac;
            if (!isStandardForm) {
                //If answer expected is in expanded form
                if (isFraction == 0) {
                    var evalDec = this.checkInvalidDecimal(model.e.trim(), model.u.trim());
                    if (!_.isEmpty(evalDec)) {
                        model['mh'] = evalDec.mh;
                        model['mmc'] = evalDec.mmc;
                    } else {
                        model['mh'] = i18n.translate("WRONG_EXPANDED_FORM_DEC");
                        model['mmc'] = 'DE134';
                    }
                } else {
                    model['mh'] = i18n.translate("WRONG_EXPANDED_FORM");
                    if (Number(variables.$n1) < 100)
                        model['mmc'] = 'C498';
                    else if (Number(variables.$n1) > 99 && Number(variables.$n1) < 1000)
                        model['mmc'] = 'C502';
                    else
                        model['mmc'] = 'C506';
                }
            } else {
                //If the answer expected is in standard form
                if (isFraction == 0) {
                    var evalDec = this.checkInvalidDecimal(model.e.trim(), model.u.trim());
                    if (!_.isEmpty(evalDec)) {
                        model['mh'] = evalDec.mh;
                        model['mmc'] = evalDec.mmc;
                    } else {
                        model['mh'] = i18n.translate("WRONG_STD_FORM_DEC");
                        model['mmc'] = 'DE134';
                    }
                } else {
                    model['mh'] = i18n.translate("WRONG_STD_FORM");
                    if (Number(variables.$ans) < 100)
                        model['mmc'] = 'C231';
                    else if (Number(variables.$ans) > 99 && Number(variables.$ans) < 1000)
                        model['mmc'] = 'C232';
                    else
                        model['mmc'] = 'C234';
                }
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
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object} problem state(correct/ wrong), array of mmcs and reponse values
     */
    onSubmit: function (evt, instance) {
        var model = instance._item.getModelValue();
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            if (model.model.isFrac == 1) {
                var i18n = PluginManager.getPluginObject('i18n_helper');
                var fibModelData = model.model.fibModels["fibansEntered"];
                if (fibModelData.u.trim() == fibModelData.e.trim()) {
                    result.isSolved = true;
                    fibModelData.isCorrect = true;
                } else {
                    var evalDec = this.checkInvalidDecimal(fibModelData.e.trim(), fibModelData.u.trim());
                    if (!_.isEmpty(evalDec)) {
                        fibModelData['mh'] = evalDec.mh;
                        fibModelData['mmc'] = evalDec.mmc;
                    } else {
                        fibModelData['mh'] = i18n.translate("WRONG_STD_FORM_FRAC");
                        fibModelData['mmc'] = "DE134";
                    }
                    result.isSolved = false;
                    fibModelData.isCorrect = false;
                }
                var fibObject = PluginManager.getPluginObject("fibansEntered");
                fibObject.onEvaluate();
            } else {
                var evaluator = this._item.getModelValue("evaluator");
                _.each(model.model.fibModels, function (m, k) {
                    if (m.w) {
                        var res = {};
                        res[k] = m.u;
                        result.resValues.push(res);
                        m.isCorrect = instance.evaluate(m);
                        if (!m.isCorrect) {
                            result.isSolved = false;
                            if (Array.isArray(m.mmc))
                                result.mmc.push.apply(result.mmc, m.mmc);
                            else
                                result.mmc.push(m.mmc)
                        }

                        var fibObject = PluginManager.getPluginObject(k);
                        fibObject.onEvaluate();
                    }
                });
            }
            return result;
        } else return false
    },

    checkInvalidDecimal: function (expectedVal, userEnteredVal) {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var expPos = expectedVal.indexOf('.');
        var userPos = userEnteredVal.trim().indexOf('.');
        var userVal = userEnteredVal.trim().replace('.', '');
        var expVal = expectedVal.replace('.', '');
        var model = {};
        if (userVal == expVal && expPos != -1 && userPos == -1) {
            model['mh'] = i18n.translate("DECIMAL_NOT_FOUND");
            model['mmc'] = ['DE159', 'DE169'];
        } else if (userVal == expVal && expPos != -1 && userPos != expPos) {
            model['mh'] = i18n.translate("WRONG_DECIMAL_POS");
            model['mmc'] = ['DE159', 'DE169'];
        }
        return model;
    },
    /**
     * returns an array of boolean values. Each of the boolean flags denote whether the
     * FIB in the cell is editable or not.
     * @param {string} number in expanded form
     * @param {string} toMask specifies which position to mask
     * @param {boolean} isStandardForm if expected answer is in standard form
     * @returns {array} boolean array
     */
    getMask: function (number, toMask, isStandardForm) {
        var tokens = number.split(" ").filter(e => String(e).trim());
        var mask = new Array(tokens.length).fill(!1);
        if (isStandardForm) {
            //if answer is expected in standard form mask rhs of the expression
            mask[tokens.length - 1] = !0;
            return mask;
        } else {
            var lhsrhs = number.split("=");
            var stepsToken = lhsrhs[1].split("+");
            if (toMask == "random") {
                //to be masked randomly
                mask = [false, false];
                _.each(stepsToken, function (token, index) {
                    var array = _.shuffle([true, false]);
                    if (index == stepsToken.length) // if its last digit do not include "+"
                        mask.push(array[0], false, array[1]);
                    else
                        mask.push(array[0], false, array[1], false);
                });
                return mask;
            } else {
                //mask either pv/fv
                var initialIndex = toMask == "fv" ? 2 : 4;
                //if pv is in number names multiplier should 3 else 4
                var multiplier = Boolean(this._item.getModelValue("pvInNumberNames")) ? 3 : 4;
                for (var j = 0; j < stepsToken.length; j++) {
                    var index = initialIndex + j * multiplier;
                    mask[index] = !0;
                }
                return mask;
            }
        }
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
        _.each(blanks, function (b) {
            if (b.w) {
                blkCount++;
                if (b.u != "")
                    answeredBlkCount++;
            }
        })
        if (answeredBlkCount == blkCount)
            return true
        else return false
    }
});