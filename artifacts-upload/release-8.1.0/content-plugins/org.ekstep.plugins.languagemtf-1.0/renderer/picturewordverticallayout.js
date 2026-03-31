/**
 * @class Plugin.LanguageMtf.PictureWordVerticalLayout
 */
Plugin.LanguageMtf.PictureWordVerticalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[0]["image"] = {
            "model": "option.value.imageAsset",
            "w": 40,
            "x": 2.5,
            "h": 84,
            "y": 7
        };

        mtfObj.mtf.options[1]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "1em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": "80",
            "x": "10",
            "y": "35"
        }
        return mtfObj;
    }

});
