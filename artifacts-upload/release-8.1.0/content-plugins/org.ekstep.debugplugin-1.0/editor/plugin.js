/**
 * 
 * Plugin to create Timer
 * @class timer
 * @extends EkstepEditor.basePlugin
 *
 * @author Srivathsa Dhanraj <srivathsa.dhanraj@goodworklabs.com>
 */
EkstepEditor.basePlugin.extend({
    type: "org.ekstep.debugplugin",
    stageDims:{},
    _timeText: undefined,
    _bgBox: undefined,
    _config:undefined,
   
    initialize: function() {
        console.log("debugPlugin: initialize called");
    },
    newInstance: function() {
        var instance = this;
        console.log("debugPlugin: new instance called1");
       instance.editorObj = new fabric.Text('Foo', { left: 0, top: 0, width:100, height: 100, fill: "#000000",fontSize:30 });
        
        
    },
   
    onConfigChange: function(key, value) {
        var instance = this;
        console.log("debugPlugin: onConfigChange called. key ",key,": value",value);
        if(key == "name"){
            instance.attributes.name = value;
        }
        EkstepEditorAPI.render();
        EkstepEditorAPI.dispatchEvent('object:modified', { target: EkstepEditorAPI.getEditorObject() });
    },
    
    getConfig: function() {
        var instance = this;
        instance._config = this._super();
        instance._config.name = instance.attributes.name;
        console.log("debugPlugin: getconfig called. returning ",instance._config);
        return instance._config;
    }    
        
        
       
       
    
    
    
    
    
});

