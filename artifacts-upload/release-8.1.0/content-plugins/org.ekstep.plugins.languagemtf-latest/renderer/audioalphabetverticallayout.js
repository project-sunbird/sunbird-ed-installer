/**
 * @class Plugin.LanguageMtf.AudioAlphabetVerticalLayout
 */
Plugin.LanguageMtf.AudioAlphabetVerticalLayout = Class.extend({

    getUpdatedLayout: function(mtfObj) {
        mtfObj.mtf.options[0]["event"] = {
            "type": "click",
            "action": {
                "type": "command",
                "command": "play",
                "asset_model": "option.value.audioAsset"
            }
        }
        mtfObj.mtf.options[0]["image"] = {
            "asset": "audioImage",
            "w": 20,
            "x": 12,
            "h": 60,
            "y": 20
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
