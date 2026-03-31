//@ sourceURL=custombillseditor-plugin.js
/**
 * Editor plugin for the Custom Bills template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Swathi <swathi.jayaprakash@funtoot.com>
 */


org.ekstep.funtoot.common.extend({
    /**
     * This expains the type of the plugin
     * @member {String} type
     * @memberof custombills-editor
     */
    type: "org.ekstep.plugins.funtoot.custombills",
    /**
   * registers events
   * @memberof custombills-editor
   */
    initialize: function () {
        var id = this.manifest.id;
        var version = this.manifest.ver;
        var manifest = this.manifest;
        ecEditor.addEventListener(this.manifest.id + ":showpopup", this.showDialog, this);
        ecEditor.addEventListener(this.manifest.id + ":renderFabricContent", this.renderFabricContent, this);
        setTimeout(function () {
            var templatePath = ecEditor.resolvePluginResource(id, version, manifest.editor.wizard.template);
            var controllerPath = ecEditor.resolvePluginResource(id, version, manifest.editor.wizard.controller);
            ecEditor.getService('popup').loadNgModules(templatePath, controllerPath);
        }, 1000);

    },
    /**
     *   shows the dialog for editing the questions
     *   @memberof bills-editor
     */
    showDialog: function () {
        var instance = this;
        instance.callback = this.controllerCallback;
        ecEditor.getService('popup').open({
            template: 'custombills',
            controller: 'custombillsController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function () {
                    return instance;
                }
            },
            width: 900,
            showClose: false,
            className: 'ngdialog-theme-plain'
        });
    }
});