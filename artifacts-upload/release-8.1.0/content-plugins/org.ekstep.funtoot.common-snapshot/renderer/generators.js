//@ sourceURL=generators.js
/**
 * Common plugin for all funtoot template renderer plugins
 * @extends Plugin
 * @author Henrietta (henrietta.d@funtoot.com)
 */

org.ekstep.generators = Class.extend({
    /**
    *   Empty constructor for generators class
    *   @constructs org.ekstep.generators
    */
    init: function () {
        // save this object to the glocal scope so we can access it if needed
        window.org.ekstep.funtoot.generatorObj = this;
    },
    /**
     * processes 'variables' key on the item model for parameterized questions. Replaces
     * the value of the keys with the evaluated values.
     *
     * An example of input variables object
     * variables:{
     *  $num1: random(['London', 'New York', 'Delhi']),
     * }
     *
     * @param {object} variables the object that contains the variables to be processed
     */
    processVariables: function (variables) {
        this.variables = variables;
        var random = this.random;
        var lcm = this.lcm;
        var gcd = this.gcd;
        var formNumber = this.formNumber;
        var toNumber = this.toNumber;
        var numberArray = this.numberArray;
        var expandNumber = this.expandNumber;
        var getNumberArray = this.getNumberArray;
        var getNumberSequence = this.getNumberSequence;
        var generateNumberSeries = this.generateNumberSeries;
        var pickNumbers = this.pickNumbers;
        var generateNumber = this.generateNumber;
        var iff = this.iff;
        var randomDecimal = this.randomDecimal;
        var toLatex = this.toLatex;
        var concat = this.concat;
        var toFraction = this.toFraction;
        var reducedFraction = this.reducedFraction;
        (function () {
            for (var key in this.variables) {
                this.variables[key] = typeof (this.variables[key]) == "string" ? eval(this.variables[key].replace(/\$/g, "this.variables.$")) : this.variables[key];
            }
        }).call(this);
    },
    /**
              * generates a random number as specified by 'expr' parameter
              * e.g [1-9] will generate a number between 1 and 9
              * [1-9][2-6] will generate a 2-digit number with tens place between 1 and 9 and
              * ones place 2-6.
              * @param {string} expr an expression which is used to generate a number
              */
    generateNumber: function (expr) {
        return window.org.ekstep.funtoot.generatorObj.generateNumber(expr);
    },
    /**
     * generates a sequence of numbers
     * @param {string} expr expression (see 'generateNumber' function)
     * @param {number} count the number of random numbers to generate
     * @param {number} skip skip between numbers
     * @param {string} langId Language id (en by default)
     * @param {string} [numberType] null by default, 'Roman' is the other valid value
     */
    getNumberSequence: function (expr, count, skip) {
        var start = window.org.ekstep.funtoot.generatorObj.generateNumber(expr);
        return window.org.ekstep.funtoot.generatorObj.generateNumberSeries(start, count, skip);
    },
    /**
     * replaces variables with calculated values
     * @param {string} str the variable to replace
     * @param {object} variables the variables object
     */
    replaceVariables: function (str, variables) {
        if (str != null) {
            for (var key in variables) {
                if (_.isObject(variables[key])) {
                    if (str == key)
                        return variables[key];
                } else
                    str = str.split(key).join(variables[key]);
            }
        }
        return str;
    },
    /**
     * generatos and returns a random number based on the arguments
     *
     * if arg[0] is a number, and there is no other argument, then a random number between 0 and the number is generated
     * e.g:
     * random(10)
     * => 4 // any random number between 0 and 10
     * random(10, 100)
     * => 57 // any random number between 10 and 100
     * random([1,2,3,4,5,6])
     * => 3 // picks any random number from the array
     * random([1,2,3,4,5,6], 3)
     * => [2,3,5]] // picks 3 unique  numbers from the given array
     * random(10,20,4)
     * => [0,3,4,7] // picks 4 unique number in the range of 10-20
     * if arg[0] and arg[1] are numbers, then a random number between these two numbers are generated
     * if arg[0] is an array, if there are no other arg, then randomly an element of the array is returned
     * if arg[0] is an array, and arg[1] is a digit, then an array of arg[1] elements are returned
     * if arg[0], arg[1], arg[2] are numbers, then an array of arg[2] elements are picked from the range of
     * arg[0]-arg[1] and returned
     * @param {number} / {array}
     * @returns {number}/ array of numbers
     */
    random: function () {
        if (arguments.length == 1) {
            if (typeof (arguments[0]) == "number") {
                return _.random(arguments[0]);
            } else if (_.isArray(arguments[0])) {
                return arguments[0][_.random(arguments[0].length - 1)];
            } else if (typeof (arguments[0]) == 'string') {
                return window.org.ekstep.funtoot.generatorObj.generateNumber(arguments[0]);
            } else
                console.error("Invalid arguments");
        } else if (arguments.length == 2) {
            if (typeof (arguments[0]) == "number" && typeof (arguments[1]) == "number") {
                return _.random(arguments[0], arguments[1]);
            } else if (_.isArray(arguments[0]) && (typeof (arguments[1]) == "number")) {
                return _.take(_.shuffle(arguments[0]), arguments[1]);
            } else
                console.error("Invalid arguments");
        } else if (arguments.length == 3) {
            if (!_.isUndefined(typeof (arguments[0]) == "number") && !_.isUndefined(typeof (arguments[1]) == "number") && !_.isUndefined(typeof (arguments[2]) == "number")) {
                var numArray = _.range(arguments[0], arguments[1] + 1);
                return _.take(_.shuffle(numArray), arguments[2]);
            }
        } else
            console.error("Invalid number of arguments passed to function");
    },
    /**
     *
     */
    randomDecimal: function (minimum, maximum, precision) {
        minimum = minimum === undefined ? 0 : minimum;
        maximum = maximum === undefined ? 9007199254740992 : maximum;
        precision = precision === undefined ? 0 : precision;

        var random = Math.random() * (maximum - minimum) + minimum;

        return random.toFixed(precision);
    },
    /**
     *lcm(num1, num2,...)
     * @param {number} / array of numbers
     * @returns {number}/ number
     */
    lcm: function () {
        var args = Array.prototype.slice.call(arguments).join();
        return eval('math.lcm(' + args + ')');
    },
    /**
    *gcd(num1, num2...)
    * @param {number} / array of numbers
    * @returns {number}/ number
    */
    gcd: function () {
        var args = Array.prototype.slice.call(arguments).join();
        return eval('math.gcd(' + args + ')');
    },
    /**
     *
     */
    toLatex: function () {
        var len = arguments.length;
        switch (arguments[len - 1]) {
            case "frac":
                return "``\\frac{" + arguments[0] + "}{" + arguments[1] + "}``";
        }
    },
    /**
     * pickNumbers([[1,2,3],[4,5,6]],4)
     * => [1,3,4,5] picks 4 numbers from the array of numArrays
     * @param {array}
     * @returns {array}
     */
    pickNumbers: function () {
        var pickCount = arguments[1];
        // var numArrays = arguments.slice(0, arguments.length - 1);
        var combinedArray = [];
        _.each(arguments[0], function (array, i) {
            combinedArray = combinedArray.concat(array);
        });
        return _.take(_.shuffle(combinedArray), arguments[1]);
    },
    /**
     * forms a number based on the specified arguments
     * @param nums array/ a number
     * @param islargest - boolean
     * @param count number of digits - optional parameter if not provided count = length of nums array
     * @param isEven - boolean - optional parameter.
     * @returns {Number} the number formed based on arguments
     * e.g:
     * formNumber([0,2,3,4,5], false)
     * => 20345 // 5 digit smallest number
     * formNumber([0,2,3,4,5], true)
     * => 54320 // 5 digit largest number
     * formNumber([0,1,2,3,4,5,6,7,8,9], false, 5, true)
     * => 10234 // 5 digit smallest even number
     * formNumber([0,1,2,3,4,5,6,7,8,9],5,0,0)
     * => 10235 // 5 digit smallest odd number
     * formNumber([0,1,2,3,4,5,6,7,8,9],5,1,1)
     * => 98764 // 5 digit largest even number
     * formNumber([0,1,2,3,4,5,6,7,8,9],5,1,0)
     * => 98765 // 5 digit largest odd number
     */
    formNumber: function (nums, isLargest, count, isEven) {
        if (arguments[2]) {
            if (Number(arguments[2]))
                count = arguments[2];
            else
                isEven = arguments[2];
        }
        // if the nums is not an array, make an array out of the given number
        if (!_.isArray(nums)) {
            var digits = ("" + nums).split("");
            nums = [];
            _.each(digits, function (digit) {
                nums.push(Number(digit));
            });
        }
        //if count is not provided count is equal to the length of the num array
        if (_.isUndefined(count) || count > nums.length)
            count = nums.length;

        if (_.isUndefined(isEven)) {
            // even or odd not specified
            if (isLargest) {
                nums = nums.sort().reverse();
                return largestNum = Number(_.take(nums, count).join().replace(/,/g, ''));
            } else {
                nums = nums.sort();
                //If first element in the array is zero swap it with the second element so that first digit of smallest number is not zero
                if (nums[0] == 0) {
                    var c = nums[0];
                    nums[0] = nums[1];
                    nums[1] = c;
                }
                return smallestNum = Number(_.take(nums, count).join().replace(/,/g, ''));
            }
        } else {
            //'arr' is an array of even numbers if 'isEven' is true else its array of odd numbers
            var arr = _.filter(nums, function (num) {
                return num % 2 == (isEven ? 0 : 1);
            }).sort();
            var unitDigit = "";
            var evenOrOdd = isEven ? "even" : "odd";
            var smallestOrLargest = isLargest ? "largest" : "smallest";
            if (arr.length > 0) {
                var index = isLargest ? 0 : arr.length - 1;
                //initially assume 'unitDigit' as smallest even(if 'isEven')/odd number if asked for a largest even/odd number
                //or assume 'unitDigit' as largest even(if 'isEven')/odd number if asked for a smallest even/odd number
                unitDigit = arr[index];
            } else {
                console.error("Array does not contain any " + evenOrOdd + " number hence " + smallestOrLargest + " " + evenOrOdd + " number cannot be formed");
                return null;
            }
            var numsArray = _.filter(nums, function (num) {
                return num != unitDigit;
            }).sort();
            if (isLargest)
                numsArray = numsArray.reverse();

            //If first element in the array is zero swap it with the second element so that first digit of smallest number is not zero
            if (numsArray[0] == 0) {
                var c = numsArray[0];
                numsArray[0] = numsArray[1];
                numsArray[1] = c;
            }
            var requriedNumberWithOutUnitDigit = _.take(numsArray, count - 1);
            var restNumbers = _.rest(numsArray, count - 1);
            //'restNum' is an array of even numbers if 'isEven' is true else its array of odd numbers
            var restNum = _.filter(restNumbers, function (n) {
                return n % 2 == (isEven ? 0 : 1);
            });
            if (restNum.length > 0) {
                _.each(restNum, function (e) {
                    if (isLargest)
                        // check if there is a largest even(if 'isEven')/odd number in the rejected list of numbers if any replace that with the initially assumed unitDigit
                        unitDigit = e > unitDigit ? e : unitDigit;
                    else
                        // check if there is a smallest even(if 'isEven')/odd number in the rejected list of numbers if any replace that with the initially assumed unitDigit
                        unitDigit = e < unitDigit ? e : unitDigit;
                });
            }
            //add the unitDigit to the formed number
            requriedNumberWithOutUnitDigit.push(unitDigit);
            //convert array of numbers to number
            return Number(requriedNumberWithOutUnitDigit.join().replace(/,/g, ''));
        }
    },

    /**
     * takes arguments and concatenates them to form a n digit number where n is the number of arguments
     * e.g
     * nDigitNumber(random(1-4), random(5-7), random(8-9))
     * =>368
     * @param numbers
     * @param {boolean} optional parameter set to true if the array should be shuffled
     * @returns number in string form
     */
    toNumber: function () {
        var array = _.toArray(arguments);
        if (arguments[arguments.length - 1] === true) {
            //Remove the last element(which is a boolean) and shuffle the array
            array = _.shuffle(_.initial(array));
            if (array[0] == 0) {
                //if the first element is zero swap it with the next element
                var c = array[0];
                array[0] = array[1];
                array[1] = c;
            }
        } else
            array = _.toArray(arguments);
        return array.join().replace(/,/g, '');

    },
    /**
     * generates a random number array from the given array
     * @param {array} digits
     * @param {integer} number of digts to be picked
     */
    numberArray: function () {
        if (arguments.length % 2 == 1)
            console.error("formNumbers requires even number of arguments");
        var result = []
        for (i = 0; i < arguments.length; i += 2) {
            if (typeof arguments[i] == "object") {
                var nums = _.take(_.shuffle(arguments[i]), arguments[i + 1]);
                result = result.concat(nums)
            }
        }
        return result;
    },
    /**
     * computes the place value of the specified digit in the number
     * @param {Number} Number
     * @param {Number} digit
     * @returns {Number} place value of the specified digit
     */
    placeValue: function (number, digit) {
        number = number.toString();
        var index = _.indexOf(number, digit.toString());
        if (index == -1) {
            //if digit not found then return
            console.error(digit + " not found in " + Number(number))
            return
        } else if (_.contains(number, ".")) {
            //if decimal number
            console.error("Please enter a whole number")
            return
        } else
            return digit * Math.pow(10, (number.length - index) - 1);

    },
    /**
     * converts a number to its expanded form
     * @param {number} number to be expanded
     * @param {boolean} pvInNumberName default value is false
     * @param {string} numberSystem default value is 'en_IN'
     * @returns {string} given number in expanded form
     * e.g:
     * expandNumber(123)
     * =>1*100 + 2* 10 + 3*1
     * e.g:
     * expandNumber(523, true, 'en-IN')
     * =>5*hundreds + 2* tens + 3*units
     */
    expandNumber: function (number, isFrac, pvInNumberName = false, numberSystem = 'en-IN', numLangId) {
        var expandedNumberArray = [];
        number = number.toString().split('.');
        number[0] = number[0].split("").reverse().join().replace(/,/g, '');
        var intExpForm = this.formExpNumber(number[0], pvInNumberName, false, isFrac, numberSystem, numLangId);
        if (number[1] != undefined) {
            number[1] = number[1].split("").join().replace(/,/g, '');
            var decExpForm = this.formExpNumber(number[1], pvInNumberName, true, isFrac, numberSystem, numLangId);
            expandedNumberArray = intExpForm.reverse().join().replace(/,/g, ' \u002B ') + ' + ' + decExpForm.join().replace(/,/g, ' \u002B ');
        }
        else {
            expandedNumberArray = intExpForm.reverse().join().replace(/,/g, ' \u002B ');
        }
        return expandedNumberArray;
    },
    /**
         * converts a number to its expanded form
         * @param {number} number to be expanded
         * @param {boolean} pvInNumberName default value is false
         * @param {boolean} isDec is decimal
         * @returns {string} given number in expanded form
         */
    formExpNumber: function (number, pvInNumberName, nInt, isFrac, numberSystem, numLangId) {
        var expandedNumberArray = [];
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var instance = this;
        _.each(number, function (digit, index) {
            if (nInt && (isFrac == 0 || isFrac == 1))
                index = -(index += 1);
            var pv = Math.pow(10, index);
            var pvProcessed = false;
            if (nInt && isFrac == 1) {
                var decStr = pv.toString();
                var len = decStr.length - (decStr.indexOf('.') + 1);
                var denominator = Math.pow(10, len);
                var numerator = i18n.translateNumber(pv * denominator, numLangId).displayValue;
                denominator = i18n.translateNumber(denominator, numLangId).displayValue;
                pv = instance.toLatex(numerator, denominator, "frac");
                pvProcessed = true;
            }
            if (pvInNumberName) {
                //replace single with double quotes
                pvNumberName = JSON.parse(i18n.translate(pv).replace(/'/g, '"'));
                pv = pvNumberName[0];
                if (pvNumberName.length > 1) {
                    //depending on number sytem pick appropriate number names
                    if (numberSystem == 'en-IN')
                        pv = pvNumberName[0];
                    else
                        pv = pvNumberName[1];
                }
                pvProcessed = true;
            }
            if (!pvProcessed) {
                pv = i18n.translateNumber(pv, numLangId).displayValue;
            }
            var operator = pvInNumberName ? " " : " \u00D7 ";
            expandedNumberArray.push(i18n.translateNumber(digit, numLangId).displayValue + operator + pv);
        });
        return expandedNumberArray;
    },


    /**
     * checks the `condition` for truth, and returns the value `truthy` if it is `true`, `falsy` if it evalutes to `false`
     * @param {any} condition - the condition to be evaluated
     * @param {any} truthy - the expression that needs to be evaluated and returned if the condition evaluates to `true`
     * @param {any} falsy - the expression that needs to be evaluated and returned if the condition evaluates to `false`
     * @returns {any} evaluted value of `truthy` if the condition evalutes to `true`, else evaluated value of `falsy`
     */
    iff: function (condition, truthy, falsy) {
        return (eval(condition) == true) ? eval(truthy) : eval(falsy);
    },

    /**
    * given a start number, Skip and count, generates an array of numbers
    * @param {number} start
    * @param {number} count
    * @param {number} skip
    * @param {string} langId
    * @param {string} [numberType]
    */
    generateNumberSeries: function (start, count, skip) {
        //numberType = (numberType || null);
        //var result = { lang: langId, nums: [] };
        start = parseFloat(start);
        skip = parseFloat(skip || 1);
        var arr = _.range(start, start + (count * skip), skip);
        var newArr = []
        _.each(arr, function (a) {
            newArr.push(Math.round(a * 100) / 100);
        });
        //var i18n = PluginManager.getPluginObject('i18n_helper');
        //result.nums = i18n.translateNumber(arr, langId);//this._translateNumbers(arr, langId, numberType);
        return newArr;
    },
    /**
     * given a start number, Skip and count, generates an array of numbers
     * @param {number} start
     * @param {number} count
     * @param {number} skip
     * @param {string} langId
     * @param {string} [numberType]
     */
    getNumberArray: function (start, count, skip) {
        //numberType = (numberType || null);
        //var result = { lang: langId, nums: [] };
        start = parseInt(start);
        skip = parseInt(skip || 1);
        var arr = _.range(start, start + (count * skip), skip);
        //var i18n = PluginManager.getPluginObject('i18n_helper');
        //result.nums = i18n.translateNumber(arr, langId);//this._translateNumbers(arr, langId, numberType);
        return arr;
    },
    /**
     * returns array of factors of the given number
     * @param {number} n number
     * @returns {array} num_factors array of factors
     */
    factors: function (n) {
        var num_factors = [],
            f;
        for (f = 1; f <= Math.floor(Math.sqrt(n)); f += 1)
            if (n % f === 0) {
                num_factors.push(f);
                if (n / f !== f)
                    num_factors.push(n / f);
            }
        num_factors.sort(function (x, y) {
            return x - y;
        }); // numeric sort
        return num_factors;
    },
    concat: function () {
        var res = '';
        _.each(arguments, function (argument) {
            res = res.concat(argument);
        })
        return res;
    },
    /**
     * generates a numbers given a number pattern (specifying range to each digit)  eg: [1-5][2-6][5]
     * @param {string} expr
     */
    generateNumber: function (expr) {
        var nums = [];
        var patterns = expr.split(',');
        _.each(patterns, function (pattern) {
            var digitSpecs = pattern.replace(/\]\[/g, ';').replace(/\[/g, ';').replace(/\]/g, ';').split(';');
            digitSpecs = digitSpecs.filter(e => String(e).trim());
            var number = '';
            _.each(digitSpecs, function (v, k, a) {
                if (v.indexOf(".") == -1) {// if (!_.contains(v, ".")) {
                    if (_.find(v, function (c) {
                        return c == '-'
                    })) {
                        var range = _.each(v.split('-'), function (x, y, z) {
                            z[y] = parseInt(x);
                        });
                        a[k] = _.random(range[0], range.length > 1 ? range[1] : range[0]);
                    }
                }
            });
            nums.push(Number(digitSpecs.join().replace(/,/g, '')));
        });
        return nums[_.random(0, nums.length - 1)];
    },
    /**
     * generates fraction in latex form
     * @param numbers
     * @returns {object} fraction
     */
    toFraction: function () {
        var array = _.toArray(arguments);
        var fraction = "\\frac{" + arguments[0] + "}{" + arguments[1] + "}";
        if (array.length == 3)
            fraction = arguments[2] + fraction;
        else
            console.error("toFrac function takes either 2 or 3 arguments");
        return fraction;
    },
    /**
     * reduces the fraction to lowest form
     * @param numbers
     * @returns {object} fraction
     */
    reducedFraction: function (latex) {
        var array = latex.replace("\\frac{", ",").replace("}{", ",").replace("}", ",").split(",").filter(Boolean);
        if (array.length == 1)
            fraction = array[0];
        else if (array.length == 2) {
            var mathObj = math.fraction(array[0], array[1]);
            fraction = "\\frac{" + mathObj.n + "}{" + mathObj.d + "}";
        }
        else if (array.length == 3) {
            var mathObj = math.fraction(array[0] + ' ' + array[1] + '/' + array[2]);
            var q = Math.floor(mathObj.n / mathObj.d);
            var r = mathObj.n % mathObj.d;
            fraction = q + "\\frac{" + r + "}{" + mathObj.d + "}";
        }
        else
            console.error("please enter a fraction");
        return fraction;
    }
});