org.ekstep.plugins.WordCard.Layout = Class.extend({
    /**
     * @memberof org.ekstep.plugins.WordCard.Layout#
     * @member {object} _defaultTextProperty default text properties
     */
    _defaultTextProperty: undefined,

    /**
     * @memberof org.ekstep.plugins.WordCard.Layout#
     * @member {object} _defaultImageProperty default image properties
     */
    _defaultImageProperty: undefined,

    /**
     * @memberof org.ekstep.plugins.WordCard.Layout#
     * @member {object} _defaultShapeProperty default shape properties
     */
    _defaultShapeProperty: undefined,

    /**
     * Layout provides word card plugin layout
     * @constructs org.ekstep.plugins.WordCard.Layout
     */
    init: function() {
        this._defaultTextProperty = {
            "x": 10,
            "y": 10,
            "fontFamily": "NotoSans",
            "fontSize": 18,
            "minWidth": 20,
            "w": 89,
            "h": 10,
            "maxWidth": 500,
            "align": "left",
            "fill": "#000000",
            "fontStyle": "normal",
            "weight": "normal",
            "stroke": "rgba(255, 255, 255, 0)",
            "strokeWidth": 1,
            "opacity": 1,
            "editable": false,
            "valign": "middle"
        };
        this._defaultImageProperty = {
            "x": 10,
            "y": 10,
            "h": 9,
            "w": 16,
            "stretch": false,
            "from": "plugin",
            "asset": "",
            "assetMedia": {}
        };
        this._defaultShapeProperty = {
            "type": "roundrect",
            "x": 10,
            "y": 10,
            "fill": "#FFFFFF",
            "w": 20,
            "h": 20,
            "radius": 18,
            "stroke": "rgba(255, 255, 255, 0)",
            "strokeWidth": 1,
            "opacity": 1
        };
    },

    /**
     * Retruns the layout for word card
     * @memberof org.ekstep.plugins.WordCard.Layout#
     * @returns  {object} layout- layout of wordcard
     *
     */
    getLayout: function() {
        return {
            cardBackgroundShape: this._merge(this._defaultShapeProperty, { x: 10, y: 10, w: 80, h: 80, stroke: "rgba(0, 0, 0, 0.5)", radius: 5, shadow: "#888888" }),
            imageAltTextBorderShape: this._merge(this._defaultShapeProperty, { x: 15, y: 18, w: 25, h: 43, stroke: "rgba(0, 0, 0, 0.5)", radius: 5 }),
            wordBackgroundShape: this._merge(this._defaultShapeProperty, { x: 15, y: 67, w: 25, h: 12, fill: "#e8405f", shadow: "#888888" }),
            wordAudioIcon: this._merge(this._defaultImageProperty, { x: 34.7, y: 69, w: 4.5, h: 8, stretch: false }),
            translation: {
                two: [{
                    text: this._merge(this._defaultTextProperty, { x: 44, y: 71, w: 17, h: 9, fill: "#ffffff", align: "center", fontSize: 16, weight: "bold", color: "#ffffff" }),
                    shape: this._merge(this._defaultShapeProperty, { x: 44, y: 68, w: 17, h: 9, fill: "#9563a9", shadow: "#888888" }),
                    language: this._merge(this._defaultTextProperty, { x: 44, y: 63, w: 17, h: 9, fill: "#222222", align: "center", fontSize: 12 }),
                    audioIcon: this._merge(this._defaultImageProperty, { x: 55, y: 69, w: 4.5, h: 8, stretch: false }),
                }, {
                    text: this._merge(this._defaultTextProperty, { x: 66, y: 71, w: 17, h: 9, fill: "#ffffff", align: "center", fontSize: 16, weight: "bold", color: "#ffffff" }),
                    shape: this._merge(this._defaultShapeProperty, { x: 66, y: 68, w: 17, h: 9, fill: "#9563a9", shadow: "#888888" }),
                    language: this._merge(this._defaultTextProperty, { x: 66, y: 63, w: 17, h: 9, fill: "#222222", align: "center", fontSize: 12 }),
                    audioIcon: this._merge(this._defaultImageProperty, { x: 77, y: 69, w: 4.5, h: 8, stretch: false }),
                }],
                four: [{
                    text: this._merge(this._defaultTextProperty, { x: 44, y: 62, w: 17, h: 9, fill: "#ffffff", align: "center", fontSize: 16, weight: "bold", color: "#ffffff" }),
                    shape: this._merge(this._defaultShapeProperty, { x: 44, y: 59, w: 17, h: 9, fill: "#9563a9", shadow: "#888888" }),
                    language: this._merge(this._defaultTextProperty, { x: 44, y: 55, w: 17, h: 9, fill: "#222222", align: "center", fontSize: 12 }),
                    audioIcon: this._merge(this._defaultImageProperty, { x: 55, y: 60, w: 4.5, h: 8, stretch: false }),
                }, {
                    text: this._merge(this._defaultTextProperty, { x: 66, y: 62, w: 17, h: 9, fill: "#ffffff", align: "center", fontSize: 16, weight: "bold", color: "#ffffff" }),
                    shape: this._merge(this._defaultShapeProperty, { x: 66, y: 59, w: 17, h: 9, fill: "#9563a9", shadow: "#888888" }),
                    language: this._merge(this._defaultTextProperty, { x: 66, y: 55, w: 17, h: 9, fill: "#222222", align: "center", fontSize: 12 }),
                    audioIcon: this._merge(this._defaultImageProperty, { x: 77, y: 60, w: 4.5, h: 8, stretch: false }),
                }, {
                    text: this._merge(this._defaultTextProperty, { x: 44, y: 78, w: 17, h: 9, fill: "#ffffff", align: "center", fontSize: 16, weight: "bold", color: "#ffffff" }),
                    shape: this._merge(this._defaultShapeProperty, { x: 44, y: 75, w: 17, h: 9, fill: "#9563a9", shadow: "#888888" }),
                    language: this._merge(this._defaultTextProperty, { x: 44, y: 71, w: 17, h: 9, fill: "#222222", align: "center", fontSize: 12 }),
                    audioIcon: this._merge(this._defaultImageProperty, { x: 55, y: 76, w: 4.5, h: 8, stretch: false }),
                }, {
                    text: this._merge(this._defaultTextProperty, { x: 66, y: 78, w: 17, h: 9, fill: "#ffffff", align: "center", fontSize: 16, weight: "bold", color: "#ffffff" }),
                    shape: this._merge(this._defaultShapeProperty, { x: 66, y: 75, w: 17, h: 9, fill: "#9563a9", shadow: "#888888" }),
                    language: this._merge(this._defaultTextProperty, { x: 66, y: 71, w: 17, h: 9, fill: "#222222", align: "center", fontSize: 12 }),
                    audioIcon: this._merge(this._defaultImageProperty, { x: 77, y: 76, w: 4.5, h: 8, stretch: false }),
                }]
            },
            example: [this._merge(this._defaultTextProperty, { x: 44, y: 40, w: 43, h: 5, fontSize: 18 }), this._merge(this._defaultTextProperty, { x: 44, y: 44, w: 43, h: 5, fontSize: 18 })],
            image: this._merge(this._defaultImageProperty, { x: 18, y: 18.5, w: 20, h: 43, stretch: false }),
            wordTextOne: this._merge(this._defaultTextProperty, { x: 15, y: 70, w: 24, h: 12, fontSize: 25, weight: "bold", align: "center", fill: "#ffffff", color: "#ffffff", valign: "middle" }),
            wordTextTwo: this._merge(this._defaultTextProperty, { x: 44, y: 18, w: 43, h: 5, fontSize: 22 }),
            meaning: this._merge(this._defaultTextProperty, { x: 44, y: 25, w: 43, h: 10, fontSize: 18 })
        }
    },

    /**
     * Merges two given object and retruns a new object
     * @memberof org.ekstep.plugins.WordCard.Layout#
     * @param {object} defaults defaults property
     * @param {object} overrides overrides property
     * @returns  {object} object- single object merged with defaults and overrides
     */
    _merge: function(defaults, overrides) {
        var _ = ecEditor._;
        return _.extend({}, defaults, overrides);
    }

});
//# sourceURL=WordcardPluginWordCardLayout.js
