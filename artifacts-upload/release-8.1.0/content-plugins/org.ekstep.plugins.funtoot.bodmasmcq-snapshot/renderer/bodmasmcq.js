//@ sourceURL=bodmasmcq.js
/* global PluginManager */
/**
 * This plugin is used to generate bodmas mcq problems
 * @extends ftBasePlugin
 * @fires grid
 * @author Amulya (amulya.k@funtoot.com)
 */
Plugin.extend({
    _type: 'org.ekstep.funtoot.bodmasmcq',
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
        model.model.mcqType = 2;
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
        if (!model.optionsCreated) {
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
                mmc: []
            }
            console.log("opcount", model.model.optionsCount)
            for (var i = 0; i < model.model.optionsCount; i++) {
                model.options[i] = JSON.parse(JSON.stringify(op));
            }
            if (!_.isUndefined(model.mmc2))
                model.options[1].mmc = model.mmc2
        }


        if (!data.isSolution && variables != "" && _.isUndefined(model.optionsCreated)) {
            model.options[0].answer = true;
            model.optionsCreated = true;
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
        if (!model.isProcessed) {
            model.i18n = {
                "en": {

                }
            }
        }
        PluginManager.invoke('set', param2Data, this, this._stage, this._theme);
        i18n.onReady().then(function () {
            model.i18n[langId]["NO_ANSWER"] = i18n.translate("NO_ANSWER");
            if (!model.isProcessed) {
                model.i18n[langId]["HINT"] = i18n.translate("HINT");
                model.i18n[langId]["SOLUTION"] = i18n.translate("SOLUTION");
                model.i18n[langId]["MICROHINT"] = i18n.translate("MICROHINT");
                model.i18n[langId]["HELP"] = i18n.translate("HELP");
                model.i18n[langId][model.model.questionText] = i18n.translate(model.model.questionText);
                model.i18n[langId]["MH1"] = "Correct";
                model.question = model.model.questionText;
                model.i18n[langId][model.model.hintMsg] = i18n.translate(model.model.hintMsg);
                model.options[0].mh = "MH1";
                for (var i = 0; i < model.model.optionsText.length; i++) {
                    model.options[i].value.asset = "OPT" + i;
                    model.options[i].value.resvalue = i;
                    model.options[i].value.resindex = i;
                    model.i18n[langId]["OPT" + i] = model.model.optionsText[i];
                    if (typeof model.model.optionsText[i] == "string")
                        model.i18n[langId]["OPT" + i] = model.model.optionsText[i];
                }
                for (i = 0; i < model.model.mhs.length; i++) {
                    model.options[i + 1].mh = model.model.mhs[i];
                    model.i18n[langId][model.model.mhs[i]] = i18n.translate(model.model.mhs[i]);
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