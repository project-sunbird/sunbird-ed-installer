Plugin.Eraser = {};
/**
 *   @class Plugin.Eraser.EraserView
 */
Plugin.Eraser.EraserView = Class.extend({
    /**
     *   Draw the eraser and assign event.
     *   @memberof Plugin.Eraser.EraserView#
     *   @param {number} eraserXpos x position for the eraser
     *   @param {number} eraserYpos y position for the eraser
     */
    drawEraser: function(eraserXpos, eraserYpos) {
        var eraserParentDiv = document.getElementById('org-ekstep-plugin-eraser-parent');
        if (eraserParentDiv) {
            jQuery("#org-ekstep-plugin-eraser-parent").remove();
        }
        if ((eraserXpos != undefined) && (eraserYpos != undefined)) {
            eraserParentDiv = document.createElement('div');
            eraserParentDiv.id = "org-ekstep-plugin-eraser-parent";

            var eraserDiv = document.createElement('div');
            eraserDiv.id = "org-ekstep-plugin-eraser";
            eraserDiv.style.top = eraserYpos + '%';
            eraserDiv.style.left = eraserXpos + '%';

            eraserParentDiv.appendChild(eraserDiv);
            var gameAreaDiv = document.getElementById(Renderer.divIds.gameArea);
            gameAreaDiv.appendChild(eraserParentDiv);
        }
    },

    /**
     *   Set eraser functionality
     *   @memberof Plugin.Eraser.EraserView#
     *   @private
     *   @param {function} eraserEventCallback callback function for eraser button
     */
    _assignEraserEvent: function(eraserEventCallback) {
        var eraserbtn = document.getElementById('org-ekstep-plugin-eraser');
        eraserbtn.addEventListener("click", function() {
            eraserEventCallback()
        });
    },

    /**
     *   callback to get eraser id
     *   @memberof Plugin.Eraser.EraserView#
     *   @param {function} eraserPressCallback callback function for eraser keys
     */
    onEraserPress: function(eraserPressCallback) {
        this._assignEraserEvent(eraserPressCallback);
    }
});

/* istanbul ignore next: renderer init plugin */
Plugin.Eraser.RendererPlugin = Plugin.extend({
    _type: 'org.ekstep.plugins.common.eraser',
    _isContainer: false,
    _render: true,

    initPlugin: function(data) {

        var eraserPositions = {
            x: data.xPosition,
            y: data.yPosition,
            stretch: false
        }

        this.eraser = new Plugin.Eraser.EraserView();
        this.eraser.drawEraser(eraserPositions.x, eraserPositions.y);
    },

    onEraserPress: function(eraserPressCallback) {
        this.eraser.onEraserPress(eraserPressCallback);
    }
});
//# sourceURL=eraserPlugin.js
