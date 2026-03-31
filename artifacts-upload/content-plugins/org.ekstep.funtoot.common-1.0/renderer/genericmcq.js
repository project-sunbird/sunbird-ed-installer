//@ sourceURL=genericmcq.js
/* global PluginManager */
Plugin.extend({
    _type: 'org.ekstep.plugins.funtoot.genericmcq',
    initPlugin: function (data) {
        var ftdata = data;
        var instance = this;
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        instance.itemCtrl = this._stage.getController("item");
        var model = instance.itemCtrl.getModelValue(this._data.model);
        var optionsText = model.optionsText;
        var optionsImage = model.optionsImage;
        var questionImage = model.questionImage;
        var optionsCount = model.optionsCount;
        var mhs = model.mhs;
        var options = [];
        var i18n = PluginManager.getPluginObject('i18n_helper');
        if (_.isUndefined(model.options) || model.options.length == 0) {
            for (i = 0; i < optionsCount; i++) {
                var op = {
                    value: {
                        text: optionsText[i],
                        image: optionsImage[i],
                        mh: i != 0 ? mhs[i - 1] : null
                    },
                    answer: i == 0,
                    type: 'text'
                };
                options.push(op);
            }
            var shuffledOptions = _.shuffle(options);
            model.options = [];
            for (i = 0; i < shuffledOptions.length; i++) {
                var option_model = {
                    value: { type: shuffledOptions[i].type, audio: "", image: "", asset: shuffledOptions[i].value[shuffledOptions[i].type], "fontsize": data.fontSize },
                    answer: shuffledOptions[i].answer,
                    mh: shuffledOptions[i].value.mh,
                }
                model.options.push(option_model);
            }
        }

        var rowHeight = 10; // in units
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
        gridData.layout.push({ type: "gutter", h: 5 });
        var rows = optionsCount;
        for (r = 0; r < rows; r++) {
            var newRow = {
                type: "row", h: rowHeight, cols: [{ type: "offset", w: 0.5 }]
            };
            newRow.cols.push({ id: "options[" + r + "]", type: "column", w: 11 });
            gridData.layout.push(newRow);
            if (r < rows - 1)
                gridData.layout.push({ type: "gutter", h: 4 });
        }
        var contentContainer = PluginManager.getPluginObject(data.containerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        var question = model.questionText;
        var questionCell = PluginManager.getPluginObject("questionText");
        var QtextObj = {
            align: "center",
            color: "#4c4c4c",
            fontsize: data.fontSize,
            h: 100, w: 100, x: 0, y: 0,
            $t: question,
            valign: "middle"
        }
        PluginManager.invoke('text', QtextObj, questionCell, instance._stage, instance._theme);

        var grid = PluginManager.getPluginObject(gridData.id);
        var mcqObj = {
            id: "mcqObj",
            model: "item",
            force: "true"
        };
        PluginManager.invoke("mcq", mcqObj, grid, this._stage, this._theme);
        // add the options using the options builder
        _.each(_.range(rows), function (num, i) {
            var op = PluginManager.getPluginObject("options[" + i + "]");
            //create option if it's not for solution display
            if (!data.isSolution) {
                var shapeObj = {
                    fill: "#E9E8E8",
                    h: 100, w: 100, x: 0, y: 0, type: "roundrect",
                }
                PluginManager.invoke('shape', shapeObj, op, this._stage, this._theme);
                instance.buildOption(op, { templateId: mcqObj.id, fill: "#CCCCCC", attachMh: true });
            }
            // create shape and text in case of solution
            else {
                var shapeObj = {
                    fill: model.options[i].answer ? "#CCCCCC" : "#E9E8E8",
                    h: 100, w: 100, x: 0, y: 0, type: "rect",
                }
                PluginManager.invoke('shape', shapeObj, op, this._stage, this._theme);
                var textObj = {
                    align: "center",
                    color: "#4c4c4c",
                    fontsize: data.fontSize,
                    h: "100", w: 100, x: 0, y: 0,
                    $t: model.options[i].value.asset,
                    valign: "middle"
                }
                PluginManager.invoke('text', textObj, op, this._stage, this._theme);
            }
        });
    },
    /**
   *  creates option on the specified parent 
   * @param {Object} opParent- the parent cell
   */
    buildOption: function (opParent, config) {
        var optData = {
            id: opParent._data.id + "_opt",
            w: opParent._data.w,
            x: opParent._data.x,
            h: opParent._parent._data.h,
            y: opParent._parent._data.y,
            templateId: config.templateId,
            color: config.fill,
            attachMh: config.attachMh
        };
        PluginManager.invoke('org.ekstep.funtoot.optionBuilder', optData, opParent, this._stage, this._theme);
    },
    onSubmit: function (evt, instance) {
        console.log("generic mcq submit called");
        var model = this._stage._stageController.getModelValue();
        var item = this._stage.getController("item");
        var options = model.model.options;
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = item.getModelValue("variables");
        var result = { isSolved: false, resValues: [], mmc: [] };
        _.each(options, function (option, i) {
            if (options[i].selected == options[i].answer && options[i].answer) {
                result.isSolved = true;
            }
            else if (options[i].selected) {
                result.isSolved = false;
                options[i].mh = i18n.translate(options[i].mh, {
                    n: variables.$x
                });
                var optionObj = PluginManager.getPluginObject("option_options[" + i + "]");
                options[i].isCorrect = false;
                optionObj.onEvaluate("options[" + i + "]");
            }
            else if (!options[i].selected && !options[i].answer) {
                options[i].isCorrect = true;
                var optionObj = PluginManager.getPluginObject("option_options[" + i + "]");
                optionObj.onEvaluate("options[" + i + "]");
            }
        });
        if (!result.isSolved)
            result.mmc = model.model.mmcs.split(",");
        return result;
    }
});