//@ sourceURL=ftPopup.js
/* global PluginManager */
/**
 * Common plugin used by funtoot template renderer plugins to display popup
 * @extends Plugin
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
    _type: 'ftPopup',

    _ftPopupContainerId: "__ft_popup_container__",
    _ftPopupBackdropId: "__ft_popup_backdrop__",
    _ftPopupContentContainerId: "__ft_popup_content_container__",
    _ftPopupContentBorderId: "__ft_popup_content_border__",
    _ftPopupTitleId: "__ft_popup_title__",
    _ftPopupCloseBtnId: "__ft_popup_close_btn__",
    _ftPopupContentId: "__ft_popup_content__",

    initPlugin: function (data) {
        var inst = this;
        //Creating a conatiner on stage for popup
        var container = {
            id: this._ftPopupContainerId,
            w: 100, h: 100, x: 0, y: 0, "z-index": 999
        };
        PluginManager.invoke('g', container, this._stage, this._stage, this._theme);
        var popupContainer = PluginManager.getPluginObject(this._ftPopupContainerId);
        popupContainer._self.on("click", this._onClose, this);

        //Creating backdrop for the popup.
        var backdrop = {
            id: 'popup-backdrop',
            w: 100, h: 100, x: 0, y: 0,
            type: 'rect', fill: '#000000', opacity: 0.5,
        };
        PluginManager.invoke('shape', backdrop, popupContainer, this._stage, this._theme);

        var popupContentContainer = {
            id: this._ftPopupContentContainerId,
            w: data.w || 100, h: data.h || 100, x: data.x || 0, y: data.y || 0
        };
        PluginManager.invoke('g', popupContentContainer, popupContainer, this._stage, this._theme);

        var popupContentContainerObj = PluginManager.getPluginObject(this._ftPopupContentContainerId)
        var popupBorder = {
            id: this._ftPopupContentBorderId,
            w: 100, h: 100, x: 0, y: 0,
            blur: 5, type: 'roundrect', stroke: '#CCCCCC', fill: '#FFFFFF',
            outline: 10, offsetX: -2, offsetY: 3, shadow: '#CCCCCC'
        };
        PluginManager.invoke('shape', popupBorder, popupContentContainerObj, this._stage, this._theme);

        //Creating title for popup
        var popupTitle = {
            id: this._ftPopupTitleId,
            w: 100, h: 15, y: 0, x: 5,
            fontsize: "2.7vw",
            valign: "middle",
            $t: data.title,
            color: "#60BC50",
        }
        PluginManager.invoke('text', popupTitle, popupContentContainerObj, this._stage, this._theme);

        //Creating close button on popup
        var close = {
            id: this._ftPopupCloseBtnId,
            w: 6,
            x: 93.5,
            y: 1,
            asset: "close",
        }
        PluginManager.invoke('image', close, popupContentContainerObj, this._stage, this._theme);
        var closeBtn = PluginManager.getPluginObject(close.id);
        closeBtn._self.on("click", this._onClose, this);

        //Creating popup content container
        if (data.content || data.model) {
            var popupContent = {
                id: this._ftPopupContentId,
                w: 100,
                h: 100,
                x: 0,
                y: 5
            };
            if (typeof (data.content) == "string" || data.model) {
                popupContent = Object.assign(popupContent, {
                    "text": {
                        w: 80,
                        x: 10,
                        y: 20,
                        h: 50,
                        //align:"center",
                        fontsize: "2.5vw",
                        valign: "middle",
                        $t: data.content,
                        model: data.model,
                        color: "#333333",
                    }
                });
            }
            else if (typeof (data.content) == "object") {
                popupContent = Object.assign(popupContent, data.content);
            }
            PluginManager.invoke('g', popupContent, popupContentContainerObj, this._stage, this._theme);
        }
        this.show(data);
    },
    /**
     * handle on close event of popup
     * @param {object} evt the event that triggered the call
     */
    _onClose: function (evt) {
        console.log('_onClose called!');
        //show problem page
        var problemPage = PluginManager.getPluginObject("__ft_content_container__");
        problemPage._self.visible = true;
        Renderer.update = true;
        this.hide();
    },
    /**
     * Show appropriate popup content
     */
    show: function (data) {
        //hide keyboard if displayed
        var keyboardObj = PluginManager.getPluginObject("keypadId");
        if (keyboardObj && keyboardObj._self)
            keyboardObj._self.visible = false;
        var instance = this
        var popupContainer = PluginManager.getPluginObject(this._ftPopupContainerId);
        var childIds = popupContainer._childIds;
        _.each(childIds, function (v, k, a) {
            if (v.endsWith(data.type) || v.endsWith('backdrop')) {
                instance.updateObject(v, true);
            }
        })
        popupContainer._self.visible = true;
        Renderer.update = true;
    },
    /**
     * hide all popups
     */
    hide: function () {
        var instance = this
        var popupContainer = PluginManager.getPluginObject(this._ftPopupContainerId);
        var childIds = popupContainer._childIds;
        _.each(childIds, function (v, k, a) {
            instance.updateObject(v, false);
        })
        popupContainer._self.visible = false;
        Renderer.update = true;
    },
    /**
     * update 'visible' property of the object
     */
    updateObject: function (obj, state) {
        var instance = this;
        var object = PluginManager.getPluginObject(obj);
        object._self.visible = state;
        var childIds = object._childIds;
        _.each(childIds, function (v, k, a) {
            instance.updateObject(v, state);
        });
    }
});