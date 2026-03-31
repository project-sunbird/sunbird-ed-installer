//@ sourceURL=orderingNumbersbase.js
/* global PluginManager */
/**
 * This plugin is used to generate ordering numerals problems
 * @extends ftBasePlugin
 * @fires mtfOptionBuilder, grid
 * @author Amulya (amulya.k@funtoot.com)
 */
org.ekstep.funtoot.ftPlugin.extend({
    _type: 'org.ekstep.funtoot.orderingNumbersbase',
    _isContainer: !0,
    _render: !0,
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

        // color codes for each rhs option box
        var colors = ["#68c7ec", "#f7a897", "#f4d161", "#f289b7", "#b0d775"];
        var variables = item.getModelValue("variables");
        var defaultFontSize = this.getFontSize(data.isSolution);
        /**
         * lets give the ascending followed by descending
         * if the index is even, then question is about ascending
         * and if the index is odd, question is about descending order
         */
        var orderingIndex = item._index % 2 ? -1 : 1;
        model.order = orderingIndex == -1 ? "descending" : "ascending";
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
        }
        var fraction = false;

        if (model.IsFraction) {
            fraction = true;
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

        var number_array = [variables.$n1, variables.$n2, variables.$n3, variables.$n4, variables.$n5];
        // sort the array according to the ordering
        if (!fraction) {
            var sortedArray = _.sortBy(number_array, function (num) {
                return num * orderingIndex;
            });
            var nums = i18n.translateNumber(sortedArray, nlangId);
        } else {
            var numObj = []
            _.each(number_array, function (n, i) {
                numObj[i] = {};
                numObj[i].fracDisplay = number_array[i];
                var fNums = number_array[i].match(/[0-9]+/g)
                numObj[i].decValue = fNums[0] / fNums[1];
            });
            var len = numObj.length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < len - i - 1; j++) { // this was missing
                    if (numObj[j].decValue > numObj[j + 1].decValue) {
                        // swap
                        var temp = numObj[j];
                        numObj[j] = numObj[j + 1];
                        numObj[j + 1] = temp;
                    }
                }
            }

            var sortedArray = [];
            _.each(numObj, function (n, i) {
                sortedArray.push(n.fracDisplay);
            });
            if (model.order == "descending")
                sortedArray.reverse();
            var nums = i18n.translateFraction(sortedArray, nlangId);
        }
        // add the sorted position for each nums model
        _.each(nums, function (num, k) {
            num.index = k;
        });

        var shuffledArray = _.shuffle(nums);
        model.lhs_options = [];
        model.rhs_options = [];
        var fontsize = shuffledArray[0].displayValue.length > 6 ? this.getFontSize(data.isSolution, 2.2) : defaultFontSize;
        _.each(nums, function (num, j) {
            var lhs_model = {
                value: {
                    type: "mixed",
                    audio: "",
                    image: "",
                    text: "",
                    content: "",
                    $t: "",
                    "fontsize": fontsize
                },
                index: j
            }
            var rhs_model = {
                value: {
                    identifier: _.uniqueId("fraction-op"),
                    type: "text",
                    audio: "",
                    image: "",
                    asset: shuffledArray[j].displayValue,
                    content: shuffledArray[j].displayValue,
                    $t: shuffledArray[j].displayValue,
                    "fontsize": fontsize
                },
                answer: shuffledArray[j].index
            }
            model.lhs_options.push(lhs_model);
            model.rhs_options.push(rhs_model);
        });

        var rowHeight = 8; // in units
        if (fraction) {
            rowHeight = 10;
        }
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
        var imgRow = {
            type: "row",
            h: 19,
            cols: [{
                type: "offset",
                w: 1
            }, {
                id: "imageId",
                type: "column",
                w: 10
            }]
        };

        //push image row
        gridData.layout.push(imgRow);
        gridData.layout.push({
            type: "gutter",
            h: 2
        });
        var rows = 2;
        for (r = 0; r < rows; r++) {
            var newRow = {
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 1
                }]
            };
            for (c = 0; c < nums.length; c++) {
                var cellId = r == 0 ? "lhs_options[" + c + "]" : "rhs_options[" + c + "]";
                newRow.cols.push({
                    id: cellId,
                    type: "column",
                    w: 2
                });
            }
            gridData.layout.push(newRow);
            if (r < rows - 1)
                gridData.layout.push({
                    type: "gutter",
                    h: 4
                });
        }
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        // add the question stem
        i18n.onReady().then(function (o) {
            var questionText = o.translate(model.order == 'ascending' ? "QUESTION05_STEM2" : "QUESTION05_STEM1");
            var questionCell = PluginManager.getPluginObject("questionText");
            var QtextObj = {
                identifier: _.uniqueId("fraction-que"),
                align: "center",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                $t: questionText,
                content: questionText,
                valign: "middle"
            }
            PluginManager.invoke('mathtext', QtextObj, questionCell, instance._stage, instance._theme);
        }).catch(function (error) {
            console.error(error);
        });
        // place the image at the first row cell
        var imgCell = PluginManager.getPluginObject("imageId");
        var imgObj = {
            stretch: "false",
            asset: model.order,
            h: 100,
            w: 100,
            x: 0,
            y: 0
        };
        PluginManager.invoke('image', imgObj, imgCell, this._stage, this._theme);

        var grid = PluginManager.getPluginObject(gridData.id);
        var mtfObj = {
            id: "mtfObj",
            model: "item",
            force: "true"
        };
        PluginManager.invoke("mtf", mtfObj, grid, this._stage, this._theme);

        // add the LHS options using the options builder
        _.each(nums, function (num, i) {
            // add the LHS options first
            var op = PluginManager.getPluginObject("lhs_options[" + i + "]");
            //create option if it's not for solution display
            if (!data.isSolution) {
                instance.buildOption(op, {
                    mtfId: mtfObj.id,
                    fill: colors[i],
                    attachMh: true
                });
            }
            // create shape and text in case of solution
            else {
                var shapeObj = {
                    fill: colors[i],
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, op, this._stage, this._theme);

                var textObj = {
                    identifier: _.uniqueId("math-textop"),
                    align: "center",
                    color: "#4c4c4c",
                    fontsize: nums[i].displayValue.length > 6 ? instance.getFontSize(data.isSolution, 2.0) : defaultFontSize,
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    $t: nums[i].displayValue,
                    content: nums[i].displayValue,
                    valign: "middle",
                    isSolution: data.isSolution
                }
                PluginManager.invoke('mathtext', textObj, op, this._stage, this._theme);
            }
        });
        // add the RHS options using the option builder
        _.each(nums, function (num, i) {
            // add the RHS options if it's not for solution display
            if (!data.isSolution) {
                var op = PluginManager.getPluginObject("rhs_options[" + i + "]");
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
                instance.buildOption(op, {
                    mtfId: mtfObj.id,
                    attachMh: false
                });
            }
        });
    },
    /**
     *  creates mtf option on the specified parent
     * @param {Object} opParent- the parent cell
     */
    buildOption: function (opParent, config) {
        var mtfOptData = {
            id: opParent._data.id + "_opt",
            w: opParent._data.w,
            x: opParent._data.x,
            h: opParent._parent._data.h,
            y: opParent._parent._data.y,
            templateId: config.mtfId,
            color: config.fill,
            attachMh: config.attachMh
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
        var ordering = model.order;
        var digits = rhs_options[0].value.asset.toString().length;
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            // get the i18n plugin object
            var i18n = PluginManager.getPluginObject('i18n_helper');
            for (let i = 0; i < rhs_options.length; i++) {
                var lhs_selected;
                if (!_.isUndefined(rhs_options[i].selected)) {
                    var res = {};
                    res[rhs_options[i].selected] = rhs_options[i].value.$t;
                    lhs_selected = rhs_options[i].selected;
                    if (rhs_options[i].selected == rhs_options[i].answer) {
                        lhs_options[lhs_selected].isCorrect = true;
                    } else {
                        lhs_options[lhs_selected].isCorrect = false;
                        if (digits > 4) {
                            if (ordering == "ascending") {
                                lhs_options[lhs_selected].mh = i18n.translate("GREATER_THAN_9999_ASCENDING");
                                lhs_options[lhs_selected].mmc = "C670";
                            } else {
                                lhs_options[lhs_selected].mh = i18n.translate("GREATER_THAN_9999_DESCENDING");
                                lhs_options[lhs_selected].mmc = "C467";
                            }
                        } else {
                            if (ordering == "ascending") {
                                lhs_options[lhs_selected].mh = i18n.translate("LESSER_THAN_9999_ASCENDING");
                                lhs_options[lhs_selected].mmc = "C670";
                            } else {
                                lhs_options[lhs_selected].mh = i18n.translate("LESSER_THAN_9999_DESCENDING");
                                lhs_options[lhs_selected].mmc = "C467";
                            }
                        }
                        result.isSolved = false;
                        result.mmc.push(lhs_options[lhs_selected].mmc);
                    }
                    result.resValues.push(res);
                } else {
                    result.isSolved = false;
                    result.mmc.push("01");
                }
            }
            for (j = 0; j < rhs_options.length; j++) {
                if (_.isUndefined(lhs_options[j].isCorrect)) {
                    lhs_options[j].mh = i18n.translate("NO_ANSWER");
                    lhs_options[j].mmc = "01";
                }
                var optionObj = PluginManager.getPluginObject("option_lhs_options[" + j + "]");
                optionObj.onEvaluate("lhs_options[" + j + "]");
            }
            return result;
        } else return false
    },
    /**
     * checks if user has answered completely
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (instance) {
        var selOptCount = 0;
        var options = instance._item.getModelValue().rhs_options;
        _.each(options, function (o) {
            if (o.selected >= 0)
                selOptCount++
        })
        if (selOptCount == options.length)
            return true
        else return false
    }
});