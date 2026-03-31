/**
 * @class Plugin.LanguageMtf.WordPictureWordPictureHorizontalLayout
 */
  /* istanbul ignore next: init plugin */
Plugin.LanguageMtf.WordPictureWordPictureHorizontalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[0]["image"] = {
            "model": "option.value.imageAsset",
            "w": 90,
            "x": 5,
            "h": 24,
            "y": 3
        };
        mtfObj.mtf.options[0]["shape"].push({
            "fill": "#000",
            "opacity": 0.5,
            "h": 8,
            "type": "rect",
            "w": 90,
            "x": 5,
            "y": 19,
            "z-index": 10
        });
        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#fff",
            "fontsize": "2vw",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": 100,
            "x": 0,
            "y": 21,
            "h": 0,
            "z-index": 15
        }

        mtfObj.mtf.options[1]["image"] = {
            "model": "option.value.rel_imageAsset",
            "w": 95,
            "x": 2.5,
            "h": 87,
            "y": 5
        };
        mtfObj.mtf.options[1]["shape"].push({
            "fill": "#000",
            "opacity": 0.5,
            "h": 30,
            "type": "rect",
            "w": 95,
            "x": 2.5,
            "y": 62,
            "z-index": 10
        });
        mtfObj.mtf.options[1]["text"] = {
            "align": "center",
            "color": "#fff",
            "fontsize": "2vw",
            "lineHeight": "1.4",
            "model": "option.value.rel_text",
            "w": 100,
            "x": 0,
            "y": 72,
            "h": 0,
            "z-index": 15
        }
        return mtfObj;
    }

})
