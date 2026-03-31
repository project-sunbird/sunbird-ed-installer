//@ sourceURL=custombills-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate bills problems
 * @extends ftFibBasePlugin
 * @fires ftGrid
 * @author Swathi (swathi.jayaprakash@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.custombills',
    initPlugin: function (data) {
        this._super(data);
        var instance = this;
        var i18n = PluginManager.getPluginObject('i18n_helper');
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);
        var variables = this._item.getModelValue("variables");
        var numericLangId = this._item.getModelValue("numericLangId");
        var totItems = this._item.getModelValue("totalItems");

        // process the variables only if non-solution display
        if (!this._item.getModelValue("variablesProcessed") && !data.isSolution) {
            var indArray = [];
            while (indArray.length < totItems) {
                var randInd = new org.ekstep.generators().random(variables.totItemsAvail.length - 1);
                if (indArray.indexOf(randInd) == -1) {
                    indArray.push(randInd);
                }
            }
            var itemsArray = [];
            var itemQtyArray = [];
            var ppuArray = [];
            _.each(indArray, function (ind) {
                itemsArray.push(variables.totItemsAvail[ind]);
                var qtyRange = variables.totItemsQtyAvail[ind].split("-");
                itemQtyArray.push(new org.ekstep.generators().random(Number(qtyRange[0]), Number(qtyRange[1])));
                var ppuRange = variables.totItemsPPuAvail[ind].split("-");
                ppuArray.push(new org.ekstep.generators().random(Number(ppuRange[0]), Number(ppuRange[1])));
            });
            variables.indArray = indArray;
            variables.itemArray = itemsArray;
            variables.itemQtyArray = itemQtyArray;
            variables.ppuArray = ppuArray;
            this._item.setModelValue("variablesProcessed", true);
        }
        if (!this._item.getModelValue("isNumbersProcessed")) {
            _.each(variables.indArray, function (ind, i) {
                variables.itemQtyArray[i] = i18n.translateNumber(variables.itemQtyArray[i], numericLangId);
                variables.ppuArray[i] = i18n.translateNumber(variables.ppuArray[i], numericLangId);
            });
            this._item.setModelValue("isNumbersProcessed", true);
        }
        instance._item.setModelValue("itemArray", variables.itemArray);
        instance._item.setModelValue("itemQtyArray", variables.itemQtyArray);
        instance._item.setModelValue("ppuArray", variables.ppuArray);

        i18n.onReady().then(function (o) {
            var itemArray = instance._item.getModelValue("itemArray");
            var itemQtyArray = instance._item.getModelValue("itemQtyArray");
            var ppuArray = instance._item.getModelValue("ppuArray");
            var maskedArray = eval(instance._item.getModelValue("maskArray"));
            // invoke grid
            var gridData = {
                id: _.uniqueId('grid'),
                w: 100,
                h: 100,
                x: 0,
                y: 0,
                cbObj: instance //, debug: true
            };
            gridData.layout = [];
            gridData.layout.push({
                type: "gutter",
                h: 1
            });
            var billHeaderRow = {
                type: "row",
                h: 17,
                cols: [{
                    type: "column",
                    id: "billHeaderImg",
                    w: 12
                }]
            };
            gridData.layout.push(billHeaderRow);
            var billTableRow = {
                type: "row",
                h: 35,
                id: "billTableCell",
                cols: []
            };
            gridData.layout.push(billTableRow);
            //  gridData.debug = true;
            var contentContainer = PluginManager.getPluginObject(instance._ftContentContainerId);
            PluginManager.invoke('org.ekstep.funtoot.grid', gridData, contentContainer, instance._stage, instance._theme);

            var billTableCell = PluginManager.getPluginObject("billTableCell");
            /**Invoke shapes plugin to set the background color */
            var billTableCellColorShapeObj = {
                fill: "#ADD2F2",
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                type: "rect"
            };
            PluginManager.invoke('shape', billTableCellColorShapeObj, billTableCell, instance._stage, instance._theme);

            var tableData = {
                id: _.uniqueId('table'),
                w: 100,
                h: 100,
                x: 0,
                y: 0,
                align: "center",
                valign: "middle",
                cbObj: instance,
                //  debug: true,
                colCb: instance.onColCreated
            };
            tableData.layout = [];
            var tableHeaderRow = {
                type: "row",
                h: 7,
                cols: [],
                id: "tableHeaderRow",
                w: 128
            };
            tableHeaderRow.cols.push({
                type: "column",
                id: "SLNO",
                w: 9
            }, {
                    type: "column",
                    id: "ITEM_DESC",
                    w: 53
                }, {
                    type: "column",
                    id: "ITEM_QTY",
                    w: 22
                }, {
                    type: "column",
                    id: "ITEM_PPU",
                    w: 22
                }, {
                    type: "column",
                    id: "ITEM_PRICE",
                    w: 22
                });
            tableData.layout.push(tableHeaderRow);
            var r = 0;
            var c = 0;
            var rowHeight = 7;
            for (r = 0; r < totItems + 1; r++) {
                var newRow = {
                    id: 'row' + r,
                    type: "row",
                    h: rowHeight,
                    cols: [],
                    w: 128
                };
                if (r == totItems) {
                    newRow.cols.push({
                        id: "TOTAL_PRICE",
                        type: "column",
                        w: 106
                    }, {
                            id: "totalBillVal",
                            type: "column",
                            w: 22
                        });
                } else {
                    for (c = 0; c < 5; c++) {
                        var colWidth;
                        if (c == 0)
                            colWidth = 9;
                        else if (c == 1)
                            colWidth = 53;
                        else
                            colWidth = 22;
                        newRow.cols.push({
                            id: 'cell' + r + '_' + c,
                            type: "column",
                            w: colWidth
                        });
                    }
                }
                tableData.layout.push(newRow);
            }
            PluginManager.invoke('org.ekstep.funtoot.table', tableData, billTableCell, instance._stage, instance._theme);

            //Add assets to grid and the inner table
            /** Invoke plugin manager for the bill header field */
            var billHeaderImgGridObj = PluginManager.getPluginObject("billHeaderImg");
            /**Invoke shapes plugin to set the background color */
            var billHeaderRowColorShapeObj = {
                fill: "#ADD2F2",
                h: 100,
                w: 100,
                x: 0,
                y: 0,
                type: "rect"
            };
            PluginManager.invoke('shape', billHeaderRowColorShapeObj, billHeaderImgGridObj, instance._stage, instance._theme);
            var billHeaderImgObj = {
                w: 100,
                x: 0,
                y: 0,
                asset: "billheaderimgbar",
                align: "center"
            };
            PluginManager.invoke('image', billHeaderImgObj, billHeaderImgGridObj, instance._stage, instance._theme);

            var textValArray = ["SLNO", "ITEM_DESC", "ITEM_QTY", "ITEM_PPU", "ITEM_PRICE", "TOTAL_PRICE"];
            var j;
            var headerLineObj;
            var headerLine;
            var headerVerticalShapeObj;
            var headerCellObj;
            var headerCellTextObj
            for (j = 0; j < textValArray.length; j++) {
                headerCellObj = PluginManager.getPluginObject(textValArray[j]);
                /**Invoke shapes plugin to set the background color */
                var headerbackGroundColorShapeObj = {
                    fill: "#88C5FA",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect"
                };
                if (j == textValArray.length - 1) {
                    headerbackGroundColorShapeObj.fill = '#ADD2F2';
                }
                PluginManager.invoke('shape', headerbackGroundColorShapeObj, headerCellObj, instance._stage, instance._theme);
                headerCellTextObj = {
                    id: textValArray[j],
                    align: j == textValArray.length - 1 ? "right" : "center",
                    weight: "bold",
                    valign: "middle",
                    fontsize: '2vw',
                    $t: o.translate(textValArray[j], {}),
                    x: 0,
                    y: 0,
                    w: 100,
                    h: 100
                };
                PluginManager.invoke('text', headerCellTextObj, headerCellObj, instance._stage, instance._theme);
                /**Invoke plugin manager to draw vertical lines */
                headerLineObj = {
                    x: 0,
                    y: 0,
                    h: 100,
                    w: 0.3,
                    id: "line" + textValArray[j]
                };
                PluginManager.invoke('g', headerLineObj, headerCellObj, instance._stage, instance._theme);
                headerLine = PluginManager.getPluginObject("line" + textValArray[j]);
                headerVerticalShapeObj = {
                    fill: "#ffffff",
                    h: 100,
                    w: 100,
                    x: 0,
                    y: 0,
                    type: "rect"
                };
                PluginManager.invoke('shape', headerVerticalShapeObj, headerLine, instance._stage, instance._theme);
                if (j == textValArray.length - 2) {
                    headerVerticalShapeObj.x = 100;
                    PluginManager.invoke('shape', headerVerticalShapeObj, headerLine, instance._stage, instance._theme);
                }
            }
            /**Invoke plugin manager to draw horizontal lines */
            var boldLineObj = {
                fill: "#ffffff",
                stroke: "#ffffff",
                h: 1,
                w: 100,
                x: 0,
                y: 0,
                type: "rect"
            };
            var tableHeaderRowObj = PluginManager.getPluginObject("tableHeaderRow");
            PluginManager.invoke('shape', boldLineObj, tableHeaderRowObj, instance._stage, instance._theme);
            boldLineObj.y = 100;
            PluginManager.invoke('shape', boldLineObj, tableHeaderRowObj, instance._stage, instance._theme);

            if (!data.isSolution) {
                instance._item.setModelValue("fibModels", {});
                instance._item.setModelValue("mask", maskedArray);
            }
            var totalBill = 0;
            var curRow;
            var cell;
            var n = 0;
            //    var billTableObj = PluginManager.getPluginObject(tableData.id);
            for (r = 0; r < totItems; r++) {
                curRow = PluginManager.getPluginObject('row' + r);
                for (c = 0; c < 5; c++) {
                    n = r * 3 + c - 2;
                    cell = PluginManager.getPluginObject('cell' + r + '_' + c);
                    switch (c) {
                        case 0:
                            /**Invoke Plugin manager for sl no fields(column1) */
                            var slNoFiledObj = {
                                id: "silNoField" + r + "_" + c,
                                align: "center",
                                valign: "middle",
                                fontsize: '2vw',
                                $t: i18n.translateNumber(r + 1, numericLangId).displayValue,
                                x: 0,
                                y: 0,
                                w: 100,
                                h: 100
                            };
                            PluginManager.invoke('text', slNoFiledObj, cell, instance._stage, instance._theme);
                            break;
                        case 1:
                            /**Invoke Plugin manager for item desc fields(column2) */
                            var itemDecTextObj = {
                                id: "itemDecField" + r + "_" + c,
                                align: "center",
                                valign: "middle",
                                fontsize: '2vw',
                                $t: itemArray[r],
                                x: 0,
                                y: 0,
                                w: 100,
                                h: 100
                            };
                            PluginManager.invoke('text', itemDecTextObj, cell, instance._stage, instance._theme);
                            break;
                        case 2:
                        case 3:
                        case 4:
                            var key = "fibcell" + r + '_' + c;
                            if (!data.isSolution) {
                                var numVal = c == 2 ? (itemQtyArray[r]) : (c == 3 ? (ppuArray[r]) : (i18n.translateNumber(itemQtyArray[r].numericalValue * ppuArray[r].numericalValue, numericLangId)));
                                var fibData = {
                                    e: numVal.displayValue,
                                    u: maskedArray[n] ? '' : numVal.displayValue,
                                    w: maskedArray[n],
                                    isSolution: data.isSolution,
                                    isEvaluated: false,
                                    isCorrect: false
                                };
                                var fibMObj = instance._item.getModelValue().model.fibModels;
                                fibMObj[key] = fibData;
                            }
                            instance._item.getModelValue().model.fibModels[key].isSolution = data.isSolution;
                            var fibObj = Object.create(data);
                            fibObj.id = key;
                            fibObj.model = "fibModels." + key;
                            fibObj.w = 100;
                            fibObj.x = 0;
                            fibObj.h = 100;
                            fibObj.y = 0;
                            fibObj.options = {
                                readonly: {
                                    showBgImg: false
                                }
                            };
                            fibObj.fontsize = '2vw';
                            fibObj.state = "deselected";
                            PluginManager.invoke('ftFib', fibObj, cell, instance._stage, instance._theme);
                            break;
                    }
                    var lineObj = {
                        x: 0,
                        y: 0,
                        h: 100,
                        w: 0.3,
                        id: "line" + c
                    };
                    PluginManager.invoke('g', lineObj, cell, instance._stage, instance._theme);
                    var line = PluginManager.getPluginObject("line" + c);
                    var verticalShapeObj = {
                        fill: "#ffffff",
                        h: 100,
                        w: 100,
                        x: 0,
                        y: 0,
                        type: "rect",
                    };
                    PluginManager.invoke('shape', verticalShapeObj, line, instance._stage, instance._theme);
                    if (c == 4) {
                        verticalShapeObj.x = 100;
                        PluginManager.invoke('shape', verticalShapeObj, line, instance._stage, instance._theme);
                    }
                } //End of cols loop
                totalBill += itemQtyArray[r].numericalValue * ppuArray[r].numericalValue;
                PluginManager.invoke('shape', boldLineObj, curRow, instance._stage, instance._theme);
            } //End of rows loop
            curRow = PluginManager.getPluginObject('row' + r);
            PluginManager.invoke('shape', boldLineObj, curRow, instance._stage, instance._theme);
            /**Invoke plugin manager for total bill vall field */
            var totalBillValObj = PluginManager.getPluginObject("totalBillVal");
            totalBill = i18n.translateNumber(totalBill, numericLangId);
            if (!data.isSolution) {
                var fibDataObj = {
                    e: totalBill.displayValue,
                    u: '',
                    w: 1,
                    isSolution: data.isSolution,
                    isEvaluated: false,
                    isCorrect: false
                }
                var fibM = instance._item.getModelValue().model.fibModels;
                fibM["totalBillVal"] = fibDataObj;
            }
            instance._item.getModelValue().model.fibModels["totalBillVal"].isSolution = data.isSolution;
            var fib = Object.create(data);
            fib.id = "totalBillVal";
            fib.model = "fibModels.totalBillVal";
            fib.w = 100;
            fib.x = 0;
            fib.h = 100;
            fib.y = 0;
            fib.fontsize = '2vw';
            fib.state = "deselected";
            PluginManager.invoke('ftFib', fib, totalBillValObj, instance._stage, instance._theme);
        });
    },
    /**
     * handles Submit button
     * evaluates the user answers
     * @param {object} evt the event
     * @returns {object} the result
     * @param {object} instance the instance of the plugin
     */
    onSubmit: function (evt, instance) {
        // console.log("bills - onSubmit called");
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var model = instance._item.getModelValue();
        //    var length = Object.keys(model.model.fibModels).length;
        var result = {
            isSolved: true,
            resValues: [],
            mmc: []
        };
        if (this.onEvaluate(instance)) {
            _.each(model.model.fibModels, function (m, k) {
                if (m.w) {
                    var userValue = i18n.toNumber(m.u.trim());
                    var expectedValue = i18n.toNumber(m.e.trim());
                    var res = {};
                    res[k] = m.u;
                    if (m.u.trim() == '') {
                        m['mh'] = i18n.translate("NO_ANSWER"); //'Please answer'
                        m['mmc'] = 'O1';
                        m.isCorrect = !1;
                    } else if (userValue != expectedValue) {
                        var cellType = k.split('_')[1];
                        if (cellType == 2) {
                            m['mh'] = i18n.translate("INVALID_QTY");
                            m['mmc'] = 'C297';
                        } else if (cellType == 3) {
                            m['mh'] = i18n.translate("INVALID_UNIT_PRICE");
                            m['mmc'] = 'C297';
                        } else if (cellType == 4) {
                            m['mh'] = i18n.translate("INVALID_ITEM_PRICE");
                            m['mmc'] = 'C269';
                        } else {
                            m['mh'] = i18n.translate("INVALID_TOTAL");
                            m['mmc'] = 'C295';
                        }
                        m.isCorrect = !1;
                    } else {
                        m['mh'] = null;
                        m['mmc'] = null;
                        m.isCorrect = !0;
                    }
                    result.resValues.push(res);
                    if (!m.isCorrect) {
                        result.isSolved = false;
                        result.mmc.push(m.mmc);
                    }
                    var fibObject = PluginManager.getPluginObject(k);
                    fibObject.onEvaluate();
                }
            });
            return result;
        } else return false
    },
    /**
     * checks if user has answered completely
     * @param {object} instance current instance
     * @returns {boolean} true if input is given
     */
    onEvaluate: function (instance) {
        var blkCount = 0;
        var answeredBlkCount = 0;
        var blanks = instance._item.getModelValue().model.fibModels;
        _.each(blanks, function (b) {
            if (b.w) {
                blkCount++;
                if (b.u != "")
                    answeredBlkCount++;
            }
        })
        if (answeredBlkCount == blkCount)
            return true
        else return false
    }
});