//@ sourceURL=ftPluginHelper.js
/**
 * common plugin for all funtoot template renderer plugins
 * @extends Plugin
 * @author Ram Jayaraman <ram.j@funtoot.com>
 */
Plugin.extend({
    _type: 'ftPluginHelper',
    initPlugin: function (data) { },
    /**
     * processes 'variables' key on the item model for parameterized questions. Replaces
     * the value of the keys with the evaluated values.
     *
     * An example of input variables object
     * variables:{
     *  $num1: pickRandom(['London', 'New York', 'Delhi']),
     * }
     *
     * @param {object} variables the object that contains the variables to be processed
     */
    processVariables: function (variables) {
        var model = this._stage.getController("item").getModelValue("model");
        if (_.isUndefined(model.variablesProcessed) || !model.variablesProcessed) {
            var inst = this;
            (function () {
                //Generates a number within the given range
                var pickRandom = function (items, start, end) {
                    if (items == null || items.length == 0)
                        return _.random(start, end);
                    else if (items && start == undefined && end == undefined) {
                        return items[_.random(0, items.length - 1)];
                    } else {
                        if (start < 0 || start >= items.length)
                            start = 0;
                        if (end < 0 || end >= items.length)
                            end = items.length - 1;
                        return items[_.random(start, end)];
                    }
                };

                /**
                 * generates a random number as specified by 'expr' parameter
                 * e.g [1-9] will generate a number between 1 and 9
                 * [1-9][2-6] will generate a 2-digit number with tens place between 1 and 9 and
                 * ones place 2-6.
                 * @param {string} expr an expression which is used to generate a number
                 */
                var generateNumber = function (expr) {
                    return inst.generateNumber(expr);
                };
                /**
                 * generates a sequence of numbers
                 * @param {string} expr expression (see 'generateNumber' function)
                 * @param {number} count the number of random numbers to generate
                 * @param {number} skip skip between numbers
                 * @param {string} langId Language id (en by default)
                 * @param {string} [numberType] null by default, 'Roman' is the other valid value
                 */
                var getNumberSequence = function (expr, count, skip) {
                    var start = inst.generateNumber(expr);
                    return inst.generateNumberSeries(start, count, skip);
                };

                var formnumber = function () {
                    var result = inst.formNumber(arguments);
                    return result;
                }

                console.log('variables:');
                console.log(this);
                for (var key in this) {
                    this[key] = typeof (this[key]) == "string" ? eval(this[key].replace(/\$/g, "this.$")) : this[key];
                }
            }).call(variables);
            model.variablesProcessed = true;
        }
    },
    /**
     * replaces variables with calculated values
     * @param {string} str the variable to replace
     * @param {object} variables the variables object
     */
    replaceVariables(str, variables) {
        for (var key in variables) {
            if (_.isObject(variables[key])) {
                if (str == key)
                    return variables[key];
            } else
                str = str.split(key).join(variables[key]);
        }
        return str;
    },
    /**
     * converts an Arabic number to Roman number
     * @param {number} num
     */
    /*toRoman(num) {
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
    },*/

    /**
     * given a start number, Skip and count, generates an array of numbers
     * @param {number} start
     * @param {number} count
     * @param {number} skip
     * @param {string} langId
     * @param {string} [numberType]
     */
    generateNumberSeries(start, count, skip) {
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
     * generates an array of random numbers within the given range
     * @param {number} count number of random numbers to generate
     * @param {number} start the starting number
     * @param {number} end ending number
     * @param {number} [multi=1] multiplier
     * @param {string} langId
     * @param {string} [numberType]
     */
    getRandomNumbers(count, start, end, multi) {
        //numberType = (numberType || null);
        count = parseInt(count);
        start = parseInt(start);
        multi = parseInt(multi);
        end = parseInt(end);
        //var result = { lang: langId, nums: [] };
        var randomList = [];
        multi = (multi || 1);
        end = end + 1; //to include upper bound
        end = Math.floor(end / multi) * multi;
        while (randomList.length < count) {
            if ((count > (end - start)) / multi) {
                throw "Cannot generate " + count + " numbers between " + start + " - " + end;
                break;
            }
            var res = _.random(start, end);
            var remainder = res % multi;
            if (remainder > 0)
                res = res + (multi - remainder);
            if (!_.contains(randomList, res)) {
                randomList.push(res);
            }
        }
        //var i18n = PluginManager.getPluginObject('i18n_helper');
        //result.nums = i18n.translateNumber(arr, langId);//result.nums = this._translateNumbers(randomList, langId, numberType);
        return randomList;
    },
    /**
     * generates a random number array from the given array
     * @param {array} digits
     * @param {integer} number of digts to be picked
     */
    formNumber: function () {
        if (arguments[0].length % 2 == 1)
            console.error("formNumbers requires even number of arguments");
        var result = []
        for (i = 0; i < arguments[0].length; i += 2) {
            if (typeof arguments[0][i] == "object") {
                var nums = _.take(_.shuffle(arguments[0][i]), arguments[0][i + 1]);
                result = result.concat(nums)
            }
        }
        return result;
    },
    /**
     * generates a numbers given a number pattern (specifying range to each digit)  eg: [1-5][2-6][5]
     * @param {string} expr
     */
    generateNumber(expr) {
        var nums = [];
        var patterns = expr.split(',');
        _.each(patterns, function (pattern) {
            var digitSpecs = pattern.replace(/\]\[/g, ';').replace(/\[/g, ';').replace(/\]/g, ';').split(';');
            digitSpecs = digitSpecs.filter(e => String(e).trim());
            var number = '';
            _.each(digitSpecs, function (v, k, a) {
                if (!_.contains(v, ".")) {
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
     * returns the relative dimension of any object on the canvas relative to one of its ancestors
     * Right now calculates only the relative x and y. Should get enhanced to return relative w and h as well
     * @param {object} obj object for which the relative dimensions are to be obtained
     * @param {object} relObj object relative to which the dimensions are to be obtains
     */
    getRelativeDimension: function (obj, relObj) {
        var dims = [obj._dimensions];
        var p = obj._parent;
        while (p && p._data) {
            dims.push(p._dimensions);
            if (p._id == relObj._id) break;
            p = p._parent;
        }
        var dim = {
            x: 0,
            y: 0
        };
        for (i = 0; i < dims.length - 1; i++) {
            var x = dims[i].x / dims[i + 1].w,
                y = dims[i].y / dims[i + 1].h;
            for (j = i + 1; j < dims.length - 1; j++) {
                x = x * dims[j].w / dims[j + 1].w;
                y = y * dims[j].h / dims[j + 1].h;
            }
            dim.x += x;
            dim.y += y;
        }
        dim.x *= 100;
        dim.y *= 100;
        return dim;
    },
    /**
     * invokes popup plugin
     * @param {object} data the data for instantiating the popup object
     */
    showPopup: function (data) {
        var telemetryData = {};
        var i18n = PluginManager.getPluginObject('i18n_helper');
        if (this._stage._stageController.getModelValue().i18n != undefined) {
            var itemModel = this._stage._stageController.getModelValue();
            var i18nObj = itemModel.i18n[itemModel.model.langId];
        }
        switch (data.type) {
            case "hint":
                data.title = i18nObj != undefined ? i18nObj.HINT : i18n.translate("HINT");
                telemetryData.values = ['Hint', data.content];
                break;
            case "solution":
                data.title = i18nObj != undefined ? i18nObj.SOLUTION : i18n.translate("SOLUTION");
                telemetryData.values = ['Solution'];
                break;
            case "mh":
                data.title = i18nObj != undefined ? i18nObj.MICROHINT : i18n.translate("MICROHINT");
                telemetryData.values = ['MicroHint', data.content, data.mmc];
        }
        EventManager.processAppTelemetry({}, "TOUCH", this, telemetryData);

        var popupId = "__ft_popup_container__" + data.type;
        if (data.type == "solution") {
            var popupData = Object.assign({
                id: popupId
            }, data);
            PluginManager.invoke('ftPopup', popupData, this._stage, this._stage, this._theme);
        } else {
            var htmlpopupObj = {
                "id": popupId,
                "content": data.content,
                "type": data.title
            }
            PluginManager.invoke('htmlpopup', htmlpopupObj, this._stage, this._stage, this._theme);
        }
    },
    /**
     * computes the dimensions from units to percent, relative to a parent container element
     * Used to compute gutter's w and h so it is always the same size irrespective
     * of the container.
     * @param {object} dim the dimension in units (160:90) that needs to be converted to percent
     * @param {object} parent the ancestor relative to which the percentage value to be computed
     */
    toPercent: function (dim, parent) {
        var xExt = 160,
            yExt = 90;
        var xUnits = xExt,
            yUnits = yExt;
        var p = parent;
        while (p && p._data) {
            xUnits *= p._data.w ? p._data.w / 100 : 1;
            yUnits *= p._data.h ? p._data.h / 100 : 1;
            if (p._rendererPlugin)
                break;
            p = p._parent;
        }
        return {
            w: dim.w / xUnits * 100,
            h: dim.h / yUnits * 100,
            x: dim.x / xUnits * 100,
            y: dim.y / yUnits * 100
        };
    },

    /**
     * returns an array of boolean values. Each of the boolean flags denote whether the
     * FIB in the cell is editable or not.
     * The input is the data passed to the plugin. The 'mask' property determines how the
     * mask should be generated. If the 'mask' property is an array [2], then the column index 1 (2-1)
     * will be set as editable. If the mask is a decimal value between 0 and 1, (e.g 0.5) then
     * randomly 50% of the FIB plugins will be set as ediable.
     *
     * @param {object} data the data passed to the plugin.
     */
    getUserInputMask: function (data) {
        var masks = new Array(data.rows * data.cols).fill(!1); // initialize all as read-only
        if (_.isArray(data.mask)) {
            //the data.mark is a array of columns to mask (e.g [2,5])
            if (_.contains(data.mask, true))
                return data.mask; // if the array is already masked then return the same array(in case of solution array will be already masked)
            for (r = 0; r < data.rows; r++) {
                for (m = 0; m < data.mask.length; m++) {
                    masks[r * data.cols + data.mask[m] - 1] = !0;
                }
            }
            return masks;
        } else {
            // the data.mark is a value between 0 and 1 (e.g 0.5)
            var t = data.rows * data.cols;
            var n = _.filter(masks, function (b) {
                return !b;
            }).length;
            do {
                masks[n - 1] = !0;
                n = _.filter(masks, function (b) {
                    return !b;
                }).length;
            } while ((n / t) > data.mask);
            return _.shuffle(masks);
        }
    },
    /**
     * Invokes "try again" overlay when next is clicked
     * else opens up a dialog with custom message
     */
    onNoResponse: function (evt, instance) {
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var model = instance._stage._stageController.getModelValue();
        var langId = model.model.langId || "en";
        if (evt.nextClicked)
            OverlayManager.showTryAgainFb(true);
        else {
            var title;
            if (model.i18n && model.i18n[langId]["HELP"])
                title = model.i18n[langId]["HELP"];
            else {
                title = i18n.translate("HELP") == "" || i18n.translate("HELP") == undefined ? "Help" : i18n.translate("HELP");
            }
            var popupId = "__ft_popup_container__no_answer";
            var htmlpopupObj = {
                "id": popupId,
                "content": model.i18n ? model.i18n[langId]["NO_ANSWER"] : i18n.translate("NO_ANSWER"),
                "type": title
            }
            if (_.isUndefined(htmlpopupObj.content)) {
                console.log("!------no no_response key------!")
                htmlpopupObj.content = "Please answer."
            }
            PluginManager.invoke('htmlpopup', htmlpopupObj, this._stage, this._stage, this._theme);
        }
    }
});