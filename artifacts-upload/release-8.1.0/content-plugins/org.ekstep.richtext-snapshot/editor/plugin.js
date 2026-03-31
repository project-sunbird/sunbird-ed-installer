
org.ekstep.contenteditor.basePlugin.extend({
    type: "org.ekstep.richtext",
    initialize: function() {
        var instance = this;
        ecEditor.addEventListener("org.ekstep.richtext:showpopup", this.loadHtml, this);
        var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/richtexteditor.html");
        var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/richtexteditorapp.js");
        ecEditor.getService('popup').loadNgModules(templatePath, controllerPath);
    },
    newInstance: function() {
        var props = this.convertToFabric(this.attributes);
        if(ecEditor._.isUndefined(this.config.text))
            this.config.text = ecEditor._.isUndefined(this.attributes.__text) ? "" : this.attributes.__text; 
        delete props.__text;
        
        props.editable = false; // added to disable inline editing of exiting content
        var div = document.createElement('div');
        div.setAttribute("id", "richText");
        div.style.position = 'absolute';
        div.style.top = '10%';
        div.style.left = '20%';
        ecEditor.jQuery(".canvas-container").append(div);
        ecEditor.jQuery(".canvas-container div#richText").html(this.config.text);
        ecEditor.jQuery("div#richText").draggable();
    },
    loadHtml: function(event, data) {
        currentInstance = this;
        ecEditor.getService('popup').open({
            template: 'richtexteditor',
            controller: 'richtexteditorcontroller',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function() {
                    return currentInstance;
                }
            },
            width: 500,
            showClose: false,
            className: 'ngdialog-theme-plain'
        });
    }
});
//# sourceURL=richtextplugin.js
