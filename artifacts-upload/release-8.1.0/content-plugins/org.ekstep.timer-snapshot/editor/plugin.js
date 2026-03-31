/**
 * 
 * Plugin to create Timer
 * @class timer
 * @extends EkstepEditor.basePlugin
 *
 * @author Srivathsa Dhanraj <srivathsa.dhanraj@goodworklabs.com>
 */
EkstepEditor.basePlugin.extend({
    type: "org.ekstep.timer",
    initialize: function() {},
    /**
    *   Initializes plugin. 
    *   @memberof timer
    */
    newInstance: function() {
        var instance = this;
        delete this.configManifest;
       
        var textConfig = { 
            "__text": "00:00",
            "x": 12,
            "y": 2,
            "w": 5,
            "h":10,
            "fontFamily": this.attributes.fontfamily,
            "fontSize": this.attributes.fontSize,
            "minWidth": 20,
            "maxWidth": 500,
            "fill": this.attributes.color,
            "editable": false
        };
        
        var textProps = this.convertToFabric(textConfig);
        var timeText = EkstepEditorAPI.instantiatePlugin('org.ekstep.text', textProps, this);

        this.editorObj = timeText.editorObj;
        this.setTimeRemaining(this.attributes.time,this.attributes.unit); 
        
    },
     /**
    *   Update plugin attributes. Make visual changes to the editor object to reflect changes. 
    *   @param key {string} attribute id that's being changed
    *   @param value {string} value being assigned
    *   @memberof timer
    */
    onConfigChange: function(key, value) {
        var instance = this;
        
        switch (key) { 
            case 'unit':
                this.attributes.unit = value || 0;
                this.setTimeRemaining(this.attributes.time,this.attributes.unit);
                break;
            case 'time':
                this.attributes.time = value || 0;
                if(this.attributes.time<0){
                    this.attributes.time = 0;
                }
                this.setTimeRemaining(this.attributes.time,this.attributes.unit);
                break;
            case 'alertTime':
                value>this.attributes.time ? value = this.attributes.time : value;
                this.attributes.alertTime = value || 0;
                
                break;
            case 'name':
                this.attributes.name = value || "Unavailable";
                break;
            case 'type':
                this.attributes.type = value || 0;
                break;
            case 'fontfamily':
                this.attributes.fontfamily = value || 'Arial';
                instance.editorObj.setFontFamily(value);
                break;
            case 'fontSize':
                this.attributes.fontSize = value || 20;
                instance.editorObj.setFontSize(value);
                break;
            case 'color':
                this.attributes.color = value || "#000000";
                instance.editorObj.setFill(value);
                break;
            
        }
        if(key != 'name'){
            this.updateChange();
        }
        EkstepEditorAPI.render();
        EkstepEditorAPI.dispatchEvent('object:modified', { target: EkstepEditorAPI.getEditorObject() });
    },  

    /**
    *   Update config of the plugin. 
    *   Also sets the target stage for all the timers in the content. 
    *   @memberof timer
    */ 
    getConfig: function() {
        var instance = this;
        var config = this._super();
        
        instance.setTargetStage(this.attributes.name);
        
        config.unit = this.attributes.unit;
        config.time = this.attributes.time;
        config.alertTime = this.attributes.alertTime;
        config.name = this.attributes.name;
        config.type = this.attributes.type;        
        config.textColor = this.attributes.textColor;
        config.bgcolor = this.attributes.bgColor;
        config.fontfamily = this.attributes.fontfamily;
        config.fontSize = this.attributes.fontSize;
        config.toStageId = this.attributes.toStageId;

        return config;

    },
    /**
    *   Set the target stage to transition to after the timer runs out. 
    *   Iterates over all the stages and finds timer instances with the same 'name'.
    *   Target stage is the immediate next stage after the stage with the last instance of timer with matching 'name'
    *   If timer is on the last stage, target stage is set to Endpage. 
    *
    *   @param instanceName {string} name of the timer to update target stage. 
    *   @memberof timer
    */
    setTargetStage: function(instanceName){
        var instance = this;
        var allStages = EkstepEditorAPI.getAllStages();
        var stageIndex = -1;
        console.log("all stages",allStages);
        for(var i=0; i<allStages.length; i++){
            var children = EkstepEditorAPI.getStagePluginInstances(allStages[i].id,instance.manifest.id);
            
            if(children != undefined && children.length > 0){
                for(var j=0; j<children.length; j++){
                    var name = children[j].attributes.name;
                    if(name != undefined && name===instanceName){

                        stageIndex = i;

                    }
                }
            }
        }

        var targetStageIndex = stageIndex+1;
        
        //'default' is the end page. 
        if(targetStageIndex>=allStages.length){
            this.attributes.toStageId = "default";
        }else{
            this.attributes.toStageId = allStages[targetStageIndex].id;
        }
        console.log("tsid ",this.attributes.toStageId);
    },
    /**
    *   Calculate time to be displayed on the timer text
    *   @param time {int} time to be displayed on the timer.
    *   @param unit {string} Unit of 'time' provided. Seconds or Minutes.
    *   @memberof timer
    */
    setTimeRemaining: function(time,unit) {
        var instance = this;
        var t = 0;
      
        
        if(unit == "Seconds"){
            t = time * 1000;
        }else if(unit == "Minutes"){
            t = time * 60 * 1000;
        }

        var seconds = Math.floor((t / 1000) % 60);
        seconds < 0 ? seconds = 0 : seconds;
        seconds > 9 ? seconds : seconds = '0' + seconds;

        var minutes = Math.floor((t / 1000 / 60) % 60);
        minutes < 0 ? minutes = 0 : minutes;
        minutes > 9 ? minutes : minutes = '0' + minutes;

        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        hours < 0 ? hours = 0 : hours;
        hours > 9 ? hours : hours = '0' + hours;

        instance.editorObj.setText(minutes+":"+seconds);
    },
    
    /**
    *   When timer attributes are modified, look through the content and find timer instances with the 
    *   same name and update their attributes as well. 
    *   @memberof timer
    */
    updateChange: function(){
        var instance = this;
        var allStages = EkstepEditorAPI.getAllStages();
        for(var i=0; i<allStages.length; i++){
            var children = EkstepEditorAPI.getStagePluginInstances(allStages[i].id,instance.manifest.id);
            
            if(children != undefined){
               
                for(var j=0; j<children.length; j++){
                    var name = children[j].attributes.name;
                    
                    if(name != undefined && name===this.attributes.name){
                        
                        var p = children[j];
                        //p.attributes = this.attributes;
                        p.attributes.time = this.attributes.time;
                        p.attributes.alertTime = this.attributes.alertTime;
                        p.attributes.unit = this.attributes.unit;
                        p.attributes.type = this.attributes.type;
                        p.attributes.fontFamily = this.attributes.fontFamily;
                        p.attributes.fontSize = this.attributes.fontSize;
                        p.attributes.color = this.attributes.color;
                        

                        var plugin = EkstepEditorAPI.getPluginInstance(children[j].id);
                        plugin.editorObj.setText(instance.editorObj.text);
                        plugin.editorObj.setFill(instance.editorObj.fill);
                        plugin.editorObj.setFontSize(instance.editorObj.fontSize);
                        plugin.editorObj.setFontFamily(instance.editorObj.fontFamily);
                        EkstepEditorAPI.render();
                    }
                }
            }
        }  
    },
    removed: function(instance,options,event) {    
        EkstepEditorAPI.render();        
    }

    
    
    
    
});

