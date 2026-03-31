//@ sourceURL=timeintrocustom-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate measurement problems
 * @extends ftFibBasePlugin
 * @fires table, grid
 * @author Amit (amit.dawar@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.customtimeintro',
    _isContainer: false,
    _render: true,
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);

        // process the variables only if non-solution display
        if (!data.isSolution) {
            //this.processVariables(variables);
            item.setModelValue("fibModels", {});
        }

        var rowHeight = 9; // in units
        //Number of rows is fixed
        var rows = 4;
        // Number of cols is fixed
        var cols = 2;
        var colWidth = 20; // in units
        var gridColumns = 4; // column width

        // offset is fixed
        var offset = 4;

        // invoke grid
        var gridData = {
            id: _.uniqueId('grid'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance,
            // debug: true
        };
        gridData.layout = [];
        var clock = {
            type: "row",
            h: 100,
            w: 100,
            id: "clockDisplay"
        }
        gridData.layout.push(clock);

        var table = {
            type: "row",
            h: rows * rowHeight,
            cols: [{
                type: "offset",
                w: offset
            }, {
                id: "tableCell",
                type: "column",
                w: gridColumns
            }]
        };
        gridData.layout.push(table);

        var contentContainer = PluginManager.getPluginObject(this._ftContentContainerId);
        PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, this._stage, this._theme);

        // add table in the tableCell created
        var tableCell = PluginManager.getPluginObject("tableCell");
        var tableData = {
            id: _.uniqueId('table'),
            w: 100,
            h: 100,
            x: 0,
            y: 0,
            cbObj: instance,
            // debug: true,
            colCb: this.onColCreated
        };
        tableData.layout = [];

        //add answer row
        var answerRow = {
            type: "row",
            h: rowHeight,
            cols: [],
            id: "answer",
            w: cols * colWidth
        }
        for (i = cols - 1; i >= 0; i--) {
            answerRow.cols.push({
                type: "column",
                w: colWidth,
                id: "ans" + i
            });
        }
        tableData.layout.push(answerRow);
        PluginManager.invoke('org.ekstep.funtoot.table', tableData, tableCell, instance._stage, instance._theme);

        for (var i = 0; i <= 1; i++) {
            var cell = PluginManager.getPluginObject("ans" + i);
            var key = "fib" + cell._data.id;
            if (!data.isSolution) {
                var fibData = {
                    e: key == 'fibans0' ? "ansmnr" : "ansmjr",
                    u: '',
                    w: true,
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false,
                    key: key
                }
                var fibM = item.getModelValue().model.fibModels;
                fibM[key] = fibData;
            }
            item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
            var fib = {
                id: key,
                model: "fibModels." + key,
                w: 100,
                x: 0,
                h: 100,
                y: 0,
                fontsize: "2.7vw",
                options: {
                    readonly: {
                        showBgImg: false
                    },
                    "deselected": {
                        "stroke": "#ffffff"
                    }
                }
            };
            PluginManager.invoke('ftFib', fib, cell, instance._stage, instance._theme);
        }

        var clockDisp = PluginManager.getPluginObject('clockDisplay');
        var clockData = {
            "id": "clock",
            "x": "70",
            "y": "70",
            "w": "200",
            "h": "200",
            "visible": true
        }
        PluginManager.invoke('clockcontrol', clockData, clockDisp, instance._stage, instance._theme);
    }
});