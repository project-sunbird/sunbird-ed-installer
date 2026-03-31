//@ sourceURL=subtractionhorizontalbase-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate horizontal subtraction problems
 * @extends ftFibBasePlugin
 * @author Henrietta D <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.subtractionhorizontalbase',
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
        var numericLangId = item.getModelValue("numericLangId")
        var ans = _.reduce(nums, function (memo, num) {
            return memo - Number(num);
        });
        variables.$ans = i18n.translateNumber(ans, numericLangId).displayValue;
        nums = i18n.translateNumber(nums, numericLangId);
        //extracting list of 'displayValue' values.
        nums = _.pluck(nums, 'displayValue');
        //form the lhs part by joining the numbers with '-'
        var lhs = nums.join().replace(/,/g, ' - ');
        var qTitleFontSize = this.getFontSize(data.isSolution);
        //Vary fontsize depending on number of operands, if there are only 2 operands fontsize= 5.0vw if more than 2 operands then fontsize=4.0vw.
        var defaultFontSize = nums.length < 3 ? this.getFontSize(data.isSolution, 5.0) : this.getFontSize(data.isSolution, 4.0);
        var step = lhs + " = " + variables.$ans;
        var missingSubtrahend = Boolean(item.getModelValue("missingSubtrahend"));
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        var tokens = step.split(" ").filter(e => String(e).trim());
        var maskedArray = this.getMask(step, missingSubtrahend);
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
     * custom evaluation for horizontal subtraction
     * populates the micro hint message and mmc depending on the user answer
     * refer: <https://docs.google.com/document/d/1NX3zayPeFbBBLOIl4Nha-7_IoGw-tlXgjHVjjT9w4Pg/edit#heading=h.yp3ky2nqr1lf>
     * @param {object} the model associated with the FIB plugin
     * @returns {boolean}
     */
    evaluate: function (model, evalModel) {
        evalModel = _.isUndefined(evalModel) ? true : evalModel;
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = this._item.getModelValue("variables");
        var missingSubtrahend = Boolean(this._item.getModelValue("missingSubtrahend"));
        var operands = variables.$nums;
        //check if one of the number is single digit
        var isOneOfTheSubtrahendSingleDigit = false;
        for (i = 0; i < operands.length; i++) {
            if (operands[i].toString().length == 1)
                isOneOfTheSubtrahendSingleDigit = true;
        }
        //check if subtraction of numbers involve borrow
        var isBorrow = false;
        var digitsArray = []
        //convert each operand into array of digits
        _.map(operands, function (op) {
            digitsArray.push(_.toArray(op.toString()).reverse());
        });
        //for each place value check if borrow is involved
        for (i = 0; i < digitsArray.length - 1; i++) {
            for (j = 0; j < digitsArray[0].length; j++) {
                if (Number(digitsArray[i][j]) < Number(digitsArray[i + 1][j]))
                    isBorrow = true;
            }
        }
        var ruleToMmcMhMap = {
            isSum: {
                mmc: "C86",
                mh: "ADDING_NUMBERS"
            },
            isSameNumber: {
                mmc: "C544",
                mh: "SAME_NUMBERS"
            },
            isSubtrahendDigitZero: {
                mmc: "C544",
                mh: "ONE_SUBTRAHEND_IS_ZERO"
            },
            subtractFromLargerNumber: {
                mmc: "C716",
                mh: "SUBTRACTING_FROM_LARGER_NUMBER"
            },
            notDecrementingAfterBorrow: {
                mmc: "C717",
                mh: "NOT_DECEREMENTING_AFTER_BORROW"
            },
        };
        if (model.u.trim() == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (evalModel != true) {
            model['mh'] = i18n.translate(ruleToMmcMhMap[evalModel.id].mh);
            model['mmc'] = ruleToMmcMhMap[evalModel.id].mmc;
            return !1;
        } else if (model.u.trim() != model.e.trim()) {
            if (!missingSubtrahend && isOneOfTheSubtrahendSingleDigit) {
                model['mh'] = i18n.translate("ONE_SUBTRAHEND_IS_SINGLE_DIGIT");
                model['mmc'] = "C257";
            } else if (!missingSubtrahend && variables.$nums.length > 2) {
                model['mh'] = i18n.translate("MORE_THAN_2_NUMBERS");
                model['mmc'] = "C111";
            } else if (missingSubtrahend) {
                var modelArray = this._item.getModelValue("modelArray");
                var displayedOperand = "";
                _.each(modelArray, function (m) {
                    if (!m.w && m.content.trim() == model.u.trim() && m.content.trim() != variables.$ans.trim())
                        displayedOperand = m.content;
                });
                model['mmc'] = "C714";
                if (model.u.toString().trim() === variables.$ans.toString().trim())
                    model['mh'] = i18n.translate("MISSING_NO_DIFFERENCE_AS_ANSWER");
                else if (model.u.toString().trim() == displayedOperand.toString().trim())
                    model['mh'] = i18n.translate("MISSING_NO_GIVEN_SUBTRAHEND_AS_ANSWER");
                else
                    model['mh'] = i18n.translate("MISSING_NO_WRONG_SUBTRAHEND");
            } else {
                model['mmc'] = "C258";
                if (isBorrow)
                    model['mh'] = i18n.translate("HORIZONTAL_WITH_BORROW");
                else
                    model['mh'] = i18n.translate("HORIZONTAL_WITHOUT_BORROW");
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
        var variables = this._item.getModelValue("variables");
        var missingSubtrahend = Boolean(this._item.getModelValue("missingSubtrahend"));
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                if (m.w) {
                    var evalModel = new AdditionEval().evaluate(mod = {
                        operands: variables.$nums,
                        operators: ['-'],
                        operation: 'Subtraction',
                        expected: {
                            answer: i18n.toNumber(variables.$ans).toString(),
                            carry: null,
                            borrow: null
                        },
                        user: {
                            answer: i18n.toNumber(m.u).toString(),
                            carry: null,
                            borrow: null
                        },
                        type: 'horizontal'
                    });
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);
                    m.isCorrect = missingSubtrahend ? instance.evaluate(m) : instance.evaluate(m, evalModel);
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
     * returns an array of boolean values. Each of the boolean flags denote whether the
     * FIB in the cell is editable or not.
     * @param {string} number in expanded form
     * @param {string} toMask specifies which position to mask
     * @param {boolean} isStandardForm if expected answer is in standard form
     * @returns {array} boolean array
     */
    getMask: function (number, missingSubtrahend) {
        var tokens = number.split(" ").filter(e => String(e).trim());
        var mask = new Array(tokens.length).fill(!1); //initially fill array with false
        if (!missingSubtrahend) {
            //if answer is expected in standard form mask rhs of the expression
            mask[tokens.length - 1] = !0;
            return mask;
        } else {
            //generate a number array of length equal to the lhs (num1 + num2)
            var numberArray = new Array(mask.length - 2);
            for (var i = 0; i < numberArray.length; i++) {
                numberArray[i] = i;
            }
            //get all the even numbers from the array since numbers to be masked are in even index, operators are in odd index
            var even = _.filter(numberArray, function (num) {
                return num % 2 == 0;
            });
            //choose one even index to be masked
            var index = _.shuffle(even)[0];
            mask[index] = true;
            return mask;
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