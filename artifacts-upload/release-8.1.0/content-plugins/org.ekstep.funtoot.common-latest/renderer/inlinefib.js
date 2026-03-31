//@ sourceURL=inlineFib.js
/* global PluginManager */
/**
 * Common plugin for inline
 * @extends Plugin
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
Plugin.extend({
    _type: 'inlineFib',
    /**
     * initializes the plugin
     */
    initPlugin: function (data) {
        var contentContainer = this._parent;
        this._cells = [];
        var instance = this;
        var inlineTxtContainer = {
            id: "inlineTxtContainer",
            w: !_.isUndefined(data.w) ? data.w : 80,
            h: !_.isUndefined(data.h) ? data.h : 70,
            y: !_.isUndefined(data.y) ? data.y : 20,
            x: !_.isUndefined(data.x) ? data.x : 10,
            align: "center",
            valign: "middle",
        }
        PluginManager.invoke('g', inlineTxtContainer, contentContainer, this._stage, this._theme);
        var debug1 = {
            w: !_.isUndefined(data.w) ? data.w : 80,
            h: !_.isUndefined(data.h) ? data.h : 70,
            y: !_.isUndefined(data.y) ? data.y : 20,
            x: !_.isUndefined(data.x) ? data.x : 10,
            type: "rect",
            stroke: "red",
        }

        //PluginManager.invoke('shape', debug1, contentContainer, this._stage, this._theme);
        var txtContainer = PluginManager.getPluginObject("inlineTxtContainer");

        var wordXPosition = data.xMargin || 0;
        var wordYPosition = 0;
        var defaultFontSize = data.fontSize || "2.7vw";
        var lineWidth = 0;
        var lineNumber = 1;
        var phantomTxtObjArray = [];

        _.each(data.tokens, function (token) {
            var phantomTxt = {
                id: _.uniqueId('txt'),
                y: wordYPosition, x: wordXPosition,
                fontsize: defaultFontSize,
                align: "center",
                valign: "middle",
                $t: token.content,
                color: "#60BC50",
                visible: false
            }
            PluginManager.invoke('text', phantomTxt, txtContainer, instance._stage, instance._theme);

            var txtObj = PluginManager.getPluginObject(phantomTxt.id);
            var blankXPadding = (token.w) ? 10 : 0;
            var blankYPadding = (token.w) ? 2 : 0;
            var wordWidth = ((txtObj._self.getBounds().width) / (txtContainer._self.width) * 100);
            wordWidth = wordWidth + blankXPadding;
            lineWidth = lineWidth + wordWidth;
            var wordHeight = (txtObj._self.getBounds().height) / (txtContainer._self.height) * 100;
            wordHeight = wordHeight + blankYPadding;
            if (wordXPosition + wordWidth > 100) {
                lineNumber++;
                wordXPosition = 0;
                //4 percent spacing between lines
                wordYPosition = wordYPosition + wordHeight + 6;
            }
            //save each word's data
            phantomTxtObjArray.push({
                id: token.id,
                wordWidth: wordWidth,
                wordHeight: wordHeight,
                wordXPosition: wordXPosition,
                wordYPosition: wordYPosition,
                lineNumber: lineNumber
            });
            wordXPosition = wordXPosition + wordWidth + 1.5;
        });
        //check if the line should be center aligned

        var xPadding = (data.align == "center" && lineWidth < 100) ? (100 - lineWidth) / 2 : 0;
        wordYPosition = 0; wordXPosition = 0;

        _.each(phantomTxtObjArray, function (phantomTxtObj) {
            var cell = {
                id: phantomTxtObj.id,
                w: phantomTxtObj.wordWidth,
                h: phantomTxtObj.wordHeight,
                y: phantomTxtObj.wordYPosition,
                x: phantomTxtObj.wordXPosition + xPadding,
            }

            PluginManager.invoke('g', cell, txtContainer, instance._stage, instance._theme);
            var cellObj = PluginManager.getPluginObject(cell.id);
            instance._cells.push(cellObj);
            var debug2 = {
                id: _.uniqueId('txt-shape'),
                w: phantomTxtObj.wordWidth, h: phantomTxtObj.wordHeight,
                y: phantomTxtObj.wordYPosition, x: phantomTxtObj.wordXPosition + xPadding,
                type: "rect",
                stroke: "black",
            }

            //PluginManager.invoke('shape', debug2, txtContainer, instance._stage, instance._theme);
        });
    },

    /**
         * returns the cell at the specified colIndex
         * @param {number} colIndex the column index of the cell
         */
    getCell: function (colIndex) {
        return this._cells[colIndex];
    }
});