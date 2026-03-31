//@ sourceURL= genericseq-renderer.js
/**
 * This plugin is used to generate word problems.
 * @extends ftPlugin
 * @fires ftFibBasePlugin, ftb
 * @author Henrietta D <henrietta.d@funtoot.com>
 */

org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.genericseq',
    _isContainer: !0,
    _render: !0,
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var model = item.getModelValue();
        var generator = PluginManager.getPluginObject("generators");
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = item.getModelValue("variables");
        var defaultFontSize = this.getFontSize(data.isSolution);
        var langId = this._item.getModelValue().model.langId || "en";
        // process the variables only if non-solution display
        if (!data.isSolution) {
            var i18nData = this._item.getModelValue().i18n;
            if (typeof (i18nData) == 'string')
                i18nData = JSON.parse(this._item.getModelValue().i18n);
            this._item.setModelValue("i18n", i18nData);
        }
        var trans = this._item.getModelValue("i18n")[langId];
        if (!this._item.getModelValue("model").variablesProcessed && !data.isSolution) {
            this.processVariables(variables);
            this._item.setModelValue("hintMsg", generator.replaceVariables(trans[this._item.getModelValue("hintMsg")], variables));
            this._item.setModelValue("fibModels", {});
        }
        var qImgKey = this._item.getModelValue().questionImage;
        var seqStepsText1 = _.pluck(this._item.getModelValue().model.seqSteps, 'text');
        var seqStepsImg = _.pluck(this._item.getModelValue().model.seqSteps, 'image');
        var isTextStep = _.every((seqStepsImg), function (s) { return s == null; })
        var seqStepsText = [];
        if (isTextStep)
            _.each(seqStepsText1, function (s) {
                seqStepsText.push(generator.replaceVariables(trans[s], variables))
            });
        this._variables = variables;
        var shuffledRhs = _.shuffle(this._item.getModelValue().model.seqSteps);
        var nums = isTextStep ? seqStepsText : seqStepsImg;
        model.lhs_options = [];
        model.rhs_options = [];
        _.each(nums, function (num, j) {
            var lhs_model = {
                value: { type: "mixed", audio: "", image: "", asset: "", "fontsize": defaultFontSize },
                index: j
            }

            var rhs_model = {
                value: { type: isTextStep ? "text" : "image", audio: "", image: "", asset: isTextStep ? generator.replaceVariables(trans[shuffledRhs[j].text], variables) : shuffledRhs[j].image, "fontsize": defaultFontSize },
                answer: shuffledRhs[j].identifier, mh: shuffledRhs[j].mh, mmc: shuffledRhs[j].mmc
            }


            model.lhs_options.push(lhs_model);
            model.rhs_options.push(rhs_model);
        });
        var rowHeight = isTextStep ? 12 : 18; // in units
        var rowWidth = 12 / (this._item.getModelValue().model.seqSteps.length);
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100, h: 100, x: 0, y: 0,
            cbObj: instance,
            //debug: true
        };
        gridData.layout = [];
        if (!_.isUndefined(qImgKey) && qImgKey != "") {
            questionRow = {
                type: "row", h: 27,
                cols: [
                    { type: "column", id: "qImg", w: 4 },
                    { type: "column", id: "questionText", w: 8 }
                ]
            };
        }
        else {
            questionRow = {
                type: "row", h: isTextStep ? 27 : 10,
                cols: [
                    { type: "column", id: "questionText", w: 12 },
                ]
            };
        }
        gridData.layout.push(questionRow);
        gridData.layout.push({ type: "gutter", h: 4 });
        var rows = nums.length;
        for (var r = 0; r < 3; r++) {
            var colId = r == 0 ? "rank" : (r == 1 ? "lhs_options" : "rhs_options");
            var rrow = { type: "row", h: r == 0 ? 10 : rowHeight, cols: [] };
            for (var c = 0; c < nums.length; c++) {
                rrow.cols.push({
                    id:
                    colId + "[" + c + "]", type: "column", w: rowWidth
                })
            }
            gridData.layout.push(rrow);
            if (r < rows - 1)
                gridData.layout.push({ type: "gutter", h: r == 0 ? 1 : 3 });
        }
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var questionText = generator.replaceVariables(trans[this._item.getModelValue().question], variables);
        var questionCell = PluginManager.getPluginObject("questionText");
        var QtextObj = {
            align: "center",
            color: "#4c4c4c",
            fontsize: defaultFontSize,
            h: 100, w: 100, x: 0, y: 0,
            $t: i18n.translate(questionText),
            valign: "middle"
        }
        PluginManager.invoke('text', QtextObj, questionCell, instance._stage, instance._theme);
        if (!_.isUndefined(qImgKey) && qImgKey != "") {
            var qImage = PluginManager.getPluginObject("qImg");
            var tileImageObj = {
                h: 100, x: 0, y: 0, asset: qImgKey, valign: "middle", align: "center"
            };
            if (!data.isSolution)
                PluginManager.invoke('org.ekstep.funtoot.zoomableImage', tileImageObj, qImage, this._stage, this._theme);
            else
                PluginManager.invoke('image', tileImageObj, qImage, this._stage, this._theme);
        }
        _.each(nums, function (n, index) {
            var rankCell = PluginManager.getPluginObject("rank" + "[" + index + "]");
            var OptImageObj = {
                identifier: _.uniqueId("cric"),
                h: 96, x: 0, y: 0,
                asset: "seq",
                valign: "middle",
                align: "center"
            };
            PluginManager.invoke('image', OptImageObj, rankCell, instance._stage, instance._theme);

            var rankObj = {
                align: "center",
                color: "#ffffff",
                fontsize: defaultFontSize,
                h: 100, w: 100, x: 0, y: 2,
                $t: index + 1,
                valign: "middle"
            }
            PluginManager.invoke('text', rankObj, rankCell, instance._stage, instance._theme);

        });
        var grid = PluginManager.getPluginObject(gridData.id);
        var mtfObj = {
            id: "mtfObj",
            model: "item",
            force: "true"
        };
        PluginManager.invoke("mtf", mtfObj, grid, this._stage, this._theme);
        //var colors = ["#68c7ec", "#f7a897", "#f4d161", "#f289b7", "#b0d775"];
        // add the LHS options using the options builder

        _.each(nums, function (num, i) {
            // add the LHS options first
            var op = PluginManager.getPluginObject("lhs_options[" + i + "]");
            //create option if it's not for solution display
            if (!data.isSolution) {
                var curve = PluginManager.getPluginObject("lhs_options[" + i + "]");
                var controlXPoint = curve._dimensions.x;
                if (i > 0) {
                    var pcurve = PluginManager.getPluginObject("lhs_options[" + (i - 1) + "]");
                    var gap = (curve._dimensions.x - pcurve._dimensions.x - (2 * curve._dimensions.w)) / 2;
                    console.log(gap);
                    console.log("curr- " + curve._dimensions.x + " previous " + pcurve._dimensions.x);
                    controlXPoint = (curve._dimensions.x - (curve._dimensions.w * i) - (14.5 * i));
                }
                var rect = new createjs.Shape();
                //rect.graphics.beginFill("#000000");
                console.log("debug- " + i + controlXPoint);
                rect.graphics.setStrokeDash([3, 3]);
                rect.graphics.setStrokeStyle(1).beginStroke("#000000").drawRect(controlXPoint - 1, curve._dimensions.y - 1, curve._dimensions.w + 2, curve._dimensions.h + 2);
                curve.addChild(rect);
                curve.update();
                instance.buildOption(op, {
                    mtfId: mtfObj.id,
                    fill: "#F4F7EC",
                    attachMh: true
                });
            }
            // create shape and text in case of solution
            else {
                var shapeObj = {
                    fill: "#F4F7EC",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect",
                    stroke: "#F4F7EC"
                }
                PluginManager.invoke('shape', shapeObj, op, instance._stage, instance._theme);
                if (isTextStep) {
                    var textObj = {
                        identifier: _.uniqueId("math-textop"),
                        align: "center",
                        color: "#4c4c4c",
                        fontsize: nums[i].length > 6 ? instance.getFontSize(data.isSolution, 2.0) : defaultFontSize,
                        h: 100,
                        w: 100,
                        x: 0,
                        y: 0,
                        content: nums[i],
                        valign: "middle",
                        isSolution: data.isSolution
                    }
                    PluginManager.invoke('mathtext', textObj, op, instance._stage, instance._theme);
                }
                else {
                    var OptImageObj = {
                        identifier: _.uniqueId("math-imgop"),
                        h: 100, x: 0, y: 0,
                        asset: nums[i],
                        valign: "middle",
                        align: "center"
                    };
                    PluginManager.invoke('image', OptImageObj, op, instance._stage, instance._theme);
                }
            }
        });
        // add the RHS options using the option builder
        _.each(nums, function (num, i) {
            // add the RHS options if it's not for solution display
            if (!data.isSolution) {
                var op = PluginManager.getPluginObject("rhs_options[" + i + "]");
                var shapeObj = {
                    fill: "#DAB4C9",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    stroke: "#DAB4C9",
                    type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, op, this._stage, this._theme);
                instance.buildOption(op, {
                    mtfId: mtfObj.id,
                    fill: "#DAB4C9",
                    attachMh: false
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
        var result = { isSolved: true, resValues: [], mmc: [] };
        var generator = PluginManager.getPluginObject("generators");
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var trans = this._item.getModelValue("i18n")[this._item.getModelValue().model.langId || "en"];
        for (var i = 0; i < rhs_options.length; i++) {
            var lhs_selected;
            if (!_.isUndefined(rhs_options[i].selected)) {
                lhs_selected = rhs_options[i].selected;
                if (rhs_options[i].selected == rhs_options[i].answer) {
                    lhs_options[lhs_selected].isCorrect = true;
                }
                else {
                    lhs_options[lhs_selected].isCorrect = false;
                    lhs_options[lhs_selected].mh = generator.replaceVariables(trans[rhs_options[i].mh], this._variables);
                    lhs_options[lhs_selected].mmc = rhs_options[i].mmc;
                    result.isSolved = false;
                    result.mmc.push(rhs_options[i].mmc);

                }
            }
            else {
                result.isSolved = false;
                result.mmc.push("01");
            }
        }
        for (var j = 0; j < rhs_options.length; j++) {
            if (_.isUndefined(lhs_options[j].isCorrect)) {
                lhs_options[j].mh = trans["NO_ANSWER"];
                lhs_options[j].mmc = "01";
            }
            var optionObj = PluginManager.getPluginObject("option_lhs_options[" + j + "]");
            optionObj.onEvaluate("lhs_options[" + j + "]");
        }
        return result;
    }
});