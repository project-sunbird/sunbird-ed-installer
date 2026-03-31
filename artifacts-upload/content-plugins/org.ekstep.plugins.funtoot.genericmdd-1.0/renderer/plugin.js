//@ sourceURL= genericmdd-renderer.js
/**
 * This plugin is used to generate word problems.
 * @extends ftPlugin
 * @fires ftFibBasePlugin, ftb
 * @author Sivashanmugam Kannan<sivashanmugam.kannan@funtoot.com>
 */

org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.genericmdd',
    _isContainer: !0,
    _render: !0,
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item) {
            this._item = item;
        }
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var variables = item.getModelValue("variables");
        var langId = this._item.getModelValue().model.langId;
        var i18nData = this._item.getModelValue().i18n;
        if (typeof (i18nData) == 'string')
            i18nData = JSON.parse(this._item.getModelValue().i18n);
        this._item.setModelValue("i18n", i18nData);

        var defaultFontSize = this.getFontSize(data.isSolution);
        var trans = this._item.getModelValue("i18n")[langId];

        if (!this._item.getModelValue("model").variablesProcessed && !data.isSolution) {
            this.processVariables(variables);
            this._item.setModelValue("hintMsg", new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue("hintMsg")], variables));
        }

        var qtext = new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue().question], variables);

        this.dropDownCount = qtext.match(/__.*?__/g).length;
        qtext = qtext.split(/\n/g).filter(Boolean);
        if (qtext.indexOf("__") > -1)
            qtext = qtext.replace("__", " __");

        if (qtext.length > 2) {
            var firstLine = _.first(qtext);
            var tempQtext = _.rest(qtext);
            tempQtext = tempQtext.join("");
            qtext = [];
            qtext.push(firstLine, tempQtext)
        }
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
        /** Build the first row with 1 or 2 columns based on the availability of the question image */
        var qImgKey = this._item.getModelValue().questionImage;
        var questionRow = {};
        var lastStep = {};
        //If question Image exists and qtext having one new line character
        if (!_.isUndefined(qImgKey) && qImgKey != "" && qtext.length == 2) {
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
            gridData.layout.push(questionRow);
            gridData.layout.push({
                type: "gutter",
                h: 6
            });
            lastStep = {
                type: "row",
                h: 12,
                cols: [{
                    type: "column",
                    id: "lastStep",
                    w: 12
                }, ],
            };
            gridData.layout.push(lastStep);
        }
        //If question Image exists and qtext is a single line
        else if (!_.isUndefined(qImgKey) && qImgKey != "" && qtext.length == 1) {
            questionRow = {
                type: "row",
                h: 26,
                stretch: "false",
                id: "qImg"
            };
            gridData.layout.push(questionRow);
            gridData.layout.push({
                type: "gutter",
                h: 4
            });
            lastStep = {
                type: "row",
                h: 12,
                cols: [{
                    type: "column",
                    id: "lastStep",
                    w: 12
                }, ],
            };
            gridData.layout.push(lastStep);
        }
        //If question Image not exists and qtext
        else {
            questionRow = {
                type: "row",
                h: 10,
                cols: [{
                    type: "column",
                    id: "questionText",
                    w: 12
                }, ]
            };
            gridData.layout.push(questionRow);
        }

        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        var questionTextObj = PluginManager.getPluginObject("questionText");
        var lastStepObj = PluginManager.getPluginObject("lastStep");

        /** Check if the question image exist, invoke plugin manager for image if Yes */
        if (!_.isUndefined(qImgKey) && qImgKey != "") {
            var imgObj = {
                h: 100,
                x: 10,
                y: 10,
                asset: instance._item.getModelValue("questionImage"),
                valign: "middle",
                align: "center",
            }
            var imageObj = PluginManager.getPluginObject('qImg');

            if (this._item.getModelValue().flags != undefined && JSON.parse(this._item.getModelValue().flags).isZoomable && !data.isSolution) {
                PluginManager.invoke('org.ekstep.funtoot.zoomableImage', imgObj, imageObj, instance._stage, instance._theme);
            } else {
                PluginManager.invoke('image', imgObj, imageObj, instance._stage, instance._theme);
            }
        }
        var dropDownsObj = this._item.getModelValue().model.dropDowns;

        instance._optionObjs = [];
        this._mathtextObjsIds = [];
        for (var q = 0; q < qtext.length; q++) {
            var tokens = qtext[q].split(" ").filter(Boolean);
            var pseudoDropDowns = _.filter(tokens, function (t) {
                return t.indexOf("__") > -1;
            });

            _.each(pseudoDropDowns, function (pseudoDD) {
                var dropDownId = instance.replaceAll(pseudoDD, "_", "").replace(".", "");
                _.each(dropDownsObj, function (dropDown) {
                    if (dropDown.identifier == dropDownId) {
                        var optionObj = {
                            identifier: dropDown.identifier,
                            options: []
                        }
                        _.each(dropDown.options, function (option) {
                            optionObj.options.push({
                                answer: option.answer,
                                text: new org.ekstep.generators().replaceVariables(trans[option.text], variables),
                                mh: new org.ekstep.generators().replaceVariables(trans[option.mh], variables),
                                mmc: option.mmc
                            })
                        })
                        optionObj.options = _.shuffle(optionObj.options)
                        instance._optionObjs.push(optionObj)
                    }
                });
            })

            var position = (!_.isUndefined(qImgKey) && qImgKey != "") ? (qtext.length > 1 ? (q == 0 ? questionTextObj : lastStepObj) : lastStepObj) : questionTextObj;
            var mathtextObj = {
                "id": _.uniqueId("mathtext-id"),
                "identifier": "mathtext-id" + (q + 1),
                "x": 0,
                "y": 0,
                "w": 90,
                "h": 90,
                "visible": true,
                "align": "left",
                "content": qtext[q],
                "isSolution": data.isSolution,
                "fontsize": defaultFontSize
            }
            PluginManager.invoke('mathtext', mathtextObj, position, instance._stage, instance._theme);
            this._mathtextObjsIds.push(mathtextObj.identifier);
        }


        _.each(this._mathtextObjsIds, function (m) {
            var dropDownProcessorData = {
                identifier: m,
                dropDowns: instance._optionObjs,
                isSolution: data.isSolution,
                selectText: trans['SELECT']

            }
            PluginManager.invoke('ftbdropdownprocessor', dropDownProcessorData, instance._stage, instance._stage, instance._theme);
        })
    },


    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object} result
     */

    onSubmit: function (evt, instance) {

        var dropDowns = instance._optionObjs;
        var areMicrohintsEnabled = this._item._data.selectedConfig && !_.isUndefined(this._item._data.selectedConfig.areMicrohintsEnabled) ? this._item._data.selectedConfig.areMicrohintsEnabled : true
        var evaluationResult = [];
        var isSolved = true;
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            for (var i = 0; i < this.dropDownCount; i++) {
                var optionObj;
                var selectBox = document.getElementById('mdd-' + (i + 1));
                var choosenOptionIndex = selectBox.dataset.selected;
                _.each(dropDowns, function (dD) {
                    //send the dropdown div-id and the options object
                    if (dD.identifier == (i + 1)) {
                        evaluationResult.push(instance.evaluate(dD, choosenOptionIndex))
                        return false;
                    }
                })

                if (evaluationResult[i].microHint && areMicrohintsEnabled) {
                    result.isSolved = false;
                    selectBox.style.border = '1px solid red'
                    document.getElementById('mhImg-' + evaluationResult[i].selectBoxId).dataset.mhmsg = evaluationResult[i].microHint;
                    document.getElementById('mhImg-' + evaluationResult[i].selectBoxId).dataset.mmc = evaluationResult[i].mmc;
                    document.getElementById('mhImg-' + evaluationResult[i].selectBoxId).style.display = 'inline-block';
                } else {
                    selectBox.style.border = '1px solid #c1c1c1'
                    document.getElementById('mhImg-' + evaluationResult[i].selectBoxId).dataset.mhmsg = '';
                    document.getElementById('mhImg-' + evaluationResult[i].selectBoxId).style.display = 'none';
                }
            }
            result.resValues = evaluationResult;
            _.each(evaluationResult, function (evalResult) {
                _.each(evalResult.mmc, function (m) {
                    result.mmc.push(m);
                })
                delete evalResult.selectBoxId
                delete evalResult.mmc
                delete evalResult.microHint
            })
            return result;
        } else return false

    },
    /**
     *custom evaluation for number counting plugin
     * populates the micro hint message and mmc depending on the user answer
     * @param {object} model the model associated with the FIB plugin
     * @param {object} instance plugin instance
     * @returns {Boolean} true/false
     */
    evaluate: function (optionObj, choosenOptionIndex) {
        var langId = this._item.getModelValue().model.langId;
        var trans = this._item.getModelValue("i18n")[langId];
        var evaluationResult;
        var selectBoxIndex = optionObj['identifier']
        if (choosenOptionIndex == undefined || choosenOptionIndex == "") {
            evaluationResult = {
                [selectBoxIndex]: '',
                microHint: trans['NO_ANSWER'],
                mmc: '01',
                selectBoxId: selectBoxIndex
            }
        } else if (optionObj.options[choosenOptionIndex - 1].answer) {
            evaluationResult = {
                [selectBoxIndex]: optionObj.options[choosenOptionIndex - 1].text,
                microHint: null,
                mmc: null,
                selectBoxId: selectBoxIndex
            }
        } else {
            evaluationResult = {
                [selectBoxIndex]: optionObj.options[choosenOptionIndex - 1].text,
                microHint: optionObj.options[choosenOptionIndex - 1].mh,
                mmc: optionObj.options[choosenOptionIndex - 1].mmc,
                selectBoxId: selectBoxIndex
            }
        }
        return evaluationResult;
    },
    /**
     * replaces all occurrance of a element in a string
     * @param {string} target search in
     * @param {string} search search for
     * @param {string} replacement replace with
     * @returns {string} replaced string
     */
    replaceAll: function (target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement);
    },

    /**
     * checks if user has answered completely
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (instance) {
        var dropDowns = instance._optionObjs;
        var answeredDd = 0;

        for (var i = 0; i < this.dropDownCount; i++) {
            var optionObj;
            var selectBox = document.getElementById('mdd-' + (i + 1));
            var choosenOptionIndex = selectBox.dataset.selected;
            if (choosenOptionIndex != '')
                answeredDd++
        }
        if (answeredDd == this.dropDownCount) {
            return true
        } else return false
    }
});