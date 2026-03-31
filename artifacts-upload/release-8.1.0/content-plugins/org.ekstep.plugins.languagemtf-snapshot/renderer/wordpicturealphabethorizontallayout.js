/**
 * @class Plugin.LanguageMtf.WordPictureAlphabetHorizontalLayout
 */
Plugin.LanguageMtf.WordPictureAlphabetHorizontalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[0]["image"] = {
            "model": "option.value.imageAsset",
            "w": 90,
            "x": 3,
            "h": 35,
            "y": 3
        };
        mtfObj.mtf.options[0]["shape"].push({
            "fill": "#000",
            "opacity": 0.5,
            "h": 13,
            "type": "rect",
            "w": 96,
            "x": 2,
            "y": 25,
            "z-index": 10
        });
        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#fff",
            "fontsize": "2.5vw",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": 100,
            "x": 0,
            "y": 27,
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
            "w": "100",
            "x": "0",
            "y": "20"
        }
        return mtfObj;
    }

})
