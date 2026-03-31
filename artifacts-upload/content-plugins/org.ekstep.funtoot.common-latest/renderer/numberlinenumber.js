//@ sourceURL=numberlinenumber.js
/* global PluginManager */
/**
 * Common plugin for number line
 * @extends Plugin
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
Plugin.extend({
    _type: 'numberlinenumber',
    /**
     * initializes the plugin
     */
    initPlugin: function (data) {
        var numberlineContainer = this._parent;
        var instance = this;
        var x = data.xPos; var y = data.yPos; var w = data.cellWidth; var h = data.cellHeight;
        var verticalMarkHeight = 20;
        var numberLineNumContainer = {
            id: data.name,
            w: w, h: h, y: y, x: x,
            align: "center",
            valign: "middle",
        }
        PluginManager.invoke('g', numberLineNumContainer, numberlineContainer, this._stage, this._theme);
        var debug1 = {
            w: w, h: h, y: y, x: x,
            type: "rect",
            stroke: "red",
        }

        // PluginManager.invoke('shape', debug1, numberlineContainer, this._stage, this._theme);
        var numberContainer = PluginManager.getPluginObject(numberLineNumContainer.id);

        var numberBox = {
            id: 'box' + data.type + data.number.numericalValue,
            // w: 90, h: 100, y: verticalMarkHeight, x: 5,
            w: 40, h: 100, y: 50, x: 50,
            align: "center",
            valign: "middle",
            fill: "#ffffff",
            type: "circle"
        }
        PluginManager.invoke('shape', numberBox, numberContainer, this._stage, this._theme);

        var horizontalLine = {
            id: 'horizontalLine' + data.type + data.number.numericalValue,
            w: 100, h: 3, y: 0, x: 0,
            align: "center",
            valign: "middle",
            stroke: "#000000",
            fill: "#000000"
        }
        PluginManager.invoke('shape', horizontalLine, numberContainer, this._stage, this._theme);

        var verticalMark = {
            id: 'verticalMark' + data.type + data.number.numericalValue,
            w: 0, h: verticalMarkHeight, y: 0, x: 50,
            align: "center",
            valign: "middle",
            stroke: "black",
            fill: "#ffffff"
        }
        PluginManager.invoke('shape', verticalMark, numberContainer, this._stage, this._theme);

        var number = {
            id: 'numberlinetxt' + data.type + data.number.numericalValue,
            y: 55, x: 50,
            fontsize: data.fontSize,
            align: "center",
            valign: "middle",
            $t: data.number.displayValue,
            color: "#000000",
            // visible: false
        }
        PluginManager.invoke('text', number, numberContainer, this._stage, this._theme);
    }

});