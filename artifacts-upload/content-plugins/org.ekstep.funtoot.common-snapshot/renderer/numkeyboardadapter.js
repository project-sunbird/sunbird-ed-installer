Plugin.NumKeyboardAdapter = Class.extend({
    /**
        *   Constructor for Keyboard class
        *   @constructs Plugin.Keyboard.KeyboardView
        *   @param {number} numberOfColumns number of columns
        *   @param {array} keys array containing keys for keyboard
        */
    init: function () {
        var keyBoardArea = {
            "keyWidth": 10,                         //(MANDATORY) Width of each key(value taken in percentage)
            "keyHeight": 10,                        //(MANDATORY) Height of each key(value taken in percentage)
            "numberOfColumns": 10,                   //(MANDATORY) Number of columns in the keyboard
            keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],      //(MANDATORY) Array of keys
            "xPosition": 0,                         //(MANDATORY) X position of the keyboard(value taken in percentage)
            "yPosition": 80,
            "id": "keypadId",
            "visible": false,
            "controller": "item",
            "embed": {}
        }
        PluginManager.invoke('org.ekstep.plugins.keyboard', keyBoardArea, this._stage, this._stage, this._theme);
    },
})
