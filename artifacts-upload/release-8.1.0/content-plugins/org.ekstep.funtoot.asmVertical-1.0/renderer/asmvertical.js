//@ sourceURL=asmVertical.js
/* global PluginManager */
/**
 * This plugin is used to generate asm vertical problems 
 * @extends ftFibBasePlugin
 * @fires mtfOptionBuilder, grid
 * @author Amulya (amulya.k@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
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
        model.answer = answer;
        var correctAns = i18n.translateNumber(answer, item.getModelValue("numericLangId"));
        var ansArray = []
        _.each(_.range(correctAns.displayValue.length), function (i) {
            ansArray.push(correctAns.displayValue[correctAns.displayValue.length - 1 - i]);
        });
        item.setModelValue("ans", correctAns);
        var rowHeight = 7; // in units
        var rows = variables.$nums.length + 3;
        var cols = model.model.digits + 2;
        var colWidth = 14; // in units
        var gridColumns = (cols * colWidth + 4) / 11.0;
        var offset = (128 - cols * colWidth + 4) / 22.0;
        // qType : 0 - regular
        // qType : 1 - missing operands
        // qType : 2 - missing digits
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
            for (i = 1; i <= nums.length; i++) {
                maskedMatrix[i][cols - 2] = null;
            }
            maskedMatrix[0][0] = null;
        }
        else {
            _.each(_.range(rows - 1), function (row) {
                var rowMask = [];
                _.each(_.range(cols - 1), function (col) {
                    rowMask.push(false);
                });
                maskedMatrix.push(rowMask);
            })
            // mask random digits

            var array = _.shuffle(_.range(1, rows - 2));
            for (i = 0; i < model.model.digits; i++) {
                var index = i - ((array.length) * Math.floor(i / array.length));
                maskedMatrix[array[index]][i] = true;
            }

            // mask carry row
            for (i = 0; i < cols - 1; i++) {
                if (i == 0) maskedMatrix[0][i] = null;
                else maskedMatrix[0][i] = true;
            }
        }
        var operands = [];
        _.each(nums, function (num, i) {
            var numStr = num.displayValue;
            var numArray = [];
            _.each(_.range(numStr.length), function (j) {
                numArray.push(numStr[numStr.length - 1 - j]);
            });
            operands.push(numArray);
        });

        var carry = [];
        carry.push('');
        for (i = 0; i < model.model.digits; i++) {
            var sum = 0;
            _.each(operands, function (operand) {
                if (operand[i])
                    sum += i18n.toNumber(operand[i]);
            });
            if (i != 0)
                sum = sum + carry[i - 1];
            if (sum >= 10) carry.push(Math.floor(sum / 10));
            else carry.push('');
        }
        var carryOvers = i18n.translateNumber(carry, item.getModelValue("numericLangId"));

        // matrix containing the values for creating fibModels
        var valueMatrix = [];
        _.each(_.range(rows - 1), function (row) {
            var valRow = [];
            _.each(_.range(cols - 1), function (col) {
                if (row == 0) {
                    valRow.push(!_.isUndefined(carryOvers[col]) ? carryOvers[col].displayValue : null);
                }
                else if (row == (rows - 2)) {
                    valRow.push(!_.isUndefined(ansArray[col]) ? ansArray[col] : null);
                }
                else {
                    valRow.push(!_.isUndefined(operands[row - 1][col]) ? operands[row - 1][col] : null);
                }
            })
            valueMatrix.push(valRow);
        });
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
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        // add table in the tableCell created
        var tableCell = PluginManager.getPluginObject("tableCell");
        var tableData = {
            id: _.uniqueId('table'),
            w: 100, h: 100, x: 0, y: 0,
            cbObj: instance,
            // debug: true,
            colCb: this.onColCreated
        };
        tableData.layout = [];

        // add row for Place value
        var pvRow = {
            type: "row", h: rowHeight, cols: [], id: "pvRow", w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            pvRow.cols.push({ type: "column", w: colWidth, id: "pv" + i });
        }
        tableData.layout.push(pvRow);

        // add row for carry or borrow
        var carryRow = {
            type: "row", h: rowHeight, cols: [], id: "carryRow", w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            carryRow.cols.push({ type: "column", w: colWidth, id: "carry" + i });
        }
        tableData.layout.push(carryRow);

        // add rows for operands
        for (i = 0; i < variables.$nums.length; i++) {
            var operandRow = { type: "row", h: rowHeight, cols: [], id: "op" + i, w: cols * colWidth }
            for (a = cols - 1; a >= 0; a--)
                operandRow.cols.push({ type: "column", w: colWidth, id: "num" + i + a });
            tableData.layout.push(operandRow);
        }

        //add answer row
        var answerRow = { type: "row", h: rowHeight, cols: [], id: "answer", w: cols * colWidth }
        for (i = cols - 1; i >= 0; i--) {
            answerRow.cols.push({ type: "column", w: colWidth, id: "ans" + i });
        }
        tableData.layout.push(answerRow);

        PluginManager.invoke('org.ekstep.funtoot.table', tableData, tableCell, instance._stage, instance._theme);
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

        for (i = 0; i < rows - 1; i++) {
            for (j = 0; j < cols - 1; j++) {
                if (maskedMatrix[i][j] != null) {
                    var cell = {};
                    if (i == 0) cell = PluginManager.getPluginObject("carry" + j);
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
                    item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                    var fib = Object.create(data);
                    fib.id = key;
                    fib.model = "fibModels." + key;
                    fib.w = 100;
                    fib.x = 0;
                    fib.h = 100;
                    fib.y = 0;
                    fib.fontsize = "2.7vw";
                    // fib.state = "nostroke";
                    fib.options = {
                        readonly: { showBgImg: false },
                        "deselected": {
                            "stroke": "#ffffff "
                        }
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
                h: 100, w: 100, x: 0, y: 0,
                $t: "+",
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, cell, instance._stage, instance._theme);
        }

        // adding the horizontal grid lines
        // add the first lines
        var carryOverRow = PluginManager.getPluginObject("carryRow");
        var ansRow = PluginManager.getPluginObject("answer");
        var boldLineObj = {
            fill: "#000000", stroke: "#000000",
            h: 2, w: 100, x: 0, y: 0, type: "rect",
        }
        var defaultLineObj = {
            fill: "#4f4f4f",
            h: 1, w: 100, x: 0, y: 0, type: "rect",
        }
        PluginManager.invoke('shape', defaultLineObj, carryOverRow, this._stage, this._theme);
        PluginManager.invoke('shape', boldLineObj, ansRow, this._stage, this._theme);

        for (i = 0; i < nums.length; i++) {
            var numRow = PluginManager.getPluginObject("op" + i);
            if (i == 0) PluginManager.invoke('shape', boldLineObj, numRow, this._stage, this._theme);
            else PluginManager.invoke('shape', defaultLineObj, numRow, this._stage, this._theme);
        }

        // adding the vertical grid lines
        for (i = 0; i < cols - 1; i++) {
            var lineObj = {
                x: (100.0 / cols) * (i + 1), y: 0, h: 100, w: 0.5, id: "line" + i
            }
            PluginManager.invoke('g', lineObj, tableCell, instance._stage, instance._theme);
            var line = PluginManager.getPluginObject("line" + i);
            var verticalShapeObj = {
                fill: "#4f4f4f",
                h: 100, w: 100, x: 0, y: 0, type: "rect",
            }
            PluginManager.invoke('shape', verticalShapeObj, line, instance._stage, instance._theme);
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
        var item = this._stage.getController("item");
        var variables = item.getModelValue("variables");
        var result = { isSolved: false, resValues: [], mmc: [] };
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        // regular addition
        if (model.model.qType == 0) {
            // form the user answer
            var userAns = '';
            _.each(_.range(model.model.digits + 1), function (i) {
                userAns = userAns + model.model.fibModels['fibans' + (model.model.digits - i)].u;
            });
            // if user answer is correct check for any carry error
            if (Number(userAns) == model.answer) {
                result.isSolved = true;
                // remove error on answerBox if existing
                var answerContainer = PluginManager.getPluginObject("answerBox");
                if (answerContainer)
                    instance.clearContainerError(answerContainer);
                _.each(_.range(model.model.digits), function (j) {
                    var fibM = model.model.fibModels['fibcarry' + (j + 1)];
                    if (Number(fibM.u) > 0 && fibM.e != fibM.u) {
                        fibM.isCorrect = false;
                        fibM.mmc = "TBD";
                        fibM.mh = i18n.translate("ONLY_CARRY_ERROR");
                        var fibObject = PluginManager.getPluginObject(fibM.key);
                        fibObject.onEvaluate();
                        var res = {};
                        res[fibM.key] = userAns;
                        result.resValues.push(res);
                        result.mmc.push(fibM.mmc);
                        result.isSolved = false;
                    }
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
            }
            else {
                var answerContainer = PluginManager.getPluginObject("answerBox");
                var showErrorOnAns = false;
                var userCarryArray = [];
                var expectedCarry = [];
                _.each(_.range(model.model.digits), function (j) {
                    userCarryArray.push(model.model.fibModels['fibcarry' + (j + 1)].u);
                    expectedCarry.push(model.model.fibModels['fibcarry' + (j + 1)].e);
                });
                if (Number(userAns) == 0) {
                    model.model["answerMh"] = {
                        mh: i18n.translate("NO_ANSWER")
                    }
                    showErrorOnAns = true;
                }
                else {
                    var evalModel = {
                        digits: model.model.digits,
                        operands: variables.$nums,
                        operations: ["+"],
                        operation: 'Addition',
                        expected: {
                            answer: model.answer,
                            carry: expectedCarry,
                            borrow: null
                        },
                        user: {
                            answer: userAns,
                            carry: userCarryArray,
                            borrow: null
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
                                if (m.e != m.u && Number(m.u) > 0) {
                                    errorCount++;
                                }
                            }
                        });
                        // if error count is less than 3 give specific errors for each digit
                        if (errorCount < 3) {
                            // clear if microhint is given on answer box
                            var answerContainer = PluginManager.getPluginObject("answerBox");
                            if (answerContainer)
                                instance.clearContainerError(answerContainer);
                            _.each(model.model.fibModels, function (fib) {
                                if (Number(fib.e) > 0) {
                                    if (fib.key.includes("carry") && !Number(fib.u) > 0) {
                                        // don't evaluate if carry isn't given
                                    }
                                    else {
                                        fib.isCorrect = fib.e == fib.u;
                                        if (!fib.isCorrect) {
                                            fib.mmc = "TBD";
                                            if (fib.key.includes("carry"))
                                                fib.mh = i18n.translate("MH10A_TBD3");
                                            else
                                                fib.mh = i18n.translate("MH10A_TBD10");
                                        }
                                        var fibObject = PluginManager.getPluginObject(fib.key);
                                        fibObject.onEvaluate();
                                    }
                                }
                                // if some number is entered where nothing has to be given
                                else {
                                    if (Number(fib.u) > 0) {
                                        fib.isCorrect = false;
                                        fib.mmc = "TBD";
                                        if (fib.key.includes("carry"))
                                            fib.mh = i18n.translate("MH10A_TBD3");
                                        else
                                            fib.mh = i18n.translate("MH10A_TBD10");
                                        var fibObject = PluginManager.getPluginObject(fib.key);
                                        fibObject.onEvaluate();
                                    }
                                }

                            });
                        }
                        // if error count is greater than 3 give generic error on answer box
                        else {
                            model.model["answerMh"] = {
                                mh: i18n.translate("GENERIC_MH")
                            }
                            showErrorOnAns = true;
                            // remove microhints on digits if visible
                            _.each(model.model.fibModels, function (fib) {
                                var mhIcon = PluginManager.getPluginObject(fib.key + '-mh-mhicon');
                                if (mhIcon) mhIcon._self.visible = false;
                            });
                        }
                    }
                    // map MMC and microhint according to the rule 
                    else {
                        var ruleToMMCMap = {
                            "isSingleDigitSameNumber": "C519",
                            "isSingleDigitDefault": "C78",
                            "isMultiplesOfHundreds": "C533",
                            "isReverseCarry": "TBD",
                            "isCarryMissing": "TBD",
                            "isReverseAddition": "TBD",
                            "isCarryInAnswerBox": "TDB",
                            "isSumOfIndividualDigits": "TBD",
                            "joinNumbers": "TBD",
                        };
                        var ruleToMicrohintMap = {
                            "isSingleDigitSameNumber": "MH10A_C519",
                            "isSingleDigitDefault": "MH10A_C78",
                            "isMultiplesOfHundreds": "MH10A_C533",
                            "isReverseCarry": "MH10A_TBD5",
                            "isCarryMissing": "MH10A_TBD6",
                            "isReverseAddition": "MH10A_TBD4",
                            "isCarryInAnswerBox": "MH10A_TBD3",
                            "isSumOfIndividualDigits": "MH10A_TBD2",
                            "joinNumbers": "MH10A_TBD1",
                        };
                        var fibObj = PluginManager.getPluginObject("fib" + evalResult.context[0].loc + evalResult.context[0].index);
                        var fibModel = model.model.fibModels["fib" + evalResult.context[0].loc + evalResult.context[0].index];
                        fibModel.isCorrect = false;
                        fibModel.mh = i18n.translate(ruleToMicrohintMap[evalResult.id]);
                        fibModel.mmc = ruleToMMCMap[evalResult.id];
                        fibObj.onEvaluate();
                        result.mmc.push(ruleToMMCMap[evalResult.id]);
                    }
                }
                // create a container on answerBox and attach corresponding microhint to it
                if (showErrorOnAns) {
                    if (_.isUndefined(answerContainer)) {
                        var answerRow = PluginManager.getPluginObject("answer");
                        var totalCols = model.model.digits + 2;
                        var answerContainerObj = {
                            x: 100.0 / totalCols, y: 0, h: 100, w: ((totalCols - 1) * 100.0) / totalCols, id: "answerBox"
                        };
                        PluginManager.invoke('g', answerContainerObj, answerRow, instance._stage, instance._theme);
                        answerContainer = PluginManager.getPluginObject("answerBox");
                        answerContainer.onMicroHint =
                            function (e) {
                                console.log("mh-asm");
                                var helper = PluginManager.getPluginObject('plugin_helper');
                                var mhModel = model.model["answerMh"];
                                var mhData = {};
                                mhData.title = 'Micro hint';
                                mhData.type = "mh";
                                mhData.containerId = '_ft_microhint_content_container__';
                                mhData.x = 10; mhData.y = 10; mhData.w = 80; mhData.h = 60;
                                mhData.content = mhModel.mh;
                                helper.showPopup(mhData);
                            }
                        var microhint = Object.create(null);
                        microhint.id = 'answerBox-mh';
                        microhint.attachTo = "answerBox";
                        microhint.mhPos = 'top-left';
                        microhint.visible = true;
                        PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);
                    }
                    var shapeObj = {
                        stroke: "#e42012",
                        h: 100, w: 100, x: 0, y: 0, type: "rect", id: "answerBox-shape"
                    }
                    PluginManager.invoke('shape', shapeObj, answerContainer, instance._stage, instance._theme);
                    var tbcobj = PluginManager.getPluginObject('answerBox-mh-mhicon');
                    tbcobj._self.visible = true;
                }

            }

        }
        // missing addends
        else if (model.model.qType == 1) {
            var maskedRow = model.maskedRow;
            var userAns = '';
            // form the user answer
            var operandDigits = variables.$nums[maskedRow - 1].toString().length;
            for (i = 0; i < operandDigits; i++) {
                userAns = userAns + model.model.fibModels['fibnum' + (maskedRow - 1) + (operandDigits - 1 - i)].u;
            }
            var opContainer = PluginManager.getPluginObject("operand" + (maskedRow - 1));
            // if answer is correct check for carry error
            if (Number(userAns) == variables.$nums[maskedRow - 1]) {
                result.isSolved = true;
                if (opContainer) instance.clearContainerError(opContainer);
                _.each(_.range(model.model.digits), function (j) {
                    var fibM = model.model.fibModels['fibcarry' + (j + 1)];
                    if (Number(fibM.u) > 0 && fibM.e != fibM.u) {
                        fibM.isCorrect = false;
                        fibM.mmc = "TBD";
                        fibM.mh = i18n.translate("ONLY_CARRY_ERROR");
                        var fibObject = PluginManager.getPluginObject(fibM.key);
                        fibObject.onEvaluate();
                        var res = {};
                        res[fibM.key] = userAns;
                        result.resValues.push(res);
                        result.mmc.push(fibM.mmc);
                        result.isSolved = false;
                    }
                });
                if (result.isSolved) {
                    _.each(model.model.fibModels, function (fib) {
                        if (!(fib.key.includes("carry") && Number(fib.u) == 0)) {
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
                var mmc = "";
                if (Number(userAns) == model.answer) {
                    mh = i18n.translate("MH10A_TBD8");
                    mmc = "TBD";
                }
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
                    if (ansEqualsOperand) {
                        mh = i18n.translate("MH10A_TBD7");
                        mmc = "TBD";
                    }
                    else {
                        mh = i18n.translate("MH10A_TBD9");
                        mmc = "TBD";
                    }
                }
                model.model["operand" + (maskedRow - 1)] = {
                    mh: mh
                };
                if (_.isUndefined(opContainer)) {
                    var addendRow = PluginManager.getPluginObject("op" + (maskedRow - 1));
                    var totalCols = model.model.digits + 2;
                    var operandContainerObj = {
                        x: ((totalCols - operandDigits) * 100.0) / totalCols, y: 0, h: 100, w: (operandDigits * 100.0) / totalCols, id: "operand" + (maskedRow - 1)
                    };
                    PluginManager.invoke('g', operandContainerObj, addendRow, instance._stage, instance._theme);
                    opContainer = PluginManager.getPluginObject("operand" + (maskedRow - 1));
                    opContainer.onMicroHint =
                        function (e) {
                            console.log("mh-asm");
                            var helper = PluginManager.getPluginObject('plugin_helper');
                            var mhModel = model.model["operand" + (maskedRow - 1)];
                            var mhData = {};
                            mhData.title = 'Micro hint';
                            mhData.type = "mh";
                            mhData.containerId = '_ft_microhint_content_container__';
                            mhData.x = 10; mhData.y = 10; mhData.w = 80; mhData.h = 60;
                            mhData.content = mhModel.mh;
                            helper.showPopup(mhData);
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
                }
                var shapeObj = {
                    stroke: "#e42012",
                    h: 100, w: 100, x: 0, y: 0, type: "rect", id: "operand" + (maskedRow - 1) + "-shape"
                }
                PluginManager.invoke('shape', shapeObj, opContainer, instance._stage, instance._theme);
                var tbcobj = PluginManager.getPluginObject("operand" + (maskedRow - 1) + '-mh-mhicon');
                tbcobj._self.visible = true;
            }
        }
        // missing digits, evaluate each writable box
        else {
            result.isSolved = true;
            _.each(model.model.fibModels, function (fib, k) {
                if (fib.key.includes("num") && fib.e != null) {
                    if (fib.e != fib.u) {
                        fib.isCorrect = false;
                        fib.mmc = "TBD";
                        fib.mh = i18n.translate("MH10A_TBD10");
                        var res = {};
                        res[fib.key] = userAns;
                        result.resValues.push(res);
                        result.mmc.push(fib.mmc);
                        result.isSolved = false;
                    }
                    else {
                        fib.isCorrect = true;
                    }
                    var fibObject = PluginManager.getPluginObject(k);
                    fibObject.onEvaluate();
                }
            })
        }
        Renderer.update = !0
        return result;
    },
    /**
     * get the column from left where the first error has been committed
     * @param {object} model
     * @returns {int} columnNum
     */
    getAnsErrorColumn: function (model) {
        var expectedAnswer = model.answer.toString();
        for (i = 0; i <= model.model.digits; i++) {
            var fibModel = model.model.fibModels['fibans' + (i)];
            if (fibModel.u != fibModel.e) {
                console.log("error found in col " + i);
                return i;
            }
        }

    },
    /**
     * remove error from container
     * @param{Object} container
     */
    clearContainerError: function (container) {
        var mhobj = PluginManager.getPluginObject(container._id + '-mh-mhicon');
        mhobj._self.visible = false;
        var shapeObj = PluginManager.getPluginObject(container._id + '-shape');
        shapeObj._self.graphics._stroke.style = null;
    }
});