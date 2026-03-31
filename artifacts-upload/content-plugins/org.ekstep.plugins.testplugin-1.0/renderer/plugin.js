Plugin.extend({
    _type: 'org.ekstep.plugins.testplugin',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        console.log('data', data);
        this._self = new createjs.Shape();
        var graphics = this._self.graphics;
        var dims = this.relativeDims();
        var instance = this;

        this._self.x = dims.x; //this comes from data.
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;
         var keyboardRequirements = { //add this as the parameter for instantiating keyboard class
            keyWidth: 15,
            keyHeight: 15,
            numberOfColumns: 3,
            keys: ['10', 'ன்', 'ल्ल', 'বাা ', 'a', 'b'],
            xPosition: 10,
            yPosition: 0
        };


        var keyboard = PluginManager.invoke('org.ekstep.plugins.common.keyboard', keyboardRequirements, instance, instance._stage, instance._theme);
        keyboard.onKeyPress(function(id) {
         //   keyValue = id;
             console.log("THIS IS key callback value : ", id);
        });

        var eraserData = {};
        eraserData.xPosition = 20;
        eraserData.yPosition = 50;
        //        eraserData.targetId = textData.id

        var eraser = PluginManager.invoke('org.ekstep.plugins.common.eraser', eraserData, instance, instance._stage, instance._theme);
        // console.log(eraser);
        eraser.onEraserPress(function() {
             console.log("THIS IS NUM CALL BACK VALUE : ");
        });

    },
    drawBorder: function() {

    }

});
