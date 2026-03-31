//@ sourceURL=numberline.js
/* global PluginManager */
/**
 * Common plugin for number line
 * @extends Plugin
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
Plugin.extend({
    _type: 'numberline',
    /**
     * initializes the plugin
     */
    initPlugin: function (data) {
        var numberlineContainer = this._parent;
        var instance = this;
        var defaultCount = data.count || 10;
        var cellWidth = 100 / defaultCount;
        var x = (100 - (defaultCount * cellWidth)) / 2;
        var curveCanvasHeight = 70;
        var numberlineCurve = {
            id: "numberlineCurve",
            w: 100, h: curveCanvasHeight, y: 0, x: 0,
            align: "center",
            valign: "middle",
            // stroke: "black"
        }
        PluginManager.invoke('g', numberlineCurve, numberlineContainer, this._stage, this._theme);

        var curve = PluginManager.getPluginObject(numberlineCurve.id);
        var type = data.isSolution ? "-sol" : "-question";
        for (var h = 0; h < data.content.length; h++) {
            var numberlineNum = {};
            numberlineNum.name = "numberLineNum" + type + data.content[h].numericalValue;
            numberlineNum.xPos = x;
            numberlineNum.yPos = curveCanvasHeight;
            numberlineNum.cellWidth = cellWidth;
            numberlineNum.cellHeight = 100 - curveCanvasHeight;
            numberlineNum.fontSize = data.fontSize;
            numberlineNum.type = type;
            numberlineNum.number = data.content[h];
            PluginManager.invoke('numberlinenumber', numberlineNum, numberlineContainer, instance._stage, instance._theme);

            var numLinenum = PluginManager.getPluginObject(numberlineNum.name);
            var hits = 0;
            var previousHop = {};
            drawingCanvas = new createjs.Shape();
            curve.addChild(drawingCanvas);
            instance._hopDetails = [];


            numLinenum._self.on('click', function (event) {
                //if scale includes zero draw arc from zero on first click
                if (this.id != ("numberLineNum" + type + "0") && data.content[0].numericalValue == 0 && instance._hopDetails.length == 0) {
                    var zero = PluginManager.getPluginObject("numberLineNum" + type + "0");
                    instance._hopDetails.push({
                        hop: zero,
                        x: zero._self.x + zero._self.width / 2,
                        y: zero._self.y
                    })
                }
                var lastHop = _.last(instance._hopDetails);
                //if user has clicked on the same number consecutively add hop only once
                if (_.isUndefined(lastHop) || (!_.isUndefined(lastHop) && lastHop.hop.id != this.id))
                    instance._hopDetails.push({
                        hop: this,
                        x: this._self.x + this._self.width / 2,
                        y: this._self.y
                    })
                instance.drawCurves(instance._hopDetails, drawingCanvas);

                hits++;
                previousHop.x = this._self.x;
                previousHop.y = this._self.y;

            }, numLinenum);
            x = x + cellWidth;
        }

        if (data.isSolution) {
            var expectedHops = [];
            if (data.start == "0")
                expectedHops.push(data.content[0]);
            if (data.operation == "Multiplication") {
                var hops = [];
                for (var i = 1; i <= data.operands[1].numericalValue; i++) {
                    hops.push(data.operands[0].numericalValue * i);
                }
                _.each(hops, function (hop) {
                    var num = _.filter(data.content, function (n) {
                        if (n.numericalValue == hop)
                            return n.displayValue;
                    });
                    expectedHops.push(num[0]);
                });
            }
            else {
                var findNum = _.filter(data.content, function (c) {
                    return c.displayValue == data.operands[0].displayValue
                })
                var firstNumToClick = findNum.length > 0 ? data.operands[0] : data.operands[1];
                expectedHops.push(firstNumToClick, data.ans);
            }
            _.each(expectedHops, function (hop) {
                var numContainer = PluginManager.getPluginObject("numberLineNum" + type + hop.numericalValue);
                instance._hopDetails.push({
                    hop: numContainer,
                    x: numContainer._self.x + numContainer._self.width / 2,
                    y: numContainer._self.y
                })
            });
            //solution
            instance.drawCurves(instance._hopDetails, drawingCanvas);
        }
        var clearAll = {
            id: 'clearAllBtn',
            w: 6, y: 15, x: 83,
            asset: "clearall",
            stretch: false,
            visible: !data.isSolution
        }
        PluginManager.invoke('image', clearAll, numberlineContainer, this._stage, this._theme);


        var clearAllBtn = PluginManager.getPluginObject(clearAll.id);
        clearAllBtn._self.on('click', function (eve) {
            instance.clearArcs(curve, numberlineContainer);
            instance._hopDetails = [];// clear model
        });

        var undo = {
            id: 'undoBtn',
            w: 6, y: 15, x: 93,
            asset: "undo",
            stretch: false,
            visible: !data.isSolution
        }
        PluginManager.invoke('image', undo, numberlineContainer, this._stage, this._theme);

        var undoBtn = PluginManager.getPluginObject(undo.id);
        undoBtn._self.on('click', function (e) {
            instance.clearArcs(curve, numberlineContainer);
            instance._hopDetails = _.initial(instance._hopDetails);
            if (instance._hopDetails.length == 1)
                instance._hopDetails = [];
            instance.drawCurves(instance._hopDetails, drawingCanvas);
        });
    },
    /**
     *draws arrow at the end of each curve
     *@param {number} radian radian
     *@param {number} x x corodinate
     *@param {number} y y coordinate
     *@param {number} r color code
     *@param {number} g color code
     *@param {number} b color code
     */
    drawArrow: function (radian, x, y, r, g, b) {
        var curve = PluginManager.getPluginObject("numberlineCurve");
        var arrow = new createjs.Shape();
        arrow.graphics.setStrokeStyle(3).beginStroke(createjs.Graphics.getRGB(r, g, b)).moveTo(-5, +5).lineTo(0, 0).lineTo(-5, -5);
        var degree = radian / Math.PI * 180;
        arrow.x = x;
        arrow.y = y;
        arrow.rotation = degree;
        curve.addChild(arrow);
        curve.update();
    },
    /**
     *draws curve between the hops
     *@param {object} hopDetails - details about hop between which cure to be drawn
     *@param {object} drawingCanvas - createjs shape on which curves to be drawn
     */
    drawCurves: function (hopDetails, drawingCanvas) {
        var instance = this;
        var curve = PluginManager.getPluginObject("numberlineCurve");
        var numberlineContainer = this._parent;
        instance.clearArcs(curve, numberlineContainer);
        for (var h = 0; h < hopDetails.length; h++) {
            hopDetails[h].hop._self.children[0].graphics._fill.style = "#40e0d0";//"#40e0d0"
            if (h > 0) {
                var controlXPoint = hopDetails[h - 1].x + (hopDetails[h].x - hopDetails[h - 1].x) / 2
                var controlYPoint = hopDetails[h].x < hopDetails[h - 1].x ? 45 : 10;
                var colour = hopDetails[h].x < hopDetails[h - 1].x ? [255, 51, 153] : [51, 0, 204];
                var r = colour[0], g = colour[1], b = colour[2];//

                drawingCanvas.graphics.setStrokeStyle(1.5).setStrokeDash([10, 3], 0).beginStroke(createjs.Graphics.getRGB(r, g, b))
                    .moveTo(hopDetails[h - 1].x, hopDetails[h - 1].y).quadraticCurveTo(controlXPoint, controlYPoint, hopDetails[h].x, hopDetails[h - 1].y);
                instance.drawArrow(Math.atan2((hopDetails[h - 1].y - controlYPoint), (hopDetails[h].x - controlXPoint)), hopDetails[h].x, hopDetails[h - 1].y, r, g, b);
            }
            curve.update();
        }
    },
    /**
     *Clear all the arcs and the colour of the number container on the canvas
     *@param {object} curve createjs shape on which the arcs are drawn
     *@param {object} numberlineContainer container on which the numbers are present
     */
    clearArcs: function (curve, numberlineContainer) {
        // clear all the arcs
        _.each(curve._self.children, function (child) {
            child.graphics.clear();
        });
        curve.update();
        var numberLineContainers = _.filter(numberlineContainer._childIds, function (n) {
            return n.includes("numberLineNum");
        })
        // change the colour of the number container back to white on clear
        _.each(numberLineContainers, function (t) {
            var numLineContainer = PluginManager.getPluginObject(t);
            var boxes = _.filter(numLineContainer._childIds, function (c) {
                return c.includes("box");
            })
            var boxObj = PluginManager.getPluginObject(boxes[0]);
            boxObj._self.graphics._fill.style = "#ffffff";//"#40e0d0"
        });
        numberlineContainer.update();
    },
    /**
     * returns the hopDetails
     * @returns {object} hopDetails
     */
    getHopDetails: function () {
        return this._hopDetails;
    }
});