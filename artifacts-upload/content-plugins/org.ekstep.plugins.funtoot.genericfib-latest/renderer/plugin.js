//@ sourceURL= genericfib-renderer.js
/**
 * This plugin is used to generate word problems.
 * @extends ftPlugin
 * @fires ftFibBasePlugin, ftb
 * @author Henrietta D <henrietta.d@funtoot.com>
 */

org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.genericfib',
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
            this._item.setModelValue("hintMsg", new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue("hintMsg")], variables));
            this._item.setModelValue("fibModels", {});
        }
        this._variables = variables;
        var qtext = new org.ekstep.generators().replaceVariables(trans[this._item.getModelValue().question], variables);
        // add space before a blank so that blank comes as a seperate token when split by space
        if (qtext.indexOf("__") > -1)
            qtext = qtext.replace("__", " __");
        var lastWord = qtext.split(" ").pop(); // get last word
        var IsBlankAtTheEnd = lastWord.indexOf("__") > -1;
        //Check if question has more than one blanks
        var qWords = qtext.split(" ").filter(Boolean);
        var blnks = _.filter(qWords, function (w) {
            return w.indexOf("__") > -1;
        });
        if (blnks.length == 1) {
            qtext = qtext.split(/\n/g).filter(Boolean);
            if (qtext.length > 2) {
                var firstLine = _.first(qtext);
                var tempQtext = _.rest(qtext);
                tempQtext = tempQtext.join().replace(/,/g, '');
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
                        w: 9
                    },
                    {
                        type: "column",
                        id: "qblank",
                        w: 3
                    }
                    ],
                };
                gridData.layout.push(lastStep);
            } else if (!_.isUndefined(qImgKey) && qImgKey != "" && qtext.length == 1) {
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
                        w: 9
                    },
                    {
                        type: "column",
                        id: "qblank",
                        w: 3
                    }
                    ],
                };
                gridData.layout.push(lastStep);
            } else {
                questionRow = {
                    type: "row",
                    h: 10,
                    cols: [{
                        type: "column",
                        id: "questionText",
                        w: 9
                    },
                    {
                        type: "column",
                        id: "qblank",
                        w: 3
                    }
                    ]
                };
                gridData.layout.push(questionRow);
            }

            var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
            PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

            var questionTextObj = PluginManager.getPluginObject("questionText");
            var lastStepObj = PluginManager.getPluginObject("lastStep");
            /** Check if the question image exist, invoke plugin manager for image if Yes */
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
                if (this._item.getModelValue().flags != undefined && JSON.parse(this._item.getModelValue().flags).isZoomable && !data.isSolution) {
                    PluginManager.invoke('org.ekstep.funtoot.zoomableImage', tileImageObj, qImage, this._stage, this._theme);
                } else {
                    PluginManager.invoke('image', tileImageObj, qImage, this._stage, this._theme);
                }
            }

            this._blanksData = [];
            var bId = 1;
            for (var q = 0; q < qtext.length; q++) {
                var tokens = qtext[q].split(" ").filter(Boolean);
                var fibs = this._item.getModelValue().model.fibs;
                var blanks = _.filter(tokens, function (t) {
                    return t.indexOf("__") > -1;
                });
                var qtextWithAnswer = qtext[q];
                _.each(blanks, function (blank) {
                    var blankid = instance.replaceAll(blank, "_", "").replace(".", "");
                    _.each(fibs, function (fib) {
                        if (fib.identifier == blankid) {
                            qtextWithAnswer = qtextWithAnswer.replace(blank, "__" + fib.answer + "__");
                            instance._blanksData.push({
                                bId: blankid,
                                responses: fib.responses,
                                answer: fib.answer
                            });
                        }
                    });
                })

                // var lineContainsBlank = qtextWithAnswer.indexOf("__") > -1;
                var position = (!_.isUndefined(qImgKey) && qImgKey != "") ? (qtext.length > 1 ? (q == 0 ? questionTextObj : lastStepObj) : lastStepObj) : questionTextObj;
                var contnt = IsBlankAtTheEnd ? qtext[q].replace(blanks[0], "") : qtext[q].replace(blanks[0], "_ _ _ _");
                var mathtextObj = {
                    "id": _.uniqueId("mathtext-id"),
                    "identifier": "mathtext-id",
                    "x": 0,
                    "y": 0,
                    "w": 100,
                    "h": 100,
                    "visible": true,
                    "content": contnt,
                    "isSolution": data.isSolution,
                    "fontsize": defaultFontSize
                }
                PluginManager.invoke('mathtext', mathtextObj, position, instance._stage, instance._theme);

            }
            var cell = PluginManager.getPluginObject("qblank"); {
                var key = "fib" + cell._data.id + q;
                if (!data.isSolution) {
                    var expectedAnswer = eval(new org.ekstep.generators().replaceVariables(instance._blanksData[0].answer, variables)).toString();
                    var fibData = {
                        e: expectedAnswer,
                        u: '',
                        w: true,
                        isSolution: data.isSolution,
                        isEvaluated: false,
                        isCorrect: false,
                        bId: bId.toString()
                    }
                    var fibM = instance._item.getModelValue().model.fibModels;
                    fibM[key] = fibData;
                }
                instance._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                var fib = {};
                fib.id = key;
                fib.model = "fibModels." + key;
                fib.w = 100;
                fib.x = 0;
                fib.h = 100;
                fib.y = 0;
                fib.options = {
                    readonly: {
                        showBgImg: false
                    }
                };
                fib.fontsize = defaultFontSize;
                PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
            }
        } else {
            throw "Question should have only one blank";
        }
    },


    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object} result
     */

    onSubmit: function (evt, instance) {
        var model = instance._item.getModelValue();
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                if (m.w) {
                    var res = {};
                    res[k] = m.u;
                    result.resValues.push(res);
                    m.isCorrect = instance.evaluate(m, instance);
                    if (!m.isCorrect) {
                        if (Array.isArray(m.mmc))
                            result.mmc.push.apply(result.mmc, m.mmc);
                        else
                            result.mmc.push(m.mmc);
                        result.isSolved = false;
                    }
                    var fibObject = PluginManager.getPluginObject(k);
                    fibObject.onEvaluate();
                }
            });
            return result;
        } else {
            return false;
        }

    },
    /**
     *custom evaluation for number counting plugin
     * populates the micro hint message and mmc depending on the user answer
     * @param {object} model the model associated with the FIB plugin
     * @param {object} instance plugin instance
     * @returns {Boolean} true/false
     */
    evaluate: function (model, instance) {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var userValue = i18n.toNumber(model.u.trim());
        var expectedValue = i18n.toNumber(model.e.trim());
        var langId = this._item.getModelValue().model.langId || "en";
        var trans = this._item.getModelValue("i18n")[langId];
        if (model.u.trim() == '') {
            model['mh'] = new org.ekstep.generators().replaceVariables(trans["NO_ANSWER"], this._variables); //'Please answer'
            model['mmc'] = 'O1';
            return !1;
        } else if (userValue != expectedValue) {
            var responses = _.find(instance._blanksData, function (b) {
                return b.bId == model.bId;
            });
            var defaultResponse;
            var otherResponses = [];
            _.each(responses.responses, function (response) {
                if (!response.default)
                    otherResponses.push(response)
                else
                    defaultResponse = response;
            });
            var matchedResponse = _.find(otherResponses, function (or) {
                return model.u == eval(new org.ekstep.generators().replaceVariables(or.response[0], instance._variables));
            });
            if (!_.isUndefined(matchedResponse)) {
                model['mh'] = new org.ekstep.generators().replaceVariables(trans[matchedResponse.mh], this._variables); //trans[matchedResponse.mh];
                model['mmc'] = matchedResponse.mmc;
            } else {
                model['mh'] = new org.ekstep.generators().replaceVariables(trans[defaultResponse.mh], this._variables); //trans[defaultResponse.mh];
                model['mmc'] = defaultResponse.mmc;
            }
            return !1;
        } else {
            model['mh'] = null;
            model['mmc'] = null;
            return !0;
        }

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
        var blkCount = 0;
        var answeredBlkCount = 0;
        var blanks = instance._item.getModelValue().model.fibModels;

        _.each(blanks, function (b) {
            if (b.w) {
                blkCount++;
                if (b.u != "")
                    answeredBlkCount++;
            }
        })
        if (answeredBlkCount == blkCount)
            return true
        else return false
    }
});