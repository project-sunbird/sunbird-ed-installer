/**
 * @class Plugin.LanguageMtf.AlphabetAudioVerticalLayout
 */
Plugin.LanguageMtf.AlphabetAudioVerticalLayout = Class.extend({

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
            "w": 40,
            "x": 30,
            "h": 60,
            "y": 20
        }
        mtfObj.mtf.options[0]["text"] = {
            "align": "center",
            "color": "#000",
            "fontsize": "3em",
            "weight": "bold",
            "lineHeight": "1.4",
            "model": "option.value.firstAlphabet",
            "w": "45",
            "x": "0",
            "y": "20"
        }
        return mtfObj;
    }

})
