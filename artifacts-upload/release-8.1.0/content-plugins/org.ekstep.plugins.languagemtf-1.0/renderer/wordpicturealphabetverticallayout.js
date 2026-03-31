/**
 * @class Plugin.LanguageMtf.WordPictureAlphabetVerticalLayout
 */
Plugin.LanguageMtf.WordPictureAlphabetVerticalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[0]["image"] = {
            "model": "option.value.imageAsset",
            "w": 38,
            "x": 2.5,
            "h": 84,
            "y": 7,

        };
        mtfObj.mtf.options[0]["shape"].push({
            "fill": "#000",
            "opacity": 0.5,
            "h": 32,
            "type": "rect",
            "w": 42,
            "x": 1,
            "y": 65,
            "z-index": 10
        });
        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#fff",
            "fontsize": "2.5vw",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": 40,
            "x": 0,
            "y": 73,
            "h": 0,
            "z-index": 15
        }
        mtfObj.mtf.options[1]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "3em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.firstAlphabet",
            "w": "80",
            "x": "10",
            "y": "20"
        }
        return mtfObj;
    }

})
