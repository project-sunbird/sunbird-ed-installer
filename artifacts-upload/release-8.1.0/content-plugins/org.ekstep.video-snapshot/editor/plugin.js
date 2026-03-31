/**
 * @author Santhosh Vasabhaktula
 */
org.ekstep.contenteditor.basePlugin.extend({
    screenShot: undefined,
    initialize: function() {
        EkstepEditorAPI.addEventListener(this.manifest.id + ":showpopup", this.loadBrowser, this);
        var templatePath = EkstepEditorAPI.resolvePluginResource(this.manifest.id, this.manifest.ver, "editor/video.html");
        var controllerPath = EkstepEditorAPI.resolvePluginResource(this.manifest.id, this.manifest.ver, "editor/videoapp.js"); 
        EkstepEditorAPI.getService('popup').loadNgModules(templatePath, controllerPath);
    },
    newInstance: function() {
        var instance = this;
        var _parent = this.parent;
        this.parent = undefined;
        var props = this.convertToFabric(this.attributes);
        this.editorObj = undefined;
        
        var imageURL = ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/maxresdefault.png');
        imageURL = ecEditor.getConfig('useProxyForURL') ? "image/get/" + encodeURIComponent(imageURL) : imageURL;
        fabric.Image.fromURL(imageURL, function(img) {
            instance.editorObj = img;
            instance.parent = _parent;
            instance.postInit();
        }, props);
    },
    loadBrowser: function() {
        currentInstance = this;
        EkstepEditorAPI.getService('popup').open({
            template: 'videoPreviewDialog',
            controller: 'videoCtrl',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function() {
                    return currentInstance;
                }
            },
            width: 700,
            showClose: false,
            className: 'ngdialog-theme-plain'
        });
    },
    getMedia: function() {
        var media = {};
        media[this.id] = {
            "id": this.id,
            "src": this.getConfig()['url'] || '',
            "assetId": this.id,
            "type": "video"
        };
        return media;
    }
});
//# sourceURL=videoplugin.js
