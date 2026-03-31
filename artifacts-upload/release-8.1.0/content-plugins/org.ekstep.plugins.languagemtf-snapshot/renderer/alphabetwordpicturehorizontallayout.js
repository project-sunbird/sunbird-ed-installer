/**
 * @class Plugin.LanguageMtf.AlphabetWordPictureHorizontalLayout
 */
Plugin.LanguageMtf.AlphabetWordPictureHorizontalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[1]["image"] = {
            "model": "option.value.imageAsset",
            "w": 95,
            "x": 2.5,
            "h": 84,
            "y": 7
        };
        mtfObj.mtf.options[1]["shape"].push({
            "fill": "#000",
            "opacity": 0.5,
            "h": 33,
            "type": "rect",
            "w": 95,
            "x": 2.5,
            "y": 62,
            "z-index": 10
        });
        mtfObj.mtf.options[1]["text"] = {
            "align": "center",
            "color": "#fff",
            "fontsize": "2.5vw",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": 100,
            "x": 0,
            "y": 72,
            "h": 0,
            "z-index": 15
        }

        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "3em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.firstAlphabet",
            "w": "100",
            "x": "0",
            "y": "8"
        }
        return mtfObj;
    }

})
