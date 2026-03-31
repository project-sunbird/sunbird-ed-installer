//@ sourceURL=numeralsCountingbase.js
/* global PluginManager */
/**
 * This plugin is used to generate counting numerals problems
 * @extends ftFibBasePlugin
 * @fires ftGrid
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.numeralscountingbase',
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var helper = PluginManager.getPluginObject('plugin_helper');
        var i18n = PluginManager.getPluginObject('i18n_helper');

        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);

        //get values from ECML
        var rows = this._item.getModelValue("rows");
        var cols = this._item.getModelValue("cols");
        var tileImg = this._item.getModelValue("tileImgPrefix") + rows + "x" + cols;
        var variables = this._item.getModelValue("variables");
        var numericLangId = this._item.getModelValue("numericLangId");

        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
        }

        //retrieve the model values from the item data
        var numArray = new org.ekstep.generators().replaceVariables(this._item.getModelValue("numbers"), variables);
        var numbers = i18n.translateNumber(numArray, numericLangId);
        var numberType = this._item.getModelValue("numberType");
        var langId = this._item.getModelValue("langId");
        var mask = this._item.getModelValue("mask");
        var qid = this._item.getModelValue().identifier;
        var subject = this._item.getModelValue("subject");
        var qlevel = this._item.getModelValue("qlevel");
        var defaultFontSize = this.getFontSize(data.isSolution);
        // height of content container is 53 units, we have 3 rows and 2 gutters (4 each)
        var rowHeight = 15; // in units
        var colsPerRow = 12 / cols; // in number of columns
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            rowCb: this.onRowCreated,
            colCb: this.onColCreated,
            cbObj: instance //, debug: true
        };
        gridData.layout = [];
        for (r = 0; r < rows; r++) {
            var newRow = {
                id: 'r' + r,
                type: "row",
                h: rowHeight,
                cols: []
            };
            for (c = 0; c < cols; c++)
                newRow.cols.push({
                    id: newRow.id + 'c' + c,
                    type: "column",
                    w: colsPerRow
                });
            gridData.layout.push(newRow);
            if (r != rows - 1)
                gridData.layout.push({
                    type: "gutter",
                    h: 4
                });
        }
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var grid = PluginManager.getPluginObject(gridData.id);

        var maskedArray = helper.getUserInputMask({
            rows: rows,
            cols: cols,
            mask: mask
        });
        if (!data.isSolution) {
            this._item.setModelValue("fibModels", {});
            this._item.setModelValue("mask", maskedArray);
        }

        // now that the grid got created, lets add the assets
        var n = 0;
        for (r = 0; r < rows; r++) {
            for (c = 0; c < cols; c++) {
                n = r * cols + c;
                var tileImage = {
                    w: 100,
                    x: 0,
                    y: 0,
                    asset: tileImg
                };
                var cell = grid.getCell(r, c);
                PluginManager.invoke('image', tileImage, cell, this._stage, this._theme);
                var key = "fib" + cell._data.id;
                if (!data.isSolution) {
                    var fibData = {
                        e: numbers[n].displayValue,
                        u: maskedArray[n] ? '' : numbers[n].displayValue,
                        w: maskedArray[n],
                        isSolution: data.isSolution,
                        isEvaluated: false,
                        isCorrect: false
                    }
                    var fibM = this._item.getModelValue().model.fibModels;
                    fibM[key] = fibData;
                }
                this._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                var fib = Object.create(data);
                fib.id = key;
                fib.model = "fibModels." + key;
                fib.w = 45;
                fib.x = (100 - fib.w) / 2;
                fib.h = 45;
                fib.y = (100 - fib.h) / 2;
                fib.fontsize = defaultFontSize;
                fib.state = "deselected";
                PluginManager.invoke('ftFib', fib, cell, this._stage, this._theme);
            }
        }

    },
    /**
     * callback called when a grid row is created
     * @param {Object} r the row that just got created
     */
    onRowCreated: function (r) { },

    /**
     *  callback called when a grid cell (column) in a row is created
     * @param {Object} c the column or cell
     */
    onColCreated: function (c) {
        /*var tileImage = {
            w: 100, x: 0, y: 0, asset: this.tileImg
        };
        PluginManager.invoke('image', tileImage, c, this._stage, this._theme);*/
    },
    /**
     * custom evaluation for number counting plugin
     * populates the micro hint message and mmc depending on the user answer
     * refer: <Config spec URL>
     * @param {object} the model associated with the FIB plugin
     * @param {boolean} isFirst is it the first number on a row
     * @param {boolean} isLast is it the last number on a row
     * @FIX: Get message strings from resource bundle
     */
    evaluate: function (model, isFirst, isLast) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var userValue = i18n.toNumber(model.u.trim());
        var expectedValue = i18n.toNumber(model.e.trim());
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"); //'Please answer'
            model['mmc'] = 'O1';
            return !1;
        } else if (userValue != expectedValue) {
            if (expectedValue.toString() == '0') {
                model['mh'] = i18n.translate("ZERO_EXPECTED"); //'There is one apple on the plate. When we remove that apple, how many are left in the plate? Now can you find the missing number.';
                model['mmc'] = 'C205';
            } else if (this._item._data.selectedConfig.Type == "Missing Decimal Numbers") {
                var expectedDecPos = expectedValue.toString().indexOf('.');
                var userDecPos = userValue.toString().indexOf('.');
                var expectedVal = expectedValue.toString().replace('.', '');
                var userVal = userValue.toString().replace('.', '');
                if (expectedDecPos != -1 && userDecPos == -1) {
                    model['mh'] = i18n.translate("DECIMAL_NOT_FOUND");
                    model['mmc'] = 'C19';
                } else if (expectedVal == userVal && expectedDecPos != userDecPos) {
                    model['mh'] = i18n.translate("WRONG_DECIMAL_POS");
                    model['mmc'] = 'C19';
                } else {
                    switch (this._item._data.selectedConfig.SubLevel.SubLevel) {
                        case 0:
                            model['mh'] = i18n.translate("ALT_DEC");
                            model['mmc'] = 'C116';
                            break;
                        case 1:
                            model['mh'] = i18n.translate("PRED_DEC");
                            model['mmc'] = 'C305';
                            break;
                        case 2:
                            model['mh'] = i18n.translate("SUCC_DEC");
                            model['mmc'] = 'C116';
                            break;
                        case 3:
                            model['mh'] = i18n.translate("INTR_DEC");
                            model['mmc'] = 'C614';
                    }
                }
            } else if (_.last(expectedValue.toString()) == '0') {
                if (!isFirst) {
                    model['mh'] = i18n.translate("PREV_ENDS_WITH_9"); //'Look at the sequence. The previous number ends with 9';
                    model['mmc'] = 'C704';
                } else {
                    model['mh'] = i18n.translate("NEXT_ENDS_WITH_1"); //'Look at the sequence. The next number ends with 1';
                    model['mmc'] = 'C702';
                }
            } else if (_.last(expectedValue.toString()) == '1') {
                if (!isFirst) {
                    model['mh'] = i18n.translate("PREV_ENDS_WITH_0"); //'Look at the sequence. The previous number ends with 0';
                    model['mmc'] = 'C702';
                } else {
                    model['mh'] = i18n.translate("GENERIC_ERROR"); //'Look at the sequence carefully and find the missing number';
                    model['mmc'] = 'C701';
                }
            } else if (_.last(expectedValue.toString()) == '9') {
                if (!isLast) {
                    model['mh'] = i18n.translate("NEXT_ENDS_WITH_0"); //'Look at the sequence. The next number ends with 0';
                    model['mmc'] = 'C704';
                } else {
                    model['mh'] = i18n.translate("GENERIC_ERROR"); //'Look at the sequence carefully and find the missing number';
                    model['mmc'] = 'C701';
                }
            } else if (expectedValue.toString().includes('0')) {
                model['mh'] = i18n.translate("GENERIC_ERROR"); //'Look at the given sequence carefully and find the missing number';
                model['mmc'] = 'C703';
            } else {
                model['mh'] = i18n.translate("GENERIC_ERROR"); //'Look at the sequence carefully and find the missing number';
                model['mmc'] = 'C701';
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
     */
    onSubmit: function (evt, instance) {
        console.log("numeralsCounting - onSubmit called");
        var model = instance._item.getModelValue();
        var length = Object.keys(model.model.fibModels).length;
        var i = 0;
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                var isLast = i == length - 1;
                var isFirst = i == 0;
                if (m.w) {
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);
                    m.isCorrect = instance.evaluate(m, isFirst, isLast);
                    if (!m.isCorrect) {
                        result.isSolved = false;
                        result.mmc.push(m.mmc);
                    }
                    var fibObject = PluginManager.getPluginObject(k);
                    fibObject.onEvaluate();
                }
                i++;
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