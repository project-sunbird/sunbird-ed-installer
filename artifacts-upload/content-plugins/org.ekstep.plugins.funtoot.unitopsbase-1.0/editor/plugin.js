//@ sourceURL=unitopsbase-plugin.js
/* global manifest */
/**
 * Editor plugin for the Place value Face value template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Amit <amit.dawar@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    /**
     * This expains the type of the plugin
     * @member {String} type
     * @memberof skip-counting
     */
    type: "org.ekstep.plugins.funtoot.unitopsbase",
    /**
     * Magic Number is used to calculate the from and to ECML conversion
     * @member {Number} magicNumber
     * @memberof Text
     */
    magicNumber: 1920,
    /**
     * Editor Width
     * @member {Number} editorWidth
     * @memberof Text
     */
    editorWidth: 720,
    /**
     * @member currentInstance
     *  @memberof division
     */
    currentInstance: undefined,
    /**
     * registers events
     *  @memberof division
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
     * shows the dialog for editing the questions
     * @memberof skip-counting
     */
    showDialog: function () {
        var instance = this;
        instance.callback = this.controllerCallback;
        var configsPath = ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, this.manifest.editor.wizard.configFile.path);
        var localeFilePath = ecEditor.resolvePluginResource(this.manifest.editor.wizard.localeFile.pluginId, this.manifest.ver, this.manifest.editor.wizard.localeFile.path);
        ecEditor.getService('popup').open({
            template: 'unitops',
            controller: 'unitopsController',
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