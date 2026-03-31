//@ sourceURL=optionBuilder.js
/* global PluginManager */
/**
 * This plugin invokes option on mtf or mcq in the placeholder determined by grid cell. 
 * parentId is the cellId in which option has to be created and the same parentId behaves 
 * as the model for option.
 * In case option doestn't contain any asset for image or text, optionBuilder creates a shape 
 * in the specified cell.
 * If attachMh parameter is true, microhint gets attached to the top-left position of the cell.
 * @extends Plugin
 * @fires option, ftMicroHint
 * @author Amulya (amulya.k@funtoot.com)
 */
Plugin.extend({
    _type: 'org.ekstep.funtoot.optionBuilder',
    /**
     * initializes the plugin
     */
    initPlugin: function (data) {
        var ftdata = data;
        var inst = this;
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        inst.itemCtrl = this._stage.getController("item");
        var parent = this._parent;
        var parentId = parent._id;
        var template = PluginManager.getPluginObject(data.templateId);

        // invoke option
        var optionObj = {
            id: "option_" + parentId,
            option: parentId,
            snapX: "0.1", snapY: "0.1",
            highlight: "#CCCCCC", opacity: 0,
            h: data.h, w: data.w, y: data.y, x: data.x
        }
        PluginManager.invoke('org.ekstep.funtoot.option', optionObj, template, this._stage, this._theme);
        var option = PluginManager.getPluginObject(optionObj.id);

        // create shape if option doesn't contain image or text as asset
        if (!inst.itemCtrl.getModelValue(parentId).value.asset) {
            var shapeObj = {
                fill: data.color ? data.color : "#F3F3F3",
                h: 100, w: 100, x: 0, y: 0,
                stroke: data.stroke,
                type: "rect"
            }
            PluginManager.invoke('shape', shapeObj, option, this._stage, this._theme);
        }

        if (data.attachMh) {
            // create the micro-hint with a delay to allow this object to get created
            setTimeout((function () {
                var microhint = {
                    id: parentId + '-mh',
                    attachTo: "option_" + parentId, mhPos: 'top-left',
                    visible: true
                }

                PluginManager.invoke('ftMicroHint', microhint, inst, inst._stage, inst._theme);
            }.bind(this)), 1000);
        }

    },


});