//@ sourceURL=table.js
/* global PluginManager */
Plugin.extend({
    _type: 'org.ekstep.funtoot.table',
    initPlugin: function (data) {
        // create a container for ourself
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        // invoke the plugin helper
        var helper = PluginManager.getPluginObject('plugin_helper');
        var inst = this;
        var rowCount = 0;
        this._layout = { _rows: [] };
        var colWidthUnits = data.colWidth;
        if (data.debug) {
            var gridBg = {
                w: 100, h: 100, x: 0, y: 0, fill: "#FAFAFA"
            };
            PluginManager.invoke('shape', gridBg, this, this._stage, this._theme);
        }
        // create rows
        _.each(data.layout, function (r, k) {
            if (r.type == "row") {
                var rowData = { w: r.w, h: r.h, x: 0, y: 0 };
                for (i = 0; i < k; i++)
                    rowData.y += data.layout[i].h;
                // compute the width, height,x and y in percent                     
                rowData = helper.toPercent(rowData, inst._parent);
                rowData.id = r.id || inst._data.id + 'r' + rowCount;
                PluginManager.invoke('g', rowData, inst, inst._stage, inst._theme);
                var rowObj = PluginManager.getPluginObject(rowData.id);
                // create the columns on this row                    
                if (r.cols && r.cols.length > 0) {
                    _.each(r.cols, function (c, ci) {
                        if (c.type == "column") {
                            var colData = {
                                w: c.w,
                                h: r.h, x: 0, y: 0
                            };
                            for (i = 0; i < ci; i++) {
                                colData.x += r.cols[i].w;
                            }
                            colData = helper.toPercent(colData, rowObj);
                            if (data.debug) {
                                colData.shape = {
                                    w: 100, h: 100, x: 0, y: 0, fill: "#DDDDDD", stroke: "#BFBFBF"
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
    }
});