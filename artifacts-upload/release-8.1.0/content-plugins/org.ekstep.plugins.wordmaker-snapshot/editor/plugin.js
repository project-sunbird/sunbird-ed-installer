org.ekstep.plugins.WordMaker.EditorPlugin = org.ekstep.contenteditor.basePlugin.extend({
    type: "org.ekstep.plugins.wordmaker",

    initialize: function() {
        var instance = this;
        ecEditor.addEventListener("org.ekstep.plugins.wordmaker:showpopup", this.loadHTML, this);
        var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/wordmaker-editor-config.html');
        var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/wordmaker-editor-app.js');
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);

    },

    newInstance: function() {
        this.addAllMedia(this.getData());
        var instance = this;
        var _parent = this.parent;
        this.parent = undefined;
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

        var imageURL = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/preview.png");
        fabric.Image.fromURL(imageURL, function(img) {
            instance.editorObj = img;
            instance.parent = _parent;
            instance.editorObj.scaleToWidth(props.w);
            instance.postInit();
        }, props);
    },

    loadHTML: function() {
        var instance = this;
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).open({
            template: 'wordMakerEditor',
            controller: 'wordmakerEditorController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function() {
                    return instance;
                }
            },
            width: 900,
            showClose: false
        })
    },

    addAllMedia: function(words) {
        var wordsData = words;
        var mediaAssets = [{
            id: "wordmaker_patternfill_img",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/patternfill.png"),
            assetId: "wordmaker_patternfill_img",
            type: "image",
            preload: true
        }, {
            id: "wordmaker_image_unavailable",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/imageunavailable.png"),
            assetId: "wordmaker_image_unavailable",
            type: "image",
            preload: true
        }, {
            id: "wordmaker_hint_no_sound",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/hint_no_sound.png"),
            assetId: "wordmaker_hint_no_sound",
            type: "image",
            preload: true
        }, {
            id: "wordmaker_hint_sound",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/hint_sound.png"),
            assetId: "wordmaker_hint_sound",
            type: "image",
            preload: true
        }, {
            id: "wordmaker_small_button",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/small_button.png"),
            assetId: "wordmaker_small_button",
            type: "image",
            preload: true
        }, {
            id: "wordmaker_input_box",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/input_box.png"),
            assetId: "wordmaker_input_box",
            type: "image",
            preload: true
        }, {
            id: "wordmaker_image_border",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/image_rect.png"),
            assetId: "wordmaker_image_border",
            type: "image",
            preload: true
        }];
        ecEditor._.each(wordsData, function(word) {
            /*istanbul ignore else*/
            if (word.picture != undefined) {
                var tempURLImg = word.picture.split("/");
                var picture = {
                    id: tempURLImg[tempURLImg.length - 1],
                    assetId: tempURLImg[tempURLImg.length - 1],
                    src: word.picture,
                    type: "image",
                    preload: true
                };
                mediaAssets.push(picture);
            }
            /*istanbul ignore else*/
            if (word.pronunciations != undefined) {
                var tempURLAudio = word.pronunciations.split("/");
                var pronunciations = {
                    id: tempURLAudio[tempURLAudio.length - 1],
                    assetId: tempURLAudio[tempURLAudio.length - 1],
                    src: word.pronunciations,
                    type: "sound",
                    preload: true
                };
                mediaAssets.push(pronunciations);
            }
        });
        var ins = this;
        ecEditor._.forEach(mediaAssets, function(asset) {
            ins.addMedia(asset);
        });
    }
});
//# sourceURL= wordmakerEditor.js
