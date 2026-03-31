//@ sourceURL=spnibbase-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate Successor/ Predecessor and Number in between problems
 * @extends ftFibBasePlugin
 * @author Ram Jayaraman <ram.j@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.spnibbase',
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
        console.log(item);

        //get values from ECML
        var rows = this._item.getModelValue("rows");
        var cols = this._item.getModelValue("cols");
        var bgImg = this._item.getModelValue("bgImg");
        var variables = this._item.getModelValue("variables");
        var mask = this._item.getModelValue("mask");
        var numericLangId = this._item.getModelValue("numericLangId");
        this._numericLangId = numericLangId;
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        if (!data.isSolution) {
            this.processVariables(variables);
        }
        var numArray = new org.ekstep.generators().replaceVariables(this._item.getModelValue("numbers"), variables);
        var numbers = i18n.translateNumber(numArray, numericLangId);
        var numberType = this._item.getModelValue("numberType");
        var langId = this._item.getModelValue("langId");
        var qtype = this._item.getModelValue("qtype");
        var qid = this._item.getModelValue().identifier;
        var subject = this._item.getModelValue("subject");
        var qlevel = this._item.getModelValue("qlevel");
        var defaultFontSize = this.getFontSize(data.isSolution);

        // height of content container is 53 units
        var rowHeight = 40; // in units
        var colsPerCell = 4; // in number of columns
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
        //Added ygutter in the begining to middle align the content.
        gridData.layout.push({
            type: "gutter",
            h: 7
        });
        /**
         * Calulate offset depending on qtype
         * for successor/predecessor 2 cells each of 4 columns, 4*2 = 8 so offset will be ( 12-8)/2= 2
         * for NumberInBetween 3 cells each of 4 columns, offset will be zero inn this case
         */
        var offset = (12 - 4 * cols) / 2;
        /**
         * calculate x position of background image depending on the offset
         * 1 column = 7 units + 4 units of gutter = 11 units
         */
        this._bgImgDims = {
            w: offset * 11,
            h: 0
        };
        this._bgImgDims = helper.toPercent(this._bgImgDims, contentContainer);
        for (r = 0; r < rows; r++) {
            var newRow = {
                id: 'r' + r,
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: offset
                }]
            };
            for (c = 0; c < cols; c++)
                newRow.cols.push({
                    id: newRow.id + 'c' + c,
                    type: "column",
                    w: colsPerCell
                });
            gridData.layout.push(newRow);
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
                n = r * rows + c;
                var cell = grid.getCell(r, c);
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
                fib.w = 50;
                fib.x = (100 - fib.w) / 2;
                fib.h = 15;
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
    onRowCreated: function (r) {
        var bgImg = this._item.getModelValue("bgImg");
        var cols = this._item.getModelValue("cols");
        var bgImage = {
            w: 100,
            x: this._bgImgDims.w,
            y: 0,
            asset: bgImg
        };
        PluginManager.invoke('image', bgImage, r, this._stage, this._theme);
    },

    /**
     * custom evaluation for Successor Predecessor and Number in Between plugin
     * populates the micro hint message and mmc depending on the user answer
     * refer: <Config spec URL>
     * @param {object} the model associated with the FIB plugin
     * @param {string} qtype is it the question type eg: Successor/Predecessor/NumberInBetween
     */
    evaluate: function (model, qtype) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var userValue = i18n.toNumber(model.u.trim(), this._numericLangId);
        var expectedValue = i18n.toNumber(model.e.trim(), this._numericLangId);
        var isRomanNumber = this._numericLangId == 'roman';
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (userValue != expectedValue) {
            if (isRomanNumber && isNaN(userValue)) {
                model.mh = i18n.translate("INVALID_ROMAN_NUMBER");
                model.mmc = 'C724';
            } else if (qtype == "Predecessor") {
                if (userValue == expectedValue + 2) {
                    //If user has entered successor of a number instead of predecessor
                    model.mh = i18n.translate(("ENTERED_SUCCESSOR_INSTEAD_OF_PREDECESSOR" + (isRomanNumber ? "_ROMAN" : '')));
                    model.mmc = isRomanNumber ? 'C701' : 'C701';
                } else {
                    model.mh = i18n.translate(("WRONG_PREDECESSOR" + (isRomanNumber ? "_ROMAN" : '')));
                    model.mmc = isRomanNumber ? 'C214' : 'C214';
                }

            } else if (qtype == "Successor") {
                if (userValue == expectedValue - 2) {
                    //If user has entered predecessor of a number instead of successor
                    model.mh = i18n.translate(("ENTERED_PREDECESSOR_INSTEAD_OF_SUCCESSOR" + (isRomanNumber ? "_ROMAN" : '')));
                    model.mmc = isRomanNumber ? 'C701' : 'C701';
                } else {
                    model.mh = i18n.translate(("WRONG_SUCCESSOR" + (isRomanNumber ? "_ROMAN" : '')));
                    model.mmc = isRomanNumber ? 'C214' : 'C214';
                }

            } else {
                model['mh'] = i18n.translate("WRONG_MIDDLE_NUMBER");
                model['mmc'] = 'C214';
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
        var model = instance._item.getModelValue();
        var qtype = this._item.getModelValue("qtype");
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
                    m.isCorrect = instance.evaluate(m, qtype);
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