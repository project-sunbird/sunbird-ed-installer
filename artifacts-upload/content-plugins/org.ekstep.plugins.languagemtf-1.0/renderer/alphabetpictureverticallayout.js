/**
 * @class Plugin.LanguageMtf.AlphabetPictureVerticalLayout
 */
Plugin.LanguageMtf.AlphabetPictureVerticalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[1]["image"] = {
            "model": "option.value.imageAsset",
            "w": 95,
            "x": 2.5,
            "h": 84,
            "y": 7

        };
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
