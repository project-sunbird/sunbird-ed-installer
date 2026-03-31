//@ sourceURL=compareNumbers.js
/* global PluginManager */
PluginManager.customPluginMap["ftPlugin"].extend({
    _type: "org.ekstep.funtoot.compareNumbers",
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var helper = PluginManager.getPluginObject('plugin_helper');
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var model = item.getModelValue();
        var random = _.random(2);
        var variables = item.getModelValue("variables");
        // process the variables only if non-solution display
        if (!data.isSolution) {
            helper.processVariables(variables);
        }
        var rowHeight = 10; // in units
        var number_array = [variables.$n1, variables.$n2];
        var shuffledArray = _.shuffle(number_array);
        if (random == 0) shuffledArray = [variables.$n1, variables.$n1];
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var nums = i18n.translateNumber(shuffledArray, item.getModelValue("langid"));

        model.lhs_options = [];
        model.rhs_options = [];

        // populate lhs_options of model
        var lhs_model = {
            "value": { "type": "mixed", "audio": "", "image": "", "text": "" },
            "index": 0
        }
        model.lhs_options.push(lhs_model);
        var symbols = ["<", "=", ">"];
        var symbolsImg = ["lesser", "equal", "greater"];
        var correctAns;
        if (shuffledArray[0] == shuffledArray[1]) correctAns = 1;
        else if (shuffledArray[0] < shuffledArray[1]) correctAns = 0;
        else correctAns = 2;

        // populate rhs_options of model
        _.each(_.range(3), function (j) {
            var ans = j == correctAns ? 0 : "";
            var rhs_model = {
                "value": { "type": "mixed", "audio": "", "image": symbolsImg[i], "text": "" },
                "answer": ans
            }

            model.rhs_options.push(rhs_model);
        });
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);


        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100, h: 100, x: 0, y: 0,
            cbObj: instance,
            // debug: true
        };
        gridData.layout = [];
        var rows = 2;
        gridData.layout.push({ type: "gutter", h: 7 });
        _.each(_.range(rows), function (row) {
            var newRow = {
                type: "row", h: rowHeight, cols: [{ type: "offset", w: row == 0 ? 2 : 3 }]
            };
            for (c = 0; c < 3; c++) {
                var cellId = row == 0 ? "lhs_options[" + (c - 1) + "]" : "rhs_options[" + c + "]";
                newRow.cols.push({ id: cellId, type: "column", w: row == 1 ? 2 : c == 1 ? 2 : 3 });
            }
            gridData.layout.push(newRow);
            if (row < rows - 1)
                gridData.layout.push({ type: "gutter", h: 7 });
        });
        PluginManager.invoke('org.ekstep.funtoot.common.grid', gridData, contentContainer, this._stage, this._theme);

        var grid = PluginManager.getPluginObject(gridData.id);
        // invoke mtf on grid 
        if (!data.isSolution) {
            var mtfObj = {};
            mtfObj.model = "item";
            mtfObj.force = "true";
            mtfObj.id = "mtfObj";
            PluginManager.invoke("mtf", mtfObj, grid, this._stage, this._theme);
        }
        _.each(_.range(-1, 2), function (i) {
            var cell = PluginManager.getPluginObject("lhs_options[" + i + "]");
            if (i == 0) {
                // create LHS option for 2nd blank
                if (!data.isSolution)
                    instance.createOption(cell, { mtfId: mtfObj.id, fill: "#66CC33" });
                else {
                    var shapeObj = {
                        fill: "#66CC33",
                        h: 100, w: 100, x: 0, y: 0,
                        stroke: "#BFBFBF", type: "roundrect",
                    }

                    PluginManager.invoke('shape', shapeObj, cell, instance._stage, instance._theme);
                    var textObj = Object.create(null);
                    textObj.align = "center";
                    textObj.color = "#4c4c4c";
                    textObj.fontsize = "2.7vw";
                    textObj.h = "100";
                    textObj.$t = symbols[correctAns];
                    textObj.valign = "middle";
                    textObj.w = "100";
                    textObj.x = "0";
                    textObj.y = "0";
                    PluginManager.invoke('text', textObj, cell, instance._stage, instance._theme);
                }
            }
            else {
                // create text for other blanks in first row
                var shapeObj = {
                    fill: "#66CC33",
                    h: 100, w: 100, x: 0, y: 0,
                    stroke: "#BFBFBF", type: "roundrect",
                }

                PluginManager.invoke('shape', shapeObj, cell, instance._stage, instance._theme);
                var textObj = Object.create(null);
                textObj.align = "center";
                textObj.color = "#4c4c4c";
                textObj.fontsize = "2.7vw";
                textObj.h = "100";
                textObj.$t = i == -1 ? nums[0].displayValue : nums[1].displayValue;
                textObj.valign = "middle";
                textObj.w = "100";
                textObj.x = "0";
                textObj.y = "0";
                PluginManager.invoke('text', textObj, cell, instance._stage, instance._theme);
            }
        });

        _.each(_.range(3), function (i) {
            // add the RHS options 
            if (!data.isSolution) {
                var op = PluginManager.getPluginObject("rhs_options[" + i + "]");
                var shapeObj = {
                    fill: "#cccccc",
                    h: 100, w: 100, x: 0, y: 0,
                    stroke: "#BFBFBF", type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, op, instance._stage, instance._theme);
                instance.createOption(op, { mtfId: mtfObj.id, fill: "#66CC33" });
            }

        });

    },


    /**
     *  creates mtf option on the specified parent 
     * @param {Object} opParent- the parent cell
     * @param {string} mtfId - Id of mtf object
     */
    createOption: function (opParent, config) {
        var mtfOptData = {
            id: opParent._data.id + "_opt",
            w: opParent._data.w,
            x: opParent._data.x,
            h: opParent._parent._data.h,
            y: opParent._parent._data.y,
            mtfId: config.mtfId,
            color: config.fill
        };
        PluginManager.invoke('mtfOptionBuilder', mtfOptData, opParent, this._stage, this._theme);
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

        var result = { isSolved: true, resValues: [], mmc: [] };
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        for (let i = 0; i < rhs_options.length; i++) {
            var lhs_selected;
            if (!_.isUndefined(rhs_options[i].selected)) {
                if (rhs_options[i].answer.toString() && rhs_options[i].answer.toString() == rhs_options[i].selected.toString()) {
                    lhs_options[0].isCorrect = true;
                }
                else {
                    lhs_options[0].isCorrect = false;
                    if (model.model.variables.$n1 > 999 || model.model.variables.$n2 > 999) {
                        lhs_options[0].mh = i18n.translate("GREATER_THAN_999");
                        lhs_options[0].mmc = "C484";
                    }
                    else {
                        lhs_options[0].mh = i18n.translate("LESSER_THAN_999");
                        lhs_options[0].mmc = "C226";
                    }
                    result.isSolved = false;
                    result.mmc.push(lhs_options[0].mmc);
                }
                var optionObj = PluginManager.getPluginObject("lhs_options[0]_opt");
                optionObj.onEvaluate("lhs_options[0]");
            }


        }
        return result;
    },
});