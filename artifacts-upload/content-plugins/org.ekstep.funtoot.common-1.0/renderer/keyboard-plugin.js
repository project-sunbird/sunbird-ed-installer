/* global PluginManager */
Plugin.Keyboard = {};
Plugin.Keyboard.KeyboardView = Class.extend({
    /**
     *   Constructor for Keyboard class
     *   @constructs Plugin.Keyboard.KeyboardView
     *   @param {number} numberOfColumns number of columns
     *   @param {array} keys array containing keys for keyboard
     */
    init: function (numberOfColumns, keys, callbacks, adapterInstance) {
        this.fontSize = 3.5;
        this.keys = keys;
        if (keys != null) {
            this.numberOfRows = this._calculateNoOfRows(keys, numberOfColumns);
        }
        this.keyPressCallbacks = callbacks;
        this.adapterInstance = adapterInstance;
        this.numberOfColumns = numberOfColumns;
    },

    /**
     *   Set number of rows based on the defined columns.
     *   @memberof Plugin.Keyboard.KeyboardView#
     *   @private
     *   @param {array} keys the keys array of keyboard
     *   @param {number} numberOfColumns number of columns of keyboard
     *   @returns {number} number of rows
     */
    _calculateNoOfRows: function (keys, numberOfColumns) {
        var rows;
        var keysTotal = Object.keys(keys).length;
        if ((numberOfColumns > 0) && (keysTotal > 0)) {
            rows = Math.ceil(keysTotal / numberOfColumns);
        } else {
            rows = 0;
        }
        return rows;
    },

    /**
     *   Draw the keyboard.
     *   @memberof Plugin.Keyboard.KeyboardView#
     *   @param {number} keyWidth width of each key
     *   @param {number} keyHeight height of each key
     *   @param {object} keyboardDims keyboard dimensions
     */
    drawKeyboard: function (keyWidth, keyHeight, keyboardDims) {
        var keyboardParentDiv = document.getElementById('org-ekstep-plugin-keyboard-parent');
        if (keyboardParentDiv) {
            jQuery("#org-ekstep-plugin-keyboard-parent").remove();
        }

        if (this.keys != null) {
            if (Object.keys(this.keys).length > 0) {
                keyboardParentDiv = document.createElement('div');
                keyboardParentDiv.id = "org-ekstep-plugin-keyboard-parent";

                var keyboardDiv = document.createElement('div');
                keyboardDiv.id = "org-ekstep-plugin-keyboard";

                keyboardDiv.style.top = keyboardDims.y + '%';
                keyboardDiv.style.left = keyboardDims.x + '%';

                keyboardDiv.style.width = keyboardDims.w + '%';
                keyboardDiv.style.height = (keyHeight * this.numberOfRows) + '%';

                /*istanbul ignore else*/
                if (keyWidth > 0 && keyHeight > 0) {
                    this._addKeys(keyboardDiv);
                }

                keyboardParentDiv.appendChild(keyboardDiv);
                var gameAreaDiv = document.getElementById(Renderer.divIds.gameArea);
                gameAreaDiv.appendChild(keyboardParentDiv);
            }
        }
        keyboardParentDiv.style.visibility = 'hidden';
    },

    /**
     *   Create key divs within the main div
     *   @memberof Plugin.Keyboard.KeyboardView#
     *   @private
     *   @param {object} keyBoardElement parent keyboard div for the keys
     */
    _addKeys: function (keyBoardElement) {
        var instance = this;
        _.each(this.keys, function (key) {
            var localWidth = (100 / instance.numberOfColumns);
            var localHeight = (100 / instance.numberOfRows);
            var $keyElement = $('<div class="org-ekstep-key" style="width: ' + localWidth + '%; height:' + localHeight + '%"></div>');
            var $keyTextElement = $('<div class="org-ekstep-keyText">' + key.fv + '</div>')
            $($keyElement).append($keyTextElement);
            $(keyBoardElement).append($keyElement);
            $keyElement.on('click', function () {
                instance.keyPressCallbacks.forEach(function (keyPressCallback) {
                    keyPressCallback(key, instance.adapterInstance);
                });
            });
        })
    },

    /**
     *   callback to get key pressed
     *   @memberof Plugin.Keyboard.KeyboardView#
     *   @param {function} keyPressCallback callback function for keyboard keys
     */
    onKeyPress: function (keyPressCallback) {
        this.keyPressCallbacks.push(keyPressCallback);
    },
    onShowKeyboard: function () {
        document.getElementById("org-ekstep-plugin-keyboard-parent").style.visibility = 'visible';
    },
    onHideKeyboard: function () {
        document.getElementById("org-ekstep-plugin-keyboard-parent").style.visibility = 'hidden';
    }
});
/* istanbul ignore next: renderer initPlugin */
Plugin.Keyboard.RendererPlugin = Plugin.extend({
    _type: 'org.ekstep.plugins.keyboard',
    initPlugin: function (data) {
        if (data.model && this._stage.getModelValue(data.model)) {
            data.keys = this._stage.getModelValue(data.model);
        }
        var containerWidth = data.keyWidth * data.numberOfColumns;
        var keyboardDimensions = {
            w: containerWidth,
            x: data.xPosition,
            y: data.yPosition,
            stretch: false
        }

        this.keyboard = new Plugin.Keyboard.KeyboardView(data.numberOfColumns, data.keys, data.callBack, data.adapterInstance);
        this.keyboard.drawKeyboard(data.keyWidth, data.keyHeight, keyboardDimensions);
    },

    onKeyPress: function (keyPressCallback) {
        this.keyboard.onKeyPress(keyPressCallback);
    },
    onShowKeyboard: function () {
        console.log('show keyboard');
        this.keyboard.onShowKeyboard();
    },
    switchTarget: function (action) {
        console.log(action.id);
    },
    onHideKeyboard: function () {
        console.log('hide keyboard');
        this.keyboard.onHideKeyboard();
    },

});
//# sourceURL=keyboardPluginNew.js
