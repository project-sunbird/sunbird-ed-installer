Plugin.extend({
    _type: 'testone',
    initPlugin: function(data) {
        var instance = this;
        this._self = new createjs.Container();
        this._data = data;
        var data = _.clone(this._data);
        PluginManager.invoke('shape', data, instance._parent, instance._stage, instance._theme);
    }
});
