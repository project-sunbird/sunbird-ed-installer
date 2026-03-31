org.ekstep.contenteditor.basePlugin.extend({
    initialize: function() {},
    newInstance: function() {
        var props = this.convertToFabric(this.attributes);
        this.editorObj = new fabric.Circle(props);
        if (this.editorObj) this.editorObj.setStroke(props.stroke);
    },
    onConfigChange: function(key, value) {
        //  var editorObj = instance.editorObj
        switch (key) {
        case "sampleText":
            this.attributes.sampleText = value;
            break;
        }
        ecEditor.render();
        ecEditor.dispatchEvent('object:modified', { target: ecEditor.getEditorObject() });
    },
    getConfig: function() {
        var config = this._super();
        config.sampleText = this.attributes.sampleText;
        return config;
    }
});
