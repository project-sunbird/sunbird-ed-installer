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
        if (!data.isSolution) {
            this.processVariables(variables);
            this._item.setModelValue("hintMsg", new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue("hintMsg")], variables));
            this._item.setModelValue("fibModels", {});
        }
        var qImgKey = this._item.getModelValue().questionImage;
        var seqStepsText1 = _.pluck(this._item.getModelValue().model.seqSteps, 'text');
        var seqStepsImg = _.pluck(this._item.getModelValue().model.seqSteps, 'image');
        var isTextStep = _.every((seqStepsImg), function (s) {
            return s == null;
        })
        var seqStepsText = [];
        if (isTextStep)
            _.each(seqStepsText1, function (s) {
                seqStepsText.push(new org.ekstep.generators().replaceVariables(trans[s], variables))
            });
        this._variables = variables;
        var shuffledRhs = _.shuffle(this._item.getModelValue().model.seqSteps);
        var steps = isTextStep ? seqStepsText : seqStepsImg;
        model.lhs_options = [];
        model.rhs_options = [];
        _.each(steps, function (step, j) {
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
                    type: isTextStep ? "text" : "image",
                    audio: "",
                    image: "",
                    asset: isTextStep ? new org.ekstep.generators().replaceVariables(trans[shuffledRhs[j].text], variables) : shuffledRhs[j].image,
                    "fontsize": defaultFontSize
                },
                answer: shuffledRhs[j].identifier,
                mh: shuffledRhs[j].mh,
                mmc: shuffledRhs[j].mmc
            }


            model.lhs_options.push(lhs_model);
            model.rhs_options.push(rhs_model);
        });
        var rowHeight = isTextStep ? 12 : 18; // in units
        var rowWidth = 12 / (this._item.getModelValue().model.seqSteps.length);
        // invoke grid
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
        if (!_.isUndefined(qImgKey) && qImgKey != "") {
            questionRow = {
                type: "row",
                h: 27,
                cols: [{
                    type: "column",
                    id: "qImg",
                    w: 4
                },
                {
                    type: "column",
                    id: "questionText",
                    w: 8
                }
                ]
            };
        } else {
            questionRow = {
                type: "row",
                h: isTextStep ? 27 : 10,
                cols: [{
                    type: "column",
                    id: "questionText",
                    w: 12
                },]
            };
        }
        gridData.layout.push(questionRow);
        gridData.layout.push({
            type: "gutter",
            h: 4
        });
        var rows = steps.length;
        for (var r = 0; r < 3; r++) {
            var colId = r == 0 ? "rank" : (r == 1 ? "lhs_options" : "rhs_options");
            var rrow = {
                type: "row",
                h: r == 0 ? 10 : rowHeight,
                cols: []
            };
            for (var c = 0; c < steps.length; c++) {
                rrow.cols.push({
                    id: colId + "[" + c + "]",
                    type: "column",
                    w: rowWidth
                })
            }
            gridData.layout.push(rrow);
            if (r < rows - 1)
                gridData.layout.push({
                    type: "gutter",
                    h: r == 0 ? 1 : 3
                });
        }
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);
        var questionText = new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue().question], variables);
        var questionCell = PluginManager.getPluginObject("questionText");
        var QtextObj = {
            identifier: _.uniqueId("questionText"),
            align: i18n.translate(questionText).length > 60 ? "left" : "center",
            color: "#4c4c4c",
            fontsize: defaultFontSize,
            h: 100,
            w: 100,
            x: 0,
            y: 0,
            content: i18n.translate(questionText),
            valign: "middle",
            isSolution: data.isSolution
        }
        PluginManager.invoke('mathtext', QtextObj, questionCell, instance._stage, instance._theme);
        if (!_.isUndefined(qImgKey) && qImgKey != "") {
            var qImage = PluginManager.getPluginObject("qImg");
            var tileImageObj = {
                h: 100,
                x: 0,
                y: 0,
                asset: qImgKey,
                valign: "middle",
                align: "center"
            };
            if (model.flags != undefined && JSON.parse(model.flags).isZoomable && !data.isSolution) {
                PluginManager.invoke('org.ekstep.funtoot.zoomableImage', tileImageObj, qImage, instance._stage, instance._theme);
            } else {
                PluginManager.invoke('image', tileImageObj, qImage, instance._stage, instance._theme);
            }
        }
        _.each(steps, function (n, index) {
            var rankCell = PluginManager.getPluginObject("rank" + "[" + index + "]");
            var OptImageObj = {
                identifier: _.uniqueId("cric"),
                h: 96,
                x: 0,
                y: 0,
                asset: "seq",
                valign: "middle",
                align: "center"
            };
            PluginManager.invoke('image', OptImageObj, rankCell, instance._stage, instance._theme);

            var rankObj = {
                align: "center",
                color: "#ffffff",
                fontsize: defaultFontSize,
                h: 100,
                w: 100,
                x: 0,
                y: 2,
                $t: i18n.translateNumber(index + 1, langId).displayValue,
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
        // add the LHS options using the options builder
        _.each(steps, function (step, i) {
            // add the LHS options first
            var op = PluginManager.getPluginObject("lhs_options[" + i + "]");
            var gutter = data.isSolution ? 11.5 : 14.5;
            var controlXPoint = (op._dimensions.x - (op._dimensions.w * i) - (gutter * i));
            var rect = new createjs.Shape();
            console.log("debug- " + i + controlXPoint);
            rect.graphics.setStrokeDash([3, 3]);
            rect.graphics.setStrokeStyle(1).beginStroke("#000000").drawRect(controlXPoint - 1, op._dimensions.y - 1, op._dimensions.w + 2, op._dimensions.h + 2);
            op.addChild(rect);
            op.update();
            //create option if it's not for solution display
            if (!data.isSolution) {
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
                }
                PluginManager.invoke('shape', shapeObj, op, instance._stage, instance._theme);
                if (isTextStep) {
                    var textObj = {
                        identifier: _.uniqueId("math-textop"),
                        align: "center",
                        color: "#4c4c4c",
                        fontsize: defaultFontSize,
                        h: 100,
                        w: 100,
                        x: 0,
                        y: 0,
                        content: steps[i],
                        valign: "middle",
                        isSolution: data.isSolution
                    }
                    PluginManager.invoke('mathtext', textObj, op, instance._stage, instance._theme);
                } else {
                    var OptImageObj = {
                        identifier: _.uniqueId("math-imgop"),
                        h: 100,
                        x: 0,
                        y: 0,
                        asset: steps[i],
                        valign: "middle",
                        align: "center"
                    };
                    PluginManager.invoke('image', OptImageObj, op, instance._stage, instance._theme);
                }
            }
        });
        // add the RHS options using the option builder
        _.each(steps, function (step, i) {
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
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            // get the i18n plugin object
            var i18n = PluginManager.getPluginObject('i18n_helper');
            var trans = this._item.getModelValue("i18n")[this._item.getModelValue().model.langId || "en"];
            for (var i = 0; i < rhs_options.length; i++) {
                var lhs_selected;
                if (!_.isUndefined(rhs_options[i].selected)) {
                    lhs_selected = rhs_options[i].selected;
                    if (rhs_options[i].selected == rhs_options[i].answer) {
                        lhs_options[lhs_selected].isCorrect = true;
                    } else {
                        lhs_options[lhs_selected].isCorrect = false;
                        lhs_options[lhs_selected].mh = new org.ekstep.generators().replaceVariables(trans[rhs_options[i].mh], this._variables);
                        lhs_options[lhs_selected].mmc = rhs_options[i].mmc;
                        result.isSolved = false;
                        if (Array.isArray(rhs_options[i].mmc))
                            result.mmc.push.apply(result.mmc, rhs_options[i].mmc)
                        else
                            result.mmc.push(rhs_options[i].mmc);

                    }
                } else {
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