/* global PluginManager */
Plugin.extend({
    /**
        *   Constructor for Keyboard class
        *   @constructs Plugin.Keyboard.KeyboardView
        *   @param {number} numberOfColumns number of columns
        *   @param {array} keys array containing keys for keyboard
        */
    _type: 'org.ekstep.plugins.defaultkeyboardadapter',
    _isContainer: false,
    _render: true,
    target: '',
    keysObj: {},
    initPlugin: function (data) {
        this.keyBoardArea = {
            "keyWidth": 10,        //(MANDATORY) Width of each key(value taken in percentage)
            "keyHeight": 10,        //(MANDATORY) Height of each key(value taken in percentage)
            "numberOfColumns": 7,    //(MANDATORY) Number of columns in the keyboard
            "xPosition": 20, //(MANDATORY) X position of the keyboard(value taken in percentage)
            "yPosition": 80,
            "id": "keypadId",
            "visible": false,
            "controller": "item",
            "embed": {}
        };
        var instance = this;
        keysObj = this.getNumberKeys();
        instance.keyBoardArea.keys = keysObj;
        this._blanks = data.blanks;
        instance.keyBoardArea.callBack = [instance.numKeyCallback];
        instance.keyBoardArea.adapterInstance = instance;
        PluginManager.invoke('keyboard', instance.keyBoardArea, this._stage, this._stage, this._theme);
    },
    getNumberKeys: function () {
        var keysObj = {
            '1': { "fv": "1", "cmd": "write", "value": "1" },
            '2': { "fv": "2", "cmd": "write", "value": "2" },
            '3': { "fv": "3", "cmd": "write", "value": "3" },
            '4': { "fv": "4", "cmd": "write", "value": "4" },
            '5': { "fv": "5", "cmd": "write", "value": "5" },
            '6': { "fv": "6", "cmd": "write", "value": "6" },
            '7': { "fv": "7", "cmd": "write", "value": "7" },
            '8': { "fv": "8", "cmd": "write", "value": "8" },
            '9': { "fv": "9", "cmd": "write", "value": "9" },
            '0': { "fv": "0", "cmd": "write", "value": "0" },
            '.': { "fv": ".", "cmd": "write", "value": "." },
            '\u2215': { "fv": 'a/b', "cmd": "cmd", "value": "\\frac" },
            'del': { "fv": "\u232B", "cmd": "keystroke", "value": "Backspace" },
        };
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var langId = i18n.config.numericLangId;
        var translatedNums = i18n.getNumbers(langId);
        for (var k = 0; k < 10; k++) {
            keysObj[k.toString()].fv = translatedNums[k].toString();
            keysObj[k.toString()].value = translatedNums[k].toString();
        }
        return keysObj;
    },
    getSymbolKeys: function () {
        var keysObj = {
            '\u2190': { "fv": '\u2190', "cmd": "keystroke", "value": "Left" },
            '\u2215': { "fv": '\u2215', "cmd": "cmd", "value": "\\frac" },
            '\u2192': { "fv": '\u2192', "cmd": "keystroke", "value": "Right" },
        }
        return keysObj;
    },
    numKeyCallback: function (keyObj, adapterInstance) {
        var targetBlank = adapterInstance._blanks[target];
        //  var keyObj = keysObj[key];
        if (keyObj.cmd == 'keystroke')
            targetBlank.keystroke(keyObj.value);
        else if (keyObj.cmd == 'cmd')
            targetBlank.command(keyObj.value);
        else if (keyObj.cmd == 'write')
            targetBlank.write(keyObj.fv);
        else if (keyObj.cmd == 'change')
            this.changeKeys();
    },
    switchTarget: function (action) {
        target = action;
        this.onShowKeyboard();
        _.each(this._blanks, function (blank) {
            if (blank.blankId != target) blank.blur();
            else blank.focus();
        })
    },
    onShowKeyboard: function () {
        var keyboard = PluginManager.getPluginObject('keypadId');
        keyboard.onShowKeyboard();
    },
    registerEvents: function () {
        _.each(this._blanks, function (blank) {
            blank.registerEvents();
        })
    }
})
//# sourceURL=keyboardPluginAdapter.js