//@ sourceURL=subtractionvertical-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate vertical subtraction problems
 * @extends ftFibBasePlugin
 * @fires table, grid
 * @author Henrietta (henrietta.d@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.subtractionvertical',
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
        var model = item.getModelValue();
        var variables = item.getModelValue("variables");
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
            item.setModelValue("fibModels", {});
        }
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var nums = i18n.translateNumber(variables.$nums, item.getModelValue("numericLangId"));
        this._noOfDigits = variables.$nums[0].toString().length;
        this._noOfDecimalPlaces = model.model.decimalDigits;
        var answer = nums[0].numericalValue;
        for (i = 1; i < nums.length; i++) {
            answer = answer - nums[i].numericalValue
        }
        if (model.model.decimalDigits)
            answer = +answer.toFixed(model.model.decimalDigits);
        // answer = 3;
        model.answer = answer;
        answer = answer.toString();
        if (model.model.decimalDigits) {
            if (Number.isInteger(model.answer)) answer = answer + ".";
            var decimalsInAns = _.isUndefined(answer.toString().split(".")[1]) ? 0 : decimalsInAns = answer.toString().split(".")[1].length;
            if (decimalsInAns < model.model.decimalDigits) {
                for (var k = 0; k < model.model.decimalDigits - decimalsInAns; k++) answer = answer + "0";
            }
        }
        while (answer.toString().length < this._noOfDigits) answer = "0" + answer;
        var correctAns = i18n.translateNumber(answer, item.getModelValue("numericLangId"));
        var ansArray = []
        _.each(_.range(correctAns.displayValue.length), function (i) {
            ansArray.push(correctAns.displayValue[correctAns.displayValue.length - 1 - i]);
        });
        item.setModelValue("ans", correctAns);

        var rowHeight = 7; // in units
        // extra rows for answer,carry and place value
        var rows = variables.$nums.length + 3;
        // extra columns for operation symbol and carry
        var cols = this._noOfDigits + 1;
        var colWidth = 14; // in units
        var gridColumns = (cols * colWidth + 4) / 11.0;
        var offset = (128 - cols * colWidth + 4) / 22.0;
        // qType : 0 - regular
        // qType : 1 - missing operands
        // qType : 2 - missing digits
        var qType = model.model.qType;
        var maskedMatrix = instance.getMaskedMatrix(model, rows, cols, nums);
        var operands = [];
        _.map(nums, function (op) {
            operands.push(_.toArray(op.displayValue.toString()).reverse());
        });
        var borrow = [];
        var borrows = {};
        if (!model.model.decimalDigits) {
            borrow = this.getBorrowDigits(operands);
        } else {
            borrow = this.getBorrowDigitsForDecimal(operands, model.model.decimalDigits)
        }
        borrows = i18n.translateNumber(borrow, item.getModelValue("numericLangId"));
        // matrix containing the values for creating fibModels
        var valueMatrix = [];
        _.each(_.range(rows - 1), function (row) {
            var valRow = [];
            _.each(_.range(cols - 1), function (col) {
                if (row == 0) {
                    if (col == model.model.decimalDigits) valRow.push(null);
                    else
                        valRow.push(!_.isUndefined(borrows[col]) ? borrows[col].displayValue : null);
                } else if (row == (rows - 2)) {
                    valRow.push(!_.isUndefined(ansArray[col]) ? ansArray[col] : null);
                } else {
                    valRow.push(!_.isUndefined(operands[row - 1][col]) ? operands[row - 1][col] : null);
                }
            })
            valueMatrix.push(valRow);
        });
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance,
            // debug: true
        };
        gridData.layout = [];
        var questionRow = {
            type: "row",
            h: 6,
            cols: [],
            id: "questionText"
        }
        gridData.layout.push(questionRow);
        gridData.layout.push({
            type: "gutter",
            h: 4
        });
        var table = {
            type: "row",
            h: rows * rowHeight,
            cols: [{
                type: "offset",
                w: offset
            }, {
                id: "tableCell",
                type: "column",
                w: gridColumns
            }]
        };
        gridData.layout.push(table);
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        // add table in the tableCell created
        var tableCell = PluginManager.getPluginObject("tableCell");
        var tableData = {
            id: _.uniqueId('table'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance,
            // debug: true,
            colCb: this.onColCreated
        };
        tableData.layout = [];

        // add row for Place value
        var pvRow = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "pvRow",
            w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            pvRow.cols.push({
                type: "column",
                w: colWidth,
                id: "pv" + i
            });
        }
        tableData.layout.push(pvRow);

        // add row for borrow
        var borrowRow = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "borrowRow",
            w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            borrowRow.cols.push({
                type: "column",
                w: colWidth,
                id: "borrow" + i
            });
        }
        tableData.layout.push(borrowRow);

        // add rows for operands
        for (i = 0; i < variables.$nums.length; i++) {
            var operandRow = {
                type: "row",
                h: rowHeight,
                cols: [],
                id: "op" + i,
                w: cols * colWidth
            }
            for (a = cols - 1; a >= 0; a--)
                operandRow.cols.push({
                    type: "column",
                    w: colWidth,
                    id: "num" + i + a
                });
            tableData.layout.push(operandRow);
        }

        //add answer row
        var answerRow = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "answer",
            w: cols * colWidth
        }
        for (i = cols - 1; i >= 0; i--) {
            answerRow.cols.push({
                type: "column",
                w: colWidth,
                id: "ans" + i
            });
        }
        tableData.layout.push(answerRow);

        PluginManager.invoke('org.ekstep.funtoot.table', tableData, tableCell, instance._stage, instance._theme);
        // add place value names
        instance.renderPlaceValueRow();
        var borrowInvoledInoperation = instance.isBorrowInvolved(variables.$nums);
        for (i = 0; i < rows - 1; i++) {
            for (j = 0; j < cols - 1; j++) {
                if (maskedMatrix[i][j] != null) {
                    var cell = {};
                    if (i == 0) cell = PluginManager.getPluginObject("borrow" + j);
                    else if (i == rows - 2) cell = PluginManager.getPluginObject("ans" + j);
                    else cell = PluginManager.getPluginObject("num" + (i - 1) + j);
                    var key = "fib" + cell._data.id;
                    if (!data.isSolution) {
                        var fibData = {
                            e: !_.isUndefined(valueMatrix[i][j]) ? valueMatrix[i][j] : '',
                            u: maskedMatrix[i][j] ? '' : !_.isUndefined(valueMatrix[i][j]) ? valueMatrix[i][j] : '',
                            w: maskedMatrix[i][j],
                            isSolution: data.isSolution,
                            isEvaluated: false,
                            isCorrect: false,
                            key: key
                        }
                        var fibM = item.getModelValue().model.fibModels;
                        fibM[key] = fibData;
                    }
                    if (data.isSolution && !borrowInvoledInoperation && key.includes("borrow")) {
                        var fibM = item.getModelValue().model.fibModels;
                        fibM[key].e = "";
                    }
                    item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                    var fib = {
                        id: key,
                        model: "fibModels." + key,
                        w: 100,
                        x: 0,
                        h: 100,
                        y: 0,
                        fontsize: "2.7vw",
                        options: {
                            readonly: {
                                showBgImg: false
                            },
                            "deselected": {
                                "stroke": "#ffffff "
                            }
                        },
                        limit: i == 0 ? 2 : 1
                    };
                    PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
                }
            }
        }

        // add the symbol text
        for (i = 1; i < nums.length; i++) {
            var cell = PluginManager.getPluginObject("num" + i + (cols - 1));
            var textObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                $t: "-",
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, cell, instance._stage, instance._theme);
        }

        // adding the horizontal grid lines
        // add the first lines
        var borrowsRow = PluginManager.getPluginObject("borrowRow");
        var ansRow = PluginManager.getPluginObject("answer");
        var boldLineObj = {
            fill: "#000000",
            stroke: "#000000",
            h: 2,
            w: 100,
            x: 0,
            y: 0,
            type: "rect",
        }
        var defaultLineObj = {
            fill: "#4f4f4f",
            h: 1,
            w: 100,
            x: 0,
            y: 0,
            type: "rect",
        }
        PluginManager.invoke('shape', defaultLineObj, borrowsRow, this._stage, this._theme);
        PluginManager.invoke('shape', boldLineObj, ansRow, this._stage, this._theme);

        for (i = 0; i < nums.length; i++) {
            var numRow = PluginManager.getPluginObject("op" + i);
            if (i == 0) PluginManager.invoke('shape', boldLineObj, numRow, this._stage, this._theme);
            else PluginManager.invoke('shape', defaultLineObj, numRow, this._stage, this._theme);
        }
        // adding the vertical grid lines
        instance.renderVerticalGridLines(cols, tableCell);
    },
    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     */
    onSubmit: function (evt, instance) {
        var model = this._stage._stageController.getModelValue();
        var item = this._stage.getController("item");
        var variables = item.getModelValue("variables");
        var result = {
            isSolved: false,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            // get the i18n plugin object
            var i18n = PluginManager.getPluginObject('i18n_helper');
            // regular Subtraction
            if (model.model.qType == 0) {
                // form the user answer
                var userAns = '';
                _.each(_.range(instance._noOfDigits), function (i) {
                    if (model.model.fibModels['fibans' + (instance._noOfDigits - (i + 1))].u != "") {
                        if (model.model.fibModels['fibans' + (instance._noOfDigits - (i + 1))].u != ".") {
                            var localUserAns = i18n.toNumber(model.model.fibModels['fibans' + (instance._noOfDigits - (i + 1))].u).toString();
                            userAns = userAns + localUserAns;
                        } else userAns = userAns + ".";
                        var res = {};
                        ansFibModel = model.model.fibModels['fibans' + (instance._noOfDigits - (i + 1))]
                        res[ansFibModel.key] = ansFibModel.u;
                        result.resValues.push(res);
                    }

                });
                // if user answer is correct check for any borrow error
                if (userAns != '' && Number(userAns) == model.answer) {
                    result.isSolved = true;
                    // remove error on answerBox if existing
                    var answerContainer = PluginManager.getPluginObject("answerBox");
                    if (answerContainer)
                        instance.clearContainerError(answerContainer);
                    _.each(_.range(instance._noOfDigits), function (j) {
                        var fibM = model.model.fibModels['fibborrow' + j];
                        if (fibM.u != '' && fibM.e != fibM.u) {
                            fibM.isCorrect = false;
                            fibM.mmc = "C719";
                            fibM.mh = i18n.translate("SOLUTION_CORRECT_BORROW_WRONG");
                            var fibObject = PluginManager.getPluginObject(fibM.key);
                            fibObject.onEvaluate();
                            result.mmc.push(fibM.mmc);
                            result.isSolved = false;
                        }
                        var res = {};
                        res[fibM.key] = fibM.u;
                        result.resValues.push(res);
                    });
                    if (result.isSolved) {
                        _.each(model.model.fibModels, function (fib) {
                            if (Number(fib.u) > 0) {
                                fib.isCorrect = true;
                                var fibObject = PluginManager.getPluginObject(fib.key);
                                fibObject.onEvaluate();
                            }
                        })
                    }
                } else {
                    var answerContainer = PluginManager.getPluginObject("answerBox");
                    var showErrorOnAns = false;
                    var userBorrowArray = [];
                    var expectedBorrow = [];
                    if (model.model.decimalDigits) {
                        showErrorOnAns = true;
                        if (userAns == '') model.model["answerMh"] = {
                            mh: i18n.translate("NO_ANSWER")
                        }
                        else if (instance.isDecimalMissed(userAns, model.answer.toString())) {
                            model.model["answerMh"] = {
                                mh: i18n.translate("DECIMAL_MISSED")
                            }
                        } else {
                            model.model["answerMh"] = {
                                mh: instance.isBorrowInvolved(variables.$nums) ? i18n.translate("DECIMAL_SUB_WITH_BORROW") : i18n.translate("DECIMAL_SUB_WITHOUT_BORROW")
                            }

                        }
                        model.model.answerMh["mmc"] = "DECIMAL_SUB";
                        result.mmc.push("DECIMAL_SUB");
                        result.isSolved = false;
                    } else {
                        _.each(_.range(instance._noOfDigits), function (j) {
                            userBorrowArray.push(model.model.fibModels['fibborrow' + j].u);
                            expectedBorrow.push(model.model.fibModels['fibborrow' + j].e);
                        });
                        var evalModel = {
                            digits: instance._noOfDigits,
                            operands: variables.$nums,
                            operations: ["-"],
                            operation: 'Subtraction',
                            expected: {
                                answer: model.answer,
                                carry: null,
                                borrow: expectedBorrow
                            },
                            user: {
                                answer: userAns,
                                carry: null,
                                borrow: userBorrowArray
                            },
                            type: 'vertical',
                            errorAnsCol: instance.getAnsErrorColumn(model, userAns),
                        };
                        // check for atypical mistakes specified
                        var evalResult = new AdditionEval().evaluate(evalModel);
                        // if no rule is satisfied
                        if (evalResult == true) {
                            // get the total number of errors
                            var errorCount = 0;
                            _.each(model.model.fibModels, function (m, k) {
                                if (m.w && m.e != null) {
                                    if (m.e != m.u && i18n.toNumber(m.u) > 0) {
                                        errorCount++;
                                    }
                                }
                            });
                            // if error count is less than 3 give specific errors for each digit
                            if (errorCount < 3 && userAns != '') {
                                // clear if microhint is given on answer box
                                var answerContainer = PluginManager.getPluginObject("answerBox");
                                if (answerContainer)
                                    instance.clearContainerError(answerContainer);
                                _.each(model.model.fibModels, function (fib) {
                                    if (fib.e != null && i18n.toNumber(fib.e) >= 0) {
                                        if (fib.key.includes("borrow") && !i18n.toNumber(fib.u) > 0) {
                                            // don't evaluate if borrow isn't given
                                        } else {
                                            fib.isCorrect = fib.e == fib.u;
                                            if (!fib.isCorrect) {
                                                fib.mmc = "C257";
                                                result.mmc.push("C257");
                                                if (instance.isBorrowInvolved(variables.$nums) && fib.key.includes("carry")) {
                                                    fib.mh = i18n.translate("VERTICAL_WITH_BORROW");
                                                } else
                                                    fib.mh = (fib.u == '') ? i18n.translate("NO_ANSWER") : i18n.translate("VERTICAL_WITHOUT_BORROW");
                                            }
                                            var fibObject = PluginManager.getPluginObject(fib.key);
                                            fibObject.onEvaluate();
                                        }
                                    }

                                });
                            }
                            // if error count is greater than 3 give generic error on answer box
                            else {
                                model.model["answerMh"] = {
                                    mh: (userAns == '') ? i18n.translate("NO_ANSWER") : i18n.translate("GENERIC_MH")
                                }
                                model.model.answerMh["mmc"] = "01";
                                result.mmc.push("C257");
                                showErrorOnAns = true;
                                // remove microhints on digits if visible
                                _.each(model.model.fibModels, function (fib) {
                                    var mhIcon = PluginManager.getPluginObject(fib.key + '-mh-mhicon');
                                    if (mhIcon) {
                                        mhIcon._self.visible = false;
                                        mhIcon._data.visible = false;
                                    }
                                });
                            }
                        }
                        // map MMC and microhint according to the rule
                        else {
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
                            result.mmc.push(ruleToMmcMhMap[evalResult.id].mmc);
                            model.model["answerMh"] = {
                                mh: i18n.translate(ruleToMmcMhMap[evalResult.id].mh),
                                mmc: ruleToMmcMhMap[evalResult.id].mmc
                            }
                            showErrorOnAns = true;
                            // remove microhints on digits if visible
                            _.each(model.model.fibModels, function (fib) {
                                var mhIcon = PluginManager.getPluginObject(fib.key + '-mh-mhicon');
                                if (mhIcon) {
                                    mhIcon._self.visible = false;
                                    mhIcon._data.visible = false;
                                }
                            });
                            // remove common micro-hint if visible
                            var tbcobj = PluginManager.getPluginObject('answerBox-mh-mhicon');
                            if (tbcobj) {
                                tbcobj._self.visible = false;
                                tbcobj._data.visible = false;
                            }
                        }
                    }

                }
                // create a container on answerBox and attach corresponding microhint to it
                if (showErrorOnAns) {
                    var answerRow = PluginManager.getPluginObject("answer");
                    var totalCols = instance._noOfDigits + 1;
                    var answerContainerObj = {
                        x: 100.0 / totalCols,
                        y: 0,
                        h: 100,
                        w: ((totalCols - 1) * 100.0) / totalCols,
                        id: "answerBox"
                    };
                    PluginManager.invoke('g', answerContainerObj, answerRow, instance._stage, instance._theme);
                    answerContainer = PluginManager.getPluginObject("answerBox");
                    answerContainer.onMicroHint =
                        function (e) {
                            var mhModel = model.model["answerMh"];
                            var mhData = {};
                            mhData.title = 'Micro hint';
                            mhData.type = "mh";
                            mhData.containerId = '_ft_microhint_content_container__';
                            mhData.x = 10;
                            mhData.y = 10;
                            mhData.w = 80;
                            mhData.h = 60;
                            mhData.content = mhModel.mh;
                            mhData.mmc = mhModel.mmc;
                            return mhData;
                        }
                    var microhint = Object.create(null);
                    microhint.id = 'answerBox-mh';
                    microhint.attachTo = "answerBox";
                    microhint.mhPos = 'top-left';
                    microhint.visible = true;
                    // if (this.areMicrohintsEnabled()) {
                    PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);
                    var shapeObj = {
                        stroke: "#e42012",
                        h: 100,
                        w: 100,
                        x: 0,
                        y: 0,
                        type: "rect",
                        id: "answerBox-shape"
                    }
                    PluginManager.invoke('shape', shapeObj, answerContainer, instance._stage, instance._theme);
                    var tbcobj = PluginManager.getPluginObject('answerBox-mh-mhicon');
                    tbcobj._self.visible = true;
                    tbcobj._data.visible = true;
                    // }
                }
            }
            // missing subtrahend
            else if (model.model.qType == 1) {
                var maskedRow = model.maskedRow;
                var userAns = '';
                // form the user answer
                var operandDigits = variables.$nums[maskedRow - 1].toString().length;
                for (i = 0; i < operandDigits; i++) {
                    var localUserAns = i18n.toNumber(model.model.fibModels['fibnum' + (maskedRow - 1) + (operandDigits - 1 - i)].u).toString();
                    if (model.model.fibModels['fibnum' + (maskedRow - 1) + (operandDigits - 1 - i)].u != '')
                        userAns = userAns + localUserAns;
                    var res = {}
                    fibAnsBox = model.model.fibModels['fibnum' + (maskedRow - 1) + (operandDigits - 1 - i)];
                    res[fibAnsBox.key] = fibAnsBox.u;
                    result.resValues.push(res);
                }
                var opContainer = PluginManager.getPluginObject("operand" + (maskedRow - 1));
                // if answer is correct check for borrow error
                if (Number(userAns) == variables.$nums[maskedRow - 1]) {
                    result.isSolved = true;
                    if (opContainer) instance.clearContainerError(opContainer);
                    _.each(_.range(instance._noOfDigits), function (j) {
                        var fibM = model.model.fibModels['fibborrow' + j];
                        var res = {};
                        res[fibM.key] = fibM.u;
                        result.resValues.push(res);
                        if (i18n.toNumber(fibM.u) > 0 && fibM.e != fibM.u) {
                            fibM.isCorrect = false;
                            fibM.mmc = "C719";
                            fibM.mh = i18n.translate("SOLUTION_CORRECT_BORROW_WRONG");
                            var fibObject = PluginManager.getPluginObject(fibM.key);
                            fibObject.onEvaluate();
                            result.mmc.push(fibM.mmc);
                            result.isSolved = false;
                        }
                    });
                    if (result.isSolved) {
                        _.each(model.model.fibModels, function (fib) {
                            if (!(fib.key.includes("borrow") && Number(fib.u) == 0)) {
                                fib.isCorrect = true;
                                var fibObject = PluginManager.getPluginObject(fib.key);
                                fibObject.onEvaluate();
                            }
                        })
                    }
                }
                // in case of wrong answer create a container to the missing addend box and invoke ftMicrohint on it
                else {
                    var mh = "";
                    var mmc = "C714";
                    if (Number(userAns) == model.answer)
                        mh = i18n.translate("MISSING_NO_DIFFERENCE_AS_ANSWER");
                    else {
                        var ansEqualsOperand = false;
                        var nums = variables.$nums;
                        _.each(nums, function (num, i) {
                            if (i != maskedRow - 1) {
                                if (num == userAns) {
                                    ansEqualsOperand = true;
                                }
                            }
                        })
                        if (userAns == '')
                            mh = i18n.translate("NO_ANSWER");
                        else if (ansEqualsOperand)
                            mh = i18n.translate("MISSING_NO_GIVEN_SUBTRAHEND_AS_ANSWER");
                        else
                            mh = i18n.translate("MISSING_NO_WRONG_SUBTRAHEND");
                    }
                    model.model["operand" + (maskedRow - 1)] = {
                        mh: mh,
                        mmc: mmc
                    };
                    result.mmc.push(mmc);
                    var addendRow = PluginManager.getPluginObject("op" + (maskedRow - 1));
                    var totalCols = instance._noOfDigits + 1;
                    var operandContainerObj = {
                        x: ((totalCols - operandDigits) * 100.0) / totalCols,
                        y: 0,
                        h: 100,
                        w: (operandDigits * 100.0) / totalCols,
                        id: "operand" + (maskedRow - 1)
                    };
                    PluginManager.invoke('g', operandContainerObj, addendRow, instance._stage, instance._theme);
                    opContainer = PluginManager.getPluginObject("operand" + (maskedRow - 1));
                    opContainer.onMicroHint =
                        function (e) {
                            var mhModel = model.model["operand" + (maskedRow - 1)];
                            var mhData = {};
                            mhData.title = 'Micro hint';
                            mhData.type = "mh";
                            mhData.containerId = '_ft_microhint_content_container__';
                            mhData.x = 10;
                            mhData.y = 10;
                            mhData.w = 80;
                            mhData.h = 60;
                            mhData.content = mhModel.mh;
                            mhData.mmc = mhModel.mmc;
                            return mhData;
                        }
                    // opContainer.onMicroHint = instance.onMicroHint(mh);
                    //        setTimeout((function () {
                    var microhint = Object.create(null);
                    microhint.id = "operand" + (maskedRow - 1) + '-mh';
                    microhint.attachTo = "operand" + (maskedRow - 1);
                    microhint.mhPos = 'top-left';
                    microhint.visible = true;
                    PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);
                    //    }.bind(this)), 1000);
                    var shapeObj = {
                        stroke: "#e42012",
                        h: 100,
                        w: 100,
                        x: 0,
                        y: 0,
                        type: "rect",
                        id: "operand" + (maskedRow - 1) + "-shape"
                    }
                    PluginManager.invoke('shape', shapeObj, opContainer, instance._stage, instance._theme);
                    var tbcobj = PluginManager.getPluginObject("operand" + (maskedRow - 1) + '-mh-mhicon');
                    tbcobj._self.visible = true;
                    tbcobj._data.visible = true;
                }
            }
            // missing digits, evaluate each writable box
            else {
                result.isSolved = true;
                _.each(model.model.fibModels, function (fib, k) {
                    if (fib.w) {
                        var res = {};
                        res[fib.key] = fib.u;
                        result.resValues.push(res);
                    }

                    if (fib.e != fib.u) {
                        if (fib.key.includes("num")) {
                            fib.isCorrect = false;
                            result.isSolved = false;
                            fib.mmc = "C714";
                            fib.mh = (fib.u == '') ? i18n.translate("NO_ANSWER") : i18n.translate("WRONG_MISSING_DIGIT");
                        } else if (fib.key.includes("borrow")) {
                            if (fib.u != "") {
                                fib.isCorrect = false;
                                result.isSolved = false;
                                fib.mmc = "C526";
                                fib.mh = i18n.translate("BORROW_WRONG");
                            } else
                                fib.isCorrect = true;
                        }
                        if (!fib.isCorrect)
                            result.mmc.push(fib.mmc);
                        var fibObject = PluginManager.getPluginObject(k);
                        fibObject.onEvaluate();
                    } else
                        fib.isCorrect = true;
                })
            }
            Renderer.update = !0
            return result;
        } else return false
    },

    /**
     * get the column from left where the first error has been committed
     * @param {object} model
     * @returns {int} columnNum
     */
    getAnsErrorColumn: function (model) {
        var expectedAnswer = model.answer.toString();
        for (i = 0; i <= this._noOfDigits; i++) {
            var fibModel = model.model.fibModels['fibans' + (i)];
            if (fibModel.u != fibModel.e)
                return i;
        }
    },
    /**
     * remove error from container
     * @param{Object} container
     */
    clearContainerError: function (container) {
        var mhobj = PluginManager.getPluginObject(container._id + '-mh-mhicon');
        mhobj._self.visible = false;
        mhobj._data.visible = false;
        var shapeObj = PluginManager.getPluginObject(container._id + '-shape');
        shapeObj._self.graphics._stroke.style = null;
    },
    /**
     * Check if the subtraction involves borrow and returns the expected borrow digits as array
     * @param {Array} operands
     * @returns {array}  array of expected borrow digits
     */
    getBorrowDigits: function (operands) {
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var lId = this._item.getModelValue("numericLangId")
        var zero = i18n.getNumbers(lId)[0];
        var digitsArray = [];
        _.each(operands, function (digit, i) {
            digitsArray[i] = i18n.toNumber(digit).toString();
            if (i == 0 && digit[0] == zero)
                digitsArray[i] = "0" + digitsArray[i];
        })
        var borrowDigits = [];
        for (i = 0; i < digitsArray.length - 1; i++) {
            var isBorrow = [];
            for (j = 0; j < digitsArray[0].length; j++) {
                //if subtrahend is undefined then assume zero
                var subtrahent = _.isUndefined(digitsArray[i + 1][j]) ? 0 : digitsArray[i + 1][j]
                if (Number(digitsArray[i][j]) < Number(subtrahent)) {
                    isBorrow.push(true);
                    if (j != 0 && isBorrow[j - 1])
                        borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                    else
                        borrowDigits.push(Number(digitsArray[i][j]) + 10);
                } else {
                    if (isBorrow[j - 1]) {
                        if (Number(digitsArray[i][j]) - 1 < Number(subtrahent)) {
                            isBorrow.push(true);
                            borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                        } else {
                            isBorrow.push(false);
                            if (Number(digitsArray[i][j]) - 1 < 0)
                                borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                            else
                                borrowDigits.push(Number(digitsArray[i][j]) - 1);
                        }
                    } else {
                        isBorrow.push(false);
                        borrowDigits.push(Number(digitsArray[i][j]));
                    }
                }
            }
        }
        return borrowDigits;
    },
    getBorrowDigitsForDecimal: function (operands, decimalDigits) {
        var borrowDigits = [];
        var digitsArray = [];
        var i18n = PluginManager.getPluginObject('i18n_helper');
        for (i = 0; i < operands.length; i++) {
            var num = [];
            for (j = 0; j < operands[i].length; j++) {
                if (operands[i][j] != ".")
                    num.push(i18n.toNumber(operands[i][j]).toString());
                else
                    num.push(".");
            }
            digitsArray.push(num);
        }
        for (i = 0; i < digitsArray.length - 1; i++) {
            var isBorrow = [];
            for (j = 0; j < digitsArray[0].length; j++) {
                //if subtrahend is undefined then assume zero
                if (j == decimalDigits) {
                    borrowDigits.push(0);
                    isBorrow.push(false);
                } else {
                    var subtrahent = _.isUndefined(digitsArray[i + 1][j]) ? 0 : digitsArray[i + 1][j]
                    if (Number(digitsArray[i][j]) < Number(subtrahent)) {
                        isBorrow.push(true);
                        if (j == decimalDigits + 1) {
                            if (j != 0 && isBorrow[j - 2])
                                borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                            else
                                borrowDigits.push(Number(digitsArray[i][j]) + 10);
                        } else {
                            if (j != 0 && isBorrow[j - 1])
                                borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                            else
                                borrowDigits.push(Number(digitsArray[i][j]) + 10);
                        }

                    } else {
                        if (j == decimalDigits + 1) {
                            if (isBorrow[j - 2]) {
                                if (Number(digitsArray[i][j]) - 1 < Number(subtrahent)) {
                                    isBorrow.push(true);
                                    borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                                } else {
                                    isBorrow.push(false);
                                    if (Number(digitsArray[i][j]) - 1 < 0)
                                        borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                                    else
                                        borrowDigits.push(Number(digitsArray[i][j]) - 1);
                                }
                            } else {
                                isBorrow.push(false);
                                borrowDigits.push(Number(digitsArray[i][j]));
                            }
                        } else {
                            if (isBorrow[j - 1]) {
                                if (Number(digitsArray[i][j]) - 1 < Number(subtrahent)) {
                                    isBorrow.push(true);
                                    borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                                } else {
                                    isBorrow.push(false);
                                    if (Number(digitsArray[i][j]) - 1 < 0)
                                        borrowDigits.push(Number(digitsArray[i][j]) - 1 + 10);
                                    else
                                        borrowDigits.push(Number(digitsArray[i][j]) - 1);
                                }
                            } else {
                                isBorrow.push(false);
                                borrowDigits.push(Number(digitsArray[i][j]));
                            }
                        }
                    }
                }

            }
        }
        return borrowDigits;
    },
    /**
     * Check if the subtraction involves borrow
     * @param {Array} operands
     * @returns {boolean}  true if borrow is involved
     */
    isBorrowInvolved: function (operands) {
        var digitsArray = []
        _.map(operands, function (op) {
            digitsArray.push(_.toArray(op.toString()).reverse());
        });
        for (i = 0; i < digitsArray.length - 1; i++) {
            for (j = 0; j < digitsArray[0].length; j++) {
                if (digitsArray[i][j] != ".")
                    if (Number(digitsArray[i][j]) < Number(digitsArray[i + 1][j]))
                        return true;
            }
        }
        return false;
    },
    /**
     * create a boolean matrix which represents all the boxes.
     * true - hide the value
     * false - show the value of the box
     */
    getMaskedMatrix: function (model, rows, cols, nums) {
        var qType = model.model.qType;
        var maskedMatrix = [];
        if (qType == 0 || qType == 1) {
            // row number to be masked
            var maskedRow = rows - 2;
            if (qType == 1) {
                maskedRow = _.random(1, rows - 3);
                model.maskedRow = maskedRow;
            }
            _.each(_.range(rows - 1), function (row) {
                var rowMask = [];
                _.each(_.range(cols - 1), function (col) {
                    if (row == maskedRow || row == 0) rowMask.push(true);
                    else rowMask.push(false);
                });
                maskedMatrix.push(rowMask);
            });
        } else {
            _.each(_.range(rows - 1), function (row) {
                var rowMask = [];
                _.each(_.range(cols - 1), function (col) {
                    rowMask.push(false);
                });
                maskedMatrix.push(rowMask);
            })
            // mask random digits

            var array = _.shuffle(_.range(1, rows - 2));
            for (i = 0; i < this._noOfDigits; i++) {
                var index = i - ((array.length) * Math.floor(i / array.length));
                maskedMatrix[array[index]][i] = true;
            }

            // mask borrow row
            for (i = 0; i < cols - 1; i++) {
                maskedMatrix[0][i] = true;
            }
        }
        return maskedMatrix;
    },
    /**
     * add place value name for each column
     * @param{integer} maximum no. of digits in operands
     */
    renderPlaceValueRow: function () {
        var pvVal = [];
        var pvValWholeNums = ["U", "T", "H", "Th", "T Th", "L", "T L", "Cr", "T Cr"];
        var pvDecimal = ["tth", "th", "h", "t"];
        var decimalDigits = this._noOfDecimalPlaces;
        if (decimalDigits) {
            var decArray = pvDecimal.slice((-1 * decimalDigits));
            var wholeNums = pvValWholeNums.slice(0, this._noOfDigits - decimalDigits - 1);
            pvVal = decArray.concat([""], wholeNums);
        } else {
            pvVal = pvValWholeNums;
        }
        // add place value names
        for (i = 0; i < this._noOfDigits; i++) {
            var pv = PluginManager.getPluginObject("pv" + i);
            var textObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                h: "100",
                w: 100,
                x: 0,
                y: 0,
                $t: pvVal[i],
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, pv, this._stage, this._theme);
        }
    },
    /**
     * renders vertical grid lines
     * @param{integer,Object} no. of columns, tableCell
     */
    renderVerticalGridLines: function (cols, tableCell) {
        // adding the vertical grid lines
        for (i = 0; i < cols - 1; i++) {
            var lineObj = {
                x: (100.0 / cols) * (i + 1),
                y: 0,
                h: 100,
                w: 0.5,
                id: "line" + i
            }
            PluginManager.invoke('g', lineObj, tableCell, instance._stage, instance._theme);
            var line = PluginManager.getPluginObject("line" + i);
            var verticalShapeObj = {
                fill: "#4f4f4f",
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                type: "rect",
            }
            PluginManager.invoke('shape', verticalShapeObj, line, instance._stage, instance._theme);
        }
    },
    isDecimalMissed: function (userAns, expectedAnswer) {
        if (expectedAnswer.replace(".", "") == userAns) return true;
        else return false;
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
            if (b.w & !(b.e == null || b.e == "" || b.key.includes("borrow"))) {
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