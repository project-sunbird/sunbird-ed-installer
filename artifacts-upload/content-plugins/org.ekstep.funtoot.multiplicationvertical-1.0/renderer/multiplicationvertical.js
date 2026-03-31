//@ sourceURL=multiplicationvertical.js
/* global PluginManager */
/**
 * This plugin is used to generate multiplication vertical problems
 * @extends ftFibBasePlugin
 * @fires table, grid
 * @author Amulya (amulya.k@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.funtoot.multiplicationvertical',
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
        var answer = _.reduce(nums, function (memo, num) {
            return memo * num.numericalValue;
        }, 1);
        console.log("answer-" + answer);
        model.answer = answer;
        var correctAns = i18n.translateNumber(answer, item.getModelValue("numericLangId"));
        variables["$ans"] = correctAns
        var ansArray = []
        _.each(_.range(correctAns.displayValue.length), function (i) {
            ansArray.push(correctAns.displayValue[correctAns.displayValue.length - 1 - i]);
        });
        item.setModelValue("ans", correctAns);
        var rowHeight = 7; // in units
        var rows = variables.$nums.length + 3;
        model.digits = Math.max(nums[0].displayValue.length, nums[1].displayValue.length)
        var cols = model.digits + 2;
        var colWidth = 14; // in units
        var gridColumns = (cols * colWidth + 4) / 11.0;
        var offset = (128 - cols * colWidth + 4) / 22.0;
        var maskedMatrix = [];
        // row number to be masked
        var maskedRow = rows - 2;
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
        for (i = 1; i <= nums[0].displayValue.length; i++) {
            var currValue = Number(nums[0].displayValue[nums[0].displayValue.length - i]) * nums[1].numericalValue;
            if (i != 1)
                currValue = currValue + Number(carry[i - 1]);
            if (currValue >= 10) carry.push(Math.floor(currValue / 10));
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

        // add row for carry or borrow
        var carryRow = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "carryRow",
            w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            carryRow.cols.push({
                type: "column",
                w: colWidth,
                id: "carry" + i
            });
        }
        tableData.layout.push(carryRow);

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
        i18n.onReady().then(function (o) {
            var question = o.translate(instance._item.getModelValue("question"), {});
            var questionRow = PluginManager.getPluginObject("questionText");
            var questionObj = {
                id: "question-id",
                align: "center",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                $t: question,
                x: 0,
                y: 0,
                w: 100,
                h: 100
            };
            PluginManager.invoke('text', questionObj, questionRow, instance._stage, instance._theme);
        });
        var pvVal = ["U", "T", "H", "Th"];
        // add place value names
        for (i = 0; i <= cols - 2; i++) {
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
                        readonly: {
                            showBgImg: false
                        },
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
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                $t: "x",
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, cell, instance._stage, instance._theme);
        }

        // adding the horizontal grid lines
        // add the first lines
        var carryOverRow = PluginManager.getPluginObject("carryRow");
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

        // create container for answer box and attach micro hint
        var answerRow = PluginManager.getPluginObject("answer");
        var answerContainerObj = {
            x: 100.0 / cols,
            y: 0,
            h: 100,
            w: ((cols - 1) * 100.0) / cols,
            id: "answerBox"
        };
        PluginManager.invoke('g', answerContainerObj, answerRow, instance._stage, instance._theme);
        var answerContainer = PluginManager.getPluginObject("answerBox");
        model.model["answerMh"] = {};
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
        PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);
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
            // form the user answer
            var userAns = '';
            _.each(_.range(model.digits + 1), function (i) {
                if (model.model.fibModels['fibans' + (model.digits - i)].u != "") {
                    userAns = userAns + i18n.toNumber(model.model.fibModels['fibans' + (model.digits - i)].u).toString();
                    var res = {};
                    ansFibModel = model.model.fibModels['fibans' + (model.digits - i)]
                    res[ansFibModel.key] = ansFibModel.u;
                    result.resValues.push(res);
                }

            });
            var answerContainer = PluginManager.getPluginObject("answerBox");
            // if user answer is correct check for any carry error
            if (Number(userAns) == model.answer) {
                result.isSolved = true;
                instance.clearContainerError(answerContainer);
                _.each(_.range(model.digits), function (j) {
                    var fibM = model.model.fibModels['fibcarry' + (j + 1)];
                    if (i18n.toNumber(fibM.u) > 0 && fibM.e != fibM.u) {
                        fibM.isCorrect = false;
                        fibM.mmc = "C713";
                        fibM.mh = i18n.translate("ONLY_CARRY_ERROR");
                        var fibObject = PluginManager.getPluginObject(fibM.key);
                        fibObject.onEvaluate();
                        result.mmc.push(fibM.mmc);
                        result.isSolved = false;
                    }
                });
                if (result.isSolved) {
                    _.each(model.model.fibModels, function (fib) {
                        if (!(fib.key.includes("carry") && i18n.toNumber(fib.u) == 0)) {
                            fib.isCorrect = true;
                            var fibObject = PluginManager.getPluginObject(fib.key);
                            fibObject.onEvaluate();
                        }
                    })
                }
            } else {
                var ansModel = model.model["answerMh"];
                var evalModel = new MultiplicationEval().evaluate(mod = {
                    operands: variables.$nums,
                    operation: 'Multiplication',
                    expected: {
                        answer: i18n.toNumber(variables.$ans).toString(),
                    },
                    user: {
                        answer: i18n.toNumber(userAns).toString(),
                    },
                    type: 'vertical'
                });
                ansModel.u = userAns;
                ansModel.isCorrect = instance.evaluate(ansModel, evalModel);
                result.mmc.push(ansModel.mmc);
                if (!ansModel.isCorrect)
                    result.isSolved = false;
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
            }
            Renderer.update = !0
            return result;
        } else return false
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
        if (shapeObj)
            shapeObj._self.graphics._stroke.style = null;
    },
    /**
     * custom evaluation for horizontal multiplication
     * populates the micro hint message and mmc depending on the user answer
     * @param {object} the model associated with the FIB plugin
     * @returns {boolean}
     */
    evaluate: function (model, evalModel) {
        evalModel = _.isUndefined(evalModel) ? true : evalModel;
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = this._item.getModelValue("variables");
        var userAnswer = i18n.toNumber(model.u)
        var expectedAnswer = i18n.toNumber(model.e)
        var ruleToMMCMhMap = {
            "isSum": {
                mmc: "C12",
                mh: "MH_SUM"
            },
            "multiplicationby1": {
                mmc: "C548",
                mh: "MH_1"
            },
            "multiplicationBySingleDigit": {
                mmc: "C99",
                mh: "MH_SINGLEDIGIT"
            },
            "multiplicationByPowersOfTen": {
                mmc: "C280",
                mh: "MH_10"
            },
            "isProductMisplaced": {
                mmc: "C276",
                mh: "MH_MISPLACE"
            },
            "isZeroMissedInTheEnd": {
                mmc: "C280",
                mh: "MH_END0"
            },
            "isZeroMissed": {
                mmc: "C722",
                mh: "MH_MISSED0"
            },
            "isSameNumber": {
                mmc: "C720",
                mh: "MH_SAME"
            },
            "isZeroPresent": {
                mmc: "C547",
                mh: "MH_0"
            }
        };
        if (userAnswer == '') {
            model['mh'] = i18n.translate("NO_ANSWER"), model['mmc'] = 'O1';
            return !1;
        } else if (evalModel != true) {
            model['mh'] = i18n.translate(ruleToMMCMhMap[evalModel.id].mh);
            model['mmc'] = ruleToMMCMhMap[evalModel.id].mmc;
            return !1;
        } else if (userAnswer.trim() != expectedAnswer.trim()) {
            model['mh'] = i18n.translate("MH_DEFAULT");
            model['mmc'] = "C276"
            return !1;
        } else {
            model['mh'] = null;
            model['mmc'] = null;
            return !0;
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
            if (b.w & !(b.e == null || b.e === "" || b.key.includes("carry"))) {
                blkCount++;
                if (b.u !== "")
                    answeredBlkCount++;
            }
        });
        if (answeredBlkCount == blkCount)
            return true;
        else return false;
    }
});