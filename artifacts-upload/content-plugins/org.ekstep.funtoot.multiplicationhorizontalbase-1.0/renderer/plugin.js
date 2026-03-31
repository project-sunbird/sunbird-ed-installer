//@ sourceURL=multiplicationhorizontalbase-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate horizontal addition problems
 * @extends ftFibBasePlugin
 * @author Henrietta D <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.multiplicationhorizontalbase',
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
        var nums = variables.$nums;
        instance.isDecimalMul = nums.toString().includes(".") ? true : false;
        var numericLangId = item.getModelValue("numericLangId")
        //calculate answer
        var ans = 1;
        _.each(nums, function (n) {
            ans = ans * Number(n);
        })
        ans = parseFloat(ans.toFixed(instance.getAnsPrecision(nums)));
        variables.$ans = i18n.translateNumber(ans, numericLangId).displayValue;
        nums = i18n.translateNumber(nums, numericLangId);
        nums = _.pluck(nums, 'displayValue');
        var lhs = nums.join().replace(/,/g, ' x ');
        var qTitleFontSize = this.getFontSize(data.isSolution);
        var defaultFontSize = nums.length < 3 ? this.getFontSize(data.isSolution, 5.0) : this.getFontSize(data.isSolution, 4.0);
        var step = lhs + " = " + variables.$ans;
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        var tokens = step.split(" ").filter(e => String(e).trim());
        var modelArray = [];
        _.each(tokens, function (token, i) {
            modelArray.push({
                //build object which will be consumed by inlineFib in creating the layout
                id: "c" + i,
                content: token.trim(),
                w: i == tokens.length - 1
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
                fontsize: qTitleFontSize,
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
                    u: index == tokens.length - 1 ? '' : modelArray[index].content,
                    w: index == tokens.length - 1,
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
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object} problem state(correct/ wrong), array of mmcs and reponse values
     */
    onSubmit: function (evt, instance) {
        var model = instance._item.getModelValue();
        var variables = this._item.getModelValue("variables");
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                if (m.w) {
                    var evalModel = new MultiplicationEval().evaluate(mod = {
                        operands: variables.$nums,
                        operation: 'Multiplication',
                        expected: {
                            answer: i18n.toNumber(variables.$ans).toString() //parseFloat(variables.$ans).toString(),
                        },
                        user: {
                            answer: i18n.toNumber(m.u).toString() //parseFloat(m.u).toString(),
                        },
                        type: 'horizontal'
                    });
                    m.isCorrect = instance.evaluate(m, evalModel);
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);
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
     * custom evaluation for horizontal multiplication
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
        if (this.isDecimalMul & (model.e != model.u)) {
            console.log("decimal multiplication")
            var item = this._stage.getController("item");
            var variables = item.getModelValue("variables");
            if (variables.$nums[1] % 10 == 0) {
                model['mh'] = i18n.translate("MH_POWERSOF10");
                model['mmc'] = "DE043";
                return !1;
            } else {
                model['mh'] = i18n.translate("MH_DECIMAL");
                model['mmc'] = "DE043";
                return !1;
            }
        } else if (model.u.trim() == '') {
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
     * calculates proper precision for answer,
     * if question is decimal multiplication
     * @param {array} nums nums array
     * @returns {number} precision precision value
     */
    getAnsPrecision: function (nums) {
        var precision = 0
        if (nums.toString().includes(".")) {
            _.each(nums, function (n) {
                n = n.toString();
                precision = precision + n.substring(n.indexOf(".") + 1).length
            })
        }
        return precision
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