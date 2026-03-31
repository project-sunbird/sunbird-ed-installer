//@ sourceURL=multiplicationtable-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate table addition problems
 * @extends ftFibBasePlugin
 * @author Swathi <swathi.jayaprakash@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.multiplicationtable',
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

        var variables = item.getModelValue("variables");
        var rows = 3;
        var cols = 3;
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
            //create fib model
            this._item.setModelValue("fibModels", {});
        }
        // get the number
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var multiplicands = _.isArray(variables.$num1) ? variables.$num1 : Array(6).fill(Number(variables.$num1));
        var multipliers = variables.$num2;
        var numericLangId = item.getModelValue("numericLangId");
        var qTitleFontSize = this.getFontSize(data.isSolution);
        var defaultFontSize = this.getFontSize(data.isSolution, 4.0);// multiplicands[0].length + multipliers[0].toString().length < 3 ? this.getFontSize(data.isSolution, 4.0) : this.getFontSize(data.isSolution, 4.0);
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        var maskedArray = this._item.getModelValue("maskedArray");
        var products = [];
        var lhs = [];
        var steps = [];
        var tokens = [];
        var modelArray = new Array(6);
        variables.$operands = [];
        variables.$products = [];
        variables.$expAns = [];
        for (i = 0; i < 6; i++) {
            products[i] = Number(multiplicands[i]) * Number(multipliers[i]);
            variables.$operands[i] = new Array(Number(multiplicands[i]), Number(multipliers[i]));
            variables.$products[i] = i18n.translateNumber(products[i], numericLangId).displayValue;
            multiplicands[i] = i18n.translateNumber(multiplicands[i], numericLangId).displayValue;
            multipliers[i] = i18n.translateNumber(multipliers[i], numericLangId).displayValue;
            lhs[i] = multiplicands[i] + ' x ' + multipliers[i];
            steps[i] = lhs[i] + " = " + variables.$products[i];
            tokens[i] = steps[i].split(" ").filter(e => String(e).trim());
            modelArray[i] = new Array();
            var rwVal = maskedArray[i] == 0 ? "tokens[i].length-1" : maskedArray[i] == 1 ? "0" : "tokens[i].length-3";
            _.each(tokens[i], function (token, j) {
                modelArray[i].push({
                    //build object which will be consumed by tables to create the layout
                    id: "c" + j,
                    content: token.trim(),
                    w: j == eval(rwVal)
                });
            });
        }
        this._item.setModelValue("modelArray", modelArray);
        // height of content container is 53 units
        var rowHeight = 12; // in units
        var colsPerCell = 5.5; // in number of columns

        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance//,debug: true
        };

        gridData.layout = [];
        gridData.layout.push({
            type: "gutter",
            h: 5
        });
        var r;
        var c;
        for (r = 0; r < rows; r++) {
            var newRow = {
                id: 'r' + r,
                type: "row",
                h: rowHeight,
                cols: []
            };
            for (c = 0; c < cols; c++) {
                newRow.cols.push({
                    id: newRow.id + 'c' + c,
                    type: "column",
                    w: c == 1 ? 1 : colsPerCell
                });
            }
            gridData.layout.push(newRow);
            if (r != rows - 1)
                gridData.layout.push({
                    type: "gutter",
                    h: 5
                });
        }
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var grid = PluginManager.getPluginObject(gridData.id);
        var mulTableCell;
        for (r = 0; r < rows; r++) {
            for (c = 0; c < cols; c++) {
                if (c != 1) {
                    mmInd = r == 0 && c == 0 ? 0 : r == 0 && c == 2 ? 1 : r == 1 && c == 0 ? 2 : r == 1 && c == 2 ? 3 : r == 2 && c == 0 ? 4 : 5;
                    mulTableCell = PluginManager.getPluginObject('r' + r + 'c' + c);
                    var tableData = {
                        id: 'table' + r + c,
                        w: 100,
                        h: 100,
                        x: 0,
                        y: 0,
                        align: "center",
                        valign: "middle",
                        cbObj: instance,
                        // debug: true,
                        colCb: instance.onColCreated
                    };
                    tableData.layout = [];
                    var tableCellRow = {
                        type: "row",
                        h: 12,
                        cols: [],
                        id: "tableCellRow" + r + c,
                        w: 56.5
                    };
                    var h;
                    for (h = 0; h < 5; h++) {
                        tableCellRow.cols.push({
                            type: "column",
                            id: "tokenCell" + r + c + h,
                            w: modelArray[mmInd][h].w ? 14 : 10.625
                        });
                    }
                    tableData.layout.push(tableCellRow);
                    PluginManager.invoke('org.ekstep.funtoot.table', tableData, mulTableCell, instance._stage, instance._theme);
                    var cellTable = PluginManager.getPluginObject('table' + r + c);
                    /**Invoke plugin manager to draw horizontal lines */
                    var boldLineObj = {
                        fill: "#000000",
                        stroke: "#000000",
                        h: 0.5,
                        w: 100,
                        x: 0,
                        y: 0,
                        type: "rect"
                    };
                    PluginManager.invoke('shape', boldLineObj, cellTable, instance._stage, instance._theme);
                    boldLineObj.y = 100;
                    PluginManager.invoke('shape', boldLineObj, cellTable, instance._stage, instance._theme);

                    /**Invoke plugin manager to draw vertical lines */
                    var lineObj = {
                        x: 0,
                        y: 0,
                        h: 100,
                        w: 0.2,
                        id: "line" + c
                    };
                    PluginManager.invoke('g', lineObj, cellTable, instance._stage, instance._theme);
                    var line = PluginManager.getPluginObject("line" + c);
                    var verticalShapeObj = {
                        fill: "#000000",
                        h: 100,
                        w: 100,
                        x: 0,
                        y: 0,
                        type: "rect",
                    };
                    PluginManager.invoke('shape', verticalShapeObj, line, instance._stage, instance._theme);
                    lineObj = {
                        x: 100,
                        y: 0,
                        h: 100,
                        w: 0.2,
                        id: "line" + c
                    };
                    PluginManager.invoke('g', lineObj, cellTable, instance._stage, instance._theme);
                    line = PluginManager.getPluginObject("line" + c);
                    verticalShapeObj = {
                        fill: "#000000",
                        h: 100,
                        w: 100,
                        x: 0,
                        y: 0,
                        type: "rect",
                    };
                    PluginManager.invoke('shape', verticalShapeObj, line, instance._stage, instance._theme);
                }
            }
        }
        var mmInd;
        var fibM = instance._item.getModelValue().model.fibModels;
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (c != 1) {
                    mmInd = r == 0 && c == 0 ? 0 : r == 0 && c == 2 ? 1 : r == 1 && c == 0 ? 2 : r == 1 && c == 2 ? 3 : r == 2 && c == 0 ? 4 : 5;
                    _.each(tokens[mmInd], function (token, index) {
                        var cell = PluginManager.getPluginObject("tokenCell" + r + c + index);
                        /**Invoke shapes plugin to set the background color */
                        var mulColCellColorShapeObj = {
                            fill: "#E7FDFD",
                            h: 100,
                            w: 100,
                            x: 0,
                            y: 0,
                            type: "rect"
                        };
                        PluginManager.invoke('shape', mulColCellColorShapeObj, cell, instance._stage, instance._theme);
                        var key = "fib" + cell.id + '_' + mmInd;
                        if (!data.isSolution) {
                            var fibData = {
                                id: key,
                                e: modelArray[mmInd][index].content,
                                u: modelArray[mmInd][index].w ? '' : modelArray[mmInd][index].content,
                                w: modelArray[mmInd][index].w,
                                isSolution: data.isSolution,
                                isEvaluated: false,
                                isCorrect: false
                            };
                            fibM[key] = fibData;
                            if (modelArray[mmInd][index].w) {
                                variables.$expAns[mmInd] = modelArray[mmInd][index].content;
                            }
                        }
                        instance._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                        var fib = {};
                        fib.id = key;
                        fib.model = "fibModels." + key;
                        fib.align = "center";
                        fib.valign = "middle";
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
            }
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
        var variables = this._item.getModelValue("variables");
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                var index = m.id.split("_")[1];
                if (m.w) {
                    var evalModel = new MultiplicationEval().evaluate(mod = {
                        operands: variables.$operands[index],
                        operation: 'Multiplication',
                        expected: {
                            answer: variables.$expAns[index],
                        },
                        user: {
                            answer: m.u,
                        },
                        type: 'table'
                    });
                    m.isCorrect = instance.evaluate(m, evalModel);
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);

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
     * custom evaluation for table multiplication
     * populates the micro hint message and mmc depending on the user answer
     * refer: <Config spec URL>
     * @param {object} the model associated with the FIB plugin
     * @returns {boolean}
     */
    evaluate: function (model, evalModel) {
        evalModel = _.isUndefined(evalModel) ? true : evalModel;
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = this._item.getModelValue("variables");
        var ruleToMMCMap = {
            "isSum": "C12",
            "multiplicationby1": "C548",
            "multiplicationBySingleDigit": "C99",
            "multiplicationByPowersOfTen": "C280",
            "isProductMisplaced": "C276",
            "isZeroMissedInTheEnd": "C280",
            "isZeroMissed": "C722",
            "isSameNumber": "C720",
            "isZeroPresent": "C547"
        };
        var ruleToMicrohintMap = {
            "isSum": "MH_SUM",
            "multiplicationby1": "MH_1",
            "multiplicationBySingleDigit": "MH_SINGLEDIGIT",
            "multiplicationByPowersOfTen": "MH_10",
            "isProductMisplaced": "MH_MISPLACE",
            "isZeroMissedInTheEnd": "MH_END0",
            "isZeroMissed": "MH_MISSED0",
            "isSameNumber": "MH_SAME",
            "isZeroPresent": "MH_0"
        };
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (evalModel != true) {
            model['mh'] = i18n.translate(ruleToMicrohintMap[evalModel.id]);
            model['mmc'] = ruleToMMCMap[evalModel.id];
            return !1;
        } else if (model.u.trim() != model.e.trim()) {
            model['mh'] = i18n.translate("MH_DEFAULT");
            model['mmc'] = "C93"
            return !1;
        } else {
            model['mh'] = null;
            model['mmc'] = null;
            return !0;
        }
    },
    /**
     * checks if user has given any input
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (instance) {
        var blkCount = 0;
        var answeredBlkCount = 0;
        var blanks = instance._item.getModelValue().model.fibModels;

        _.each(blanks, function (b) {
            if (b.w & !(b.e == null || b.e == "")) {
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