//@ sourceURL=formNumbers.js
/* global PluginManager */
/**
 * This plugin is used to generate forming numbers problems
 * @extends ftFibBasePlugin
 * @fires mtfOptionBuilder, grid
 * @author Amulya (amulya.k@funtoot.com)
 */
org.ekstep.funtoot.ftPlugin.extend({
    _type: 'org.ekstep.funtoot.formNumbers',
    /**
     * initializes the plugin
     * @param {object} data the data for the plugin
     */
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var i18n = PluginManager.getPluginObject('i18n_helper');
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var model = item.getModelValue();
        var variables = item.getModelValue("variables");
        var defaultFontSize = this.getFontSize(data.isSolution);
        /**
         * largest and smallest number questions are given alternately
         * if the index is even, then question is about smallest
         * and if the index is odd, question is about largest number
         */
        var largestOrSmallest = item._index % 2 ? "largest" : "smallest";
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
        }
        // number array containing the numbers from which the answer has to be formed
        var number_array = variables.$n1;
        var answer = null;
        // form the correct answer
        if (model.evenOrOdd == "Any") {
            answer = new org.ekstep.generators().formNumber(number_array, item._index % 2, model.digits)
        } else
            answer = new org.ekstep.generators().formNumber(number_array, item._index % 2, model.digits, model.evenOrOdd == "even" ? true : false);
        console.log("answer-" + answer);
        var ansArray = _.toArray(answer.toString());
        var answer_array = _.each(ansArray, function (num) {
            return Number(num);
        });
        var nums = i18n.translateNumber(number_array, item.getModelValue("numericLangId"));
        var answerNums = i18n.translateNumber(answer_array, item.getModelValue("numericLangId"));
        // shuffle the numbers for question display
        var shuffledArray = _.shuffle(nums);
        model.lhs_options = [];
        model.rhs_options = [];
        model.answer = answer;
        // number of rhs options is equal to the number of digits provided to form the answer
        _.each(nums, function (num, j) {
            var rhs_model = {
                "value": {
                    "type": "text",
                    "audio": "",
                    "image": "",
                    "asset": shuffledArray[j].displayValue,
                    "fontsize": nums.length < 6 ? instance.getFontSize(data.isSolution, 5.0) : defaultFontSize
                },
            }
            model.rhs_options.push(rhs_model);
        });

        // number of lhs options is equal to the number of digits present in the answer to be formed
        _.each(_.range(model.digits), function (j) {
            var lhs_model = {
                "value": {
                    "type": "mixed",
                    "audio": "",
                    "image": "",
                    "text": ""
                },
                "index": j
            }
            model.lhs_options.push(lhs_model);
        });

        //invoke grid
        //cell size is 18x18 units when number of digits is less than 6 and 7x7 units otherswise
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance,
            //debug: true
        };
        gridData.layout = [];
        // create row for question text
        var questionRow = {
            type: "row",
            h: 4,
            cols: [],
            id: 'question'
        }
        gridData.layout.push(questionRow);
        gridData.layout.push({
            type: "gutter",
            h: 4
        });
        var newRow = {
            type: "row",
            h: nums.length < 6 ? 18 : 7,
            cols: [{
                type: "offset",
                w: (12 - nums.length * (nums.length < 6 ? 2 : 1)) / 2.0
            }]
        };

        for (c = 0; c < nums.length; c++) {
            var cellId = "rhs_options[" + c + "]";
            newRow.cols.push({
                id: cellId,
                type: "column",
                w: nums.length < 6 ? 2 : 1
            });
        }
        gridData.layout.push(newRow);
        gridData.layout.push({
            type: "gutter",
            h: 4
        });
        // create an empty row for lhs options
        var lhsRow = {
            type: "row",
            h: nums.length < 6 ? 18 : 7,
            cols: [],
            id: "lhsRow"
        };
        gridData.layout.push(lhsRow);
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var grid = PluginManager.getPluginObject(gridData.id);
        var lhsContainer = PluginManager.getPluginObject("lhsRow");
        // get the width of each cell from 1st row
        var rhsWidth = PluginManager.getPluginObject("rhs_options[1]")._data.w;
        // create place holders for each lhs option in the empty row
        for (i = 0; i < model.digits; i++) {
            var lhsOpPHobj = {
                x: ((100 - rhsWidth * model.digits) / 2.0) + i * rhsWidth,
                y: 0,
                h: 100,
                w: rhsWidth,
                id: "lhs_options[" + i + "]"
            }
            PluginManager.invoke('g', lhsOpPHobj, lhsContainer, instance._stage, instance._theme);
        }

        var mtfObj = {
            model: "item",
            force: "true",
            id: "mtfObj"
        };
        PluginManager.invoke("mtf", mtfObj, grid, this._stage, this._theme);

        var questionTxt = PluginManager.getPluginObject("question");

        // allow polyglot js to get intialized and then form the question text
        i18n.onReady().then(function (o) {
            var questionStem = "QUESTION06_STEM" + "_" + model.digits.toString() + "_" + largestOrSmallest.toUpperCase();
            if (model.evenOrOdd != "Any") questionStem = questionStem + "_" + model.evenOrOdd.toUpperCase();
            var questionTxtObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                h: "100",
                w: 100,
                x: 0,
                y: 0,
                $t: i18n.translate(questionStem, {
                    largestOrSmallest: largestOrSmallest,
                    numDigits: model.digits,
                    evenOrOdd: model.evenOrOdd == "Any" ? "" : model.evenOrOdd
                }),
                valign: "middle"
            }
            PluginManager.invoke('text', questionTxtObj, questionTxt, this._stage, this._theme);
        }).catch(function (error) {
            console.error(error);
        });

        _.each(_.range(model.digits), function (i) {
            // add the LHS options first
            var op = PluginManager.getPluginObject("lhs_options[" + i + "]");
            if (!data.isSolution) {
                instance.createOption(op, {
                    mtfId: mtfObj.id,
                    fill: "#FFFFCC",
                    stroke: "#000000",
                    attachMh: i == 0 ? true : false
                });
            }
            // create a shape with the correct number for solution display
            else {
                var shapeObj = {
                    fill: "#FFFFCC",
                    stroke: "#4C4C4C",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, op, this._stage, this._theme);
                var textObj = {
                    align: "center",
                    color: "#4c4c4c",
                    fontsize: defaultFontSize,
                    h: "100",
                    w: 100,
                    x: 0,
                    y: 0,
                    $t: answerNums[i].displayValue,
                    valign: "middle"
                }
                PluginManager.invoke('text', textObj, op, this._stage, this._theme);
            }

        });
        _.each(nums, function (num, i) {
            // add the RHS options next
            var op = PluginManager.getPluginObject("rhs_options[" + i + "]");
            if (!data.isSolution) {
                instance.createOption(op, {
                    mtfId: mtfObj.id,
                    attachMh: false
                });
            }
            var shapeObj = {
                fill: "#cccccc",
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                stroke: "#BFBFBF",
                type: "rect",
            }
            PluginManager.invoke('shape', shapeObj, op, this._stage, this._theme);
        });
    },
    /**
     *  creates mtf option on the specified parent
     * @param {Object} opParent- the parent cell
     * @param  {Object} config
     */
    createOption: function (opParent, config) {
        var mtfOptData = {
            id: opParent._data.id + "_opt",
            w: opParent._data.w,
            x: opParent._data.x,
            h: opParent._parent._data.h,
            y: opParent._parent._data.y,
            templateId: config.mtfId,
            color: config.fill,
            stroke: config.stroke,
            attachMh: config.attachMh
        };
        PluginManager.invoke('org.ekstep.funtoot.optionBuilder', mtfOptData, opParent, this._stage, this._theme);
    },

    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object}
     */
    onSubmit: function (evt, instance) {
        var item = this._stage._stageController;
        var model = item.getModelValue();
        var variables = item.getModelValue("variables");
        var number_array = variables.$n1;
        var rhs_options = model.rhs_options;
        var lhs_options = model.lhs_options;
        var ordering = model.order;
        var largestOrSmallest = item._index % 2 ? "largest" : "smallest";
        var evenOrOdd = model.evenOrOdd == "even" ? 0 : 1;
        var increasingOrDecreasing = item._index % 2 ? "decreasing" : "increasing";
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            var digitsRemaining = 0;
            for (i = 0; i < lhs_options.length; i++) {
                delete lhs_options[i].number;
            }
            for (let i = 0; i < rhs_options.length; i++) {
                var lhs_selected;
                if (!_.isUndefined(rhs_options[i].selected)) {
                    lhs_selected = rhs_options[i].selected;
                    lhs_options[lhs_selected].number = rhs_options[i].value.asset;
                } else {
                    digitsRemaining = digitsRemaining + 1;
                    if (digitsRemaining > rhs_options.length == lhs_options.length) {
                        result.isSolved = false;
                        result.mmc = "01";
                        lhs_options[0].mh = "NO_ANSWER";
                        lhs_options[0].mmc = "01";
                        var optionObj = PluginManager.getPluginObject("option_lhs_options[0]");
                        optionObj.onEvaluate("lhs_options[0]");
                        return result;
                    }

                }
            }
            var answerGiven = "";
            _.each(lhs_options, function (opt, i) {
                var resVal = {};
                resVal[i] = opt.number ? opt.number : "";
                result.resValues.push(resVal);
            });
            for (let i = 0; i < lhs_options.length; i++) {
                if (_.isUndefined(lhs_options[i].number)) {
                    answerGiven = null;
                    break;
                } else
                    answerGiven = answerGiven.concat(lhs_options[i].number);
            }
            var containsZero = false;
            _.each(rhs_options, function (opt) {
                if (i18n.toNumber(opt.value.asset) == "0") containsZero = true;
            });
            if (answerGiven == null) {
                result.isSolved = false;
                lhs_options[0].isCorrect = false;
                lhs_options[0].mh = i18n.translate("NO_ANSWER");
                lhs_options[0].mmc = "01";
            } else if (Number(i18n.toNumber(answerGiven)) == model.answer) {
                result.isSolved = true;
                lhs_options[0].isCorrect = true;
            } else {
                result.isSolved = false;
                lhs_options[0].isCorrect = false;
                if (model.evenOrOdd == "Any") {
                    lhs_options[0].mmc = "C468";
                    if (containsZero && i18n.toNumber(answerGiven[0]) == "0") {
                        lhs_options[0].mh = i18n.translate("MH06_" + largestOrSmallest.toUpperCase() + "_ZERO");
                    } else {
                        lhs_options[0].mh = i18n.translate("MH06_" + largestOrSmallest.toUpperCase());
                    }

                } else {
                    if (Number(i18n.toNumber(answerGiven)) % 2 == evenOrOdd) {
                        lhs_options[0].mh = i18n.translate("MH063_" + largestOrSmallest.toUpperCase() + "_" + model.evenOrOdd.toUpperCase());
                    } else {
                        if (Number(i18n.toNumber(answerGiven)) == new org.ekstep.generators().formNumber(number_array, item._index % 2, model.digits, model.evenOrOdd == "even" ? false : true))
                            lhs_options[0].mh = i18n.translate("MH062_" + largestOrSmallest.toUpperCase() + "_" + model.evenOrOdd.toUpperCase());
                        else
                            lhs_options[0].mh = i18n.translate("MH06_" + largestOrSmallest.toUpperCase() + "_" + model.evenOrOdd.toUpperCase());

                    }
                    lhs_options[0].mmc = "C705"
                }
            }
            var optionObj = PluginManager.getPluginObject("option_lhs_options[0]");
            optionObj.onEvaluate("lhs_options[0]");

            // in case of a wrong answer create an orange border encompassing all lhs options
            if (!result.isSolved) {
                var lhsContainer = PluginManager.getPluginObject("lhsRow");
                // get the width of each cell from 1st row
                var rhsWidth = PluginManager.getPluginObject("rhs_options[1]")._data.w;
                var lhsRowObj = {
                    x: ((100 - rhsWidth * model.digits) / 2.0),
                    y: 0,
                    h: 100,
                    w: rhsWidth * model.digits,
                    id: "lhs_options"
                }
                PluginManager.invoke('g', lhsRowObj, lhsContainer, instance._stage, instance._theme);
                var lhsRow = PluginManager.getPluginObject("lhs_options");
                var shapeObj = {
                    fill: "#000000",
                    stroke: "#F89222",
                    "stroke-width": 5,
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, lhsRow, instance._stage, instance._theme);
                result.mmc.push(lhs_options[0].mmc);
            }
            return result;
        } else return false
    },

    /**
     * handles hint icon click event and invokes the popup
     * @FIX: move the hardcoded string to resource bundle
     */
    _onHint: function (evt) {
        console.log('formingNumbers - _onHint called!');
        var helper = PluginManager.getPluginObject('plugin_helper');
        var item = this._stage.getController("item");
        var model = item.getModelValue();
        var i18n = PluginManager.getPluginObject('i18n_helper');

        var hintMsg = model.model.hintMsg;
        var placeValue = "";
        if (model.digits == 4) placeValue = "THOUSANDS";
        else if (model.digits == 5) placeValue = "TENTHOUSANDS";
        else if (model.digits == 6) placeValue = "LAKH";
        else placeValue = "TENLAKH";
        var largestOrSmallest = item._index % 2 ? "largest" : "smallest";
        var increaseOrDecrease = item._index % 2 ? "decrease" : "increase";
        var highestOrLowest = item._index % 2 ? "highest" : "lowest";
        if (hintMsg == "HINT06_HUNDREDS") hintMsg = hintMsg + "_" + largestOrSmallest.toUpperCase();
        if (hintMsg == "HINT062") hintMsg = "HINT06_" + largestOrSmallest.toUpperCase() + "_" + model.evenOrOdd.toUpperCase();
        if (hintMsg == "HINT06_DIGITS") hintMsg = hintMsg + "_" + largestOrSmallest.toUpperCase() + "_" + model.evenOrOdd.toUpperCase();
        if (hintMsg == "HINT06_4") hintMsg = "HINT06_" + placeValue + "_" + largestOrSmallest.toUpperCase();
        if (hintMsg == "HINT06_5") hintMsg = "HINT06_" + largestOrSmallest.toUpperCase();
        var hintData = {
            title: 'Hint',
            type: "hint",
            content: i18n.translate(hintMsg) || i18n.translate("NO_HINT"), //There is no hint for this question',
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
        var selOptCount = 0;
        var rhsoptions = instance._item.getModelValue().rhs_options;
        var lhsoptions = instance._item.getModelValue().lhs_options;
        _.each(rhsoptions, function (o) {
            if (o.selected >= 0)
                selOptCount++
        })
        if (selOptCount == lhsoptions.length)
            return true
        else return false
    }
});