//@ sourceURL=pvchart.js
// global PluginManager, Plugin
/**
 * A reusable place value chart plugin. 
 * 
 * @extends Plugin
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
    _type: 'org.ekstep.funtoot.common.pvchart',
    /**
     * initializes the place value chart plugin
     * @param {Object} data the data for the place value chart plugin
     */
    initPlugin: function (data) {
        // create a container for ourself
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.regX = dims.w / 2;
        this._self.regY = dims.h / 2;

        PluginManager.invoke('shape', { x: 0, y: 0, w: 100, h: 100, fill: "#ff0000" }, this, this._stage, this._theme);

        var textData = {
            id: _.uniqueId('text-'),
            x: 0,
            y: 0,
            w: 50,
            h: 50,
            //hitArea: true,
            $t: 'some text',
            fontsize: '2.7vw'
        };
        PluginManager.invoke('text', textData, this, this._stage, this._theme);
        //var t = PluginManager.getPluginObject(textData.id);
        this._self.on('click', function () {
            console.log('rotation', this._self.rotation);
            this._self.rotation += 3;
            Renderer.update = !0;
        }, this);
        //this._self.rotation = -90;
    }
});
