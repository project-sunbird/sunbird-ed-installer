//@ sourceURL=fibblankprocessor.js
/**
 *Math text plugin
 * @extends Plugin
 * @author EkStep team
 */
org.ekstep.plugins.funtoot.util = {};
org.ekstep.plugins.funtoot.util.FibProcessor = Class.extend({
    processBlanks: function (div) {
        console.log("processBlanks");
        var inst = this;
        var blankList = div.innerText.match(/__.*?__/g);
        var blankIds = [];
        var src = "";
        if (blankList) {
            _.each(blankList, function (blank) {
                var blankContent = "fib" + blank.replace(new RegExp("__", 'g'), "");
                var imgId = blankContent.replace("fib", "img");
                blankIds.push(blankContent);
                var input = '<img class="hide_micro_hint" id="' + imgId + '" style="width:25px;" src="' + src + '" /><span style="font-family:inherit; pointer-events: fill; min-width:70px; min-height:20px; text-align: center;" id="' + blankContent + '"></span>';
                div.innerText = div.innerText.replace(blank, input)

            });
            div.innerHTML = div.innerText;
            this._mathQuillFields = {};
            _.each(blankIds, function (bId) {
                var answerSpan = document.getElementById(bId);
                var fibBlankObj = new org.ekstep.plugins.funtoot.util.FibBlank(answerSpan);
                inst._mathQuillFields[bId] = fibBlankObj;
            })
        }
        MathQuill.config({
            substituteTextarea: function () {
                var textArea = $('<span></span>');
                textArea[0].select = angular.noop;
                textArea[0].val = function (val) {
                    return textArea.data('__val', val);
                };
                return textArea[0];
            }
        })

        return this._mathQuillFields;
    },
    addEvents: function () {
        $(document).ready(function () {
            var keyBoardObj = PluginManager.getPluginObject("keyboardAdapter");  // when the page has loaded...
            //  keyBoardObj.setBlanks(inst._mathQuillFields);
            _.each(blankIds, function (bId) {
                $("#" + bId).click(function (evt) {
                    keyBoardObj.onShowKeyboard();
                    keyBoardObj.switchTarget(bId);
                    console.log('click on ', bId);
                    _.each(inst._mathQuillFields, function (mqField) {
                        mqField.blur();
                    })
                    var focussedBlank = inst._mathQuillFields[bId];
                    focussedBlank.focus();
                })
            })
        });
    }
});
org.ekstep.plugins.funtoot.util.FibBlank = Class.extend({
    init: function (answerSpan) {
        var MQ = MathQuill.getInterface(2);
        var answerMathField = MQ.MathField(answerSpan, {
            "border-color": white,
            handlers: {
                edit: function () {
                    var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
                }
            }
        });
        this.field = answerMathField;
        this.blankId = answerSpan.id;
    },
    getUserValue: function () {
        return this.field.latex();
    },
    setState: function () {

    },
    addEvents: function () {
        console.log(this.blankId);
        var keyBoardObj = PluginManager.getPluginObject("keyboardAdapter");
        $("#" + this.blankId).click(function (evt) {
            keyBoardObj.switchTarget(evt.currentTarget.id);
        })
    },
    write: function (value) {
        this.field.write(value);
    },
    command: function (value) {
        this.field.cmd(value);
    },
    keystroke: function (value) {
        this.field.keystroke(value);
    },
    blur: function () {
        this.field.blur();
    },
    focus: function () {
        this.field.focus();
    }
});

