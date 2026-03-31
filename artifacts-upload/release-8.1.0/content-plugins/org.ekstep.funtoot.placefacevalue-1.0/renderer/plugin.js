//@ sourceURL=placefacevalue-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate place value and face value problems
 * @extends ftFibBasePlugin
 * @author Henrietta D <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.placefacevalue',
    _numbers: [],
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
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var rows = 2;
        var cols = "";
        var variables = this._item.getModelValue("variables");
        var numericLangId = this._item.getModelValue("numericLangId");
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        if (!data.isSolution) {
            this.processVariables(variables);
        }

        var qid = this._item.getModelValue().identifier;
        var subject = this._item.getModelValue("subject");
        var qlevel = this._item.getModelValue("qlevel");
        var defaultFontSize = this.getFontSize(data.isSolution);
        //place value or facevalue
        var givenNumber = variables.$num;
        var givenDigit = variables.$digit;
        var expectedAnswer = "";
        var placeOrFaceValue = this._item.getModelValue("placeOrFaceValue");
        var evaluator = this._item.getModelValue("evaluator");
        if (evaluator == "placeValueFaceValueEvaluator") {
            //Either place value or face value
            if (placeOrFaceValue == "faceValue")
                expectedAnswer = i18n.translateNumber(givenDigit, numericLangId).displayValue;
            else {
                var numGen = new org.ekstep.generators().placeValue(givenNumber, givenDigit);
                expectedAnswer = i18n.translateNumber(numGen, numericLangId).displayValue;
            }
        } else // if asked for face value
            expectedAnswer = i18n.translateNumber(variables.$ans, numericLangId).displayValue;

        // height of content container is 53 units, we have 2 rows
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
        gridData.layout.push({
            type: "gutter",
            h: 7
        });
        for (var r = 0; r < rows; r++) {
            cols = r == 0 ? 1 : 2
            colsPerCell = r == 0 ? colsPerCell : 6;
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
            if (r != rows - 1)
                gridData.layout.push({
                    type: "gutter",
                    h: 5
                });
        }
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var grid = PluginManager.getPluginObject(gridData.id);

        if (!data.isSolution) {
            //create fib model
            this._item.setModelValue("fibModels", {});
        }
        // now that the grid got created, lets add the assets
        i18n.onReady().then(function (o) {
            var numericLangId = instance._item.getModelValue("numericLangId");
            //Add question stem
            var question = o.translate(instance._item.getModelValue("question"), {
                digit: variables.$digit,
                num: o.translateNumber(variables.$num, numericLangId).displayValue
            });
            var questionRow = grid.getCell(0, 0);
            var questionObj = {
                id: instance._ftTitleTextId,
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
            //Add lhs part of step
            var stepData = instance._item.getModelValue("step");
            var step = o.translate(stepData.trim(), {
                digit: variables.$digit,
                num: o.translateNumber(variables.$num, numericLangId).displayValue
            });
            var lhs = grid.getCell(1, 0);
            var stepObj = {
                id: "step1",
                align: "right",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                $t: step,
                x: 0,
                y: 0,
                w: 100,
                h: 100
            };
            PluginManager.invoke('text', stepObj, lhs, instance._stage, instance._theme);
            // Add rhs (blank)
            var cell = grid.getCell(1, 1);
            var key = "fib" + cell._data.id;
            if (!data.isSolution) {
                var fibData = {
                    e: expectedAnswer,
                    u: '',
                    w: true,
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false
                }
                var fibM = instance._item.getModelValue().model.fibModels;
                fibM[key] = fibData;
            }
            instance._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
            var fib = Object.create(data);
            fib.id = key;
            fib.model = "fibModels." + key;
            //width of the blank should be small  when face value is asked
            fib.w = (evaluator == "placeValueFaceValueEvaluator" && placeOrFaceValue != "faceValue") ? 50 : 20;
            fib.x = 0;
            fib.h = 100;
            fib.y = (100 - fib.h) / 2;
            fib.fontsize = defaultFontSize;
            fib.state = "deselected";
            PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);

        }).catch(function (error) {
            console.error(error);
        });
    },

    /**
     * custom evaluation for place value and face value plugin
     * populates the micro hint message and mmc depending on the user answer
     * refer: <Config spec URL>
     * @param {object} the model associated with the FIB plugin
     * @returns {boolean}
     * eg: find the place value of 2 in the numeral 1423
     * This evaluator is used when digit and the numeral are specified.
     */
    placeValueFaceValueEvaluator: function (model) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var placeOrFaceValue = this._item.getModelValue("placeOrFaceValue");
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (model.u != model.e) {
            if (placeOrFaceValue == "placeValue") {
                model['mmc'] = 'C501';
                model['mh'] = i18n.translate("WRONG_PLACE_VALUE");
            } else if (placeOrFaceValue == "faceValue") {
                model['mmc'] = 'C508';
                model['mh'] = i18n.translate("WRONG_FACE_VALUE");
            }
            return !1;
        } else {
            model['mh'] = null;
            model['mmc'] = null;
            return !0;
        }
    },
    /**
     * custom evaluation for face value
     * populates the micro hint message and mmc depending on the user answer
     * refer: <Config spec URL>
     * @param {object} the model associated with the FIB plugin
     * @returns {boolean}
     * eg: Find the face value of the digit in the ten thousands place in the numeral  68654
     * This evaluator is used when only numeral is sepcified.
     */
    faceValueEvaluator: function (model) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (model.u != model.e) {
            model['mmc'] = 'C508';
            model['mh'] = i18n.translate("WRONG_FACE_VALUE");
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
        var evaluator = this._item.getModelValue("evaluator");
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                if (m.w) {
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);
                    m.isCorrect = evaluator == "placeValueFaceValueEvaluator" ? instance.placeValueFaceValueEvaluator(m) : instance.faceValueEvaluator(m);
                    if (!m.isCorrect) {
                        result.isSolved = false;
                        result.mmc.push(m.mmc);
                    }
                    var fibObject = PluginManager.getPluginObject(k);
                    fibObject.onEvaluate();
                }
            });
            return result;
        } else return false
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