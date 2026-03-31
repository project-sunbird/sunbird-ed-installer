//@ sourceURL=spnibbase-plugin.js
/**
 * Editor plugin for the spnib template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Sandhya M <sandhya.m@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    /**
     * This expains the type of the plugin
     * @member {String} type
     * @memberof spnib
     */
    type: "org.ekstep.funtoot.spnibbase",
    /**
     * registers events
     *  @memberof spnib
     */
    initialize: function () {
        var instanceManifest = this.manifest,
            version = instanceManifest.ver,
            id = instanceManifest.id;
        ecEditor.addEventListener(this.manifest.id + ":showpopup", this.showDialog, this);
        ecEditor.addEventListener(this.manifest.id + ":renderFabricContent", this.renderFabricContent, this);
        if (instanceManifest.editor.wizard.template) {
            setTimeout(function () {
                var templatePath = ecEditor.resolvePluginResource(id, version, instanceManifest.editor.wizard.template);
                var controllerPath = ecEditor.resolvePluginResource(id, version, instanceManifest.editor.wizard.controller);
                ecEditor.getService('popup').loadNgModules(templatePath, controllerPath);
            }, 1000);
        }
    },
    /**
     *   shows the dialog for editing the questions
     *   @param {object} event the event
     *   @param {function} callback the callback to call after the question is configured
     *   @memberof spnib
     */
    showDialog: function (event, callback) {
        var instance = this;
        instance.callback = this.controllerCallback;
        var configsPath = ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, this.manifest.editor.wizard.configFile.path);
        var localeFilePath = ecEditor.resolvePluginResource(this.manifest.editor.wizard.localeFile.pluginId, this.manifest.ver, this.manifest.editor.wizard.localeFile.path);
        ecEditor.getService('popup').open({
            template: 'spnib',
            controller: 'spnibController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function () {
                    return instance;
                },
                'configs': function () {
                    return {
                        "configFilePath": configsPath,
                        "localeFilePath": localeFilePath
                    };
                }
            },
            width: 900,
            showClose: false,
            className: 'ngdialog-theme-plain'
        });
    },

    getFabricImagePath: function () {
        return ecEditor.resolvePluginResource(this.manifest.editor.wizard.fbImage.pluginId, this.manifest.ver, this.manifest.editor.assets.fabricImgPath);
    }
});