/**
 * 
 * plugin to add progressbar to stage
 * 
 */
org.ekstep.contenteditor.basePlugin.extend({
    /**
     * This expains the type of the plugin 
     * @member {String} type
     * @memberof assessment
     */
    type: "org.ekstep.progressbar",
    /**
     *  
     * Registers events.
     * @memberof assessment
     */
    initialize: function() {},
    newInstance: function() {
        var instance = this;
        var props = this.convertToFabric(this.attributes);
        var _parent = this.parent;
        this.parent = undefined;

         delete instance.configManifest;
        var imageURL = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/assets/progressbar.png");
        fabric.Image.fromURL(imageURL, function(img) {
            instance.editorObj = img;
            instance.parent = _parent;
            instance.postInit();

        }, props);

    },
    onConfigChange: function(key, value) {
        if (!_.isUndefined(value)) {
            switch (key) {
                case 'questions':
                    if (value <= 100 && value >= 1) {
                        this.config.totalQuestions = value;
                        this.attributes.questions = value;
                    } else {
                      //  alert("No of questions should be between 0 to 100");
                    }
                    break;
                case 'progressbarStroke':
                    this.config.progressbarStroke = value;
                   this.attributes.progressbarStroke = value;
                   break;
                case 'progressbarSuccess':
                    this.config.progressbarSuccess = value;
                    this.attributes.progressbarSuccess = value;
                    break;
                case 'progressbarFailure':
                    this.config.progressbarFailure = value;
                    this.attributes.progressbarFailure = value;
                    break;
                case 'fontsize':
                    this.config.fontsize = value;
                    this.attributes.fontSize = value;
                    break;

            }
        }
        ecEditor.render();
        ecEditor.dispatchEvent('object:modified', {
            target: ecEditor.getEditorObject()
        });
    },
    getConfig: function() {
        var config = this._super();
        config.questions = this.attributes.questions;
        config.fontsize = this.attributes.fontSize;
        config.progressbarStroke = this.attributes.progressbarStroke;
        config.progressbarSuccess = this.attributes.progressbarSuccess;
        config.progressbarFailure = this.attributes.progressbarFailure;
        
        return config;
    }
});
//# sourceURL=progressbarPlugin.js
