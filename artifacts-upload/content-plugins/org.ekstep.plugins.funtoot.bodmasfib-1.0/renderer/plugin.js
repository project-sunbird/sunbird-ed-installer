//@ sourceURL=bodmasfib-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate vertical subtraction problems
 * @extends ftFibBasePlugin
 * @fires table, grid
 * @author Henrietta (henrietta.d@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.bodmasfib',
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
        var rows = 1;
        var cols = 1;
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
            //create fib model
            this._item.setModelValue("fibModels", {});
        }
        // get the number
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var toMask = item.getModelValue("mask");
        var nums = variables.$nums;
        var qTitleFontSize = this.getFontSize(data.isSolution);
        var defaultFontSize = variables.$nums.length < 3 ? this.getFontSize(data.isSolution, 5.0) : this.getFontSize(data.isSolution, 4.0);
        var numericLangId = item.getModelValue("numericLangId");
        var step = variables.$display + " = " + variables.$ans;
        var tokens = step.split(" ").filter(e => String(e).trim());
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
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var grid = PluginManager.getPluginObject(gridData.id);
        var question = instance._item.getModelValue("questionText");
        var questionRow = grid.getCell(0, 0);
        var questionObj = {
            id: "question-id",
            align: "center",
            valign: "middle",
            color: "#4c4c4c",
            fontsize: qTitleFontSize,
            $t: i18n.translate(question),
            x: 0,
            y: 0,
            w: 100,
            h: 100
        };
        PluginManager.invoke('text', questionObj, questionRow, instance._stage, instance._theme);
        var inlineFib = {};
        inlineFib.id = "inline";
        inlineFib.tokens = modelArray;
        inlineFib.fontSize = defaultFontSize;
        inlineFib.align = "center";
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
    },
    /**
     * returns an array of boolean values. Each of the boolean flags denote whether the
     * FIB in the cell is editable or not.
     * @param {string} number in expanded form
     * @param {string} toMask specifies which position to mask
     * @param {boolean} isStandardForm if expected answer is in standard form
     * @returns {array} boolean array
     */
    getMask: function (number) {
        var tokens = number.split(" ").filter(e => String(e).trim());
        var mask = new Array(tokens.length).fill(!1); //initially fill array with false
        //  if (!missingAddends) {
        //if answer is expected in standard form mask rhs of the expression
        mask[tokens.length - 1] = !0;
        return mask;
        //  }
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
        var variables = this._item.getModelValue("variables");
        var missingAddends = Boolean(this._item.getModelValue("missingAddends"));
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
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
     * custom evaluation for bodmas fib
     * populates the micro hint message and mmc depending on the user answer
     * @param {object} the model associated with the FIB plugin
     * @returns {boolean}
     */
    evaluate: function (model) {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (model.e == Number(model.u)) {
            return !0;
        } else {
            model['mh'] = i18n.translate("MH"), model['mmc'] = 'BD001';
            return !1;
        }
    },
    /**
     * checks if user has given any input
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (instance) {
        var blanks = instance._item.getModelValue().model.fibModels;
        return Object.values(blanks).some(function (blank) {
            return blank.u != "" & blank.w == true
        })
    }
});