//@ sourceURL=skipCounting.js
/* global PluginManager */
/**
 * This plugin is used to generate Skip counting problems
 * @extends ftFibBasePlugin
 * @author Henrietta D <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.skipcounting',
    _numbers: [],
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var helper = PluginManager.getPluginObject('plugin_helper');

        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var rows = this._item.getModelValue("rows");
        var cols = this._item.getModelValue("cols");
        var tileImg = this._item.getModelValue("tileImgPrefix"); // + rows + "x" + cols;
        var variables = this._item.getModelValue("variables");
        var numericLangId = this._item.getModelValue("numericLangId");
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        if (!data.isSolution) {
            this.processVariables(variables);
        }
        var numArray = new org.ekstep.generators().replaceVariables(this._item.getModelValue("numbers"), variables);
        this._numbers = i18n.translateNumber(numArray, numericLangId);
        var lengthOfLastNumber = _.last(this._numbers).displayValue.length;
        var numberType = this._item.getModelValue("numberType");
        var langId = this._item.getModelValue("langId");
        var mask = this._item.getModelValue("mask");
        var qid = this._item.getModelValue().identifier;
        var subject = this._item.getModelValue("subject");
        var qlevel = this._item.getModelValue("qlevel");
        var defaultFontSize = this.getFontSize(data.isSolution);
        if (lengthOfLastNumber > 4)
            defaultFontSize = this.getFontSize(data.isSolution, 2.35, 0.9);
        // height of content container is 53 units, we have 3 rows and 2 gutters (4 each)
        var rowHeight = 36; // in units
        var colsPerCell = 2; // in number of columns
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
        for (r = 0; r < rows; r++) {
            var newRow = {
                id: 'r' + r,
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 1
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
                        e: this._numbers[n].displayValue,
                        u: maskedArray[n] ? '' : this._numbers[n].displayValue,
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
                fib.w = 80;
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
     * Returns array of indices of given element(val)
     * @param arr - is an array
     * @param val - element whose indices are returned
     */
    getAllIndexes(arr, val) {
        var indexes = [],
            i = -1;
        while ((i = arr.indexOf(val, i + 1)) != -1) {
            indexes.push(i);
        }
        return indexes;
    },
    /**
     * Sorts a array into groups and returns a count for the number of objects in each group.
     */
    getOddEvenCount(arr) {
        var res = {
            'even': 0,
            'odd': 0
        }
        _.countBy(arr, function (n) {
            n % 2 == 0 ? res.even++ : res.odd++;
        });
        return res;

    },
    /**
     * custom evaluation for skip counting plugin
     * populates the micro hint message and mmc depending on the user answer
     * refer: <Config spec URL>
     * @param {object} the model associated with the FIB plugin
     */
    evaluate: function (model) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        //get only numerical values from the Object
        var nummericalArray = [];
        _.each(this._numbers, function (num) {
            nummericalArray.push(num.numericalValue);
        });
        //check the count of odd and even numerials from the array
        var arrayType = this.getOddEvenCount(nummericalArray);
        //get mask pattern
        var modelData = this._item.getModelValue();
        var maskPattren = [];
        _.each(modelData.model.fibModels, function (m, k) {
            maskPattren.push(m.w);
        });
        var skip = this._item.getModelValue("skip");
        var seqIsMultipleOfSkip = (_.filter(nummericalArray, function (num) {
            return num % skip != 0;
        }).length == 0) ? true : false;
        var indices = this.getAllIndexes(maskPattren, true);
        var maskedData = this.getOddEvenCount(indices);
        var maskedAlternate = maskedData.even == 0 || maskedData.odd == 0 ? true : false;
        var userValue = i18n.toNumber(model.u.trim());
        var expectedValue = i18n.toNumber(model.e.trim());
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (userValue != expectedValue) {
            if (maskedAlternate)
                model['mh'] = i18n.translate("GENERIC_ERROR");
            if (arrayType.odd == 0) //if array contains all even numbers
            {
                model['mmc'] = 'C476';
                if (!maskedAlternate)
                    model['mh'] = i18n.translate("EVEN_ARRAY_NOT_MASKED_ALTERNATELY");
            } else if (arrayType.even == 0) //if array contains all even numbers
            {
                model['mmc'] = 'C475';
                if (!maskedAlternate)
                    model['mh'] = i18n.translate("ODD_ARRAY_NOT_MASKED_ALTERNATELY");
            } else if (seqIsMultipleOfSkip) //if array contains multiples of skips
            {
                model['mmc'] = 'C470';
                if (!maskedAlternate)
                    model['mh'] = i18n.translate("ARRAY_WHICH_IS_MULTIPLE_OF_SKIP_NUMBER");
            } else {
                model['mmc'] = 'C470';
                if (!maskedAlternate)
                    model['mh'] = i18n.translate("ARRAY_WHICH_IS_NOT_MULTIPLE_OF_SKIP_NUMBER");
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