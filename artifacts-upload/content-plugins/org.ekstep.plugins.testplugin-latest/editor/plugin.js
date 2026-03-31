org.ekstep.contenteditor.basePlugin.extend({
    initialize: function() {
    },
    newInstance: function() {
        var props = this.convertToFabric(this.attributes);
        this.editorObj = new fabric.Circle(props);
        if (this.editorObj) this.editorObj.setStroke(props.stroke);
    },
    onConfigChange: function(key, value) {
        var instance = ecEditor.getCurrentObject();
        var editorObj = instance.editorObj
        switch (key) {
            case "color":
                editorObj.setStroke(value);
                instance.attributes.stroke = value;
                break;
        }
        ecEditor.render();
        ecEditor.dispatchEvent('object:modified', { target: ecEditor.getEditorObject() });
    }
});
