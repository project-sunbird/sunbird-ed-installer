/**
 * @class Plugin.LanguageMtf.PictureAlphabetHorizontalLayout
 */
Plugin.LanguageMtf.PictureAlphabetHorizontalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[1]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "3em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.firstAlphabet",
            "w": "100",
            "x": "0",
            "y": "20"
        }

        mtfObj.mtf.options[0]["image"] = {
            "model": "option.value.imageAsset",
            "w": 90,
            "x": 5,
            "h": 30,
            "y": 5

        };
        return mtfObj;
    }

})
