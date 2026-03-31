/**
 * @class Plugin.LanguageMtf.AudioAlphabetHorizontalLayout
 */
Plugin.LanguageMtf.AudioAlphabetHorizontalLayout = Class.extend({

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
            "w": 40,
            "x": 30,
            "h": 30,
            "y": 5
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
