//@ sourceURL=skip-counting-plugin.js
/**
 * Editor plugin for the Skip Counting template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Sandhya M <sandhya.m@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    /**
     * This expains the type of the plugin
     * @member {String} type
     * @memberof skip-counting
     */
    type: "org.ekstep.funtoot.skipcounting",
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
     *  @memberof skip-counting
     */
    currentInstance: undefined,
    /**
   * registers events
   *  @memberof skip-counting
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
     *   shows the dialog for editing the questions
     *   @param {object} event the event
     *   @param {function} callback the callback to call after the question is configured
     *    @memberof skip-counting
     */
    showDialog: function (event, callback) {
        currentInstance = this;
        currentInstance.callback = this.controllerCallback;
        ecEditor.getService('popup').open({
            template: 'skip.counting',
            controller: 'SkipCountingController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function () {
                    return currentInstance;
                }
            },
            width: 900,
            showClose: false,
            className: 'ngdialog-theme-plain'
        });
    }
});
