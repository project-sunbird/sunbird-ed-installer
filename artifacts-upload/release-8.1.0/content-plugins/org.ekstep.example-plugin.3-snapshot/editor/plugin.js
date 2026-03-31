/**
 * 
 * plugin for creating hello world
 * @class HelloWord
 * @extends EkstepEditor.basePlugin
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */
EkstepEditor.basePlugin.extend({

    initialize: function() {

    },
    /**
     * This method used to create the text fabric object and assigns it to editor of the instance
     * convertToFabric is used to convert attributes to fabric properties 
     * It shows the text editor popup to enter text to add it to canvas editor fabric object
     * @memberof Text
     */
    newInstance: function() {
        var props = this.convertToFabric(this.attributes);
        delete props.__text;
        props.editable = false; // added to disable inline editing of exiting content
        this.editorObj = new fabric.ITextbox(this.attributes.__text, props);
    },
    convertToFabric: function(data) {
        var retData = EkstepEditorAPI._.clone(data);
        if (data.x) retData.left = data.x;
        if (data.y) retData.top = data.y;
        if (data.w) retData.width = data.w;
        if (data.h) retData.height = data.h;
        if (data.radius) retData.rx = data.radius;
        if (data.color) retData.fill = data.color;
        if (data.weight && EkstepEditorAPI._.includes(data.weight, 'bold')) {
            retData.fontWeight = "bold";
            data.fontweight = true;
        } else { data.fontweight = false; }
        if (data.weight && EkstepEditorAPI._.includes(data.weight, 'italic')) {
            retData.fontStyle = "italic";
            data.fontstyle = true;
        } else { data.fontstyle = false; }
        if (data.font) {
            retData.fontFamily = data.font;
            data.fontFamily = data.font
        }
        if (data.fontsize) {
            var fontSize = this.updateFontSize(data.fontsize, true);
            retData.fontSize = fontSize;
            data.fontSize = fontSize;
        };
        delete retData.lineHeight // line height set to default value 
        return retData;
    },

});

//# sourceURL=atpreviewplugin.js
