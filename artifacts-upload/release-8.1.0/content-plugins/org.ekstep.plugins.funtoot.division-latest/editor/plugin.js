//@ sourceURL=division.js
/* global manifest */
/**
 * Editor plugin for the Place value Face value template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Henrietta <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    /**
     * This expains the type of the plugin
     * @member {String} type
     * @memberof skip-counting
     */
    type: "org.ekstep.plugins.funtoot.division",
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
        var id = this.manifest.id;
        var version = this.manifest.ver;
        ecEditor.addEventListener(this.manifest.id + ":showpopup", this.showDialog, this);
        ecEditor.addEventListener(this.manifest.id + ":renderFabricContent", this.renderFabricContent, this);
        setTimeout(function () {
            var templatePath = ecEditor.resolvePluginResource(id, version, manifest.editor.wizard.template);
            var controllerPath = ecEditor.resolvePluginResource(id, version, manifest.editor.wizard.controller);
            ecEditor.getService('popup').loadNgModules(templatePath, controllerPath);
        }, 1000);

    },
    /**
     * shows the dialog for editing the questions
     * @memberof skip-counting
     */
    showDialog: function () {
        var instance = this;
        instance.callback = this.controllerCallback;
        ecEditor.getService('popup').open({
            template: 'division',
            controller: 'DivisionController',
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
