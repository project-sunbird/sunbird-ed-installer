Plugin.extend({
    _type: 'Countdown',
    _isContainer: true,
    _render: true,
    _name: undefined,
    _timeText: undefined,

    initPlugin: function(data) {

        var instance = this;

        this._self = new createjs.Container();

        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;

        instance.createTimerUI();
    },
    createTimerUI: function() {

        var instance = this;
        var textData = {};
        textData.x = 0;
        textData.y = 0;
        textData.w = 100;
        textData.h = 100;
        textData.id = "debugShape";
        textData.fill = "#F00";
        var textBg = PluginManager.invoke('shape', textData, instance, instance._stage, instance._theme);

        
        

    }

});