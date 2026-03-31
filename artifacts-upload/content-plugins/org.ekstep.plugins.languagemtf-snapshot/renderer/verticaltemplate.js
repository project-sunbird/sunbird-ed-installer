/**
 * @class Plugin.LanguageMtf.VerticalMtfLayout
 */
Plugin.LanguageMtf.VerticalMtfLayout = Class.extend({

    getTemplateLayout: function() {

        var mtfObj = {
            "id": "org.ekstep.languageMtf.template",
            "image": { "x": "-15", "y": "-15", "h": "142", "w": "130", "asset": "languagemtf_patternfill_img" },
            "mtf": {
                "model": "item",
                "options": [{
                    "cols": 1,
                    "h": 100,
                    "layout": "table",
                    "marginX": 5,
                    "marginY": 5,
                    "options": "lhs_options",
                    "w": 60,
                    "x": 0,
                    "y": 0,
                    "snapX": 59.3,
                    "snapY": 0,
                    "shape": [{
                        "fill": "#fff",
                        "h": 100,
                        "stroke": "#fff",
                        "type": "roundrect",
                        "radius": 3,
                        "w": 44,
                        "x": 0,
                        "y": 0
                    }, {
                        "fill": "#fff",
                        "h": 15,
                        "type": "rect",
                        "w": 15,
                        "x": 44,
                        "y": 45
                    }, {
                        "fill": "#fff",
                        "h": 100,
                        "stroke": "#fff",
                        "type": "roundrect",
                        "radius": 3,
                        "w": 44,
                        "x": 59,
                        "y": 0
                    },{
                        "h": 100,
                        "stroke": "#fff",
                        "stroke-width" : 2,
                        "type": "roundrect",
                        "radius": 3,
                        "w": 44,
                        "x": 120,
                        "y": 0
                    }]
                }, {
                    "cols": 1,
                    "h": 100,
                    "layout": "table",
                    "marginX": 5,
                    "marginY": 5,
                    "options": "rhs_options",
                    "w": 26,
                    "x": 72.2,
                    "y": 0,
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
        };
        return mtfObj;
    }

})