/**
 * @class Plugin.LanguageMtf.PictureWordHorizontalLayout
 */
Plugin.LanguageMtf.PictureWordHorizontalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[0]["image"] = {
            "model": "option.value.imageAsset",
            "w": 90,
            "x": 5,
            "h": 30,
            "y": 5
        };

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
        return mtfObj;
    }

})
