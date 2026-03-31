Plugin.extend({
    _type: 'org.ekstep.plugins.helloworldplugin',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        // console.log('data', data);
        this._self = new createjs.Container();

        var instance = this;
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;


        var configData = JSON.parse(data.config.__cdata);
        // console.log("ConfigData : ", configData.sampleText);


        var textData = {};
        textData.align = "right"; //Show the number values
        textData.valign = "bottom";
        textData.lineHeight = "1.2";
        textData.x = 29;
        textData.y = 35;
        textData.w = 50;
        textData.h = 40;
        textData.fontsize = "2vw";
        textData.$t = configData.sampleText; //this are the number vals
        PluginManager.invoke('text', textData, instance, instance._stage, instance._theme);


    },
    drawBorder: function() {

    }

});
