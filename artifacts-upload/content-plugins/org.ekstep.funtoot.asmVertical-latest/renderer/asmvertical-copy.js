//@ sourceURL=asmVertical.js
/* global PluginManager */
/**
 * This plugin is used to generate asm vertical problems 
 * @extends ftFibBasePlugin
 * @fires mtfOptionBuilder, grid
 * @author Amulya (amulya.k@funtoot.com)
 */
PluginManager.customPluginMap["ftFibBasePlugin"].extend({
    _type: 'org.ekstep.funtoot.asmVertical',
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var helper = PluginManager.getPluginObject('plugin_helper');
        var generator = PluginManager.getPluginObject("generators");
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var model = item.getModelValue();
        var variables = item.getModelValue("variables");
        // process the variables only if non-solution display
        if (!data.isSolution) {
            generator.processVariables(variables);
            item.setModelValue("fibModels", {});
        }
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var nums = i18n.translateNumber(variables.$nums, item.getModelValue("numericLangId"));
        var answer = 0;
        _.each(nums, function (num) {
            answer = answer + num.numericalValue;
        });
        console.log("answer-" + answer);
        var ansArray = []
        var ansStr = answer.toString();
        _.each(_.range(ansStr.length), function (i) {
            ansArray.push(ansStr[0]);
        });
        var ans = i18n.translateNumber(ansArray, item.getModelValue("numericLangId"));
        item.setModelValue("ans", ans);
        var rowHeight = 7; // in units
        var rows = variables.$nums.length + 3;
        var cols = model.model.digits + 3;
        var colWidth = 14; // in units
        var gridColumns = (cols * colWidth + 4) / 11.0;
        var offset = (128 - cols * colWidth + 4) / 22.0;
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100, h: 100, x: 0, y: 0,
            cbObj: instance,
            // debug: true
        };
        gridData.layout = [];
        var questionRow = {
            type: "row", h: 6, cols: [], id: "questionText"
        }
        gridData.layout.push(questionRow);
        gridData.layout.push({ type: "gutter", h: 4 });
        var table = {
            type: "row", h: rows * rowHeight, cols: [{ type: "offset", w: offset }, { id: "tableCell", type: "column", w: gridColumns }]
        };
        gridData.layout.push(table);
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.common.grid', gridData, contentContainer, this._stage, this._theme);
        var tableCell = PluginManager.getPluginObject("tableCell");
        var tableData = {
            id: _.uniqueId('table'),
            w: 100, h: 100, x: 0, y: 0,
            cbObj: instance,
            debug: true,
            colCb: this.onColCreated
        };
        tableData.layout = [];
        var pvRow = {
            type: "row", h: rowHeight, cols: [], id: "pvRow", w: cols * colWidth
        };
        for (i = 0; i < (cols - (model.model.digits + 1)); i++) { pvRow.cols.push({ type: "column", w: colWidth }); }
        for (j = model.model.digits; j >= 0; j--) pvRow.cols.push({ type: "column", w: colWidth, id: "pv" + j })
        tableData.layout.push(pvRow);
        var carryRow = {
            type: "row", h: rowHeight, cols: [], id: "carryRow", w: cols * colWidth
        };
        for (i = 0; i < (cols - (model.model.digits + 1)); i++) { carryRow.cols.push({ type: "column", w: colWidth }); }
        for (j = 0; j < model.model.digits + 1; j++) carryRow.cols.push({ type: "column", w: colWidth, id: "carry[" + j + "]" })
        // carryRow.cols.push({ type: "column", w: colWidth });
        tableData.layout.push(carryRow);
        for (i = 0; i < variables.$nums.length; i++) {
            var operandRow = { type: "row", h: rowHeight, cols: [{ type: "column", w: colWidth }, { type: "column", w: colWidth, id: "symbol" + i }, { type: "column", w: colWidth }], id: "op" + i, w: cols * colWidth }
            for (a = model.model.digits - 1; a >= 0; a--) operandRow.cols.push({ type: "column", w: colWidth, id: "num" + i + "[" + a + "]" });
            tableData.layout.push(operandRow);
        }
        var answerRow = { type: "row", h: rowHeight, cols: [], id: "answer", w: cols * colWidth }
        for (i = 0; i < (cols - (model.model.digits + 1)); i++) { answerRow.cols.push({ type: "column", w: colWidth }); }
        answerRow.cols.push({ type: "column", w: colWidth, id: "ans1" }, { type: "column", w: colWidth, id: "ans0" });
        tableData.layout.push(answerRow);
        PluginManager.invoke('org.ekstep.funtoot.common.table', tableData, tableCell, instance._stage, instance._theme);
        var pvVal = ["U", "T", "H", "Th"];
        // add place value names
        for (i = 0; i <= model.model.digits; i++) {
            var pv = PluginManager.getPluginObject("pv" + i);
            var textObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                h: "100", w: 100, x: 0, y: 0,
                $t: pvVal[i],
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, pv, this._stage, this._theme);
        }
        for (j = 1; j < variables.$nums.length; j++) {
            var sy = PluginManager.getPluginObject("symbol" + j);
            var textObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                h: "100", w: 100, x: 0, y: 0,
                $t: "+",
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, sy, this._stage, this._theme);
        }
        _.each(nums, function (num, i) {
            var numStr = num.displayValue.toString();
            _.each(_.range(numStr.length), function (st, j) {
                var numCell = PluginManager.getPluginObject("num" + i + "[" + j + "]");
                var textObj = {
                    align: "center",
                    color: "#4c4c4c",
                    fontsize: "2.7vw",
                    h: "100", w: 100, x: 0, y: 0,
                    $t: numStr[j],
                    valign: "middle"
                }
                PluginManager.invoke('text', textObj, numCell, this._stage, this._theme);
            })
        });
        var ansRow = PluginManager.getPluginObject("answer");
        var shapeObj = {
            fill: "#000000", stroke: "#000000",
            h: 0.5, w: 100, x: 0, y: 0, type: "rect",
        }
        PluginManager.invoke('shape', shapeObj, ansRow, this._stage, this._theme);
        for (i = 0; i < model.model.digits + 1; i++) {
            var ansCell = PluginManager.getPluginObject("ans" + i);
            var carryCell = PluginManager.getPluginObject("carry[" + i + "]");
            _.each([ansCell], function (cell) {
                var key = "fib" + cell._data.id;
                if (!data.isSolution) {
                    var fibData = {
                        e: !_.isUndefined(item.getModelValue(cell._data.id)) ? item.getModelValue(cell._data.id).displayValue : '',
                        u: '',
                        w: true,
                        isSolution: data.isSolution,
                        isEvaluated: false,
                        isCorrect: false
                    }
                    var fibM = item.getModelValue().model.fibModels;
                    fibM[key] = fibData;
                }
                item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                var fib = Object.create(data);
                fib.id = key;
                fib.model = "fibModels." + key;
                fib.w = 100;
                fib.x = 0;
                fib.h = 100;
                fib.y = 0;
                fib.fontsize = "2.7vw";
                fib.state = "deselected";
                PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
            });
        }
    },


    /**
    * handles Submit button
    * evaluates the user answers
    * @param {object} evt the event
    * @param {object} instance the instance of the plugin
    */
    onSubmit: function (evt, instance) {
        var model = this._stage._stageController.getModelValue();
        var result = { isSolved: true, resValues: [], mmc: [] };
        return result;
    },
    onColCreated: function (inst, cell) {
        var cell = PluginManager.getPluginObject(inst._id);
        var shapeObj = {
            fill: "#FFFFFF", stroke: "#000000",
            h: 100, w: 100, x: 0, y: 0, type: "rect",
        }
        PluginManager.invoke('shape', shapeObj, cell, this._stage, this._theme);
    }
});