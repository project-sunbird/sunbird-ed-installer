//@ sourceURL=ftFibBasePlugin.js
/**
 * Base plugin for all FIB based renderer plugins
 * Handles keyboard rendering. For this reason, this plugin sets the content container
 * to have 59% height to accommodate the keyboard.
 * 
 * This plugin also handles showing and hiding the keyboard - a functionality shared by
 * all FIB blank plugins.
 * 
 * @extends ftBasePlugin
 * @author Henrietta (henrietta.d@funtoot.com)
 */
org.ekstep.funtoot.ftPlugin.extend({
    _type: "ftFibBasePlugin",
    initPlugin: function (data) {
        this._super(data);
        if (!data.isSolution) {
            var keyBoardArea = {
                "id": "keypadId",
                "x": 10,
                "y": 80,
                "w": 80,
                "h": 20,
                "limit": 8,
                "visible": false,
                "controller": "item",
                "embed": {}
            }
            PluginManager.invoke('nkeyboard', keyBoardArea, this._stage, this._stage, this._theme);
        }
        this._self.on('showKeyboard', this.onShowKeyboard);
        this._self.on('hideKeyboard', this.onHideKeyboard);
        this._self.on('setFocus', this.setFocus);
    },

    /**
     * adds the content container to the canvas
     * overrides the ftBasePlugin.addContentContainer
     * @param {object} data the data for the plugin
     */
    addContentContainer: function (data) {
        var superContainer = PluginManager.getPluginObject(this._ftSuperContentContainerId);
        var containerData = {
            id: this._ftContentContainerId,
            x: 0,
            y: 21,
            w: 100,
            h: 59
        };
        PluginManager.invoke('g', containerData, superContainer, this._stage, this._theme);
    },
    /**
     * displays the keyboard
     */
    onShowKeyboard: function (evt) {
        var keyboardObj = PluginManager.getPluginObject("keypadId");
        keyboardObj._self.visible = true;
        var event = new createjs.Event('setFocus');
        event.boxId = evt.boxId;
        event.previousTarget = keyboardObj.target || null;
        this.dispatchEvent(event);
        keyboardObj.target = evt.boxId;
        PluginManager.getPluginObject('keypadId').switchTarget({ id: evt.id.toString() });
        Renderer.update = true;
    },
    /**
     * hides the keyboard
     */
    onHideKeyboard: function (evt) {
        var keyboardObj = PluginManager.getPluginObject("keypadId");
        keyboardObj._self.visible = false;
        var event = new createjs.Event('setFocus');
        event.previousTarget = keyboardObj.target || null;
        this.dispatchEvent(event);
        Renderer.update = true;
    },
    /**
     * manages focus on the FIB blank objects on the canvas
     */
    setFocus: function (evt) {
        if (evt.previousTarget) {
            var fibObj = PluginManager.getPluginObject(evt.previousTarget);
            if (fibObj._data.state == "selected")
                fibObj.changeState("deselected");
        }
        if (evt.boxId) {
            var fibObj = PluginManager.getPluginObject(evt.boxId);
            fibObj.changeState("selected");
        }
    }
});
