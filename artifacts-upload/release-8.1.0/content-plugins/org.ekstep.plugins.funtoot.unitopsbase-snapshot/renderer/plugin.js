//@ sourceURL=unitopsbase-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate measurement problems
 * @extends ftFibBasePlugin
 * @fires table, grid
 * @author Amit (amit.dawar@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.unitopsbase',
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

        var nlangId = item.getModelValue("numericLangId");
        var langId = item.getModelValue("langId");

        var plugData = {
            id: "i18n_helper",
            config: {
                langId: langId,
                numericLangId: nlangId
            },
            data: this._pluginData.i18n
        };

        PluginManager.invoke('org.ekstep.plugins.i18n', plugData, this, this._stage, this._theme);
        var i18n = PluginManager.getPluginObject('i18n_helper');

        //Get major and minor unit
        var mjunit = i18n.translate(variables.$majorunit);
        var mnunit = i18n.translate(variables.$minorunit);

        model.mjunit = mjunit;
        model.mnunit = mnunit;

        //Get multiplication factor
        var mulFactor = i18n.translateNumber(variables.$mulFactor, nlangId).numericalValue;
        var mulFactorStr = mulFactor.toString();
        model.mulFactor = mulFactor;

        //Get operands of major unit
        var mj1 = i18n.translateNumber(variables.$opnmjr1, nlangId).displayValue;
        var mj2 = i18n.translateNumber(variables.$opnmjr2, nlangId).displayValue;

        //Get operands of minor unit
        var mnr1 = i18n.translateNumber(variables.$opnmnr1, nlangId).displayValue;
        var mnr2 = i18n.translateNumber(variables.$opnmnr2, nlangId).displayValue;

        //Get padding size
        var paddingSize = instance.getPaddingSize(mj1, mj2);

        //Add appropriate zero-padding to all operands
        mj1 = instance.addZeroPadding(mj1, paddingSize, nlangId);
        mj2 = instance.addZeroPadding(mj2, paddingSize, nlangId);
        mnr1 = instance.addZeroPadding(mnr1, mulFactorStr.length - 1, nlangId);
        mnr2 = instance.addZeroPadding(mnr2, mulFactorStr.length - 1, nlangId);

        //Get major and minor unit answer
        var ansmjr = i18n.translateNumber(variables.$ansmjr, nlangId).displayValue;
        var ansmnr = i18n.translateNumber(variables.$ansmnr, nlangId).displayValue;
        ansmnr = instance.addZeroPadding(ansmnr, mulFactorStr.length - 1, nlangId);

        //Get carry and borrow
        var carry = variables.$carry;
        var borrow = variables.$borrow;

        model.answer = [ansmnr, ansmjr, carry, borrow, mulFactor];

        var rowHeight = 9; // in units
        //Number of rows is fixed
        var rows = 4;
        // Number of cols is fixed
        var cols = 2;
        var colWidth = 20; // in units
        var gridColumns = 4; // column width

        // offset is fixed
        var offset = 4;

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

        i18n.onReady().then(function () {
            var questionID = model.model.question;
            var questionRow = PluginManager.getPluginObject('questionText')
            var questionObj = {
                id: "question-id",
                align: "center",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                $t: i18n.translate(questionID, nlangId),
                x: 0,
                y: 0,
                w: 100,
                h: 100
            };
            PluginManager.invoke('text', questionObj, questionRow, instance._stage, instance._theme);
        });

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

        // add row for Units
        var unitsRow = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "unitsRow",
            w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            unitsRow.cols.push({
                type: "column",
                w: colWidth,
                id: "u" + i
            });
        }

        tableData.layout.push(unitsRow);

        // add first row for Numbers
        var numRow1 = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "numRow1",
            w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            numRow1.cols.push({
                type: "column",
                w: colWidth,
                id: "opr" + i
            });
        }

        tableData.layout.push(numRow1);

        // add second row for Numbers
        var numRow2 = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "numRow2",
            w: cols * colWidth
        };
        for (i = cols - 1; i >= 0; i--) {
            numRow2.cols.push({
                type: "column",
                w: colWidth,
                id: "opr2" + i
            });
        }

        tableData.layout.push(numRow2);

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
        instance.renderUnitsRow(mnunit, mjunit);
        instance.renderOperandRow(mnr1, mj1);
        instance.renderOperandRow2(mnr2, mj2);
        instance.renderVerticalGridLines(cols, tableCell, instance);

        var boldLineObj = {
            fill: "#000000",
            stroke: "#000000",
            h: 1.5,
            w: 100,
            x: 0.5,
            y: 0,
            type: "rect",
        }
        var boldLineObj2 = {
            fill: "#000000",
            stroke: "#000000",
            h: 1.5,
            w: 100,
            x: 0.5,
            y: 100,
            type: "rect",
        }
        var defaultLineObj = {
            fill: "#000000",
            h: 1,
            w: 100,
            x: 0,
            y: 0,
            type: "rect",
        }
        var unitRow = PluginManager.getPluginObject('unitsRow');
        var oprRow2 = PluginManager.getPluginObject('numRow2');
        var ansRow = PluginManager.getPluginObject('answer');
        PluginManager.invoke('shape', defaultLineObj, unitRow, this._stage, this._theme);
        PluginManager.invoke('shape', boldLineObj2, unitRow, this._stage, this._theme);
        PluginManager.invoke('shape', defaultLineObj, oprRow2, this._stage, this._theme);
        PluginManager.invoke('shape', boldLineObj, ansRow, this._stage, this._theme);
        PluginManager.invoke('shape', boldLineObj2, ansRow, this._stage, this._theme);

        //Set the two Fibs (fibans0, fibans1)
        for (var i = 0; i <= 1; i++) {
            var cell = PluginManager.getPluginObject("ans" + i);
            var key = "fib" + cell._data.id;
            if (!data.isSolution) {
                var fibData = {
                    e: key == 'fibans0' ? ansmnr : ansmjr,
                    u: '',
                    w: true,
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false,
                    key: key
                }
                var fibM = item.getModelValue().model.fibModels;
                fibM[key] = fibData;
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
                        "stroke": "#ffffff"
                    }
                }
            };
            PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
        }
    },

    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object} result the result after submitting
     */
    onSubmit: function (evt, instance) {
        var model = this._stage._stageController.getModelValue();
        var nlangId = this._item.getModelValue("numericLangId");
        var result = {
            isSolved: false,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            // get the i18n plugin object
            var i18n = PluginManager.getPluginObject('i18n_helper');
            // form the user answer
            var userAns = [];

            for (var i = 0; i <= 1; i++) {
                model.model.fibModels['fibans' + i].u = i18n.toNumber(model.model.fibModels['fibans' + i].u) == 0 ? i18n.translateNumber(0, nlangId).displayValue : model.model.fibModels['fibans' + i].u;
                model.model.fibModels['fibans' + i].e = i18n.toNumber(model.model.fibModels['fibans' + i].e) == 0 ? i18n.translateNumber(0, nlangId).displayValue : model.model.fibModels['fibans' + i].e;
                model.answer[i] = model.model.fibModels['fibans' + i].e
                userAns[i] = model.model.fibModels['fibans' + i].u;
                userAns[i] = i18n.toNumber(userAns[i]) == 0 ? i18n.translateNumber(0, nlangId).displayValue : userAns[i];
            }
            _.each(model.model.fibModels, function (fib) {
                var res = {}
                res[fib.key] = fib.u;
                result.resValues.push(res);
            })
            // if user answer is correct
            if (userAns[0] == model.answer[0] & userAns[1] == model.answer[1]) {
                result.isSolved = true;
                // remove error on answerBox if existing
                var answerContainer = PluginManager.getPluginObject("answerBox");
                if (answerContainer) {
                    instance.clearContainerError(answerContainer);
                }
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
                // create a container on answerBox and attach corresponding microhint to it when user
                // has entered nothing.
                if (userAns[0] == '' & userAns[1] == '') {
                    var answerRow = PluginManager.getPluginObject("answer");
                    var answerContainerObj = {
                        x: 0,
                        y: 0,
                        h: 100,
                        w: 100,
                        id: "answerBox"
                    };
                    PluginManager.invoke('g', answerContainerObj, answerRow, instance._stage, instance._theme);
                    answerContainer = PluginManager.getPluginObject("answerBox");
                    answerContainer.onMicroHint =
                        function () {
                            var mhData = {};
                            mhData.title = 'Micro hint';
                            mhData.type = "mh";
                            mhData.containerId = '_ft_microhint_content_container__';
                            mhData.x = 10;
                            mhData.y = 10;
                            mhData.w = 80;
                            mhData.h = 60;
                            mhData.content = i18n.translate("NO_ANSWER");
                            mhData.mmc = "01";
                            return mhData;
                        }
                    var microhint = {};
                    microhint.id = 'answerBox-mh';
                    microhint.attachTo = "answerBox";
                    microhint.mhPos = 'top-left';
                    microhint.visible = true;
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
                } else {
                    // Call to get approriate microhints on the two fibs
                    var mmcs = instance.evaluateForMH(model, i18n, instance);
                    result.mmc = mmcs;
                }
            }
            Renderer.update = !0
            return result;
        } else return false
    },

    /**
     * remove error from container
     * @param{Object} container container to be cleared
     */
    clearContainerError: function (container) {
        var mhobj = PluginManager.getPluginObject(container._id + '-mh-mhicon');
        mhobj._self.visible = false;
        mhobj._data.visible = false;
        var shapeObj = PluginManager.getPluginObject(container._id + '-shape');
        shapeObj._self.graphics._stroke.style = null;
    },

    /**
     * render unit values
     * parameters (mnrunit, mjunit)
     * @param{string} minorunit the minor unit
     * @param{string} majorunit the major unit
     */
    renderUnitsRow: function () {
        // add units
        for (var i = 0; i < arguments.length; i++) {
            var units = PluginManager.getPluginObject("u" + i);
            var textObj = {
                align: "center",
                color: "#afaeae",
                fontsize: "2.7vw",
                h: "100",
                w: 100,
                x: 0,
                y: 0,
                $t: arguments[i],
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, units, this._stage, this._theme);
        }
    },

    /**
     * render operand row 1
     * parameters (mnr1, mj1)
     * @param{string} mnr1 first minor operand
     * @param{string} mj1 first major operand
     */
    renderOperandRow: function () {
        // add operand row
        for (var i = 0; i < arguments.length; i++) {
            var pv = PluginManager.getPluginObject("opr" + i);
            var textObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                h: "100",
                w: 100,
                x: 0,
                y: 0,
                $t: arguments[i],
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, pv, this._stage, this._theme);
        }
    },

    /**
     * render operand row 2
     * parameters (mnr2, mj2)
     * @param{string} mnr2 second minor operand
     * @param{string} mj2 second major operand
     */
    renderOperandRow2: function () {
        //Add operand row
        for (var i = 0; i < arguments.length; i++) {
            var pv = PluginManager.getPluginObject("opr2" + i);
            var textObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                h: "100",
                w: 100,
                x: 0,
                y: 0,
                $t: arguments[i],
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, pv, this._stage, this._theme);
        }
    },
    /**
     * renders vertical grid lines
     * @param{integer} cols no. of columns
     * @param{object} tableCell the tablecell
     * @param{object} instance current instance
     */
    renderVerticalGridLines: function (cols, tableCell, instance) {
        for (var i = 0; i <= cols; i++) {
            var lineObj = {
                x: 50 * i,
                y: 0,
                h: 100,
                w: 1,
                id: "line" + i
            }
            PluginManager.invoke('g', lineObj, tableCell, instance._stage, instance._theme);
            var line = PluginManager.getPluginObject("line" + i);
            var verticalShapeObj = {
                fill: "#cecece",
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                type: "rect",
            }
            PluginManager.invoke('shape', verticalShapeObj, line, instance._stage, instance._theme);
        }
    },

    /**
     * adds zero-padding to numbers
     * @param{string} num number to be zero-padded
     * @param{integer} size the length of largest operand
     * @returns{string} s string with zero-padding
     */
    addZeroPadding: function (num, size, nlangId) {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var s = num + "";
        while (s.length < size) s = i18n.translateNumber(0, nlangId).displayValue + s;
        return s;
    },

    /**
     * get length of largest operand
     * @param{string} mj1 first major operand
     * @param{string} mj2 second major operand
     * @returns{integer} max max length of operands
     */
    getPaddingSize: function (mj1, mj2) {
        return Math.max(mj1.length, mj2.length)
    },

    getTranslatedExp: function (model) {
        var nlangId = this._item.getModelValue("numericLangId");
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var mf = i18n.translateNumber(model.mulFactor, nlangId).displayValue;
        var unit = i18n.translateNumber(1, nlangId).displayValue;
        return mf + " " + model.mnunit + " = " + unit + " " + model.mjunit;
    },

    /**
     * Evaluate to get proper microhint on fibs
     * @param{Object} model model object
     * @param{object} i18n translation object
     * @param{object} instance current instance
     */
    evaluateForMH: function (model, i18n, instance) {
        var mmc = [];
        var nlangId = this._item.getModelValue("numericLangId");
        var operation;
        if (model.model.question.includes("ADD"))
            operation = "addition";
        else if (model.model.question.includes("SUB"))
            operation = "subtraction";

        var answerContainer = PluginManager.getPluginObject("answerBox");
        if (answerContainer) {
            instance.clearContainerError(answerContainer);
        }

        _.each(model.model.fibModels, function (fib) {
            fib.u = i18n.toNumber(fib.u) == 0 ? i18n.translateNumber(0, nlangId).displayValue : fib.u;
            fib.e = i18n.toNumber(fib.e) == 0 ? i18n.translateNumber(0, nlangId).displayValue : fib.e;
            var missedZero = false;

            //If user has only missed lead zeros
            if (fib.e[0] == '0' && i18n.toNumber(fib.e) > 0)
                missedZero = fib.e == instance.addZeroPadding(fib.u, model.answer[4].toString().length - 1, nlangId);
            if (missedZero) {
                fib.isCorrect = fib.e == fib.u;
                if (!fib.isCorrect && fib.key.includes('ans0') && fib.u != '') {
                    fib.mmc = "DE159";
                    mmc.push("DE159");
                    fib.mh = i18n.translate("MISSING_LEAD_ZERO");
                } else if (fib.u == '') {
                    fib.mmc = "01";
                    mmc.push("01");
                    fib.mh = i18n.translate("NO_ANSWER");
                }
            }
            var exp = instance.getTranslatedExp(model);
            // When user has entered wrong value
            if (fib.u !== '' & (!missedZero || !fib.key.includes("ans0"))) {
                // Eval for addition
                if (operation == 'addition') {

                    // If there is NO carry
                    if (model.answer[2] == 0) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect & fib.key.includes('ans0')) {
                            fib.mmc = "C617";
                            mmc.push("C617");
                            fib.mh = i18n.translate("ADD_1", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        } else if (!fib.isCorrect & fib.key.includes('ans1')) {
                            fib.mmc = "C617";
                            mmc.push("C617");
                            fib.mh = i18n.translate("ADD_2", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        }
                    }
                    // If there is carry
                    else if (model.answer[2] == 1 & model.answer[4] <= i18n.toNumber(fib.u)) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect & fib.key.includes('ans0')) {
                            fib.mmc = "C618";
                            mmc.push("C618");
                            fib.mh = i18n.translate("ADD_3", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit,
                                exp: exp
                            });
                        } else if (!fib.isCorrect & fib.key.includes('ans1')) {
                            fib.mmc = "C618";
                            mmc.push("C618");
                            fib.mh = i18n.translate("ADD_4", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit,
                            });
                        }
                    } else if (model.answer[2] == 1 & model.answer[4] > i18n.toNumber(fib.u)) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect & fib.key.includes('ans0')) {
                            fib.mmc = "C618";
                            mmc.push("C618");
                            fib.mh = i18n.translate("ADD_7", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        } else if (!fib.isCorrect & fib.key.includes('ans1')) {
                            fib.mmc = "C618";
                            mmc.push("C618");
                            fib.mh = i18n.translate("ADD_8", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        }
                    }
                    /*if (model.answer[2] == 1 & i18n.toNumber(fib.u) < fib.e & fib.key.includes('ans1')) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect & fib.key.includes('ans1')) {
                            fib.mmc = "C618";
                            mmc.push("C618");
                            fib.mh = i18n.translate("MHLA_6C618");
                        }
                    }*/
                }
                // Eval for subtraction
                else if (operation == 'subtraction') {

                    // If there is NO borrow
                    if (model.answer[3] == 0) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect & fib.key.includes('ans0')) {
                            fib.mmc = "C619";
                            mmc.push("C619");
                            fib.mh = i18n.translate("SUB_1", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        } else if (!fib.isCorrect & fib.key.includes('ans1')) {
                            fib.mmc = "C619";
                            mmc.push("C619");
                            fib.mh = i18n.translate("SUB_2", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        }
                    }
                    // If there is borrow
                    if (model.answer[3] == model.answer[4]) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect & fib.key.includes('ans0')) {
                            fib.mmc = "C620";
                            mmc.push("C620");
                            fib.mh = i18n.translate("SUB_5", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        } else if (!fib.isCorrect & fib.key.includes('ans1')) {
                            fib.mmc = "C620";
                            mmc.push("C620");
                            fib.mh = i18n.translate("SUB_6", {
                                majorunit: model.mjunit,
                                minorunit: model.mnunit
                            });
                        }
                    }
                    /*if (model.answer[3] == model.answer[4] & i18n.toNumber(fib.u) > fib.e & fib.key.includes('ans1')) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect & fib.key.includes('ans1')) {
                            fib.mmc = "C620";
                            mmc.push("C620");
                            fib.mh = i18n.translate("MHLS_4C620");
                        }
                    }*/
                }
            } else {
                // When user has entered nothing in fib and expected ans is not with leading zeros
                if (fib.e.toString()[0] != 0 || i18n.toNumber(fib.e) == 0) {
                    fib.isCorrect = false;
                    fib.mmc = "01";
                    mmc.push("01");
                    fib.mh = i18n.translate("NO_ANSWER");
                }
            }
            var fibObject = PluginManager.getPluginObject(fib.key);
            fibObject.onEvaluate();
        });
        return mmc;
    },
    /**
     * handles hint icon click event and invokes the popup
     */
    _onHint: function () {
        var helper = PluginManager.getPluginObject('plugin_helper');
        var item = this._stage.getController("item");
        var model = item.getModelValue();
        var i18n = PluginManager.getPluginObject('i18n_helper');

        var hintMsg = i18n.translate(model.model.hintMsg, item._data.selectedConfig.contentLocale);

        var hintData = {
            title: 'Hint',
            type: "hint",
            content: hintMsg,
            x: 10,
            y: 10,
            w: 80,
            h: 60
        };
        helper.showPopup(hintData);
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