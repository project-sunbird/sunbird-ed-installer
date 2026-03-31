/**
 * @class Plugin.LanguageMtf.WordPictureHorizontalLayout
 */
Plugin.LanguageMtf.WordPictureHorizontalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[1]["image"] = {
            "model": "option.value.imageAsset",
            "w": 91,
            "x": 5,
            "h": 84,
            "y": 5
        };

        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "2em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": "100",
            "x": "0",
            "y": "13"
        }
        return mtfObj;
    }

})
