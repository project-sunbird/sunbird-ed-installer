//@ sourceURL=genericmtfplugin.js
/* global PluginManager */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.genericmtf',
    initPlugin: function (data) {
        this._super(data);
        var ftdata = data;
        instance = this;
        instance.itemCtrl = this._stage.getController("item");
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var model = instance.itemCtrl.getModelValue();
        var generator = PluginManager.getPluginObject("generators");
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = item.getModelValue("variables");
        var defaultFontSize = this.getFontSize(data.isSolution);
        if (!model.isProcessed) {
            // replace text key with value from i18n
            _.each(model.rhs_options, function (opt, i) {
                if (opt.value.type == "text") {
                    opt.value.asset = model.model.langId ? model.i18n[model.model.langId][opt.value.asset] : model.i18n['en'][opt.value.asset];
                    opt.value.asset = generator.replaceVariables(opt.value.asset, variables);
                }
            })
            // create empty lhs options
            _.each(model.lhs_options, function (opt, i) {
                opt.value.asset = '';
            })
            // replace hint key with value
            model.model.hintMsg = generator.replaceVariables(model.i18n[model.model.langId][model.model.hintMsg], variables);
            model.isProcessed = true;
        }
        var shuffledRhs = _.shuffle(model.rhs_options);
        model.rhs_options = shuffledRhs;

        var shortLhs = false;  // true for short text(string length < 12) lhs 
        var shortRhs = false;  // true for short text rhs 
        if (model.lhs_options[0].value.type == 'text') {
            shortLhs = true;
            _.each(model.model.premises, function (premise) {
                if ((model.i18n[model.model.langId][premise.text]).length > 12) {
                    shortLhs = false;
                }
            });
        }
        if (model.rhs_options[0].value.type == 'text') {
            shortRhs = true;
            _.each(model.rhs_options, function (opt) {
                if (opt.value.asset.length > 12) {
                    shortRhs = false;
                }
            });
        }
        // set options and question height according to text length
        var optionHt;
        shortRhs ? optionHt = 8 : optionHt = 17;
        shortLhs ? lhsHt = 8 : lhsHt = 17;
        var questionHt = 57 - (2 * optionHt) - lhsHt;
        var horizontalOffset = (12 - 3 * (model.lhs_options.length)) / 2;
        if (model.lhs_options.length > 4) horizontalOffset = 0;
        var rowHeight = 17; // in units
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100, h: 100, x: 0, y: 0,
            cbObj: instance,
            // debug: true
        };
        gridData.layout = [];
        var questionRow = {
            type: "row", h: questionHt, cols: [], id: "questionRow"
        }
        // create placeholder for question image only if rhs option text is small
        if (shortRhs && model.questionImage) {
            questionRow.cols.push({ id: "qImage", type: "column", w: 4 });
            questionRow.cols.push({ id: "questionText", type: "column", w: 8 });
        }
        else {
            questionRow.cols.push({ id: "questionText", type: "column", w: 12 });
        }
        gridData.layout.push(questionRow);
        gridData.layout.push({ type: "gutter", h: 4 });
        var rows = model.model.responses.length;
        var optWidth = 12 / model.model.premises.length;
        for (var i = 0; i < 3; i++) {
            var newRow = {
                type: "row", h: rowHeight, cols: []
            };
            // push lhs
            if (i == 0) {
                newRow.h = lhsHt;
                for (var j = 0; j < model.model.premises.length; j++) {
                    newRow.cols.push({
                        id:
                        "lhs_text[" + j + "]", type: "column", w: optWidth
                    });
                }
            }
            else if (i == 1) {
                newRow.h = optionHt;
                for (var j = 0; j < model.model.premises.length; j++) {
                    newRow.cols.push({
                        id:
                        "lhs_options[" + j + "]", type: "column", w: optWidth
                    });
                }
            }
            else {
                newRow.h = optionHt;
                for (var j = 0; j < model.model.premises.length; j++) {
                    newRow.cols.push({
                        id:
                        "rhs_options[" + j + "]", type: "column", w: optWidth
                    });
                }
            }
            gridData.layout.push(newRow);
            if (i < rows - 1)
                gridData.layout.push({ type: "gutter", h: 4 });
        }
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        //get question stem from i18n and invoke text
        var questionText = model.i18n[model.model.langId]['QUESTION_TEXT'];
        questionText = generator.replaceVariables(questionText, variables);
        var questionCell = PluginManager.getPluginObject("questionText");
        var QtextObj = {
            align: "center",
            color: "#4c4c4c",
            fontsize: defaultFontSize,
            h: 100, w: 100, x: 0, y: 0,
            $t: questionText,
            valign: "middle"
        }
        PluginManager.invoke('text', QtextObj, questionCell, instance._stage, instance._theme);
        if (shortRhs && model.questionImage) {
            var qImageCell = PluginManager.getPluginObject("qImage");
            var QImgObj = {
                id: "qImg",
                stretch: "false",
                asset: model.questionImage,
                x: 0,
                y: 0,
                h: 100,
                visible: true,
                valign: "middle",
                align: "center"
            }
            if (!data.isSolution)
                PluginManager.invoke('org.ekstep.funtoot.zoomableImage', QImgObj, qImageCell, instance._stage, instance._theme);
            else
                PluginManager.invoke('image', QImgObj, qImageCell, instance._stage, instance._theme);
        }
        var grid = PluginManager.getPluginObject(gridData.id);
        var mtfObj = {
            id: "mtfObj",
            model: "item",
            force: "true"
        };
        PluginManager.invoke("mtf", mtfObj, grid, this._stage, this._theme);
        // add the LHS options using the options builder
        _.each(model.model.premises, function (premise, i) {
            //add LHS text
            var textContainer = PluginManager.getPluginObject("lhs_text[" + i + "]");
            //   var symbolContainer = PluginManager.getPluginObject("symbol[" + i + "]")
            var shapeObj = {
                fill: "#FFCC66",
                h: 100, w: 100, x: 0, y: 0, type: "rect",
            }
            PluginManager.invoke('shape', shapeObj, textContainer, instance._stage, instance._theme);
            lhsContainer = PluginManager.getPluginObject("lhs_text[" + i + "]");
            lhsContainer.onMicroHint = function (e) {
                console.log("mh-asm");
                var helper = PluginManager.getPluginObject('plugin_helper');
                var mhModel = model.lhs_options[i];
                var mhData = {};
                mhData.title = 'Micro hint';
                mhData.type = "mh";
                mhData.containerId = '_ft_microhint_content_container__';
                mhData.x = 10; mhData.y = 10; mhData.w = 80; mhData.h = 60;
                mhData.content = mhModel.mh;
                mhData.mmc = mhModel.mmc;
                return mhData;
            }
            var microhint = Object.create(null);
            microhint.id = "lhs_text[" + i + "]-mh";
            microhint.attachTo = "lhs_text[" + i + "]";
            microhint.mhPos = 'top-left';
            microhint.visible = true;
            PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);
            if (model.lhs_options[i].value.type == "text") {
                var textObj = {
                    "id": _.uniqueId("mathtext-id"),
                    "identifier": "mathtext-id" + (data.isSolution ? "-sol" : ""),
                    align: "center",
                    color: "#4c4c4c",
                    isSolution: data.isSolution,
                    fontsize: defaultFontSize,
                    h: "100", w: 100, x: 0, y: 0,
                    content: generator.replaceVariables(model.i18n[model.model.langId][premise.text], variables),
                    valign: "middle"
                }
                PluginManager.invoke('mathtext', textObj, textContainer, instance._stage, instance._theme);
            }
            else {
                var lhsImgObj = {
                    id: "qImg",
                    stretch: "false",
                    asset: premise.image,
                    x: 0,
                    y: 0,
                    h: 100,
                    visible: true,
                    valign: "middle",
                    align: "center"
                }
                PluginManager.invoke('image', lhsImgObj, textContainer, instance._stage, instance._theme);
            }

            var symbolObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                h: "100", w: 100, x: 0, y: 0,
                $t: "=",
                valign: "middle"
            }
            //   PluginManager.invoke('text', symbolObj, symbolContainer, instance._stage, instance._theme);
            // add the LHS options first
            var op = PluginManager.getPluginObject("lhs_options[" + i + "]");
            //create option if it's not for solution display
            if (!data.isSolution) {
                instance.buildOption(op, { mtfId: mtfObj.id, fill: "#FFFFFF", attachMh: true });
                var optShapeObj = {
                    fill: "#cccccc",
                    h: 100, w: 100, x: 0, y: 0,
                    stroke: "#000000", type: "rect",
                }
                PluginManager.invoke('shape', optShapeObj, op, instance._stage, instance._theme);
            }
            // create shape and text in case of solution
            else {
                var ansOp = PluginManager.getPluginObject("lhs_options[" + model.rhs_options[i].answer + "]");
                var solShapeObj = {
                    fill: "#cccccc",
                    h: 100, w: 100, x: 0, y: 0, type: "rect",
                }
                PluginManager.invoke('shape', solShapeObj, ansOp, instance._stage, instance._theme);
                if (model.rhs_options[i].value.type == 'text') {
                    var solTextObj = {
                        "id": _.uniqueId("mathtext-id"),
                        "identifier": "mathtext-id" + (data.isSolution ? "-sol" : ""),
                        align: "center",
                        color: "#4c4c4c",
                        fontsize: defaultFontSize,
                        h: "100", w: 100, x: 0, y: 0,
                        content: model.rhs_options[i].value.asset,
                        valign: "middle"
                    }
                    PluginManager.invoke('mathtext', solTextObj, ansOp, instance._stage, instance._theme);
                }
                else {
                    var solImgObj = {
                        align: "center",
                        h: "100", w: 100, x: 0, y: 0,
                        asset: model.rhs_options[i].value.asset,
                        align: "center",
                        valign: "middle",
                        stretch: "false",
                        id: _.uniqueId("solImg")
                    }
                    PluginManager.invoke('image', solImgObj, ansOp, instance._stage, instance._theme);
                }

            }
        });
        // add the RHS options using the option builder

        _.each(model.model.responses, function (response, i) {
            // add the RHS options if it's not for solution display
            if (!data.isSolution) {
                var op = PluginManager.getPluginObject("rhs_options[" + i + "]");
                var shapeObj = {
                    fill: "#DBFF72",
                    h: 100, w: 100, x: 0, y: 0,
                    stroke: "#CCCCCC",
                    type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, op, instance._stage, instance._theme);
                instance.buildOption(op, { mtfId: mtfObj.id, attachMh: false, fill: "#DBFF72" });
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
            attachMh: config.attachMh,
            qtype: "mtf"
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
        // get the i18n plugin object
        var i18n = PluginManager.getPluginObject('i18n_helper');
        _.each(lhs_options, function (opt) {
            if (!_.isUndefined(opt.isCorrect)) opt.isCorrect = undefined;
        });
        for (var i = 0; i < rhs_options.length; i++) {
            var lhs_selected;
            if (!_.isUndefined(rhs_options[i].selected)) {
                lhs_selected = rhs_options[i].selected;
                if (rhs_options[i].selected == rhs_options[i].answer) {
                    lhs_options[lhs_selected].isCorrect = true;
                }
                else {
                    lhs_options[lhs_selected].isCorrect = false;
                    lhs_options[lhs_selected].mh = model.i18n[model.model.langId][model.model.premises[lhs_selected].mh];
                    lhs_options[lhs_selected].mmc = model.model.ConceptCode;
                    result.isSolved = false;
                    result.mmc.push(model.model.premises[lhs_selected].mmc);
                }
                result.resValues.push(rhs_options[i].value.resvalue);
            }
            else {
                result.isSolved = false;
                result.mmc.push("01");
            }
        }
        for (var j = 0; j < rhs_options.length; j++) {
            if (_.isUndefined(lhs_options[j].isCorrect)) {
                lhs_options[j].mh = model.i18n[model.model.langId]["NO_ANSWER"];
                lhs_options[j].mmc = "01";
            }
            var tbcobj = PluginManager.getPluginObject("lhs_text[" + j + "]" + '-mh-mhicon');
            if (!lhs_options[j].isCorrect) {
                tbcobj._self.visible = true;
                tbcobj._data.visible = true;
            } else {
                tbcobj._self.visible = false;
                tbcobj._data.visible = false;
            }
            Renderer.update = !0;
        }
        return result;
    }
});