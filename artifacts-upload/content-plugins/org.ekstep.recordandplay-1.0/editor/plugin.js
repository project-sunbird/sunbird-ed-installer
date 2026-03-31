/**
 *
 * plugin to add record play feature in the content
 * @class recordandplay
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Devendra Singh <devendra.singh@tarento.com>
 */
org.ekstep.contenteditor.basePlugin.extend({
    /**
     * This expands the type of the plugin
     * @member {String} type
     * @memberof recordandplay
     */
    type: "org.ekstep.recordandplay",
    /**
     *   registers events
     *   @memberof recordandplay
     *
     */
    initialize: function() {},
    /**
     * This method used to create the image fabric object and assigns it to editor of the instance
     * convertToFabric is used to convert attributes to fabric properties
     * @memberof recordandplay
     */
    newInstance: function() {
        var instance = this;
        var _parent = this.parent;
        this.parent = undefined;
        var props = this.convertToFabric(this.attributes);
        if (this.attributes.from == 'plugin') {
            delete props.width; // To maintain aspect ratio
            delete props.height;
        }
        this.addAllMedia();
        var imageURL = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/mic.png");
        fabric.Image.fromURL(imageURL, function(img) {
            instance.editorObj = img;
            instance.parent = _parent;
            if (instance.attributes.from == 'plugin') {
                instance.editorObj.scaleToWidth(props.w);
                delete instance.attributes.from;
            }
            //
            instance.postInit();
        }, props);
    },

    /*/**
     * This method used to prepare all defult media object required for this plugin
     * @fire addMedia method of base plugin
     * @memberof recordandplay

     */
    addAllMedia: function() {
        var instance = this;
        var data = this.config;
        var defaultMediaAssests = [{
            id: "mic",
            src: ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/mic.png"),
            assetId: "mic",
            type: "image",
            preload: true
        }, {
            id: "N_stoprec",
            src: ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/01.png"),
            assetId: "N_stoprec",
            type: "image",
            preload: true
        }, {
            id: "N_stoprec2",
            src: ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/02.png"),
            assetId: "submit_disabled_image",
            type: "image",
            preload: true
        }, {
            id: "N_startrec",
            src: ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/recordbtn.png"),
            assetId: "N_startrec",
            type: "image",
            preload: true
        }, {
            id: "N_playrec",
            src: ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/soundbtn.png"),
            assetId: "N_playrec",
            type: "image",
            preload: true
        }, {
            id: "N_playrec2",
            src: ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/play01.png"),
            assetId: "N_playrec2",
            type: "image",
            preload: true
        }];
        ecEditor._.forEach(defaultMediaAssests, function(defaultMedia) {
            instance.addMedia(defaultMedia);
        });
    }
});
//# sourceURL=recordAndPlayPlugin.js
