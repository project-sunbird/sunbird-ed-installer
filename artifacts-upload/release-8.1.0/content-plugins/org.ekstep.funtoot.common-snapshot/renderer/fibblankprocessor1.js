//@ sourceURL=fibblankprocessor.js
/**
 *Math text plugin
 * @extends Plugin
 * @author EkStep team
 */
org.ekstep.plugins.funtoot.util = {};
org.ekstep.plugins.funtoot.util.FibProcessor = Class.extend({
    processBlanks: function (div, src) {
        console.log("processBlanks");
        var inst = this;
        var blankList = div.innerText.match(/__.*?__/g);
        var blankIds = [];
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

        return this._mathQuillFields;
    },
    tryi: function () {
        console.log("MH");
    }
});
org.ekstep.plugins.funtoot.util.FibBlank = Class.extend({
    init: function (answerSpan) {
        var MQ = MathQuill.getInterface(2);
        var answerMathField = MQ.MathField(answerSpan, {
            handlers: {
                edit: function () {
                    var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
                }
            }
        });
        this.blankId = answerSpan.id;
        this.field = answerMathField;
    },
    getUserValue: function () {
        return this.field.latex();
    },
    setState: function (isSolved) {
        var imgId = this.blankId.replace("fib", "img");
        var img = document.getElementById(imgId);
        var span = document.getElementById(this.blankId);
        if (!isSolved) {
            $("#" + imgId).removeClass('hide_micro_hint');
            span.style.border = "1px solid red"
        }
        else {
            $("#" + imgId).addClass('hide_micro_hint');
            span.style.border = "1px solid green"
        }
    }
});

