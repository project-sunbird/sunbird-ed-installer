//@ sourceURL=ftI18n.js
/**
 * Common plugin for internationalization (i18n)
 * @extends Plugin
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
    _type: 'ftI18n',
    _defaultLangId: "en",
    _unicodeMap: {
        'en': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        'kn': ['\u0CE6', '\u0CE7', '\u0CE8', '\u0CE9', '\u0CEA', '\u0CEB', '\u0CEC', '\u0CED', '\u0CEE', '\u0CEF'],
        'as': ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'],
        'bn': ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'],
        'gu': ['\u0AE6', '\u0AE7', '\u0AE8', '\u0AE9', '\u0AEA', '\u0AEB', '\u0AEC', '\u0AED', '\u0AEE', '\u0AEF'],
        'hi': ['\u0966', '\u0967', '\u0968', '\u0969', '\u096A', '\u096B', '\u096C', '\u096D', '\u096E', '\u096F'],
        'mr': ['\u0966', '\u0967', '\u0968', '\u0969', '\u096A', '\u096B', '\u096C', '\u096D', '\u096E', '\u096F'],
        'or': ['\u0B66', '\u0B67', '\u0B68', '\u0B69', '\u0B6A', '\u0B6B', '\u0B6C', '\u0B6D', '\u0B6E', '\u0B6F'],
        'ta': ['\u0BE6', '\u0BE7', '\u0BE8', '\u0BE9', '\u0BEA', '\u0BEB', '\u0BEC', '\u0BED', '\u0BEE', '\u0BEF'],
        'te': ['\u0C66', '\u0C67', '\u0C68', '\u0C69', '\u0C6A', '\u0C6B', '\u0C6C', '\u0C6D', '\u0C6E', '\u0C6F']
    },
    /**
     * initializes the plugin
     * @param {object} data the data for the plugin
     */
    initPlugin: function (data) {
        // save the data in the instance
        this.data = data.data;
        this.config = data.config;
        // polyglot may not get loaded as it is loaded as a "js" resource.
        this.onReady().then(function () {
            console.log('Polyglot is ready');
        });
    },

    /**
     * waits and loads Polyglot and 
     */
    onReady: function () {
        var inst = this;
        inst.pollingRemaining = 100;
        return new Promise(function (resolve, reject) {
            if (!window.Polyglot) {
                var pgPoll = setInterval((function () {
                    inst.pollingRemaining--;
                    if (!inst.pollingRemaining === 0)
                        reject('Polyglot failed to load');
                    if (!_.isUndefined(window.Polyglot)) {
                        inst._polyglot = new Polyglot({
                            phrases: inst.data[inst.config.langId],
                            locale: inst.config.langId
                        });
                        clearInterval(pgPoll);
                        resolve(inst);
                    }
                    else
                        console.log('Polyglot is not loaded yet! Polling remaining', inst.pollingRemaining)
                }).bind(inst), 100);
            }
            else {
                if (!_.isUndefined(window.Polyglot)) {
                    inst._polyglot = new Polyglot({
                        phrases: inst.data[inst.config.langId],
                        locale: inst.config.langId
                    });
                }
                resolve(inst);
            }
        });
    },

    /**
     * returns the string for the specified id. 
     * Use the `options` object for interpolation
     */
    translate: function (id, options) {
        return this._polyglot.t(id, options);
    },

    /**
     * translate a given number/array of numbers to the specified language
     */
    translateNumber: function (number, langId) {
        var inst = this;
        if (_.isArray(number)) {
            var result = [];
            _.each(number, function (n) {
                result.push(inst.getTranslatedValue(n, langId))
            });
        }
        else {
            var result = this.getTranslatedValue(number, langId);
        }
        return result;
    },

    /**
     * given an number, builds an object with display value, numerical value and audio 
     * object ={ 
     *          audio:null
     *          displayValue:"८" //Hindi
     *          numericalValue:8
     *          }
     */
    getTranslatedValue: function (number, langId) {
        //Check if its really a number
        if (isFinite(number)) {
            var langId = langId || this.config.numericLangId || this.config.langId || this._defaultLangId;

            // if langId is not found return arabic numbers 
            if (!(langId in this._unicodeMap))
                langId = this._defaultLangId;

            //var n = Number(number);// convert to number if its in string format
            var numStr = number.toString();
            var translatedNum = "";
            for (var i = 0; i < numStr.length; i++) {
                translatedNum = translatedNum + this._unicodeMap[langId][parseInt(numStr[i])];
            }
            return {
                numericalValue: Number(number),
                displayValue: translatedNum,
                audio: null
            };
        }
        else
            throw "Not a number - Please provide number"

    },
    /**
     * takes unicode string as input and returns number
     */
    toNumber: function (unicode, langId) {
        var langId = langId || this.config.numericLangId || this.config.langId || this._defaultLangId;
        // if langId is not found return arabic numbers 
        if (!(langId in this._unicodeMap))
            langId = this._defaultLangId;

        var number = "";
        for (var i = 0; i < unicode.length; i++) {
            number += _.indexOf(this._unicodeMap[langId], unicode[i]);
        }
        return Number(number);
    },

    /**
     * Converts a given number to number name
     * @param number - given number 
     * @param numberSystemType either 'en-IN'(Indian) or 'en-US'(International) 
     * default numberSystemType is 'en-IN'
     */
    toNumberName: function (number, numberSystemType) {
        //Check if its really a number
        if (isFinite(number)) {
            var type = numberSystemType || 'en-IN';
            if ((number.toString().length < 10 && type == 'en-IN') || (number.toString().length < 13 && type == 'en-US')) {
                var tens = {
                    10: "Ten", 11: "Eleven", 12: "Twelve", 13: "Thirteen", 14: "Fourteen", 15: "Fifteen", 16: "Sixteen", 17: "Seventeen", 18: "Eighteen", 19: "Nineteen", 20: "Twenty", 30: "Thirty", 40: "Forty", 50: "Fifty", 60: "Sixty", 70: "Seventy", 80: "Eighty", 90: "Ninety"
                };
                var ones = {
                    0: "Zero", 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine"
                };
                var indianPlaceValues = ["", " thousand", " lakh", " crore"];
                var internationalPlaceValues = ["", " thousand", " million", " billion"];
                var type = numberSystemType || 'en-IN';
                var number = Number(number).toLocaleString(type);
                var placeValues = type == 'en-IN' ? indianPlaceValues : internationalPlaceValues;
                var tokens = number.split(',').reverse();
                var convertedWords = [];
                for (var i = 0; i < tokens.length; i++) {
                    // converting to number removes any leading zeros.
                    var token = Number(tokens[i]).toString();
                    var word = "";
                    if (token.length == 0)
                        word = String.Empty;
                    else if (token.length == 1)
                        word = ones[token];
                    else if (token.length == 2) {
                        word = tens[token];
                        if (!word) {
                            var digit = token;
                            if (Number(token) > 0) {
                                word = ((tens[digit.toString().substring(0, 1) + "0"]) || "") + " " + ones[digit.toString().substring(1)];
                            }
                            else
                                word = "";
                        }
                    }
                    else {
                        var tensPlace = tens[token.substring(1, 3)];
                        if (!tensPlace) {
                            var digit = token.substring(1, 3);
                            if (Number(token.substring(1, 3)) > 0) {
                                tensPlace = ((tens[digit.toString().substring(0, 1) + "0"]) || "") + " " + ones[digit.toString().substring(1)];
                            }
                            else
                                tensPlace = "";
                        }
                        word = ones[token.substring(0, 1)] + " hundred " + tensPlace;
                    }
                    if (word)
                        convertedWords.push(word + placeValues[i]);
                }
                convertedWords = convertedWords.reverse().join(" ");
                console.log(convertedWords);
                return convertedWords;
            }
            else
                throw "Number not in range - Please provide a number within 99 crores or 999 billion"
        }
        else
            throw "Not a number - Please provide number"
    },
    /**
     * @param langId - language id
     * returns numbers (0-9) in specified language
     */
    getNumbers: function (langId) {
        return this._unicodeMap[langId];
    },
});
