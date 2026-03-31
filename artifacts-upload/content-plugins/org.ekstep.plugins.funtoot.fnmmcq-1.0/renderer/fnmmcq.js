//@ sourceURL=fnmmcq-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate fnm mcq problems
 * @extends ftBasePlugin
 * @fires grid
 * @author Amit (amit.dawar@funtoot.com)
 */
Plugin.extend({
    _type: 'org.ekstep.plugins.funtoot.fnmmcq',
    initPlugin: function (data) {
        var instance = this;
        // create a container for ourself
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        else {
            // parse config
            this._pluginConfig = JSON.parse(data.config.__cdata);
            this._pluginData = JSON.parse(data.data.__cdata);

            // the item data is for solution display
            if (data.item && data.item.__cdata)
                this._pluginItem = JSON.parse(data.item.__cdata);

            this.invokeEmbed();
            this.initQuestions();
            item = this._stage.getController("item");
        }
        var model = item.getModelValue();
        var variables = item.getModelValue("variables");
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
        var i18n = PluginManager.getPluginObject('i18n_helper');
        if (!variables.isProcessed) {
            model.options = [];
            var op = {
                value: {
                    type: "text",
                    asset: "",
                    audio: "",
                    image: ""
                },
                answer: false,
                mh: "",
                mmc: [model.mmc]
            }
            for (var i = 0; i < model.model.optionsCount; i++) {
                model.options[i] = JSON.parse(JSON.stringify(op));
            }
            model.options[0].mmc = []
        }

        if (!data.isSolution && variables != "" && _.isUndefined(variables.isProcessed)) {
            if (!item.getModelValue("variablesProcessed")) {
                new org.ekstep.generators().processVariables(variables);
            }
            var qText = i18n.translate(model.model.questionText);
            model.options[0].value.asset = model.model.optionsText[0].toString();
            if (variables.$reminder == undefined) {
                model.options[0].answer = true;
            } else if (variables.$reminder > 0) {
                model.options[1].answer = true;
            } else {
                model.options[0].answer = true;
            }
            if (qText.includes("divisi")) {
                model.t = "mcqma";
                for (var a = 1; a < model.model.optionsText.length - 1; a++) {
                    model.options[a].answer = true;
                }
            }
            for (var b = 1; b < model.model.optionsText.length; b++) {
                model.options[b].value.asset = model.model.optionsText[b].toString();
            }
            _.each(model.options, function (opt, k) {
                opt.value.resvalue = k;
                opt.value.resindex = k;
            })
            variables.isProcessed = true;
        }

        var param1Data = {
            param: "overlaySubmit",
            scope: "stage",
            value: "off"
        };
        PluginManager.invoke('set', param1Data, this, this._stage, this._theme);
        var param2Data = {
            param: "overlayNext",
            scope: "stage",
            value: "off"
        };
        PluginManager.invoke('set', param2Data, this, this._stage, this._theme);
        if (!model.isProcessed) {
            model.i18n = {
                "en": {},
                "mr": {}
            }
        }
        i18n.onReady().then(function (o) {
            if (!model.isProcessed) {
                model.i18n[langId]["HINT"] = o.translate("HINT");
                model.i18n[langId]["SOLUTION"] = o.translate("SOLUTION");
                model.i18n[langId]["MICROHINT"] = o.translate("MICROHINT");
                model.i18n[langId]["HELP"] = o.translate("HELP");
                model.i18n[langId]["NO_ANSWER"] = o.translate("NO_ANSWER");
                var qText = o.translate(model.model.questionText);
                model.i18n[langId][model.model.questionText] = new org.ekstep.generators().replaceVariables(qText, variables);
                model.i18n[langId]["MH1"] = "Correct";
                model.question = model.model.questionText;
                var hText = o.translate(model.model.hintMsg);
                model.i18n[langId][model.model.hintMsg] = new org.ekstep.generators().replaceVariables(hText, variables);
                model.options[0].mh = "MH1";
                for (var i = 0; i < model.model.optionsText.length; i++) {
                    model.options[i].value.asset = "OPT" + i;
                    model.i18n[langId]["OPT" + i] = model.model.optionsText[i].toString();
                    if (typeof model.model.optionsText[i] == "string")
                        model.i18n[langId]["OPT" + i] = new org.ekstep.generators().replaceVariables(model.model.optionsText[i], variables);
                }
                for (i = 0; i < model.model.mhs.length; i++) {
                    model.options[i + 1].mh = model.model.mhs[i];
                    var mhText = o.translate(model.model.mhs[i]);
                    model.i18n[langId][model.model.mhs[i]] = new org.ekstep.generators().replaceVariables(mhText, variables);
                }
            }
            data.itemCtrlInited = true;
            PluginManager.invoke('org.ekstep.plugins.funtoot.genericmcq', data, instance, instance._stage, instance._theme);

        });
    },
    /**
     * creates the embed ECML tag for item controller
     */
    invokeEmbed: function () {
        var embedData = {};
        embedData.template = "item";
        embedData["var-item"] = "item";
        PluginManager.invoke('embed', embedData, this, this._stage, this._theme);
    },
    /**
     * initializes the controller tag to bind the item to the controller
     */
    initQuestions: function () {
        var controllerName = this._pluginConfig.var;
        var assessmentid = (Renderer.theme._currentStage + "_assessment");
        var stageController = this._theme._controllerMap[assessmentid];

        // Check if the controller is already initialized, if yes, skip the init
        var initialized = (stageController != undefined);
        if (!initialized) {
            var controllerData = {};
            controllerData.__cdata = this._pluginData;
            controllerData.type = this._pluginConfig.type;
            controllerData.name = assessmentid;
            controllerData.id = assessmentid;

            this._theme.addController(controllerData);
            stageController = this._theme._controllerMap[assessmentid];
        }

        if (stageController) {
            this._stage._stageControllerName = controllerName;
            this._stage._stageController = stageController;
            this._stage._stageController.next();
        }
    }

});