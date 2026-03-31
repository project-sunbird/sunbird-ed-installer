# i18n (Internationalization) plugin

This plugin provides simple i18n functionality. 

**Please Note:** *This plugin does not perform any translation itself. It only provides a way to organize the multilingual resources and helps access them programmatically so as to enable multilingual user interface*

## Usage

1. Add this plugin as dependency in `"renderer"` section of `manifest.json`
```
"renderer": {
   "dependencies": [
       { "type": "plugin", "plugin": "org.ekstep.plugins.i18n", "ver": "1.0" }
   ]
```
2. Invoke the plugin. Somewhere in your initPlugin() function, invoke the i18n plugin, by passing the required data to it. 
```
    var i18nData = {
        "mr":{
            "HOW_ARE_YOU":"तू कसा आहेस"
        }
    }
    var pluginData = {
        id: "i18n",
        config: {
            langId: 'mr', 
            numericLangId: 'mr' 
        },
        data: i18nData
    };
    PluginManager.invoke('org.ekstep.plugins.i18n', pluginData, this, this._stage, this._theme);
```
3. Wait for the plugin to get loaded and initialized fully. This is **required** if you are attempting to invoke the i18n plugin and use it to translate text inside `initPlugin()` function of your plugin. 
```
    // get hold of the i18n plugin object
    var i18n = PluginManager.getPluginObject('i18n);
    
    i18n.onReady().then(function (o) {
        var text = o.translate("HOW_ARE_YOU");
        // Use the translated text here
        console.log('Translated text', text);
    }).catch(function (error) {
        console.error(error);
    });
```
4. Translate text using i18n plugin
```
    var text = i18n.translate("HOW_ARE_YOU");
```
Refer [Polyglot documentation](https://github.com/airbnb/polyglot.js#translation) for more information on translation and interpolation

## Translation of Numbers

Numbers (1,2,3...) can also be translated to language specific numberal representation. This plugin supports the following languages as of 1.0 version.
- en - English
- kn - Kannada
- as - Assamese
- bn - Bengali
- gu - Gujarati
- hi - Hindi
- mr - Marathi
- or - Oriya
- ta - Tamil
- te - Telugu

1. Translate numbers to the one of the supported languages
```
    var numbers = [12, 23, 45];
    var translated = i18n.translateNumber(numbers, 'mr');
    console.log("translated numbers", translated)

    var number = 12345;
    var translated = i18n.translateNumber(number, 'mr');
    console.log("translated number", translated)
```

2. Convert an Unicode to its numeric representation. Sometimes, it is required to convert a unicode version of a language specific numeral representation into a JavaScript number.
```
    var strNum = '१२३';
    var num = i18n.toNumber(strNum);
    console.log("number", num);
    // 123
```

3. Convert a number into its number name (currently supported only in 'en')
```
    var name = i18n.toNumberName(123, "en-IN");
    console.log("number name", name);
    // One hundred twenty
    name = i18n.toNumberName(12345678, "en-US");
    console.log("number name", name);
    // twelve million three hundred forty five thousand six hundred seventy eight
```
### Development

Please refer to [wiki](https://github.com/ekstep/Contributed-Plugins/wiki) for plugin developement guidelines


