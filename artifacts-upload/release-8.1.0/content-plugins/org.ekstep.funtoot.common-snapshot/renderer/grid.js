//@ sourceURL=grid.js
/* global PluginManager */
/**
 * A reusable grid layout plugin. This plugin operates on grid units rather than percentage
 * values for the height, width, x and y. The grid assumes that the aspect ratio of the stage 
 * is 16:9, and hence assumes the overall width of the stage as 160 units and height as 90 units.
 * 
 * @extends Plugin
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
    _type: 'org.ekstep.funtoot.grid',
    /**
     * initializes the grid plugin
     * @param {Object} data the data for the grid plugin
     */
    initPlugin: function (data) {
        // create a container for ourself
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        // invoke the plugin helper
        var helper = PluginManager.getPluginObject('plugin_helper');

        // The width of a column is 7 units, the gutter between two columns is 4 units
        var colWidthUnits = 7, gutterUnits = 4;

        var inst = this;
        var rowCount = 0;
        this._layout = { _rows: [] };
        if (data.debug) {
            var gridBg = {
                w: 100, h: 100, x: 0, y: 0, fill: "#FAFAFA"
            };
            PluginManager.invoke('shape', gridBg, this, this._stage, this._theme);
        }
        // create rows
        _.each(data.layout, function (r, k) {
            if (r.type == "row") {
                // a row will always occupy 128 units (80% of width of stage = 160 units)
                var rowData = { w: 128, h: r.h, x: 0, y: 0 };
                // add the height of the already rendererd rows (or gutters) to get the 
                // correct y position
                for (i = 0; i < k; i++)
                    rowData.y += data.layout[i].h;

                // compute the width, height,x and y in percent                     
                rowData = helper.toPercent(rowData, inst._parent);
                rowData.id = r.id || inst._data.id + 'r' + rowCount;
                PluginManager.invoke('g', rowData, inst, inst._stage, inst._theme);
                var rowObj = PluginManager.getPluginObject(rowData.id);

                // make the callback to the caller if interested in row creation
                if (data.cbObj && data.rowCb)
                    data.rowCb.apply(data.cbObj, [rowObj]);

                // create the columns on this row                    
                if (r.cols && r.cols.length > 0) {
                    _.each(r.cols, function (c, ci) {
                        if (c.type == "column") {
                            var colData = {
                                w: c.w * colWidthUnits + (c.w - 1) * gutterUnits,
                                h: r.h, x: 0, y: 0
                            };
                            for (i = 0; i < ci; i++) {
                                colData.x += r.cols[i].w * (colWidthUnits + gutterUnits);
                            }
                            colData = helper.toPercent(colData, rowObj);
                            if (data.debug) {
                                colData.shape = {
                                    w: 100, h: 100, x: 0, y: 0, fill: "#DDDDDD"
                                };
                            }
                            colData.id = c.id || rowData.id + 'c' + ci;
                            PluginManager.invoke('g', colData, rowObj, inst._stage, inst._theme);
                            var cell = PluginManager.getPluginObject(colData.id);

                            // call the caller if interested in column creation
                            if (data.cbObj && data.colCb)
                                data.colCb.apply(data.cbObj, [cell]);

                            // save the column into the row array 
                            (!rowObj._cols) ? rowObj._cols = [cell] : rowObj._cols.push(cell);
                        }
                        else if (c.type == "offset") {
                            // nothing need to be done for offset
                        }
                        else {
                            console.error("unknown column type " + c.type);
                        }
                    });
                }
                else
                    console.warn("got row without columns", r);
                // save the row in the layout rows array
                inst._layout._rows.push(rowObj);
            }
            else if (r.type == "gutter") {
                // nothing need to be done for gutter
            }
            else {
                console.error("unknown layout type " + r.type);
            }
        });
    },
    /**
     * returns the row at the specified index
     * @param {number} index the index of the row that need to be returned
     */
    getRow: function (index) {
        return this._layout._rows[index];
    },
    /**
     * returns the cell (or column) at the specified rowIndex and colIndex
     * @param {number} rowIndex the index of the row to which the cell belongs
     * @param {number} colIndex the column index of the cell inside the row
     */
    getCell: function (rowIndex, colIndex) {
        return this._layout._rows[rowIndex]._cols[colIndex];
    }
});
