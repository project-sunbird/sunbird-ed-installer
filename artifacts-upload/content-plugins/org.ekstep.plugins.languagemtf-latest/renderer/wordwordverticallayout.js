/**
 * @class Plugin.LanguageMtf.WordWordVerticalLayout
 */
 /* istanbul ignore next: init plugin */
Plugin.LanguageMtf.WordWordVerticalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[1]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "1em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.rel_text",
            "w": "100",
            "x": "0",
            "y": "40"
        }

        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "1em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": "45",
            "x": "0",
            "y": "35"
        }
        return mtfObj;
    }

})
