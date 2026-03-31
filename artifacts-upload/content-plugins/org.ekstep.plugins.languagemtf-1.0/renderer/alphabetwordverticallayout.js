/**
 * @class Plugin.LanguageMtf.AlphabetWordVerticalLayout
 */
Plugin.LanguageMtf.AlphabetWordVerticalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[1]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "2em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": "100",
            "x": "0",
            "y": "30"
        }

        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "3em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.firstAlphabet",
            "w": "45",
            "x": "0",
            "y": "20"
        }
        return mtfObj;
    }

})
