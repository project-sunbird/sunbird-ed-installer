/**
 * @class Plugin.Plugin.LanguageMtf
 */
/* istanbul ignore next: init plugin */
Plugin.LanguageMtf.RendererPlugin = Plugin.extend({
    _type: 'org.ekstep.plugins.languagemtf',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        data.x = 10;
        data.y = 10;
        data.w = 80;
        data.h = 80;
        var dims = this.relativeDims();
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.h = dims.h;
        this._self.w = dims.w;
        var cData = JSON.parse(data.config.__cdata);
        var languagemtfLayout = new Plugin.LanguageMtf.LanguageMtfLayout(this, this._stage, this._theme, cData);
        languagemtfLayout._invokeItemData();

    },
});
//# sourceURL=languageMtfRendererPlugin.js
