//@ sourceURL=romanmtf-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate roman mtf problems
 * @extends ftBasePlugin
 * @author Amulya (amulya.k@funtoot.com)
 */
org.ekstep.funtoot.ftPlugin.extend({
    _type: 'org.ekstep.funtoot.romanmtf',
    /**
     * initializes the plugin
     * @param {object} data the data for the plugin
     */
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var model = item.getModelValue();
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = item.getModelValue("variables");
        var defaultFontSize = this.getFontSize(data.isSolution);
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
        }
        var arabicnums = variables.$nums;
        var romanNums = [];
        _.each(arabicnums, function (num, i) {
            romanNums.push({
                value: i18n.toRoman(num),
                index: i
            });
        });
        var shuffledRhs = _.shuffle(romanNums);
        var nums = i18n.translateNumber(arabicnums, item.getModelValue("numericLangId"));
        model.lhs_options = [];
        model.rhs_options = [];
        _.each(nums, function (num, j) {
            var lhs_model = {
                value: {
                    type: "mixed",
                    audio: "",
                    image: "",
                    asset: "",
                    "fontsize": defaultFontSize
                },
                index: j
            }
            var rhs_model = {
                value: {
                    type: "text",
                    audio: "",
                    image: "",
                    asset: shuffledRhs[j].value,
                    "fontsize": defaultFontSize
                },
                answer: shuffledRhs[j].index
            }
            model.lhs_options.push(lhs_model);
            model.rhs_options.push(rhs_model);
        });
        var rowHeight = 8; // in units
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
        var rows = nums.length;
        for (var i = 0; i < rows; i++) {
            var newRow = {
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 1
                }]
            };
            // push lhs
            newRow.cols.push({
                id: "lhs_text[" + i + "]",
                type: "column",
                w: 3
            });
            newRow.cols.push({
                id: "symbol[" + i + "]",
                type: "column",
                w: 1
            });
            newRow.cols.push({
                id: "lhs_options[" + i + "]",
                type: "column",
                w: 3
            })
            //  newRow.cols.push({ type: "offset", w: 2 });
            newRow.cols.push({
                id: "rhs_options[" + i + "]",
                type: "column",
                w: 3
            });
            gridData.layout.push(newRow);
            if (i < rows - 1)
                gridData.layout.push({
                    type: "gutter",
                    h: 4
                });
        }
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var questionText = model.model.questionText;
        var questionCell = PluginManager.getPluginObject("questionText");
        var QtextObj = {
            align: "center",
            color: "#4c4c4c",
            fontsize: defaultFontSize,
            h: 100,
            w: 100,
            x: 0,
            y: 0,
            $t: i18n.translate(questionText),
            valign: "middle"
        }
        PluginManager.invoke('text', QtextObj, questionCell, instance._stage, instance._theme);
        var grid = PluginManager.getPluginObject(gridData.id);
        var mtfObj = {
            id: "mtfObj",
            model: "item",
            force: "true"
        };
        PluginManager.invoke("mtf", mtfObj, grid, this._stage, this._theme);
        // add the LHS options using the options builder
        _.each(nums, function (num, i) {
            //add LHS text
            var textContainer = PluginManager.getPluginObject("lhs_text[" + i + "]");
            var symbolContainer = PluginManager.getPluginObject("symbol[" + i + "]")
            var shapeObj = {
                fill: "#cccccc",
                stroke: "#BFBFBF",
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                type: "rect",
            }
            PluginManager.invoke('shape', shapeObj, textContainer, instance._stage, instance._theme);
            var textObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                h: "100",
                w: 100,
                x: 0,
                y: 0,
                $t: nums[i].displayValue,
                valign: "middle"
            }
            PluginManager.invoke('text', textObj, textContainer, instance._stage, instance._theme);
            var symbolObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                h: "100",
                w: 100,
                x: 0,
                y: 0,
                $t: "=",
                valign: "middle"
            }
            PluginManager.invoke('text', symbolObj, symbolContainer, instance._stage, instance._theme);
            // add the LHS options first
            var op = PluginManager.getPluginObject("lhs_options[" + i + "]");
            //create option if it's not for solution display
            if (!data.isSolution) {
                instance.buildOption(op, {
                    mtfId: mtfObj.id,
                    fill: "#cccccc",
                    attachMh: true
                });
                var optShapeObj = {
                    fill: "#cccccc",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    stroke: "#BFBFBF",
                    type: "rect",
                }
                PluginManager.invoke('shape', optShapeObj, op, instance._stage, instance._theme);
            }
            // create shape and text in case of solution
            else {
                var solShapeObj = {
                    fill: "#cccccc",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect",
                }
                PluginManager.invoke('shape', solShapeObj, op, instance._stage, instance._theme);
                var solTextObj = {
                    align: "center",
                    color: "#4c4c4c",
                    fontsize: defaultFontSize,
                    h: "100",
                    w: 100,
                    x: 0,
                    y: 0,
                    $t: romanNums[i].value,
                    valign: "middle"
                }
                PluginManager.invoke('text', solTextObj, op, instance._stage, instance._theme);
            }
        });
        // add the RHS options using the option builder

        _.each(nums, function (num, i) {
            // add the RHS options if it's not for solution display
            if (!data.isSolution) {
                var op = PluginManager.getPluginObject("rhs_options[" + i + "]");
                var shapeObj = {
                    fill: "#FFFFCC",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    stroke: "#CCCCCC",
                    type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, op, instance._stage, instance._theme);
                instance.buildOption(op, {
                    mtfId: mtfObj.id,
                    attachMh: false,
                    fill: "#cccccc"
                });
            }
        });
    },
    /**
     * creates mtf option on the specified parent
     * @param {Object} opParent parent cell
     * @param {config} config details for the cell
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
     * @returns {object} evaluation results
     */
    onSubmit: function (evt, instance) {
        var model = instance._stage._stageController.getModelValue();
        var rhs_options = model.rhs_options;
        var lhs_options = model.lhs_options;
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            // get the i18n plugin object
            var i18n = PluginManager.getPluginObject('i18n_helper');
            for (var i = 0; i < rhs_options.length; i++) {
                var lhs_selected;
                if (!_.isUndefined(rhs_options[i].selected)) {
                    lhs_selected = rhs_options[i].selected;
                    var res = {};
                    res[rhs_options[i].selected] = rhs_options[i].value.$t;
                    if (rhs_options[i].selected == rhs_options[i].answer) {
                        lhs_options[lhs_selected].isCorrect = true;
                    } else {
                        lhs_options[lhs_selected].isCorrect = false;
                        lhs_options[lhs_selected].mh = i18n.translate(model.model.mh);
                        lhs_options[lhs_selected].mmc = model.model.ConceptCode;
                        result.isSolved = false;
                    }
                    result.resValues.push(res);
                } else {
                    result.isSolved = false;
                    result.mmc.push("01");
                }
            }
            if (!result.isSolved)
                result.mmc = model.model.mmcs.split(",");
            for (var j = 0; j < rhs_options.length; j++) {
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