/**
 * @class Plugin.LanguageMtf.HorizontalMtfLayout
 */
Plugin.LanguageMtf.HorizontalMtfLayout = Class.extend({

    getTemplateLayout: function() {

        var mtfObj = {
            "id": "org.ekstep.languageMtf.template",
            "image": { "x": "-15", "y": "-15", "h": "142", "w": "130", "asset": "languagemtf_patternfill_img" },
            "mtf": {
                "model": "item",
                "options": [{
                    "cols": 4,
                    "h": 70,
                    "layout": "table",
                    "marginX": 5,
                    "marginY": 5,
                    "options": "lhs_options",
                    "w": 100,
                    "x": 0,
                    "y": 0,
                    "snapX": 0,
                    "snapY": 57,
                    "shape": [{
                        "fill": "#fff",
                        "h": 40,
                        "stroke": "#fff",
                        "type": "roundrect",
                        "radius": 3,
                        "w": 100,
                        "x": 0,
                        "y": 0
                    }, {
                        "fill": "#fff",
                        "h": 27,
                        "stroke": "#fff",
                        "type": "rect",
                        "w": 10,
                        "x": 45,
                        "y": 30
                    }, {
                        "fill": "#fff",
                        "h": 40,
                        "stroke": "#fff",
                        "type": "roundrect",
                        "radius": 3,
                        "w": 100,
                        "x": 0,
                        "y": 57
                    },{
                        "h": 40,
                        "stroke": "#fff",
                        "stroke-width" : 2,
                        "type": "roundrect",
                        "radius": 3,
                        "w": 100,
                        "x": 0,
                        "y": 107
                    }]
                }, {
                    "cols": 4,
                    "h": 28,
                    "layout": "table",
                    "marginX": 5,
                    "marginY": 5,
                    "options": "rhs_options",
                    "w": 100,
                    "x": 0,
                    "y": 75,
                    "shape": [{
                        "fill": "#fff",
                        "h": 100,
                        "stroke": "#fff",
                        "type": "roundrect",
                        "radius": 3,
                        "w": 100,
                        "x": 0,
                        "y": 0
                    }]
                }]
            }
        }
        return mtfObj;
    }

})
