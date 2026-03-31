//@ sourceURL=stdexp-plugin.js
/**
 * Editor plugin for the Number names template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Henrietta <henrietta.d@funtoot.com>
 */
org.ekstep.funtoot.common.extend({
    /**
     * This expains the type of the plugin 
     * @member {String} type
     * @memberof stdexp
     */
    type: "org.ekstep.funtoot.stdexp",
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
     *  @memberof stdexp
     */
    currentInstance: undefined,
    /**
   * registers events
   *  @memberof stdexp
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
     * loads the image depending on the question configuration and adds to the fabric object 
     *  @memberof stdexp
     */
    loadFabricImage: function () {
        var id = this.manifest.id;
        var version = this.manifest.ver;
        var instance = this;
        var fabricImg = ecEditor.resolvePluginResource(id, version, "/editor/assets/stdexp-fabric.png");
        fabric.Image.fromURL(fabricImg, function (img) {
            console.log(img.width + 'x' + img.height + '(' + img.x + ',' + img.y + ')')
            instance.editorObj.addWithUpdate(img);
        }, instance.convertToFabric(instance.attributes));
    },
    /**        
     *   shows the dialog for editing the questions
     *   @param {object} event the event
     *   @param {function} callback the callback to call after the question is configured
     *    @memberof stdexp
     */
    showDialog: function (event, callback) {
        var instance = this;
        instance.callback = this.controllerCallback;
        ecEditor.getService('popup').open({
            template: 'stdexp',
            controller: 'stdexpController',
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
