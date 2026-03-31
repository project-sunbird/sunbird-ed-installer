/**
 *
 * Plugin to create mtf
 * @class org.ekstep.plugins.languageMtf.EditorPlugin
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Swati Singh<swati.singh@tarento.com>
 */
org.ekstep.plugins.languagemtf.EditorPlugin = org.ekstep.contenteditor.basePlugin.extend({

    /**
     *  Adds event listeners and loads template and controller
     *  @memberof org.ekstep.plugins.LanguageMtf.EditorPlugin#
     */
    initialize: function() {
        var instance = this;
        ecEditor.addEventListener("org.ekstep.plugins.languagemtf:showpopup", this.loadHtml, this);
        var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/languagemtfconfig.html');
        var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/languagemtfapp.js');
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);
    },
    /**
     *  Process the Language Mtf and display everything as individual elements on the stage.
     *  @memberof org.ekstep.plugins.LanguageMtf.EditorPlugin#
     */
    newInstance: function() {
        delete this.configManifest;
        var instance = this;
        var _parent = this.parent;
        this.parent = undefined;
        /*istanbul ignore else*/
        if (!this.attributes.x) {
            this.attributes.x = 10;
            this.attributes.y = 10;
            this.attributes.w = 80;
            this.attributes.h = 80;
            this.percentToPixel(this.attributes);
        }

        var props = this.convertToFabric(this.attributes);
        delete props.width;
        delete props.height;
        this.addAllMedia();
        var imageURL = ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/mtfplaceholder1.png');
        fabric.Image.fromURL(imageURL, function(img) {
            instance.editorObj = img;
            instance.parent = _parent;
            instance.editorObj.scaleToWidth(props.w);
            instance.postInit();
        }, props);
    },

    /**
     *   add all default media and medias related to each word
     *   @memberof org.ekstep.plugins.languageMtf
     *
     */
    addAllMedia: function() {
        var data = this.config;
        var defaultMediaAssests = [{
            id: "audioImage",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/audio.png'),
            assetId: "audioImage",
            type: "image",
            preload: true
        },
        {
            id: "languagemtf_patternfill_img",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/background.png'),
            assetId: "languagemtf_patternfill_img",
            type: "image",
            preload: true
        }
        ];
        ecEditor._.each(data.words, function(obj) {
            var wimgMedia = {
                id: obj.value.imageAsset,
                src: obj.value.image,
                assetId: obj.value.imageAsset,
                type: "image",
                preload: true
            }

            defaultMediaAssests.push(wimgMedia);

            if (obj.value.rel_image && obj.value.rel_image != "") {
                var wrelimgMedia = {
                    id: obj.value.rel_imageAsset,
                    src: obj.value.rel_image,
                    assetId: obj.value.rel_imageAsset,
                    type: "image",
                    preload: true
                }
                defaultMediaAssests.push(wrelimgMedia);
            }

            var waudMedia = {
                id: obj.value.audioAsset,
                assetId: obj.value.audioAsset,
                src: obj.value.audio,
                type: "sound",
                preload: true
            }
            defaultMediaAssests.push(waudMedia);
        });
        var ins = this;
        ecEditor._.forEach(defaultMediaAssests, function(defaultMedia) {
            ins.addMedia(defaultMedia);
        });
    },

    /**
     *  Open wizard to select words and configurations
     *  @memberof org.ekstep.plugins.LanguageMtf.EditorPlugin#
     */
    loadHtml: function() {
        var instance = this;
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).open({
            template: 'languagemtfTemplate',
            controller: 'org.ekstep.plugins.languagemtf:configurationController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function() {
                    return instance;
                }
            },
            width: 900,
            showClose: false,
        });
    },

    getConfig: function() {
        var config = this._super();
        return config;
    }

});
//# sourceURL=languageMTFPlugin.js