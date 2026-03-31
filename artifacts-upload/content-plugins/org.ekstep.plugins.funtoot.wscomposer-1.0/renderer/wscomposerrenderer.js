//@ sourceURL= wscomposer-renderer.js
// Renderer plugin can't be tested as of now
// Please move the logic to other classes and test them independently
// Let the plugin class delegate functionality to these classes
/**
 * This plugin is used to generate real time problems.
 * @extends ftPlugin
 * @author Swathi <swathi.jayaprakash@funtoot.com>
 */
Plugin.extend({
    _type: 'org.ekstep.plugins.funtoot.wscomposer',
    _isContainer: !0,
    _render: !0,
    initPlugin: function (data) {
        // create a container for ourself
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        // parse config
        this._pluginConfig = JSON.parse(data.config.__cdata);
        this._pluginData = JSON.parse(data.data.__cdata);
        for (var key in this._pluginData.items) {
            var values = this._pluginData.items[key];
            _.each(values, function (val) {
                if (typeof (val.options) == "string")
                    val.options = JSON.parse(val.options);
                if (typeof (val.i18n) == "string")
                    val.i18n = JSON.parse(val.i18n);
                if (typeof (val.model) == "string")
                    val.model = JSON.parse(val.model);
                if (typeof (val.concepts) == "string")
                    val.concepts = JSON.parse(val.concepts);
                if (typeof (val.lhs_options) == 'string')
                    val.lhs_options = JSON.parse(val.lhs_options);
                if (typeof (val.rhs_options) == 'string')
                    val.rhs_options = JSON.parse(val.rhs_options);
            })
        }
        this.invokeEmbed();
        this.initQuestions();
        this._item = this._stage.getController("item");
        //Flag to be set to avoid item contoller iteration for the plugin invoked
        data["itemCtrlInited"] = true;

        switch (this._item.getModelValue().qtype) {
            case "legacy-word-problem": PluginManager.invoke("org.ekstep.plugins.funtoot.fibwordproblem", data, this, this._stage, this._theme); break;
            case "mcq": PluginManager.invoke("org.ekstep.plugins.funtoot.genericmcq", data, this, this._stage, this._theme); break;
            case "freeResponse": PluginManager.invoke("org.ekstep.plugins.funtoot.genericfib", data, this, this._stage, this._theme); break;
            case "mfr": PluginManager.invoke("org.ekstep.plugins.funtoot.genericmfr", data, this, this._stage, this._theme); break;
            case "mtf": PluginManager.invoke("org.ekstep.plugins.funtoot.genericmtf", data, this, this._stage, this._theme); break;
            case "Sequencing": PluginManager.invoke("org.ekstep.plugins.funtoot.genericseq", data, this, this._stage, this._theme); break;
            case "mdd": PluginManager.invoke("org.ekstep.plugins.funtoot.genericmdd", data, this, this._stage, this._theme);
        }
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