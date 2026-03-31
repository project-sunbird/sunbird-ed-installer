/**
 * @class Plugin.LanguageMtf.WordAudioVerticalLayout
 */
Plugin.LanguageMtf.WordAudioVerticalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[1]["event"] = {
            "type": "click",
            "action": {
                "type": "command",
                "command": "play",
                "asset_model": "option.value.audioAsset"
            }
        }
        mtfObj.mtf.options[1]["image"] = {
            "asset": "audioImage",
            "w": 50,
            "x": 25,
            "h": 70,
            "y": 15
        }
        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "2em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.text",
            "w": "45",
            "x": "0",
            "y": "30"
        }
        return mtfObj;
    }

})
