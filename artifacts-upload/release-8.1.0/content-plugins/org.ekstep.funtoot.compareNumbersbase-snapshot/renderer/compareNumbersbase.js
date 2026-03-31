//@ sourceURL=compareNumbersbase-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate compare numbers problems.
 * @extends ftPlugin
 * @fires mtfOptionBuilder, mtf
 */
org.ekstep.funtoot.ftPlugin.extend({
    _type: "org.ekstep.funtoot.compareNumbersbase",
    initPlugin: function (data) {
        this._super(data);
        console.log('----i exist----')
        var instance = this;
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
         * process the variables only if non-solution display
         * randomly select if the answer should be lesser, greater or equal
         * and set the variables $n1, $n2 accordingly.
         * This is better than randomly selecting two numbers and deciding
         * the comparison operator, as the probability of getting same two
         * random numbers is very small. This way, the <, =, > symbols will
         * have equal probability.
         */
        if (!data.isSolution) {
            this.processVariables(variables);
        }

        var number_array = [variables.$n1, variables.$n2];
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

        if (model.IsFraction) {
            model.fraction = true;
        }

        if (model.IsDecimal) {
            model.decimal = true;
        }

        if (!data.isSolution) {
            /**
             * correctAns = 0 : lesser
             * correctAns = 1 : equal
             * correctAns = 2 : greater
             */
            if (!model.fraction) {
                if (variables.$n1 == variables.$n2) {
                    model.correctAns = 1;
                } else {
                    if (_.isUndefined(model.correctAns)) {
                        model.correctAns = _.random(2);
                        if (model.correctAns == 1) {
                            var shuffledArray = _.shuffle(number_array);
                            variables.$n2 = variables.$n1 = shuffledArray[0];
                        } else {
                            var sort = _.sortBy(number_array, function (num) {
                                if (model.correctAns == 0) return num * 1;
                                else return num * -1;
                            });
                            variables.$n1 = sort[0];
                            variables.$n2 = sort[1];
                        }
                    }
                }
                var nums = i18n.translateNumber([variables.$n1, variables.$n2], nlangId);
                model.nums = nums;
            } else {
                if (variables.$n1 == variables.$n2) {
                    model.correctAns = 1;
                } else {
                    if (_.isUndefined(model.correctAns)) {
                        var numObj = []
                        _.each(number_array, function (n, i) {
                            numObj[i] = {};
                            numObj[i].fracDisplay = number_array[i];
                            var fNums = number_array[i].match(/[0-9]+/g)
                            numObj[i].decValue = fNums[0] / fNums[1];
                        });
                        model.correctAns = _.random(2);
                        if (model.correctAns == 1) {
                            var shuffledArray = _.shuffle(number_array);
                            variables.$n2 = variables.$n1 = shuffledArray[0];
                        } else {
                            if (model.correctAns == 0) {
                                if (!(numObj[0].decValue < numObj[1].decValue)) {
                                    var temp = numObj[0];
                                    numObj[0] = numObj[1];
                                    numObj[1] = temp;
                                }
                            } else if (model.correctAns == 2) {
                                if (!(numObj[0].decValue > numObj[1].decValue)) {
                                    var temp = numObj[0];
                                    numObj[0] = numObj[1];
                                    numObj[1] = temp;
                                }
                            }
                            variables.$n1 = numObj[0].fracDisplay;
                            variables.$n2 = numObj[1].fracDisplay;
                        }
                    }
                }
                var nums = i18n.translateFraction([variables.$n1, variables.$n2], nlangId);
                model.nums = nums;
            }
        }
        model.lhs_options = [];
        model.rhs_options = [];

        var nums = model.nums;

        // populate lhs_options of model
        // there is only one lhs option which is the answer box
        var lhs_model = {
            "value": {
                "type": "image",
                "audio": "",
                "text": "",
                "asset": "emptyBg"
            },
            "index": 0
        }
        model.lhs_options.push(lhs_model);

        var symbolsImg = ["lesser", "equal", "greater"];
        // populate rhs_options of model
        _.each(_.range(3), function (j) {
            var ans = j == model.correctAns ? 0 : "";
            var rhs_model = {
                "value": {
                    "type": "image",
                    "audio": "",
                    "text": "",
                    "asset": symbolsImg[j]
                },
                "answer": ans
            }
            model.rhs_options.push(rhs_model);
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
        var rows = 2;
        // Lets have a gutter of 4 units between the first row and the title
        gridData.layout.push({
            type: "gutter",
            h: 4
        });

        // This row will display a number on the left side, a place-holder for answer in
        // the middle and another number on the right side
        var firstRow = {
            type: "row",
            h: 10,
            cols: [{
                    type: "offset",
                    w: 2
                },
                {
                    type: "column",
                    id: "num0",
                    w: 3
                },
                {
                    type: "column",
                    id: "lhs",
                    w: 2
                },
                {
                    type: "column",
                    id: "num1",
                    w: 3
                },
            ]
        }
        gridData.layout.push(firstRow);
        gridData.layout.push({
            type: "gutter",
            h: 7
        });

        // This row will have the three comparison symbols (<,=,>)
        var secondRow = {
            type: "row",
            h: 8,
            cols: [{
                type: "offset",
                w: 3
            }]
        };
        for (c = 0; c < 3; c++) {
            var cellId = "rhs_options[" + c + "]";
            secondRow.cols.push({
                id: cellId,
                type: "column",
                w: 2
            });
        }
        gridData.layout.push(secondRow);

        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        var grid = PluginManager.getPluginObject(gridData.id);

        // invoke mtf on grid
        if (!data.isSolution) {
            var mtfObj = {};
            mtfObj.model = "item";
            mtfObj.force = "true";
            mtfObj.id = "mtfObj";
            PluginManager.invoke("mtf", mtfObj, grid, this._stage, this._theme);
        }

        // create shape and text for the two number cells
        _.each([0, 1], function (i) {
            var numCell = PluginManager.getPluginObject("num" + i);
            var bgObj = {
                asset: "lhsBg",
                h: 100,
                x: 0,
                y: 0,
                stretch: "false",
                type: "roundrect"
            }
            PluginManager.invoke('image', bgObj, numCell, instance._stage, instance._theme);

            var textObj = {
                identifier: _.uniqueId("math-text"),
                align: "center",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                h: "100",
                w: "100",
                x: "0",
                y: "0",
                $t: nums[i].displayValue,
                content: nums[i].displayValue
            }
            PluginManager.invoke('mathtext', textObj, numCell, instance._stage, instance._theme);
        });

        // invoke lhs option if it's not a solution else invoke image with correct symbol
        var lhsOption = PluginManager.getPluginObject("lhs");
        // lets create the LHS placeholder (a slightly smaller size as per UI mock) as a child of the cell
        // and have the option builder build the option inside this place holder
        var lhsPHData = {
            h: 80,
            w: 100,
            x: 0,
            y: 10,
            id: "lhs_options[0]"
        }
        // resize the gridcell to get correct dimensions for the answer box
        PluginManager.invoke('g', lhsPHData, lhsOption, this._stage, this._theme);
        var lhsPlaceHolderObj = PluginManager.getPluginObject("lhs_options[0]");
        if (!data.isSolution) {
            instance.createLHSOption(lhsPlaceHolderObj, {
                mtfId: mtfObj.id
            });
        } else {
            // For showing the solution, let's create the image to display the correct answer
            var imageObj = {
                asset: symbolsImg[model.correctAns],
                w: 100,
                x: 0,
                y: 10
            }
            PluginManager.invoke('image', imageObj, lhsPlaceHolderObj, instance._stage, instance._theme);
        }

        // add the RHS options
        _.each([0, 1, 2], function (i) {
            // RHS is displayed only when solving question, for solution we'll not display them
            if (!data.isSolution) {
                var op = PluginManager.getPluginObject("rhs_options[" + i + "]");
                var ImgeObj = {
                    asset: "emptyBg",
                    w: 100,
                    x: 0,
                    y: 0,
                    stretch: false
                }
                PluginManager.invoke('image', ImgeObj, op, instance._stage, instance._theme);
                instance.createRHSOption(op, {
                    mtfId: mtfObj.id
                });
            }
        });
    },

    /**
     *  creates mtf rhs option on the specified parent
     * @param {Object} opParent- the parent cell
     * @param {string} mtfId - Id of mtf object
     */
    createRHSOption: function (opParent, config) {
        var mtfOptData = {
            id: opParent._data.id + "_opt",
            w: opParent._data.w,
            x: opParent._data.x,
            h: opParent._parent._data.h,
            y: opParent._parent._data.y,
            attachMh: false,
            templateId: config.mtfId,
            color: config.fill
        };
        PluginManager.invoke('org.ekstep.funtoot.optionBuilder', mtfOptData, opParent, this._stage, this._theme);
    },
    /**
     *  creates mtf lhs option on the specified parent
     * @param {Object} opParent- the parent cell
     * @param {string} mtfId - Id of mtf object
     */
    createLHSOption: function (opParent, config) {
        var mtfOptData = {
            id: opParent._data.id + "_opt",
            w: opParent._parent._data.w,
            x: opParent._parent._data.x,
            h: 0.8 * (opParent._parent._parent._data.h),
            y: opParent._parent._parent._data.y + 0.1 * (opParent._parent._parent._data.h),
            attachMh: true,
            templateId: config.mtfId,
            color: config.fill,
            stroke: config.stroke
        };
        PluginManager.invoke('org.ekstep.funtoot.optionBuilder', mtfOptData, opParent, this._stage, this._theme);
    },
    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     */
    onSubmit: function (evt, instance) {
        var model = this._stage._stageController.getModelValue();
        var rhs_options = model.rhs_options;
        var lhs_options = model.lhs_options;

        var result = {
            isSolved: true,
            resValues: [{
                "selected": ""
            }],
            mmc: []
        };
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var unselectedOptions = 0;
        if (!model.fraction & !model.decimal) {
            for (let i = 0; i < rhs_options.length; i++) {
                var lhs_selected;
                if (!_.isUndefined(rhs_options[i].selected)) {
                    if (rhs_options[i].answer.toString() && rhs_options[i].answer.toString() == rhs_options[i].selected.toString()) {
                        lhs_options[0].isCorrect = true;
                    } else {
                        lhs_options[0].isCorrect = false;
                        if (model.model.variables.$n1 > 999 || model.model.variables.$n2 > 999) {
                            lhs_options[0].mh = i18n.translate("GREATER_THAN_999");
                            lhs_options[0].mmc = "C484";
                        } else {
                            lhs_options[0].mh = i18n.translate("LESSER_THAN_999");
                            lhs_options[0].mmc = "C226";
                        }
                        result.isSolved = false;
                        result.mmc.push(lhs_options[0].mmc);
                    }
                    var optionObj = PluginManager.getPluginObject("option_lhs_options[0]");
                    optionObj.onEvaluate("lhs_options[0]");
                    result.resValues[0].selected = i;
                } else unselectedOptions++;
            }
            if (unselectedOptions == rhs_options.length) {
                result = false
            }
            return result;
        } else if (model.decimal) {
            for (let i = 0; i < rhs_options.length; i++) {
                var lhs_selected;
                if (!_.isUndefined(rhs_options[i].selected)) {
                    if (rhs_options[i].answer.toString() && rhs_options[i].answer.toString() == rhs_options[i].selected.toString()) {
                        lhs_options[0].isCorrect = true;
                    } else {
                        lhs_options[0].isCorrect = false;

                        lhs_options[0].mh = i18n.translate("DECIMAL1");
                        lhs_options[0].mmc = "DE147";

                        result.isSolved = false;
                        result.mmc.push(lhs_options[0].mmc);
                    }
                    var optionObj = PluginManager.getPluginObject("option_lhs_options[0]");
                    optionObj.onEvaluate("lhs_options[0]");
                    result.resValues[0].selected = i;
                } else unselectedOptions++;
            }
            if (unselectedOptions == rhs_options.length) {
                result = false
            }
            return result;
        } else if (model.fraction) {
            for (let i = 0; i < rhs_options.length; i++) {
                var lhs_selected;
                if (!_.isUndefined(rhs_options[i].selected)) {
                    if (rhs_options[i].answer.toString() && rhs_options[i].answer.toString() == rhs_options[i].selected.toString()) {
                        lhs_options[0].isCorrect = true;
                    } else {
                        lhs_options[0].isCorrect = false;
                        console.log("num0", model.nums[0].decValue)
                        console.log("num1", model.nums[1].decValue)
                        if (model.nums[0].decValue == model.nums[1].decValue) {
                            lhs_options[0].mh = i18n.translate("FRAC_EQUAL_CHECK");
                            lhs_options[0].mmc = "C484";
                        } else {
                            lhs_options[0].mh = i18n.translate("FRAC1");
                            lhs_options[0].mmc = "C226";
                        }
                        result.isSolved = false;
                        result.mmc.push(lhs_options[0].mmc);
                    }
                    var optionObj = PluginManager.getPluginObject("option_lhs_options[0]");
                    optionObj.onEvaluate("lhs_options[0]");
                    result.resValues[0].selected = i;
                } else unselectedOptions++;
            }
            if (unselectedOptions == rhs_options.length) {
                result = false
            }
            return result;
        }
    }
});