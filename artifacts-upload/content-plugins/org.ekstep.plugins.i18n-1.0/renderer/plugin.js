//@ sourceURL=i18n.js
/* global PluginManager */
Plugin.extend({
    _type: 'org.ekstep.plugins.i18n',
    _isContainer: false,
    _render: true,
    /**
     * The numeral unicode map for different indian languages
     */
    
    _unicodeMap: {
        'en': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'],
        'kn': ['\u0CE6', '\u0CE7', '\u0CE8', '\u0CE9', '\u0CEA', '\u0CEB', '\u0CEC', '\u0CED', '\u0CEE', '\u0CEF', '.'],
        'as': ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF', '.'],
        'bn': ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF', '.'],
        'gu': ['\u0AE6', '\u0AE7', '\u0AE8', '\u0AE9', '\u0AEA', '\u0AEB', '\u0AEC', '\u0AED', '\u0AEE', '\u0AEF', '.'],
        'hi': ['\u0966', '\u0967', '\u0968', '\u0969', '\u096A', '\u096B', '\u096C', '\u096D', '\u096E', '\u096F', '.'],
        'mr': ['\u0966', '\u0967', '\u0968', '\u0969', '\u096A', '\u096B', '\u096C', '\u096D', '\u096E', '\u096F', '.'],
        'or': ['\u0B66', '\u0B67', '\u0B68', '\u0B69', '\u0B6A', '\u0B6B', '\u0B6C', '\u0B6D', '\u0B6E', '\u0B6F', '.'],
        'ta': ['\u0BE6', '\u0BE7', '\u0BE8', '\u0BE9', '\u0BEA', '\u0BEB', '\u0BEC', '\u0BED', '\u0BEE', '\u0BEF', '.'],
        'te': ['\u0C66', '\u0C67', '\u0C68', '\u0C69', '\u0C6A', '\u0C6B', '\u0C6C', '\u0C6D', '\u0C6E', '\u0C6F', '.'],
        'roman': ['\u0049', '\u0056', '\u0058', '\u004C', '\u0043', '\u0044', '\u004D']
    },

    /**
     * initializes the i18n plugin
     * @param {object} data the data for the plugin. The data is usually in the below format
     *
     *   var pluginData = {
     *       id: "i18n",
     *       config: { langId: 'en', numericLangId: 'en' },
     *       data: this._pluginData.i18n // json data with key/value pairs
     *   };
     *   PluginManager.invoke('org.ekstep.plugins.i18n', pluginData, this, this._stage, this._theme);
     *
     * Specify the langId as 'mr' for Marathi, 'te' for Telugu etc.
     */
    initPlugin: function (data) {
        console.log('data', data);
        // save the data in the instance
        this.data = data.data;
        this.config = data.config;
        // polyglot may not get loaded as it is loaded as a "js" resource.
        this.onReady().then(function () {
            console.log('Polyglot is ready');
        });
    },

    /**
     * returns a promise that will resolve when the i18n and its dependencies are
     * fully loaded.
     *
     * This is very useful when the plugin is required to be used in the `initPlugin()` method.
     * To translate any text in the initPlugin() method, do as below
     * <code>
     *  onReady().then(function(data){
     *      var text = i18n.translate(id);
     *      // now display the translated text
     *  });
     *
     * </code>
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
                    } else
                        console.log('Polyglot is not loaded yet! Polling remaining', inst.pollingRemaining)
                }).bind(inst), 100);
            } else {
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
     * traslates and returns the text corresponding to the specified `id`.
     * Use the `options` object for interpolation
     * @param {string} id - the id corresponding to the translated string
     * @param {object} options - the options object with key/values used for interpolation.
     * @see {@link https://github.com/airbnb/polyglot.js#interpolation}
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
        } else {
            var result = this.getTranslatedValue(number, langId);
        }
        return result;
    },

    /**
     * translate a given fraction/array of fractions to the specified language
     */
    translateFraction: function (string, langId) {
        var inst = this;
        var fracToDecimal = []

        if (_.isArray(string)) {
            var result = [];
            _.each(string, function (n, i) {
                var fNums = n.match(/[0-9]+/g)
                result.push({
                    audio: null,
                    displayValue: "``\\frac{" + inst.getTranslatedValue(fNums[0], langId).displayValue + "}{" + inst.getTranslatedValue(fNums[1], langId).displayValue + "}``"
                })
            })
        } else {
            var fNums = string.match(/[0-9]+/g)
            result.push({
                audio: null,
                displayValue: "``\\frac{" + inst.getTranslatedValue(fNums[0], langId).displayValue + "}{" + inst.getTranslatedValue(fNums[1], langId).displayValue + "}``"
            })
        }
        return result;
    },

    /**
     * translates the number and returns an object with the original numeric value,
     * the displayable value and the audio (currently not supported)
     * given an number, builds an object with display value, numerical value and audio
     *
     * {
     *      audio:null
     *      displayValue:"८" //Hindi
     *      numericalValue:8
     * }
     */
    getTranslatedValue: function (number, langId) {
        var instance = this;
        //Check if its really a number
        if (isFinite(number)) {
            var langId = langId || this.config.numericLangId || this.config.langId || this._defaultLangId;

            // if langId is not found return arabic numbers
            if (!(langId in this._unicodeMap))
                langId = this._defaultLangId;

            //var n = Number(number);// convert to number if its in string format
            var numStr = number.toString();
            var translatedNum = "";
            if (langId == 'roman')
                translatedNum = this.toRoman(number)
            else {
                if (number < 0) numStr = (numStr * -1).toString();

                for (var i = 0; i < numStr.length; i++) {
                    if (numStr[i] == '.') {
                        translatedNum = translatedNum + '.';
                    } else {
                        translatedNum = translatedNum + this._unicodeMap[langId][parseInt(numStr[i])];
                    }

                }
                if (number < 0) translatedNum = '-' + translatedNum;
            }

            return {
                numericalValue: Number(number),
                displayValue: translatedNum,
                audio: null
            };
        } else
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
        var instance = this;
        var number = "";
        if (langId == 'roman')
            number = this.fromRoman(unicode);
        else {
            if (unicode.indexOf(".") > -1) {
                unicode = unicode.split("");
                _.each(unicode, function (n) {
                    if (n == ".")
                        number += n;
                    else
                        number += _.indexOf(instance._unicodeMap[langId], n);
                });
            } else {
                for (var i = 0; i < unicode.length; i++) {
                    number += _.indexOf(this._unicodeMap[langId], unicode[i]);
                }
            }

        }
        return Number(number);
    },

    /**
     * Converts a given number to number name
     * @param number - given number
     * @param numberSystemType either 'en-IN'(Indian) or 'en-US'(International)
     * default numberSystemType is 'en-IN'
     */
    toNumberName: function (number, numberSystemType, language) {
        if (isFinite(number)) {
            var type = numberSystemType || 'en-IN';
            if ((number.toString().length < 10 && type == 'en-IN') || (number.toString().length < 13 && type == 'en-US')) {
                if(language == "te"){
                    return this.toNumberName_Te(number, numberSystemType)
                }
                else{    
                    return this.toNumberName_En(number, numberSystemType)
                }
            }else
                throw "Number not in range - Please provide a number within 99 crores or 999 billion"
        }else
            throw "Not a number - Please provide number"
    },

    toNumberName_En : function(number, numberSystemType){
        var tens = {
            10: "Ten",
            11: "Eleven",
            12: "Twelve",
            13: "Thirteen",
            14: "Fourteen",
            15: "Fifteen",
            16: "Sixteen",
            17: "Seventeen",
            18: "Eighteen",
            19: "Nineteen",
            20: "Twenty",
            30: "Thirty",
            40: "Forty",
            50: "Fifty",
            60: "Sixty",
            70: "Seventy",
            80: "Eighty",
            90: "Ninety"
        };
        var ones = {
            1: "One",
            2: "Two",
            3: "Three",
            4: "Four",
            5: "Five",
            6: "Six",
            7: "Seven",
            8: "Eight",
            9: "Nine"
        };
        var indianPlaceValues = ["", " thousand", " lakh", " crore"];
        var internationalPlaceValues = ["", " thousand", " million", " billion"];
        var type = numberSystemType || 'en-IN';
        var number = Number(number).toLocaleString(type);
        var placeValues = type == 'en-IN' ? indianPlaceValues : internationalPlaceValues;
        var tokens = number.split(',').reverse();
        var convertedWords = [];
        //Handle zero
        if (tokens.length == 1 && Number(tokens[0] == 0))
            return "Zero";
        else {
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
                        } else
                            word = "";
                    }
                } else {
                    var tensPlace = tens[token.substring(1, 3)];
                    if (!tensPlace) {
                        var digit = token.substring(1, 3);
                        if (Number(token.substring(1, 3)) > 0) {
                            tensPlace = ((tens[digit.toString().substring(0, 1) + "0"]) || "") + " " + ones[digit.toString().substring(1)];
                        } else
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
            
    },


    toNumberName_Te : function(number, numSysType){

        var numberNamesConditions = {
            "te":[
                {
                    "condition":"num == 0",
                    "apply" : "String('సున్న')"
                },
                {
            
                    "condition":"num >= 1 && num <= 9",
                    "apply":"map[num]"
                },
                {
                    "condition":"num >= 10 && num <= 20",
                    "apply":"map[num]"
                },
                {
                    "condition":"totalDigits == 2 && num % 10 == 0", //30,40..90
                    "apply":"map[num]"
                },
                {
                    "condition":"totalDigits == 2",//21 TO 99
                    "apply":"map[partNum(num, 2)*10] + map[partNum(num,1)]"
                },
                {
                    "condition":"totalDigits == 3 && partNum(num,1,2) != 0 && partNum(num,3) != 1",//2**, 3**
                    "apply":"map[partNum(num, 3)] + 'వందల ' + numToWords(partNum(num,1,2))"
                },
                {
                    "condition":"totalDigits == 3 && partNum(num,1,2) != 0 && partNum(num,3) == 1",//1**
                    "apply":"'నూట ' + numToWords(partNum(num,1,2))"
                },
                {
                    "condition":"totalDigits == 3 && partNum(num,3) != 1",//200, 300 ..
                    "apply":"map[partNum(num, 3)] + 'వందలు'"
                },
                {
                    "condition":"num == 100",
                    "apply":"'నూరు'"
                },
                {
                    "condition":"num == 1000",
                    "apply":"'వెయ్యి'"
                },
                {
                    "condition":"num > 1000 && num < 1999",
                    "apply":"'వెయ్యి ' + numToWords(partNum(num, 1,3))"
                },
                //en-US
                {
                    "condition":"numSysType == 'en-US' && (num >=2000  && num <= 999999) && partNum(num, 4) == 1 && partNum(num, 5) > 1  && partNum(num,1,3) == 0 ", //51000, 31000 .. 551000
                    "apply":"numToWords(partNum(num, 5,6) * 10) + 'ఒక' + 'వేలు'"  
                },
                {
                    "condition":"numSysType == 'en-US' && (num >=2000  && num <= 999999) && partNum(num,1,3) == 0 ", //2000, 3000 .. except 51000, 61000, 561000
                    "apply":"numToWords(partNum(num, 4,6)) + 'వేలు'"
                },
                {
                    "condition":"numSysType == 'en-US' && (num >=2000  && num <= 999999) && partNum(num, 4) == 1 && partNum(num, 5) > 1", //51***, 671***
                    "apply":"numToWords(partNum(num, 5,6) * 10) + 'ఒక' + 'వేల ' + numToWords(partNum(num, 1,3))"
                },
                {
                    "condition":"numSysType == 'en-US' && num >=2000  && num <= 999999", //2***, 45***, 543***
                    "apply":"numToWords(partNum(num, 4,6)) + 'వేల ' + numToWords(partNum(num, 1,3))"
                },
                // en-IN
                {
                    "condition":"(num >=2000  && num <= 99999) && partNum(num, 4) == 1 && partNum(num, 5) > 1  && partNum(num,1,3) == 0 ", //51000, 31000 ..
                    "apply":"numToWords(partNum(num, 5) * 10) + 'ఒక' + 'వేలు'"  
                },
                {
                    "condition":"(num >=2000  && num <= 99999) && partNum(num,1,3) == 0 ", //2000, 3000 ..
                    "apply":"numToWords(partNum(num, 4,5)) + 'వేలు'"
                },
                {
                    "condition":"(num >=2000  && num <= 99999) && partNum(num, 4) == 1 && partNum(num, 5) > 1",
                    "apply":"numToWords(partNum(num, 5) * 10) + 'ఒక' + 'వేల ' + numToWords(partNum(num, 1,3))"
                },
                {
                    "condition":"num >=2000  && num <= 99999",
                    "apply":"numToWords(partNum(num, 4,5)) + 'వేల ' + numToWords(partNum(num, 1,3))"
                },
                //en-US
                {
                    "condition":"numSysType == 'en-US' && num == 1000000",//million
                    "apply":"'మిలియన్'"
                },
                {
                    "condition":"numSysType == 'en-US' && num > 1000000 && num < 1999999",
                    "apply":"'మిలియన్ ' + numToWords(partNum(num, 1,6))"
                },
                {
                    "condition":"numSysType == 'en-US' && (num >=2000000  && num <= 999999999) && partNum(num, 7) == 1 && partNum(num, 8) > 1  && partNum(num,1,6) == 0 ", //521MILLION, 61MILLION .. 
                    "apply":"numToWords(partNum(num, 8,9) * 10) + 'ఒక' + 'మిలియన్'"  
                },
                {
                    "condition":"numSysType == 'en-US' && (num >=2000000  && num <= 999999999) && partNum(num, 7) == 1 && partNum(num, 8) > 1", //521MILLION <<something>>, 61MILLION<<something>> .. 
                    "apply":"numToWords(partNum(num, 8,9) * 10) + 'ఒక' + 'మిలియన్ ' + numToWords(partNum(num,1,6))"  
                },
                {
                    "condition":"numSysType == 'en-US' && (num >= 2000000  && num <= 999999999) && partNum(num,1,6) == 0 ", //200000, 300000 ..
                    "apply":"numToWords(partNum(num, 7,9)) + 'మిలియన్లు'"
                },
                {
                    "condition":"numSysType == 'en-US' && num >= 2000000  && num <= 999999999",
                    "apply":"numToWords(partNum(num, 7,9)) + 'మిలియన్ల ' + numToWords(partNum(num, 1,6))"
                },
                //en-IN
                {
                    "condition":"num == 100000",
                    "apply":"'లక్ష'"
                },
                {
                    "condition":"num > 100000 && num < 199999",
                    "apply":"'లక్ష ' + numToWords(partNum(num, 1,5))"
                },
                {
                    "condition":"(num >=200000  && num <= 9999999) && partNum(num,1,5) == 0 ", //200000, 300000 ..
                    "apply":"numToWords(partNum(num, 6,7)) + 'లక్షలు'"
                },
                {
                    "condition":"num >=200000  && num <= 9999999",
                    "apply":"numToWords(partNum(num, 6,7)) + 'లక్షల ' + numToWords(partNum(num, 1,5))"
                },
                //en-US
                {
                    "condition":"numSysType == 'en-US' && num == 1000000000",
                    "apply":"'బిలియన్'"
                },
                {
                    "condition":"numSysType == 'en-US' && num > 1000000000 && num < 1999999999",
                    "apply":"'బిలియన్ ' + numToWords(partNum(num, 1,9))"
                },
                {
                    "condition":"numSysType == 'en-US' && (num >=2000000000  && num <= 999999999999) && partNum(num, 10) == 1 && partNum(num, 11) > 1  &&  partNum(num,1,9) == 0 ", //521MILLION, 61MILLION .. 
                    "apply":"numToWords(partNum(num, 11,12) * 10) + 'ఒక' + 'బిలియన్'"  
                },
                {
                    "condition":"numSysType == 'en-US' && (num >=2000000000  && num <= 999999999999) && partNum(num, 10) == 1 && partNum(num, 11) > 1", //521MILLION <<something>>, 61MILLION<<something>> .. 
                    "apply":"numToWords(partNum(num, 11,12) * 10) + 'ఒక' + 'బిలియన్ ' + numToWords(partNum(num,1,9))"  
                },
                {
                    "condition":"numSysType == 'en-US' && (num >=2000000000  && num <= 999999999999) && partNum(num,1,9) == 0 ", 
                    "apply":"numToWords(partNum(num, 10,12)) + 'బిలియన్లు'"
                },
                {
                    "condition":"numSysType == 'en-US' && num >= 2000000000  && num <= 999999999999",
                    "apply":"numToWords(partNum(num, 10,12)) + 'బిలియన్ల ' + numToWords(partNum(num, 1,9))"
                },
                //en-IN
                {
                    "condition":"num == 10000000",
                    "apply":"'కోటి'"
                },
                {
                    "condition":"num > 10000000 && num < 19999999",
                    "apply":"'కోటి ' + numToWords(partNum(num, 1,7))"
                },
                {
                    "condition":"(num >=20000000  && num <= 999999999) && partNum(num,1,7) == 0 ", //200000, 300000 ..
                    "apply":"numToWords(partNum(num, 8,9)) + 'కోట్లు'"
                },
                {
                    "condition":"num >=20000000  && num <= 999999999",
                    "apply":"numToWords(partNum(num, 8,9)) + 'కోట్ల ' + numToWords(partNum(num, 1,7))"
                }
            ]
        }

        var map = {
            1: "ఒకటి",
            2: "రెండు",
            3: "మూడు",
            4: "నాలుగు",
            5: "అయిదు",
            6: "ఆరు",
            7: "ఏడు",
            8: "ఎనిమిది",
            9: "తొమ్మిది",
            10: "పది",
            11: "పదకొండు",
            12: "పన్నెండు",
            13: "పదమూడు",
            14: "పద్నాలుగు",
            15: "పదిహేను",
            16: "పదహారు",
            17: "పదిహేడు",
            18: "పద్దెనిమిది",
            19: "పందొమ్మిది",
            20: "ఇరవై",
            30: "ముప్పై",
            40: "నలభై",
            50: "యాభై",
            60: "అరవై",
            70: "డెబ్బై",
            80: "ఎనభై",
            90: "తొంబై"
        };

        //partNum(Number, digitToGet)//when Two parameter
        //partNum(Number, startDigit, EndDigit) //when Three parameter
        //partNum(987,1) => 7 
        //partNum(987,2) => 8
        //partNum(987,3) => 9
        //partNum(987, 1,2) => 87 //same result for partNum(987,2,1)
        //partNum(987, 2,3) => 98
        //partNum(987,1,3) => 987
        function partNum(num, startDigit, endDigit){
            var numStr = num.toString();
            var numDigits = numStr.length;
            if(endDigit == undefined){
                return Number(numStr[numDigits - startDigit]);
            }else{
        
                if(startDigit > endDigit){
                    var temp = endDigit;
                    endDigit = startDigit;
                    startDigit = temp;
                }
        
                var retStrArr = [];
                for(var i = startDigit; i <= endDigit; i++){
                    retStrArr.push(numStr[numDigits - i])
                }
                return Number(retStrArr.reverse().join(""));
            }
        }

        function numToWords(num){
            num = Number(num);//omitting pre zeros 0123 => 123
            var totalDigits = num.toString().length;
            for(var i = 0;i < numberNamesConditions.te.length; i++){
                if(eval(numberNamesConditions.te[i].condition)){
                    return eval(numberNamesConditions.te[i].apply)
                }
            }
        }

        var result = numToWords(number);
        return result;

    },

    /**
     * @param langId - language id
     * returns numbers (0-9) in specified language
     */
    getNumbers: function (langId) {
        return this._unicodeMap[langId];
    },

    /**
     * converts an Arabic number to Roman number
     * @param {number} num
     * @returns {string} res - roman number
     */
    toRoman: function (num) {
        var res = "";
        var arabicNums = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        var romanNums = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
        for (var i = 0; i <= arabicNums.length && num != 0; i++) {
            while (num >= arabicNums[i]) {
                num -= arabicNums[i];
                res += romanNums[i];
            }
        }
        return res;
    },
    /**
     * Converts a roman number to Arabic number
     * @param {string} str - Roman Number
     * @returns {Number} result - Arabic Number
     */
    fromRoman: function (str) {
        var result = 0;
        // the result is now a number, not a string
        var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        var roman = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
        var match = /^(?:M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|\d+)$/;
        //Check if the Roman number is valid
        if (match.test(str)) {
            for (var i = 0; i <= decimal.length; i++) {
                while (str.indexOf(roman[i]) === 0) {
                    //checking for the first characters in the string
                    result += decimal[i];
                    //adding the decimal value to our result counter
                    str = str.replace(roman[i], '');
                    //remove the matched Roman letter from the beginning
                }
            }
            return result;
        } else
            return "Invalid";
    }
});