//@ sourceURL=genericmcqplugin.js
/* global PluginManager */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.genericmcq',
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        instance.itemCtrl = this._stage.getController("item");
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var model = instance.itemCtrl.getModelValue();
        if (!model.concepts) {
            model.concepts = {};
            model.concepts.identifier = '';
        }

        var options = model.options;
        /* _.each(model.options, function (op, i) {
             op.value.type = "image";
             op.value.asset = "asset" + (i + 1);
         });*/
        var defaultFontSize = this.getFontSize(data.isSolution);
        //var i18n = PluginManager.getPluginObject('i18n_helper');
        var shuffledOptions = _.shuffle(options);
        model.options = shuffledOptions;
        //if (!model.langId && !model.langid) model.langId = 'en';
        if (!model.isProcessed) {
            if (Array.isArray(model.i18n))
                model.i18n = model.i18n[0];
            _.each(model.options, function (opt) {
                if (opt.value.type == "text") {
                    opt.value.asset = model.model.langId ? model.i18n[model.model.langId][opt.value.asset] : model.i18n[model.model.langid][opt.value.asset];
                    delete opt.value.text;
                }
                opt.mh = model.model.langId ? model.i18n[model.model.langId][opt.mh] : model.i18n[model.model.langid][opt.mh];
                opt.value.fontsize = defaultFontSize
            })
            model.model.hintMsg = model.model.langId ? model.i18n[model.model.langId][model.model.hintMsg] : model.i18n[model.model.langid][model.model.hintMsg];
            model.isProcessed = true;
        }
        _.each(model.options, function (opt) {
            opt.selected = false;
        })
        // model.model.options = model.options;

        var rowHeight = 10; // in units
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
        if (model.model.mcqType == 1 || model.model.mcqType == 2 || model.model.mcqType == 5 || model.model.mcqType == 6 || model.model.mcqType == 7 || model.model.mcqType == 8) {
            var questionRow = {
                type: "row",
                h: 6,
                cols: [],
                id: "questionText"
            }
            gridData.layout.push(questionRow);
            gridData.layout.push({
                type: "gutter",
                h: 5
            });
        }

        var rows = options.length;

        /**
         * mcqType - 1 : vertical text options, question text --
         * mcqType - 2 : 4 image options, question text --
         * mcqType - 3 : only image in question, 4 text options --
         * mcqType - 4 : only image in question, 4 image options
         * mcqType - 5 : text options in matrix (2X2 or 1X2), question has both image and text --
         * mcqType - 6 : 4 image options, question has both image and text
         * mcqType - 7 : 2 horizontal text options, question text --
         * mcqType - 8 : 2 horizontal text options in each row, question text --
         * **/
        if (model.model.mcqType == 1) {

            for (var r = 0; r < rows; r++) {
                var newRow = {
                    type: "row",
                    h: rowHeight,
                    cols: [{
                        type: "offset",
                        w: 0.5
                    }]
                };
                newRow.cols.push({
                    id: "options[" + r + "]",
                    type: "column",
                    w: 11
                });
                gridData.layout.push(newRow);
                if (r < rows - 1)
                    gridData.layout.push({
                        type: "gutter",
                        h: 4
                    });
            }
        } else if (model.model.mcqType == 2) {
            rowHeight = 20;
            var newRow2 = {
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 1
                }]
            };
            newRow2.cols.push({
                id: "options[0]",
                type: "column",
                w: 5
            }, {
                id: "options[1]",
                type: "column",
                w: 5
            });
            var secondRow = {
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 1
                },
                {
                    id: "options[2]",
                    type: "column",
                    w: 5
                },
                {
                    id: "options[3]",
                    type: "column",
                    w: 5
                }
                ]
            }
            gridData.layout.push(newRow2);
            gridData.layout.push({
                type: "gutter",
                h: 3
            });
            gridData.layout.push(secondRow);
        } else if (model.model.mcqType == 3) {
            var imgRow = {
                type: "row",
                h: 25,
                cols: [{
                    type: "offset",
                    w: 4
                },
                {
                    id: "question_image",
                    type: "column",
                    w: 4
                }
                ]
            };
            gridData.layout.push(imgRow);
            gridData.layout.push({
                type: "gutter",
                h: 10
            });
            var optRow = {
                type: "row",
                h: 10,
                cols: []
            }
            _.each(model.options, function (opt, index) {
                optRow.cols.push({
                    id: "options[" + index + "]",
                    type: "column",
                    w: 3
                });
            });
            gridData.layout.push(optRow);
        } else if (model.model.mcqType == 4 || model.model.mcqType == 6) {
            var imgRow2 = {
                type: "row",
                h: 25,
                cols: [{
                    type: "offset",
                    w: 4
                },
                {
                    id: "question_image",
                    type: "column",
                    w: 4
                }
                ]
            };
            gridData.layout.push(imgRow2);
            gridData.layout.push({
                type: "gutter",
                h: 4
            });
            var newRow3 = {
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 1
                }]
            };
            newRow3.cols.push({
                id: "options[0]",
                type: "column",
                w: 5
            }, {
                id: "options[1]",
                type: "column",
                w: 5
            });
            var secondRow2 = {
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 1
                },
                {
                    id: "options[2]",
                    type: "column",
                    w: 5
                },
                {
                    id: "options[3]",
                    type: "column",
                    w: 5
                }
                ]
            }
            gridData.layout.push(newRow3);
            gridData.layout.push({
                type: "gutter",
                h: 3
            });
            gridData.layout.push(secondRow2);
        } else if (model.model.mcqType == 5) {
            var imgRow3 = {
                type: "row",
                h: 25,
                cols: [{
                    type: "offset",
                    w: 4
                },
                {
                    id: "question_image",
                    type: "column",
                    w: 4
                }
                ]
            };
            gridData.layout.push(imgRow3);
            gridData.layout.push({
                type: "gutter",
                h: 5
            });
            var choice = 0;
            var opRows = rows / 2;
            var col = 2;
            for (var s = 0; s < opRows; s++) {
                var newRow5 = {
                    type: "row",
                    h: rowHeight,
                    cols: [{
                        type: "offset",
                        w: 0.5
                    }]
                };
                for (var c = 0; c < col; c++ , choice++) {
                    var newCol = {
                        id: "options[" + choice + "]",
                        type: "column",
                        w: 5.5
                    }
                    newRow5.cols.push(newCol);
                }

                gridData.layout.push({
                    type: "gutter",
                    h: 3
                });

                gridData.layout.push(newRow5);
            }
        } else if (model.model.mcqType == 7) {

            rowHeight = 20;
            var newRow4 = {
                type: "row",
                h: rowHeight,
                cols: [{
                    type: "offset",
                    w: 2
                }]
            };
            newRow4.cols.push({
                id: "options[0]",
                type: "column",
                w: 4
            });
            newRow4.cols.push({
                id: "options[1]",
                type: "column",
                w: 4
            });
            gridData.layout.push(newRow4);
        } else if (model.model.mcqType == 8) {
            var choice2 = 0;
            var opRows2 = rows / 2;
            var col8 = 2;
            gridData.layout.push({
                type: "gutter",
                h: 20
            });
            for (var t = 0; t < opRows2; t++) {
                var newRow8 = {
                    type: "row",
                    h: rowHeight,
                    cols: [{
                        type: "offset",
                        w: 0.5
                    }]
                };
                for (var d = 0; d < col8; d++ , choice2++) {
                    var newCol8 = {
                        id: "options[" + choice2 + "]",
                        type: "column",
                        w: 5.5
                    }
                    newRow8.cols.push(newCol8);
                }

                gridData.layout.push({
                    type: "gutter",
                    h: 4
                });

                gridData.layout.push(newRow8);
            }
        }
        if (model.t == "mcqma") {
            var opContainerRow = {
                type: "row",
                h: (rowHeight * 2) + 12,
                id: "opContainerRow"
            };
            gridData.layout.push(opContainerRow);
        }

        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        var question = model.model.langId ? model.i18n[model.model.langId][model.question] : model.i18n[model.model.langid][model.question];
        var questionCell = PluginManager.getPluginObject("questionText");
        if (questionCell) {
            var QtextObj = {
                "id": _.uniqueId("mathtext-id"),
                "identifier": "mathtext-id",
                "align": "center",
                "x": 0,
                "y": 0,
                "w": 100,
                "h": 100,
                "visible": true,
                "content": question,
                "isSolution": data.isSolution
            }
            PluginManager.invoke('mathtext', QtextObj, questionCell, instance._stage, instance._theme);
        }

        var questionImage = PluginManager.getPluginObject("question_image");
        if (questionImage) {
            var QImgObj = {
                id: "qImg",
                stretch: "false",
                asset: model.questionImage,
                x: 0,
                y: 0,
                h: 100,
                visible: true,
                valign: "middle",
                align: "middle"
            }
            PluginManager.invoke('image', QImgObj, questionImage, instance._stage, instance._theme);
        }

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
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "roundrect",
                }
                PluginManager.invoke('shape', shapeObj, op, this._stage, this._theme);
                instance.buildOption(op, {
                    templateId: mcqObj.id,
                    fill: "#CCCCCC",
                    attachMh: true
                });
            }
            // create shape and text in case of solution
            else {
                var shapeObjSol = {
                    fill: model.options[i].answer ? "#CCCCCC" : "#E9E8E8",
                    stroke: model.options[i].answer ? "#60BC50" : "",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect",
                }
                shapeObjSol["stroke-width"] = 2;
                PluginManager.invoke('shape', shapeObjSol, op, this._stage, this._theme);
                if (model.options[i].value.type == "image") {
                    var imgObj = {
                        stretch: "false",
                        asset: model.options[i].value.asset,
                        x: 0,
                        y: 0,
                        h: 100,
                        visible: true,
                        valign: "middle",
                        align: "middle"
                    }
                    PluginManager.invoke('image', imgObj, op, instance._stage, instance._theme);
                } else {
                    var textObj = {
                        align: "center",
                        color: "#4c4c4c",
                        fontsize: defaultFontSize,
                        h: "100",
                        w: 100,
                        x: 0,
                        y: 0,
                        $t: model.options[i].value.asset,
                        valign: "middle"
                    }
                    PluginManager.invoke('text', textObj, op, instance._stage, instance._theme);
                }

            }
        });
    },
    /**
     *  creates option on the specified parent
     * @param {Object} opParent parent cell of the option
     * @param {Object} config info
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
    /**
     *  creates option on the specified parent
     * @param {Object} evt information
     * @param {Object} instance of the question
     * @returns {Object} result of the attempt
     */
    onSubmit: function (evt, instance) {
        var model = instance._stage._stageController.getModelValue();
        var item = instance._stage.getController("item");
        var options = model.options;
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var variables = item.getModelValue("variables");
        var result = {
            isSolved: false,
            resValues: [],
            mmc: []
        };
        if (model.t != "mcqma") {
            _.each(options, function (option, i) {
                if (options[i].selected == options[i].answer && options[i].answer) {
                    result.isSolved = true;
                } else if (options[i].selected) {
                    result.isSolved = false;
                    result.mmc = option.mmc;
                    options[i].mh = i18n.translate(options[i].mh, {
                        n: variables.$x
                    });
                    var optionObj = PluginManager.getPluginObject("option_options[" + i + "]");
                    options[i].isCorrect = false;
                    optionObj.onEvaluate("options[" + i + "]");
                } else if (!options[i].selected && !options[i].answer) {
                    options[i].isCorrect = true;
                    var optionObj2 = PluginManager.getPluginObject("option_options[" + i + "]");
                    optionObj2.onEvaluate("options[" + i + "]");
                }
            });
        } else {
            var correctAns = 0;
            var wrongAns = 0;
            _.each(options, function (option, i) {
                if (options[i].selected == options[i].answer && options[i].answer) {
                    correctAns++;
                } else if (options[i].selected) {
                    result.isSolved = false;
                }
            });
            _.each(options, function (option, i) {
                if (options[i].selected && !options[i].answer) {
                    result.isSolved = false;
                    wrongAns++;
                }
            });
            if (correctAns == model.options.length - 1 && wrongAns == 0) {
                result.isSolved = true;
            } else {
                result.isSolved = false;
                var opContainer = PluginManager.getPluginObject("opContainerRow");
                var opContainerRowObj = {
                    x: 2,
                    y: -88,
                    h: 100,
                    w: 96,
                    id: "_options"
                }
                PluginManager.invoke('g', opContainerRowObj, opContainer, instance._stage, instance._theme);
                var container = PluginManager.getPluginObject("_options");
                container.onMicroHint =
                    function () {
                        var helper = PluginManager.getPluginObject('plugin_helper');
                        var mhData = {};
                        mhData.title = 'Micro hint';
                        mhData.type = "mh";
                        mhData.containerId = '_ft_microhint_content_container__';
                        mhData.x = 10;
                        mhData.y = 10;
                        mhData.w = 80;
                        mhData.h = 60;
                        mhData.content = i18n.translate("COMMON_MH");
                        helper.showPopup(mhData);
                    }
                var microhint = {};
                microhint.id = 'answerBox-mh';
                microhint.attachTo = "_options";
                microhint.mhPos = 'top-left';
                microhint.visible = true;
                PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);

                var shapeObj = {
                    stroke: "#e42012",
                    "stroke-width": 2,
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "roundrect",
                }
                PluginManager.invoke('shape', shapeObj, container, instance._stage, instance._theme);
                var tbcobj = PluginManager.getPluginObject('answerBox-mh-mhicon');
                tbcobj._self.visible = true;
                tbcobj._data.visible = true;
            }
        }
        if (!result.isSolved && result.mmc.length == 0 && model.model.mmcs)
            result.mmc = model.model.mmcs.split(",");
        return result;
    },
    /**
     * handles hint icon click event and invokes the popup
     * @FIX: move the hardcoded string to resource bundle
     * @param {Object} evt information
     */
    _onHint: function () {
        var helper = PluginManager.getPluginObject('plugin_helper');
        var item = this._stage.getController("item");
        var hintData = {
            title: 'Hint',
            type: "hint",
            content: item.getModelValue().model.hintMsg || "NO_HINT", //There is no hint for this question',
            x: 10,
            y: 10,
            w: 80,
            h: 60
        };
        helper.showPopup(hintData);
    },
});