/**
 *
 * plugin to add akashara teaching content (a series of memory game)
 * @class org.ekstep.plugins.memory-game
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Swati Singh <swati.singh@tarento.com>
 */
org.ekstep.contenteditor.basePlugin.extend({
    type: "org.ekstep.plugins.memory-game",
    initialize: function() {
        var instance = this;
        ecEditor.addEventListener("org.ekstep.plugins.memory-game:showpopup", this.loadHtml, this);
        setTimeout(function() {
            var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/memorygameeditorconfig.html");
            var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/memorygameeditorapp.js");
            ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);
        }, 1000);
    },
    /**
     *
     *   invoked by framework when instantiating plugin instance.
     *   @memberof org.ekstep.plugins.memory-game
     *
     */
    newInstance: function() {
        delete this.configManifest;
        var props = this.convertToFabric(this.attributes.attr.__cdata);
        var att = JSON.parse(props);
        this.updateAttributes(att);
        if (this.attributes.frontFaceColor)
            att.frontFaceColor = this.attributes.frontFaceColor;
        var rows = att.rows;
        var columns = att.columns;
        var padding = 5;
        var gridWidth = (500 - (padding * (columns - 1))) / columns;
        var gridHeight = (300 - (padding * (rows - 1))) / rows;
        this.attributes.__text = "Round: x    Level: y  ";
        var textProps = {
            "x": 110,
            "y": 12,
            "fontSize": 24
        }
        textProps = this.convertToFabric(textProps);
        var textDet = new fabric.Text(this.attributes.__text, textProps);
        var rects = [];
        rects.push(textDet);
        this.addAllMedia();
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < columns; x++) {
                var left = x * (gridWidth + padding) + 110;
                var top = y * (gridHeight + padding) + 52.5;
                var rect = new fabric.Rect({
                    id: UUID(),
                    left: left,
                    top: top,
                    fill: att.frontFaceColor,
                    width: gridWidth,
                    height: gridHeight
                });
                rects.push(rect);
            }
        }

        this.editorObj = new fabric.Group(rects);
        currentInstance = this;
    },

    updateAttributes: function(att) {
        this.attributes.x = att.x;
        this.attributes.y = att.y;
        this.attributes.w = att.w;
        this.attributes.h = att.h;
        if (ecEditor._.isUndefined(this.attributes.frontFaceColor))
            this.attributes.frontFaceColor = att.frontFaceColor;
        if (ecEditor._.isUndefined(this.attributes.backFaceColor))
            this.attributes.backFaceColor = att.backFaceColor;
        if (ecEditor._.isUndefined(this.attributes.textColor))
            this.attributes.textColor = att.textColor;
        if (ecEditor._.isUndefined(this.attributes.fixRows))
            this.attributes.fixRows = att.fixRows;

    },

    /**
     *
     *   add all default media and medias related to each word
     *   @memberof org.ekstep.plugins.memory-game
     *
     *
     */
    addAllMedia: function() {
        var data = this.config;
        var defaultMediaAssests = [{
            id: "goodjob_image",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/goodjob.png"),
            assetId: "goodjob_image",
            type: "image",
            preload: true
        }, {
            id: "submit_image",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/submit.png"),
            assetId: "submit_image",
            type: "image",
            preload: true
        }, {
            id: "submit_disabled_image",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/submit_disabled.png"),
            assetId: "submit_disabled_image",
            type: "image",
            preload: true
        }, {
            id: "icon_sound_image",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/icon_sound.png"),
            assetId: "icon_sound_image",
            type: "image",
            preload: true
        }, {
            id: "retry_image",
            src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, "assets/retry.png"),
            assetId: "retry_image",
            type: "image",
            preload: true
        }];
        ecEditor._.each(data.aksharas, function(obj) {
            var akMedia = {
                id: obj.audioAsset,
                src: obj.audioSrc,
                assetId: obj.audioAsset,
                type: "sound",
                preload: true
            }
            defaultMediaAssests.push(akMedia);
            ecEditor._.each(data.words[obj.text].one, function(o) {
                var wimgMedia = {
                    id: o.imageAsset,
                    src: o.imageSrc,
                    assetId: o.imageAsset,
                    type: "image",
                    preload: true
                }
                defaultMediaAssests.push(wimgMedia);
                var waudMedia = {
                    id: o.audioAsset,
                    assetId: o.audioAsset,
                    src: o.audioSrc,
                    type: "sound",
                    preload: true
                }
                defaultMediaAssests.push(waudMedia);
            });
            ecEditor._.each(data.words[obj.text].two, function(o) {
                var wimgMedia = {
                    id: o.imageAsset,
                    src: o.imageSrc,
                    assetId: o.imageAsset,
                    type: "image",
                    preload: true
                }
                defaultMediaAssests.push(wimgMedia);
                var waudMedia = {
                    id: o.audioAsset,
                    src: o.audioSrc,
                    assetId: o.audioAsset,
                    type: "sound",
                    preload: true
                }
                defaultMediaAssests.push(waudMedia);
            });
        });


        var ins = this;
        ecEditor._.forEach(defaultMediaAssests, function(defaultMedia) {
            ins.addMedia(defaultMedia);
        });



    },

    /**
     *
     *   method to open the modal
     *   @memberof org.ekstep.plugins.memory-game
     *
     *
     */
    loadHtml: function(parentInstance, attrs) {
        var instance = this;
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).open({
            template: 'memorygame-editor',
            controller: 'memoryGameEditorController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function() {
                    return instance;
                },
                'attrs': function() {
                    return attrs;
                }
            },
            width: 900,
            showClose: false,
        });


    },

    openHtextPopup: function(err, data, instance) {
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).open({ template: data, data: { instance: instance } }, this.controllerCallback);

    },
    controllerCallback: function(ctrl, scope, data) {},


    /**
     *
     *   update editorObj properties on config change
     *   @memberof org.ekstep.plugins.memory-game
     *
     *
     */
    onConfigChange: function(key, value) {
        var instance = this;
        switch (key) {
            case 'frontFaceColor':
                this.attributes.frontFaceColor = value;
                ecEditor._.forEach(this.editorObj._objects, function(obj) {
                    if (obj.id) {
                        obj.setFill(value)
                    }

                })
                break;
            case 'backFaceColor':
                this.attributes.backFaceColor = value;
                break;
            case 'textColor':
                this.attributes.textColor = value;
                break;
            case 'fixRows':
                this.attributes.fixRows = value;
                break;
        }

        ecEditor.render();
        ecEditor.dispatchEvent('object:modified', { target: ecEditor.getEditorObject() });
    },

    /**
     *
     *   get config data plugin instance
     *   @returns {Object}
     *   config object
     *   @memberof org.ekstep.plugins.memory-game
     */
    getConfig: function() {
        var config = {};
        if (!ecEditor._.isUndefined(this.config)) {
            config = this.config;
        }
        config.frontFaceColor = this.attributes.frontFaceColor;
        config.backFaceColor = this.attributes.backFaceColor;
        config.textColor = this.attributes.textColor;
        config.fixRows = this.attributes.fixRows;
        return config;
    },

});
//# sourceURL=aksharaplugin.js
