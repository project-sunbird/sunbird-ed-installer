//@ sourceURL=division-renderer.js
/* global PluginManager */
/* global DivisionEval */
/**
 * This plugin is used to generate division problems
 * @extends ftFibBasePlugin
 * @author Henrietta D <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.division',
    _isContainer: !0,
    _render: !0,
    /**
    * initializes the plugin
    * @param {object} data the data for the plugin
    */
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var generator = PluginManager.getPluginObject("generators");
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var variables = item.getModelValue("variables");
        var qtype = item.getModelValue("qtype");
        var rows = qtype == 0 ? 1 : 3;
        var cols = 1;
        // process the variables only if non-solution display
        if (!data.isSolution) {
            generator.processVariables(variables);
            //create fib model
            this._item.setModelValue("fibModels", {});
        }
        // get the number
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var nums = variables.$nums;
        var numericLangId = item.getModelValue("numericLangId");

        variables.$Q = i18n.translateNumber(Math.trunc(nums[0] / nums[1]), numericLangId).displayValue;
        variables.$R = i18n.translateNumber((nums[0] % nums[1]), numericLangId).displayValue;
        /* var ans = _.reduce(nums, function (memo, num) { return memo / Number(num); });
         variables.$ans = i18n.translateNumber(ans, numericLangId).displayValue;*/
        nums = i18n.translateNumber(nums, numericLangId);
        //extracting list of 'displayValue' values.
        nums = _.pluck(nums, 'displayValue');
        //form the lhs part by joining the numbers with '-'
        var lhs = nums.join().replace(/,/g, ' \u00F7 ');
        var qTitleFontSize = this.getFontSize(data.isSolution);
        //Vary fontsize depending on number of operands, if there are only 2 operands fontsize= 5.0vw if more than 2 operands then fontsize=4.0vw.
        var defaultFontSize = this.getFontSize(data.isSolution, 3.0);
        var step = lhs + " = " + variables.$Q;
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        var tokens = step.split(" ").filter(Boolean);
        var maskedArray = this.getMask(step);
        var modelArray = [];
        _.each(tokens, function (token, i) {
            modelArray.push(
                {
                    //build object which will be consumed by inlineFib in creating the layout
                    id: "c" + i,
                    content: token.trim(),
                    w: maskedArray[i]
                }
            );
        });
        this._item.setModelValue("modelArray", modelArray);
        // height of content container is 53 units
        var rowHeight = 6; // in units
        var colsPerCell = 12; // in number of columns
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100, h: 100, x: 0, y: 0,
            cbObj: instance//, debug: true
        };

        gridData.layout = [];
        //Added ygutter in the begining to middle align the content.
        for (var r = 0; r < rows; r++) {
            cols = r == 0 ? 1 : 2;
            colsPerCell = r == 0 ? colsPerCell : 6;
            var newRow = {
                id: 'r' + r, type: "row", h: rowHeight, cols: []
            };
            for (var c = 0; c < cols; c++) {
                newRow.cols.push({ id: newRow.id + 'c' + c, type: "column", w: colsPerCell });
            }
            gridData.layout.push(newRow);
            if (r != rows - 1)
                gridData.layout.push({ type: "gutter", h: 5 });
        }
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var grid = PluginManager.getPluginObject(gridData.id);
        i18n.onReady().then(function (o) {
            var question = o.translate("QUESTION_TEXT", {
                divident: variables.$nums[0],
                divisor: variables.$nums[1]
            });
            var questionRow = grid.getCell(0, 0);
            var questionObj = {
                id: "question-id",
                align: "center",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: qTitleFontSize,
                $t: question,
                x: 0, y: 0, w: 100, h: 100
            };
            PluginManager.invoke('text', questionObj, questionRow, instance._stage, instance._theme);
            if (qtype == 1) {
                var steps = ["QUOTIENT", "REMAINDER"];
                var expectedAnswer = [variables.$Q, variables.$R];
                for (var s = 0; s < steps.length; s++) {
                    var step = o.translate(steps[s]);
                    var lhs = grid.getCell(s + 1, 0);
                    var stepObj = {
                        id: "step" + s + 1,
                        align: "right",
                        valign: "middle",
                        color: "#4c4c4c",
                        fontsize: defaultFontSize,
                        $t: step,
                        x: 0, y: 0, w: 100, h: 100
                    };
                    PluginManager.invoke('text', stepObj, lhs, instance._stage, instance._theme);
                    // Add rhs (blank)
                    var cell = grid.getCell(s + 1, 1);
                    var key = "fib" + cell._data.id;
                    if (!data.isSolution) {
                        var fibData = {
                            e: expectedAnswer[s],
                            u: '',
                            w: true,
                            isSolution: data.isSolution,
                            isEvaluated: false,
                            isCorrect: false,
                            loc: s == 0 ? 'Q' : 'R'
                        }
                        var fibM = instance._item.getModelValue().model.fibModels;
                        fibM[key] = fibData;
                    }
                    instance._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                    var fib = Object.create(data);
                    fib.id = key;
                    fib.model = "fibModels." + key;
                    //width of the blank should be small  when face value is asked
                    fib.w = 50;
                    fib.x = 0;
                    fib.h = 100;
                    fib.y = (100 - fib.h) / 2;
                    fib.fontsize = defaultFontSize;
                    fib.state = "deselected";
                    PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
                }
            }
        });
        if (qtype == 0) {
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
                        isCorrect: false,
                        loc: 'Q'
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
                    readonly: { showBgImg: false }
                };
                fib.fontsize = defaultFontSize;
                PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
            });
        }
    },

    /**
     * custom evaluation for division
     * populates the micro hint message and mmc depending on the user answer
     * refer: <https://docs.google.com/document/d/1I7LIGbgAQZCHIX8GfZQj7zYvqhFnegtBcSE53k-Mhk0/edit>
     * @param {object} model associated with the FIB plugin
     * @param {object} evalModel model returned from division eval which has details abt which rule is satisfied
     * @returns {boolean} boolean value
     */
    evaluate: function (model, evalModel) {
        evalModel = _.isUndefined(evalModel) ? true : evalModel;
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var ruleToMmcMhMap = {
            isDivisorOne: { mmc: "C587", mh_r: "ISDIVISORONE", mh_q: "ISDIVISORONE" },
            isSubtracted: { mmc: "C103", mh_r: "ISSUBTRACTED", mh_q: "ISSUBTRACTED" },
            isDivisorInsteadOfQuotient: { mmc: "C289", mh_r: "ISDIVISORINSTEADOFQUOTIENT", mh_q: "ISDIVISORINSTEADOFQUOTIENT" },
            isDividentMulOf100AndDivisorIs100: { mmc: "C287", mh_r: "ISDIVIDENTMULOF100ANDDIVISORIS100_R", mh_q: "ISDIVIDENTMULOF100ANDDIVISORIS100_Q" },
            isDividentMulOf10AndDivisorIs10: { mmc: "C287", mh_r: "ISDIVIDENTMULOF10ANDDIVISORIS10_R", mh_q: "ISDIVIDENTMULOF10ANDDIVISORIS10_Q" },
            isDividentNotMulOf10AndDivisorIs10: { mmc: "C287", mh_r: "ISDIVIDENTNOTMULOF10ANDDIVISORIS10_R", mh_q: "ISDIVIDENTNOTMULOF10ANDDIVISORIS10_Q" },
            isDividentNotMulOf100AndDivisorIs100: { mmc: "C287", mh_r: "ISDIVIDENTNOTMULOF100ANDDIVISORIS100_R", mh_q: "ISDIVIDENTNOTMULOF100ANDDIVISORIS100_Q" },
            isDividentNotMulOf1000AndDivisorIs1000: { mmc: "C287", mh_r: "ISDIVIDENTNOTMULOF1000ANDDIVISORIS1000_R", mh_q: "ISDIVIDENTNOTMULOF1000ANDDIVISORIS1000_Q" },
            isDividentMulOf1000AndDivisorIs1000: { mmc: "C287", mh_r: "ISDIVIDENTMULOF1000ANDDIVISORIS1000_R", mh_q: "ISDIVIDENTMULOF1000ANDDIVISORIS1000_Q" },
            isExactlyDivisible: { mmc: "C726", mh_r: "ISEXACTLYDIVISIBLE_R", mh_q: "ISEXACTLYDIVISIBLE_R" },
            interChangedQandR: { mmc: "C590", mh_r: "INTERCHANGEDQANDR", mh_q: "INTERCHANGEDQANDR" },
            incompleteDivision: { mmc: "C734", mh_r: "INCOMPLETEDIVISION_R", mh_q: "INCOMPLETEDIVISION_Q" }
        };
        if (model.u.trim() == '') {
            if (model.loc == 'R') {
                model['mh'] = i18n.translate("NOREMAINDER");
                model['mmc'] = 'C574';
            }
            else {
                model['mh'] = i18n.translate("NO_ANSWER");
                model['mmc'] = 'O1';
            }
            return !1;
        }
        else if (evalModel != true) {
            //pick specific message for quotient and remainder
            var microHint = (evalModel.context.loc == "Q") ? "mh_q" : "mh_r";
            model['mmc'] = ruleToMmcMhMap[evalModel.id].mmc;
            model['mh'] = i18n.translate(ruleToMmcMhMap[evalModel.id][microHint]);
            return !1;
        }
        else if (Number(model.u.trim()) != Number(model.e.trim())) {
            model['mmc'] = 'C106';
            if (model.loc == 'R' && model.u.trim() == "0") {
                model['mh'] = i18n.translate("NOREMAINDER");
                model['mmc'] = 'C574';
            }
            else if (model.loc == 'R')
                model['mh'] = i18n.translate("GENERICREMAINDER");
            else
                model['mh'] = i18n.translate("GENERICQUOTIENT");
            return !1;
        }
        else {
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
        var variables = this._item.getModelValue("variables");
        var result = { isSolved: true, resValues: [], mmc: [] };
        var models = [];
        _.each(model.model.fibModels, function (m) {
            if (m.w) {
                var mod = {
                    operands: variables.$nums,
                    operators: ['/'],
                    operation: 'Division',
                    loc: m.loc,
                    expected: {
                        quotient: Math.trunc(variables.$nums[0] / variables.$nums[1]),
                        remainder: variables.$nums[0] % variables.$nums[1],
                    },
                    user: {
                        quotient: m.loc == 'Q' ? m.u : null,
                        remainder: m.loc == 'R' ? m.u : null,
                    },
                    type: instance._item.getModelValue("qtype")
                }
                models.push(mod);
            }
        });
        var mIndex = 0;
        // for each fib model call evaluate
        _.each(model.model.fibModels, function (m, k) {
            if (m.w) {
                var evalModel = new DivisionEval().evaluate(models[mIndex], models);
                var res = {};
                res[k] = m.u;
                result.resValues.push(res);
                result.mmc.push(m.mmc);
                m.isCorrect = instance.evaluate(m, evalModel);
                if (!m.isCorrect)
                    result.isSolved = false;
                var fibObject = PluginManager.getPluginObject(k);
                fibObject.onEvaluate();
                mIndex++;
            }
        });
        return result;
    },
    /**
     * returns an array of boolean values. Each of the boolean flags denote whether the
     * FIB in the cell is editable or not.
     * @param {string} number number
     * @returns {array} boolean array
     */
    getMask: function (number) {
        var tokens = number.split(" ").filter(Boolean);
        var mask = new Array(tokens.length).fill(!1);//initially fill array with false
        //mask rhs of the expression
        mask[tokens.length - 1] = !0;
        return mask;
    }
});
