//@ sourceURL=timeclockops-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate clock set/read problems
 * @extends ftBasePlugin
 * @fires grid, clockcontrol
 * @author Amit (amit.dawar@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.timeclockops',
    initPlugin: function (data) {
        this._super(data);
        var instance = this;

        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);

        var clkContainer = this._parent;
        //var instance = this;
        //var defaultCount = data.count || 10;
        //var cellWidth = 100 / defaultCount;
        //var x = (100 - (defaultCount * cellWidth)) / 2;

        var model = item.getModelValue();
        var variables = item.getModelValue("variables");

        // process the variables only if non-solution display
        if (!data.isSolution) {
            this.processVariables(variables);
            //create fib model
            this._item.setModelValue("fibModels", {});
        }

        var nlangId = item.getModelValue("numericLangId");
        var langId = item.getModelValue("langId");

        var plugData = {
            id: "i18n_helper",
            config: {
                langId: langId,
                numericLangId: nlangId
            },
            data: this._pluginData.i18n
        };

        PluginManager.invoke('org.ekstep.plugins.i18n', plugData, this, this._stage, this._theme);

        var clockContainer = {
            id: "clockContainer",
            w: 100,
            h: 100,
            y: 27,
            x: 15
            //stroke: "black"
        }
        PluginManager.invoke('g', clockContainer, clkContainer, this._stage, this._theme);

        //var langId = i18n.config.numericLangId

        //var rowHeight = 6; // in units
        //var colsPerCell = 12; // in number of columns
        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance
            //debug: true
        };

        gridData.layout = [];

        //Added ygutter in the begining to middle align the content.
        var qtext = {
            id: 'qtext',
            type: "row",
            h: 4,
            cols: []
        };
        gridData.layout.push(qtext);
        gridData.layout.push({
            type: "gutter",
            h: 10
        });

        var textRow = {
            type: "row",
            h: 5,
            cols: [{
                type: "offset",
                w: 5.5
            }, {
                type: "column",
                w: 2,
                id: "text0"
            }, {
                type: "offset",
                w: 0.2
            }, {
                type: "column",
                w: 2,
                id: "text1"
            }, {
                type: "offset",
                w: 0.2
            }, {
                type: "column",
                w: 2,
                id: "text2"
            }]
        }

        gridData.layout.push(textRow);

        //add answer row
        var answerRow = {
            type: "row",
            h: 7,
            cols: [{
                    type: "offset",
                    w: 5.5
                },
                {
                    type: "column",
                    w: 2,
                    id: "fibinput0"
                },
                {
                    type: "offset",
                    w: 0.2
                },
                {
                    type: "column",
                    w: 2,
                    id: "fibinput1"
                },
                {
                    type: "offset",
                    w: 0.2
                },
                {
                    type: "column",
                    w: 2,
                    id: "fibinput2"
                }
            ],
            id: "answer"
        }

        gridData.layout.push(answerRow);

        gridData.layout.push({
            type: "gutter",
            h: 2
        });

        var arrowRowInc = {
            type: "row",
            h: 8,
            cols: [{
                type: "offset",
                w: 6
            }],
            id: "answer"
        }
        for (var i = 0; i < 3; i++) {
            arrowRowInc.cols.push({
                type: "column",
                w: 1.2,
                id: "button" + i
            });
            arrowRowInc.cols.push({
                type: "offset",
                w: 1
            });
        }

        gridData.layout.push(arrowRowInc);

        gridData.layout.push({
            type: "gutter",
            h: 2
        });

        var arrowRowDec = {
            type: "row",
            h: 8,
            cols: [{
                type: "offset",
                w: 6
            }],
            id: "answer"
        }
        for (var z = 3; z < 6; z++) {
            arrowRowDec.cols.push({
                type: "column",
                w: 1.2,
                id: "button" + z
            });
            arrowRowDec.cols.push({
                type: "offset",
                w: 1
            });
        }
        gridData.layout.push(arrowRowDec);
        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        var i18n = PluginManager.getPluginObject('i18n_helper');
        var quetext = i18n.translate(model.model.question);
        model.qt = quetext;

        var hourStr = i18n.translate("HOURS");
        var minStr = i18n.translate("MINUTES");
        var secStr = i18n.translate("SECONDS");
        i18n.onReady().then(function () {

            var questionRow = PluginManager.getPluginObject('qtext')
            var questionObj = {
                id: "question-id",
                align: "center",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: "2.7vw",
                $t: quetext,
                x: 0,
                y: 0,
                w: 100,
                h: 100
            };
            PluginManager.invoke('text', questionObj, questionRow, instance._stage, instance._theme);
        });

        var time = [variables.$hours, variables.$min]
        if (variables.$sec) {
            time.push(variables.$sec);
        }

        model.time = time;
        if (quetext.includes("Set")) {
            _.each([0, 1, 2, 3, 4, 5], function (i) {
                if (time.length == 3 || (time.length == 2 && (i != 2 && i != 5))) {
                    var imgContainer = PluginManager.getPluginObject("button" + i);
                    var bgObj = {
                        asset: i < 3 ? "increase" : "decrease",
                        h: 100,
                        x: 0,
                        y: 0,
                        stretch: "false",
                        type: "rect"
                    }
                    PluginManager.invoke('image', bgObj, imgContainer, instance._stage, instance._theme);
                }
            });
        }

        for (var s = 0; s < time.length; s++) {
            var cell = PluginManager.getPluginObject("fibinput" + s);
            var key = cell._data.id;
            if (!data.isSolution) {
                var fibData = {
                    e: time[s],
                    u: z == 0 ? time[s] : '',
                    w: quetext.includes("Set") ? false : true,
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false,
                    key: key
                }
                var fibM = item.getModelValue().model.fibModels;
                fibM[key] = fibData;
            }
            item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
            var fib = {
                id: key,
                model: "fibModels." + key,
                w: 100,
                x: 0,
                h: 100,
                y: 0,
                fontsize: "3.2vw",
                options: {
                    readonly: {
                        showBgImg: true
                    },
                    "deselected": {
                        "stroke": "#ffffff"
                    }
                }
            };
            PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
        }

        for (var d = 0; d < time.length; d++) {
            var textContainer = PluginManager.getPluginObject("text" + d);
            var obj = {
                id: "timetextid" + d,
                align: "center",
                valign: "middle",
                color: "#4c4c4c",
                fontsize: "3.1vw",
                $t: d == 0 ? hourStr : (d == 1 ? minStr : secStr),
                x: 0,
                y: 0,
                w: 100,
                h: 100
            }
            PluginManager.invoke('text', obj, textContainer, instance._stage, instance._theme);
        }
        model.set = [];
        if (quetext.includes("Set")) {
            model.set[0] = 12;
            model.set[1] = 0;
            if (time.length == 3)
                model.set[2] = 0;
        }
        model.clickCount = 0;
        var click = false
        _.each([0, 1, 2, 3, 4, 5], function (i) {
            var button = PluginManager.getPluginObject("button" + i);
            button._self.on('click', function () {
                console.log("clicked--------")
                click = true
                model.clickCount++;
                switch (i) {
                    case 0:
                        model.set[0]++;
                        model.set[0] = model.set[0] % 12;
                        break;
                    case 1:
                        model.set[1]++;
                        model.set[1] = model.set[1] % 60;
                        if (model.set[1] == 0) {
                            model.set[0]++
                        }
                        break;
                    case 2:
                        model.set[2]++;
                        model.set[2] = model.set[2] % 60;
                        if (model.set[2] == 0) {
                            model.set[1]++
                        }
                        break;
                    case 3:
                        model.set[0]--;
                        model.set[0] = model.set[0] % 12;
                        if (model.set[0] <= 0) {
                            model.set[0] = 12 - (-1 * model.set[0]);
                        }
                        break;
                    case 4:
                        model.set[1]--;
                        model.set[1] = model.set[1] % 60;
                        if (model.set[1] < 0) {
                            model.set[1] = 60 - (-1 * model.set[1]);
                            model.set[0]--
                        }
                        break;
                    case 5:
                        model.set[2]--;
                        model.set[2] = model.set[2] % 60;
                        if (model.set[2] < 0) {
                            model.set[2] = 60 - (-1 * model.set[2]);
                            model.set[1]--
                        }
                        break;
                }
                drawClock(instance);
            });
        });
        model.submitCount = 0;
        drawClock(instance);

        function drawClock(instance) {

            var container = PluginManager.getPluginObject("clockContainer");
            var plugData = {
                id: "clockContainer",
                clicked: click,
                hours: quetext.includes("Read") || data.isSolution ? model.time[0] : model.set[0],
                min: quetext.includes("Read") || data.isSolution ? model.time[1] : model.set[1],
                seconds: quetext.includes("Read") || data.isSolution ? model.time[2] : model.set[2],
                isSolution: data.isSolution
            };

            PluginManager.invoke('clockcontrol', plugData, container, instance._stage, instance._theme);
        }
    },

    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @param {object} instance the instance of the plugin
     * @returns {object} result the result after submitting
     */
    onSubmit: function (evt, instance) {
        var model = this._stage._stageController.getModelValue();
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var qtext = i18n.translate(model.model.question);
        var mmc = "C141";
        var result = {
            isSolved: false,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            var res = true;

            if (qtext.includes("Read")) {
                _.each(model.model.fibModels, function (fib) {
                    var re = {};
                    re[fib.key] = fib.u
                    result.resValues.push(re);
                    if (res)
                        if (parseInt(fib.u) != parseInt(fib.e)) {
                            res = false;
                        } else {
                            res = true;
                        }
                });
            }

            if (qtext.includes("Set")) {
                res = true
                for (var t = 0; t < model.set.length; t++) {
                    var container = PluginManager.getPluginObject("text" + t);
                    var res = {}
                    res[container.id] = model.set[t];
                    result.resValues.push(res);
                }
                for (var t = 0; t < model.set.length; t++) {
                    if (model.time[t] == model.set[t])
                        res = true;
                    else {
                        res = false;
                        break;
                    }
                }
            }

            // if user answer is correct
            if (res == true) {
                result.isSolved = true;

                if (result.isSolved) {
                    _.each(model.model.fibModels, function (fib) {
                        fib.isCorrect = true;
                        var fibObject = PluginManager.getPluginObject(fib.key);
                        fibObject.onEvaluate();
                    });
                }
            } else {

                _.each(model.model.fibModels, function (fib) {
                    var res = {}
                    res[fib.key] = fib.u;
                    result.resValues.push(res);
                    if (qtext.includes("Read")) {
                        fib.isCorrect = fib.e == fib.u;
                        if (!fib.isCorrect && fib.key.includes('input0') && fib.u != '') {
                            fib.mmc = "C141";
                            result.mmc.push("C141");
                            fib.mh = i18n.translate("READ_H_1");
                        } else if (!fib.isCorrect && fib.key.includes('input1') && fib.u != '') {
                            fib.mmc = "C141";
                            result.mmc.push("C141");
                            fib.mh = i18n.translate("READ_M_1");
                        } else if (!fib.isCorrect && fib.key.includes('input2') && fib.u != '') {
                            fib.mmc = "C141";
                            result.mmc.push("C141");
                            fib.mh = i18n.translate("READ_S_1");
                        } else if (fib.u == '') {
                            fib.mmc = "TBD";
                            result.mmc.push("TBD");
                            fib.mh = i18n.translate("NO_ANSWER");
                        }
                        var fibObject = PluginManager.getPluginObject(fib.key);
                        fibObject.onEvaluate();
                    }
                });

                if (qtext.includes("Set")) {
                    for (var tm = 0; tm < model.set.length; tm++) {
                        if (model.time[tm] == model.set[tm])
                            res = true;
                        else {
                            t = tm == 0 ? "H" : (tm == 1 ? "M" : "S")
                            result.mmc.push("C141");
                            instance.attachSetmh(instance, tm, t)
                        }
                    }
                }
            }
            return result;
        } else return false
    },

    attachSetmh: function (instance, col, t) {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var answerRow = PluginManager.getPluginObject("text" + col);

        var answerContainerObj = {
            x: 0,
            y: 0,
            h: 100,
            w: 100,
            id: "answerBox" + col
        };
        PluginManager.invoke('g', answerContainerObj, answerRow, instance._stage, instance._theme);
        var answerContainer = PluginManager.getPluginObject("answerBox" + col);
        answerContainer.onMicroHint =
            function () {
                var helper = PluginManager.getPluginObject('plugin_helper');
                var mhData = {};
                mhData.title = 'Micro hint';
                mhData.type = "mh";
                mhData.containerId = '_ft_microhint_content_container__';
                mhData.x = 0;
                mhData.y = 0;
                mhData.w = 100;
                mhData.h = 100;
                mhData.content = i18n.translate("SET_" + t + "_1");
                mhData.mmc = "C141";
                return mhData;
            }
        var microhint = {};
        microhint.id = 'answerBox' + col + '-mh';
        microhint.attachTo = "answerBox" + col;
        microhint.mhPos = 'top-left';
        microhint.visible = true;
        PluginManager.invoke('ftMicroHint', microhint, instance, instance._stage, instance._theme);

        var tbcobj = PluginManager.getPluginObject('answerBox' + col + '-mh-mhicon');
        tbcobj._self.visible = true;
        tbcobj._data.visible = true;
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
        var model = this._stage._stageController.getModelValue();

        _.each(blanks, function (b) {
            if (b.w) {
                blkCount++;
                if (b.u != "")
                    answeredBlkCount++;
            }
        })
        if (((blkCount > 0) && (answeredBlkCount == blkCount)) || (model.clickCount > 0))
            return true
        else return false
    }
});