//@ sourceURL=generic-item-renderer-plugin.js
/* global PluginManager */
/* istanbul ignore next */

Plugin.extend({
    _type: 'org.ekstep.plugins.funtoot.genericitemrenderer',
    _isContainer: !0,
    _render: !0,
    initPlugin: function (data) {
        // create a container for ourself
        this._self = new createjs.Container();

        // Set the stage as parent 
        this._parent = this._stage;

        var dims = this.relativeDims();

        this._self.x = dims.x;
        this._self.y = dims.y;

        // This plugin will be invoked with item controller initialized with the items, 
        // but without the required pre-processing needed for funtoot plugins
        this._item = this._stage.getController("item");
        var item = this._item.getModelValue();

        var showImmediateFeedback = true;
        if (this._theme._controllerMap[this._theme._currentStage + "_assessment"] && !_.isUndefined(this._theme._controllerMap[this._theme._currentStage + "_assessment"]._data.showImmediateFeedback))
            showImmediateFeedback = this._theme._controllerMap[this._theme._currentStage + "_assessment"]._data.showImmediateFeedback;

        var item_model = (typeof (item.model) == 'string') ? JSON.parse(item.model) : item.model;
        var langId = item_model.langId;
        var i18nObj = typeof (item.i18n) == "string" ? JSON.parse(item.i18n) : item.i18n;
        i18nObj[langId] = Object.assign({}, this._i18n[langId], i18nObj[langId]);
        var expressions = i18nObj[langId].EXPRESSIONS;
        item.i18n = i18nObj;
        var variables = {};
        if (expressions && typeof (expressions) == "string" && !item_model.variablesProcessed) {
            _.each(expressions.split(/\r?\n/), function (exp) {
                var tokens = exp.split('=');
                variables[tokens[0]] = tokens[1];
            });
            item_model["variables"] = variables;
        }
        var selectedConfig = this.getSelectedConfig(showImmediateFeedback);
        data.config = {};
        data.config.__cdata = JSON.stringify({
            type: "items",
            var: "item",
            title: item.title,
            count: 1,
            selectedConfig: selectedConfig
        });
        data.data = data.data || {};
        data.data.__cdata = JSON.stringify(item);

        data["itemCtrlInited"] = true;

        //Flag to be set to avoid item contoller iteration for the plugin invoked
        switch (this._item.getModelValue().qtype) {
            case "legacy-word-problem":
                PluginManager.invoke("org.ekstep.plugins.funtoot.fibwordproblem", data, this, this._stage, this._theme);
                break;
            case "mcq":
                PluginManager.invoke("org.ekstep.plugins.funtoot.genericmcq", data, this, this._stage, this._theme);
                break;
            case "freeResponse":
                PluginManager.invoke("org.ekstep.plugins.funtoot.genericfib", data, this, this._stage, this._theme);
                break;
            case "mfr":
                PluginManager.invoke("org.ekstep.plugins.funtoot.genericmfr", data, this, this._stage, this._theme);
                break;
            case "mdd":
                PluginManager.invoke("org.ekstep.plugins.funtoot.genericmdd", data, this, this._stage, this._theme);
                break;
            case "mtf":
                PluginManager.invoke("org.ekstep.plugins.funtoot.genericmtf", data, this, this._stage, this._theme);
                break;
            case "Sequencing":
                PluginManager.invoke("org.ekstep.plugins.funtoot.genericseq", data, this, this._stage, this._theme);
                break;
            default:
        }
    },

    fixItems: function (items) {
        for (var key in items) {
            var values = items[key];
            _.each(values, function (val) {
                if (typeof (val.options) == "string")
                    val.options = JSON.parse(val.options);
                if (typeof (val.i18n) == "string")
                    val.i18n = JSON.parse(val.i18n);
                if (typeof (val.model) == "string")
                    val.model = JSON.parse(val.model);
                if (typeof (val.concepts) == "string")
                    val.concepts = JSON.parse(val.concepts);
                if (typeof (val.lhs_options) == 'string')
                    val.lhs_options = JSON.parse(val.lhs_options);
                if (typeof (val.rhs_options) == 'string')
                    val.rhs_options = JSON.parse(val.rhs_options);
            })
        }
    },

    getSelectedConfig: function (showImmediateFeedback) {
        if (showImmediateFeedback) {
            return {
                enableNextButton: true,
                showImmediateFeedback: true,
                areMicrohintsEnabled: true,
                enableFeedback: true,
                enableSolution: true,
                enableHint: true,
                areVariablesStatic: true,
                retainAnswers: true,
                maxNoOfAtt: 2
            }
        } else {
            return {
                enableNextButton: true,
                showImmediateFeedback: false,
                areMicrohintsEnabled: false,
                enableFeedback: false,
                enableSolution: false,
                enableHint: false,
                areVariablesStatic: true,
                retainAnswers: false,
                maxNoOfAtt: 1
            }
        }
    },

    _i18n: {
        "en": {
            "HINT": "Hint",
            "MICROHINT": "Micro Hint",
            "SOLUTION": "Solution",
            "HELP": "Help",
            "REDUCE_FRACTION": "Check the solution again. Remove the common factors in the fraction and reduce it to its lowest term.",
            "MIXED_FRACTION": "Convert the mixed fraction to an improper fraction.",
            "IMPROPER_FRACTION": "Convert the improper fraction to an mixed fraction.",
            "LIKEFRACTIONADDITION_NUMERATOR": "Add the numerator of the given fractions correctly.",
            "LIKEFRACTIONADDITION_DENOMINATOR": "For addition of like fractions the denominator remains the same.",
            "LIKEFRACTIONADDITION_FULL": "Check the addition of the numerator. The denominator remains the same.",
            "UNLIKEFRACTIONADDITION_NUMERATOR": "First convert the unlike fractions to like fractions. Then add the numerator of the like fractions.",
            "UNLIKEFRACTIONADDITION_DENOMINATOR": "First find the least common factor and convert the unlike fractions to like fractions. The denominator of the solution is the denominator of the like fractions.",
            "UNLIKEFRACTIONADDITION_FULL": "Convert the given fractions to like fractions and then carefully do the addition.",
            "LIKEFRACTIONSUBTRACTION_NUMERATOR": "Subtract the numerator of the given fractions correctly.",
            "LIKEFRACTIONSUBTRACTION_DENOMINATOR": "For subtraction of like fractions the denominator remains the same as that of the question.",
            "LIKEFRACTIONSUBTRACTION_FULL": "Subtract the numerator of the fractions. Denominator remains the same.",
            "UNLIKEFRACTIONSUBTRACTION_NUMERATOR": "First convert the unlike fractions to like fractions. Then subtract the numerator of the like fractions.",
            "UNLIKEFRACTIONSUBTRACTION_DENOMINATOR": "First find the least common factor and convert the unlike fractions to like fractions. The denominator of the solution is the denominator of the like fractions.",
            "UNLIKEFRACTIONSUBTRACTION_FULL": "Convert the given fractions to like fractions and then carefully do the subtraction.",
            "LIKEMIXEDFRACTIONADDITION_WHOLE": "Add the whole number part of both the fractions carefully. Check for the conversion of the improper fraction to proper fractions in the solution.",
            "LIKEMIXEDFRACTIONADDITION_NUMERATOR": "Add the numerator of the like fractions. If the fractional part is an improper fraction, then convert it to a proper fraction.",
            "LIKEMIXEDFRACTIONADDITION_DENOMINATOR": "The denominator of the solution fraction does not change for like fractions.",
            "LIKEMIXEDFRACTIONADDITION_FULL": "Convert the mixed fractions to improper fractions and then add them. The final solution should again be as a mixed fraction.",
            "LIKEMIXEDFRACTIONSUBTRACTION_WHOLE": "Subtract the whole number part of both the fractions carefully.",
            "LIKEMIXEDFRACTIONSUBTRACTION_NUMERATOR": "Subtract the numerator of the like fractions.",
            "LIKEMIXEDFRACTIONSUBTRACTION_DENOMINATOR": "The denominator of the solution fraction does not change for like fractions.",
            "LIKEMIXEDFRACTIONSUBTRACTION_FULL": "Convert the mixed fractions to improper fractions and then subtract them. The final solution should again be as a mixed fraction.",
            "WHOLEANDPROPERFRACTIONADDITION_WHOLE": "The integer added becomes the whole number part of the mixed fraction.",
            "WHOLEANDPROPERFRACTIONADDITION_NUMERATOR": "The numerator of the solution fraction remains the same. ",
            "WHOLEANDPROPERFRACTIONADDITION_DENOMINATOR": "The denominator of the solution fraction remains the same as given in the problem.",
            "WHOLEANDPROPERFRACTIONADDITION_FULL": "The integer and the proper fraction when added becomes the mixed fraction.",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_WHOLE": "Convert the whole number to an equivalent fraction. Then find the difference between the like fractions.",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_NUMERATOR": "First find the least common factor and convert them to difference between like fractions. Then subtract the numerators carefully.",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_DENOMINATOR": "The denominator of the solution fraction remains the same as given in the problem. ",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_FULL": "When the proper fraction is subtracted from the integer becomes the mixed fraction.",
            "WHOLEANDFRACTIONMULTIPLICATION_NUMERATOR": "Multiply the numerator and the whole number carefully.",
            "WHOLEANDFRACTIONMULTIPLICATION_DENOMINATOR": "Multiply the denominators of the fractions carefully. ",
            "WHOLEANDFRACTIONMULTIPLICATION_FULL": "Multiply the integer with the fraction.",
            "FRACTIONMULTIPLICATION_NUMERATOR": "Multiply the numerators of the fractions carefully.",
            "FRACTIONMULTIPLICATION_DENOMINATOR": "Multiply the denominators of the fractions carefully. ",
            "FRACTIONMULTIPLICATION_FULL": "Multiply the numerators and denominators of the fractions.",
            "FRACTIONDIVISION": "First find the reciprocal of the divisor. Then multiply the fraction with the reciprocal of the divisor to get the solution."
        },
        "hi": {
            "HINT": "संकेत",
            "MICROHINT": "माइक्रो संकेत",
            "SOLUTION": "समाधान",
            "HELP": "मदद",
            "REDUCE_FRACTION": "फिर से समाधान की जाँच करें। अंश में से सामान्य गुणक को हटा दें और इसे इसके सबसे कम अवधि तक कम करें।",
            "MIXED_FRACTION": "मिश्रित अंश को एक अनुचित अंश में बदलें।",
            "IMPROPER_FRACTION": "अनुचित अंश को एक मिश्रित अंश में बदलें।",
            "LIKEFRACTIONADDITION_NUMERATOR": "दिए गए अंशों के नुमेरेटर को सही ढंग से जोड़ें।",
            "LIKEFRACTIONADDITION_DENOMINATOR": "लाइक अंशों के जोड़ के लिए डिनोमिनेटर वही रहता है।",
            "LIKEFRACTIONADDITION_FULL": "नुमेरेटर के जोड़ की जांच करें। डिनोमिनेटर वही रहता है।",
            "UNLIKEFRACTIONADDITION_NUMERATOR": "सबसे पहले अनलाइक अंशों को लाइक अंशों से परिवर्तित करें। फिर लाइक अंशों के नुमेरेटर को जोड़ें।",
            "UNLIKEFRACTIONADDITION_DENOMINATOR": "सबसे पहले सब से छोटे आम गुणक को ढूंढें और अनलाइक अंशों को लाइक अंशों से परिवर्तित करें। समाधान का डिनोमिनेटर लाइक अंशों का डिनोमिनेटर है।",
            "UNLIKEFRACTIONADDITION_FULL": "दिए गए अंशों को लाइक अंशों से परिवर्तित करें और फिर सावधानीपूर्वक जोड़ें।",
            "LIKEFRACTIONSUBTRACTION_NUMERATOR": "दिए गए अंशों के नुमेरेटर को सही तरीके से घटाएं।",
            "LIKEFRACTIONSUBTRACTION_DENOMINATOR": "लाइक अंशों के घटाव के लिए डिनोमिनेटर प्रश्न के रूप में वही रहता है।",
            "LIKEFRACTIONSUBTRACTION_FULL": "अंशों के नुमेरेटर को घटाएं। डिनोमिनेटर वही रहता है।",
            "UNLIKEFRACTIONSUBTRACTION_NUMERATOR": "सबसे पहले अनलाइक अंशों को लाइक अंशों से परिवर्तित करें। फिर लाइक अंशों के नुमेरटर को घटाएं।",
            "UNLIKEFRACTIONSUBTRACTION_DENOMINATOR": "सबसे पहले सब से छोटे आम गुणक को ढूंढें और अनलाइक अंशों को लाइक अंशों से परिवर्तित करें। समाधान का डिनोमिनेटर लाइक अंशों का डिनोमिनेटर है।",
            "UNLIKEFRACTIONSUBTRACTION_FULL": "दिए गए अंशों को लाइक अंशों से परिवर्तित करें और फिर सावधानीपूर्वक घटाएं।",
            "LIKEMIXEDFRACTIONADDITION_WHOLE": "दोनों अंशों को ध्यान पूर्वक पूरी संख्या के भाग से जोड़ें। समाधान में उचित अंशों के लिए अनुचित अंश के रूपांतरण की जांच करें।",
            "LIKEMIXEDFRACTIONADDITION_NUMERATOR": "लाइक अंशों के नुमेरेटर को जोड़ें। यदि आंशिक भाग एक अनुचित अंश है, तो इसे उचित अंश में परिवर्तित करें।",
            "LIKEMIXEDFRACTIONADDITION_DENOMINATOR": "समाधान अंश का डिनोमिनेटर लाइक अंशों के लिए नहीं बदलता है।",
            "LIKEMIXEDFRACTIONADDITION_FULL": "मिश्रित अंशों को अनुचित अंशों में परिवर्तित करें और फिर उन्हें जोड़ें। अंतिम समाधान फिर मिश्रित अंश के रूप में होना चाहिए।",
            "LIKEMIXEDFRACTIONSUBTRACTION_WHOLE": "दोनों अंशों को सावधानीपूर्वक पूरी संख्या के भाग से घटाएं।",
            "LIKEMIXEDFRACTIONSUBTRACTION_NUMERATOR": "लाइक अंशों के नुमेरेटर को घटाएं।",
            "LIKEMIXEDFRACTIONSUBTRACTION_DENOMINATOR": "समाधान अंश का डिनोमिनेटर लाइक अंशों के लिए नहीं बदलता है।",
            "LIKEMIXEDFRACTIONSUBTRACTION_FULL": "मिश्रित अंशों को अनुचित अंशों में परिवर्तित करें और फिर उन्हें घटायें। अंतिम समाधान फिर मिश्रित अंश के रूप में होना चाहिए।",
            "WHOLEANDPROPERFRACTIONADDITION_WHOLE": "जोड़ा गया पूर्णांक मिश्रित अंश का पूरी संख्या का हिस्सा बन जाता है।",
            "WHOLEANDPROPERFRACTIONADDITION_NUMERATOR": "समाधान अंश का नुमेरेटर वही रहता है।",
            "WHOLEANDPROPERFRACTIONADDITION_DENOMINATOR": "समाधान अंश का डिनोमिनेटर वैसा ही रहता है जैसा कि समस्या में दिया गया है।",
            "WHOLEANDPROPERFRACTIONADDITION_FULL": "पूर्णांक और भिन्न को जब जोड़ा जाता है तो मिश्रित अंश बन जाता है।",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_WHOLE": "पूरे नंबर को बराबर अंश में बदलें। फिर लाइक अंशों के बीच अंतर खोजें।",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_NUMERATOR": "सबसे पहले कम से कम आम गुणक ढूंढें और उन्हें लाइक अंशों के बीच अंतर में परिवर्तित करें। फिर नुमेरेटर को ध्यान से घटाएं।",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_DENOMINATOR": "समाधान अंश का डिनोमिनेटर वैसा ही रहता है जैसा कि समस्या में दिया गया है।",
            "WHOLEANDPROPERFRACTIONSUBTRACTION_FULL": "जब पूर्णांक से भिन्न को घटाया जाता है तो मिश्रित अंश बन जाता है।",
            "WHOLEANDFRACTIONMULTIPLICATION_NUMERATOR": "नुमेरेटर और पूरी संख्या को सावधानी से गुणा करें।",
            "WHOLEANDFRACTIONMULTIPLICATION_DENOMINATOR": "अंशों के डिनोमिनेटर को ध्यान पूर्वक गुणा करें।",
            "WHOLEANDFRACTIONMULTIPLICATION_FULL": "अंश के साथ पूर्णांक को गुणा करें।",
            "FRACTIONMULTIPLICATION_NUMERATOR": "अंशों के नुमेरेटर को ध्यान पूर्वक गुणा करें।",
            "FRACTIONMULTIPLICATION_DENOMINATOR": "अंशों के डिनोमिनेटर को ध्यान पूर्वक गुणा करें।",
            "FRACTIONMULTIPLICATION_FULL": "अंशों के नुमेरेटर और डिनोमिनेटर को गुणा करें।",
            "FRACTIONDIVISION": "सबसे पहले भाजक को पारस्परिक पाते हैं। फिर समाधान प्राप्त करने के लिए भाजक के पारस्परिक के साथ अंश का गुणा करें।"
        },
        "mr": {
            "HINT": "इशारा",
            "MICROHINT": "चूक",
            "SOLUTION": "उत्तर",
            "HELP": "मदत"
        },
        "te": {
            "HINT": "సూచన",
            "MICROHINT": "ప్రత్యేక సూచన",
            "SOLUTION": "పరిష్కారం",
            "HELP": "సహాయం"
        }
    }
});