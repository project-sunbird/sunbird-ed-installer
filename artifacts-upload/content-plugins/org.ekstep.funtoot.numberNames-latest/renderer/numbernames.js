//@ sourceURL=numberNames.js
/* global PluginManager */
/**
 * This plugin is used to generate number names problems
 * @extends ftBasePlugin
 * @fires optionBuilder, grid
 * @author Amulya (amulya.k@funtoot.com)
 */
org.ekstep.funtoot.ftPlugin.extend({
    _type: 'org.ekstep.funtoot.numberNames',
    /**
     * initializes the plugin
     * @param {object} data the data for the plugin
     */
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
        var variables = item.getModelValue("variables");
        var defaultFontSize = this.getFontSize(data.isSolution);
        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
        }
        // get the number
        var number = variables.$n;
        model.number = number;
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var numberName = i18n.toNumberName(number, model.model.numberSystem, model.model.langId);
        var nums = i18n.translateNumber(number, item.getModelValue("numericLangId"));

        var options = [];
        // give 2 choices for numbers till 20 and 3 choices for numbers greater than 20
        // create possible wrong answers, pick two options randomly for display and add the correct answer to give 3 choices
        if (!data.isSolution) {
            model.options = [];
            i18n.onReady().then(function (o) {
                if (number <= 20) {
                    // get the array of wrong spellings
                    var opt2 = o.translate(number.toString());
                    opt2 = opt2.replace(/'/g, '"');
                    opt2 = JSON.parse(opt2);
                    var mh = 'MH09_1';
                    var mmc = 'C208';
                    if (number == 6 || number == 9 || number == 2 || number == 5) {
                        mh = 'MH09_2';
                        mmc = 'C204';
                    }
                    if (number == 0) {
                        mmc = "C205";
                        mh = "MH09_ZERO";
                    }
                    if (number == 12) {
                        mmc = "C462";
                        mh = "MH09_12";
                    }
                    if (number == 20) {
                        mmc = 'C463';
                        mh = "MH09_20";
                    }
                    options = [{
                        value: {
                            value: numberName
                        },
                        answer: true
                    }, {
                        value: {
                            value: opt2[Math.floor(Math.random() * opt2.length)],
                            mh: mh,
                            mmc: mmc
                        },
                        answer: false,
                    }];
                } else {
                    var tempOpt = [];
                    var numStr = number.toString();
                    var opt2 = "";
                    // single digit representation of each digit
                    if (number <= 9999) {
                        for (i = 0; i < numStr.length; i++) {
                            opt2 = opt2 + i18n.toNumberName(Number(numStr[i]), model.model.numberSystem, model.model.langId) + " ";
                        }
                        var optObj = {};
                        optObj.value = opt2;
                        optObj.mh = "MH09_3";
                        optObj.mmc = "C707";
                        tempOpt.push(optObj);
                    }
                    if (number <= 99) {
                        var opt3 = o.translate(numStr[0] + "tens") + i18n.toNumberName(Number(numStr[1]), model.model.numberSystem, model.model.langId).toLowerCase();
                        var optObj = {};
                        optObj.value = opt3;
                        optObj.mh = "MH09_3";
                        optObj.mmc = "C707";
                        tempOpt.push(optObj);
                    }
                    // interchange the last two digits in case they are different
                    if (Number(numStr[numStr.length - 1]) != Number(numStr[numStr.length - 2])) {
                        var optObj = {};
                        if (number <= 99)
                            optObj.value = i18n.toNumberName(Number(numStr[1] + numStr[0]), model.model.numberSystem, model.model.langId);
                        else
                            optObj.value = i18n.toNumberName(Number(numStr.substring(0, numStr.length - 2) + numStr[numStr.length - 1] + numStr[numStr.length - 2]), model.model.numberSystem, model.model.langId);
                        optObj.mh = "MH09_INTERCHANGE";
                        optObj.mmc = "C708";
                        tempOpt.push(optObj);
                    }
                    // remove the last digit and give it as a separate number
                    if (number > 99) {
                        var optObj = {};
                        optObj.value = i18n.toNumberName(Number(numStr.substring(0, numStr.length - 1)), model.model.numberSystem, model.model.langId) + " " + i18n.toNumberName(Number(numStr[numStr.length - 1]), model.model.numberSystem, model.model.langId);
                        optObj.mh = "MH09_1";
                        optObj.mmc = "C209";
                        tempOpt.push(optObj);
                    }
                    // remove zero and form a number name
                    if (number > 99) {
                        if (numStr.includes("0")) {
                            var optObj = {};
                            optObj.value = i18n.toNumberName(Number(numStr.replace("0", "")), model.model.numberSystem, model.model.langId);
                            optObj.mh = "MH09_1";
                            optObj.mmc = "C209";
                            tempOpt.push(optObj);
                        }
                    }
                    // reverse of the number
                    if (numStr[0] != numStr[numStr.length - 1]) {
                        var reverse = Array.from(numStr).reverse();
                        var optObj = {};
                        optObj.value = i18n.toNumberName(Number(reverse.join("")), model.model.numberSystem, model.model.langId);
                        optObj.mh = "MH09_REVERSE";
                        optObj.mmc = "C444";
                        tempOpt.push(optObj);
                    }
                    // replace 6 with 9
                    if (numStr.includes("6")) {
                        var optObj = {
                            value: i18n.toNumberName(Number(numStr.replace("6", "9")), model.model.numberSystem, model.model.langId),
                            mh: "MH09_1",
                            mmc: "C434"
                        };
                        tempOpt.push(optObj);
                    }
                    // replace 9 with 6
                    if (numStr.includes("9")) {
                        var optObj = {
                            value: i18n.toNumberName(Number(numStr.replace("9", "6")), model.model.numberSystem, model.model.langId),
                            mh: "MH09_1",
                            mmc: "C434"
                        };
                        tempOpt.push(optObj);
                    }
                    // replace 2 with 5
                    if (numStr.includes("2")) {
                        var optObj = {
                            value: i18n.toNumberName(Number(numStr.replace("2", "5")), model.model.numberSystem, model.model.langId),
                            mh: "MH09_1",
                            mmc: "C433"
                        };
                        tempOpt.push(optObj);
                    }
                    // replace 5 with 2
                    if (numStr.includes("5")) {
                        var optObj = {
                            value: i18n.toNumberName(Number(numStr.replace("5", "2")), model.model.numberSystem, model.model.langId),
                            mh: "MH09_1",
                            mmc: "C433"
                        };
                        tempOpt.push(optObj);
                    }
                    if (number % 10 == 0 && number <= 99) {
                        var optObj1 = {
                            value: i18n.toNumberName(Number(numStr[0]), model.model.numberSystem, model.model.langId),
                            mh: "MH09_1",
                            mmc: "C208"
                        };
                        var optObj2 = {
                            value: i18n.toNumberName(0, model.model.numberSystem, model.model.langId),
                            mh: "MH09_1",
                            mmc: "C208"
                        };
                        tempOpt.push(optObj1);
                        tempOpt.push(optObj2);
                    }
                    if (number > 999 && number <= 9999) {
                        var optObj = {
                            value: i18n.toNumberName(Number(numStr.substring(0, 1) + "0" + numStr.substring(2, 3)), model.model.numberSystem, model.model.langId),
                            mh: "MH09_1",
                            mmc: "C208"
                        };
                        tempOpt.push(optObj);
                    }

                    // give the number name in Indian system if number system is International
                    if (model.model.numberSystem == "en-US") {
                        var optObj = {
                            value: i18n.toNumberName(number, "en-IN", model.model.langId),
                            mh: "MH09_NUMSYSTEM1",
                            mmc: "C209"
                        };
                        tempOpt.push(optObj);
                    }

                    // give the international system if the number system is Indian and number greater than 99,999
                    if (number > 99999 && model.model.numberSystem == "en-IN") {
                        var optObj = {
                            value: i18n.toNumberName(number, "en-US", model.model.langId),
                            mh: "MH09_NUMSYSTEM2",
                            mmc: "C709"
                        };
                        tempOpt.push(optObj);
                    }
                    var pickOpt = _.take(_.shuffle(tempOpt), 2);
                    options = [{
                        value: {
                            value: numberName
                        },
                        answer: true
                    }, {
                        value: pickOpt[0],
                        answer: false
                    }, {
                        value: pickOpt[1],
                        answer: false
                    }];
                }
                var shuffledOptions = _.shuffle(options);
                for (i = 0; i < shuffledOptions.length; i++) {
                    var option_model = {
                        value: {
                            type: "text",
                            audio: "",
                            image: "",
                            asset: shuffledOptions[i].value.value,
                            "fontsize": defaultFontSize
                        },
                        answer: shuffledOptions[i].answer,
                        mh: shuffledOptions[i].value.mh,
                        mmc: shuffledOptions[i].value.mmc
                    }
                    model.options.push(option_model);
                }
            }).catch(function (error) {
                console.error(error);
            });
        }




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
        var rows = number <= 20 ? 2 : 3;
        for (r = 0; r < rows; r++) {
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
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        // add the question stem
        i18n.onReady().then(function (o) {
            var questionStem = model.model.questionStem;
            var numberSystem = model.model.numberSystem == "en-IN" ? "INDIAN" : "INTERNATIONAL";
            if (questionStem == "QUESTION09_STEM2")
                questionStem = "QUESTION09_" + numberSystem;
            var questionText = o.translate(questionStem, {
                n: number
            });
            var questionCell = PluginManager.getPluginObject("questionText");
            var QtextObj = {
                align: "center",
                color: "#4c4c4c",
                fontsize: defaultFontSize,
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                $t: questionText,
                valign: "middle"
            }
            PluginManager.invoke('text', QtextObj, questionCell, instance._stage, instance._theme);
        }).catch(function (error) {
            console.error(error);
        });

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
                i18n.onReady().then(function (o) {
                    instance.buildOption(op, {
                        templateId: mcqObj.id,
                        fill: "#CCCCCC",
                        attachMh: true
                    });
                }).catch(function (error) {
                    console.error(error);
                });
            }
            // create shape and text in case of solution
            else {
                i18n.onReady().then(function (o) {
                    var shapeObj = {
                        fill: model.options[i].answer ? "#CCCCCC" : "#E9E8E8",
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
                        $t: model.options[i].value.$t,
                        valign: "middle"
                    }
                    PluginManager.invoke('text', textObj, op, this._stage, this._theme);
                }).catch(function (error) {
                    console.error(error);
                });
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


    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     */
    onSubmit: function (evt, instance) {
        var model = this._stage._stageController.getModelValue();
        var options = model.options;
        var result = {
            isSolved: false,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            for (var i = 0; i < options.length; i++) {
                instance.clearMh("options[" + i + "]" + "-mh-mhicon")
            }
            var i18n = PluginManager.getPluginObject('i18n_helper');
            _.each(options, function (option, i) {
                if (option.selected) {
                    var res = {
                        "selected": i
                    };
                    result.resValues.push(res);
                }
                if (options[i].selected == options[i].answer && options[i].answer) {
                    result.isSolved = true;
                } else if (options[i].selected) {
                    result.isSolved = false;
                    result.mmc.push(option.mmc);
                    options[i].mh = i18n.translate(options[i].mh);
                    var optionObj = PluginManager.getPluginObject("option_options[" + i + "]");
                    optionObj.onEvaluate("options[" + i + "]");
                    options[i].isCorrect = false;
                }
            });
            return result;
        } else return false
    },

    clearMh: function (option) {
        var op = PluginManager.getPluginObject(option)
        if (!_.isUndefined(op)) {
            op._self.visible = false
            Renderer.update = true
        }
    },

    /**
     * checks if user has given any input
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (instance) {
        var options = instance._item.getModelValue().options;
        return Object.values(options).some(function (o) {
            return o.selected == true
        })
    }
});