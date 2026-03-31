//@ sourceURL=fibblankprocessor.js
/**
 * Math text plugin
 * @extends Plugin
 * @author EkStep team
 */
org.ekstep.plugins.funtoot = org.ekstep.plugins.funtoot || {};
org.ekstep.plugins.funtoot.util = org.ekstep.plugins.funtoot.util || {};
org.ekstep.plugins.funtoot.util.FibProcessor = Class.extend({
    processBlanks: function (div, options) {
        console.log("processBlanks");
        var inst = this;
        var blankPlaceHolders = div.innerText.match(/__.*?__/g);
        var blankIds = [];
        // to disable keyBoard
        MathQuill.config({
            substituteTextarea: function () {
                var textArea = $('<span></span>');
                textArea[0].select = angular.noop;
                textArea[0].val = function (val) {
                    return textArea.data('__val', val);
                };
                return textArea[0];
            }
        });
        if (blankPlaceHolders) {
            _.each(blankPlaceHolders, function (placeHolder) {
                var blankId = "fib" + placeHolder.replace(new RegExp("__", 'g'), "");
                var mhImgId = blankId.replace("fib", "img");
                blankIds.push(blankId);
                //var blank = '<img class="hide_micro_hint" id="' + mhImgId + '" style="width:25px;" src="' + mhSrc + '" /><span style="font-family:inherit; pointer-events: fill; min-width:70px; min-height:20px; text-align: center;" id="' + blankId + '"></span>';
                var blank = '<span style="display: inline-block";><span id="' + blankId + '"></span></span>';
                div.innerHTML = div.innerHTML.replace(placeHolder, blank)
            });
            div.innerHTML = div.innerHTML;
            var fibBlankObjs = {};
            _.each(blankIds, function (blankId) {
                //var blankElt = document.getElementById(blankId);
                var fibBlankObj = new org.ekstep.plugins.funtoot.util.FibBlank(blankId, options);
                fibBlankObjs[blankId] = fibBlankObj;
            })
        }
        return fibBlankObjs;
    },
});

org.ekstep.plugins.funtoot.util.FibBlank = Class.extend({
    init: function (blankId, options) {
        var blankElt = document.getElementById(blankId);
        $("#" + blankId).addClass('ft_html_blank_span');
        var img = document.createElement('img');
        img.id = blankId.replace("fib", "img");
        img.src = options["instance"]._theme.getAsset("html-micro-hint");
        img.style.width = "4.3vw";
        img.style.pointerEvents = "fill";
        img.className = 'ft_micro_hint_hide';
        img.onclick = "alert('HI')";
        blankElt.parentNode.insertBefore(img, blankElt);
        console.log(div.innerText);
        var MQ = MathQuill.getInterface(2);
        var answerMathField = MQ.MathField(blankElt);
        this.blankId = blankElt.id;
        this.field = answerMathField;
    },
    getUserValue: function () {
        return this.field.latex();
    },
    setState: function (isSolved, areMicrohintsEnabled) {
        var imgId = this.blankId.replace("fib", "img");
        var img = document.getElementById(imgId);
        var span = document.getElementById(this.blankId);
        if (!isSolved && areMicrohintsEnabled) {
            $("#" + imgId).removeClass('ft_micro_hint_hide');
            span.style.border = "0.2vw solid red"
        } else {
            $("#" + imgId).addClass('ft_micro_hint_hide');
            span.style.border = "0.2vw solid green"
        }
    },
    registerEvents: function () {
        console.log(this.blankId);
        if (this.model && !this.model.isSolution) {
            $("#" + this.blankId).click(function (evt) {
                var keyBoardObj = PluginManager.getPluginObject("keyboardAdapter");
                keyBoardObj.switchTarget(evt.currentTarget.id);
            })
            $("#" + this.blankId.replace("fib", "img")).click(function (evt) {
                var helper = PluginManager.getPluginObject('plugin_helper');
                //var model = this.itemCtrl.getModelValue(this._data.model);
                var mhData = {};
                mhData.title = 'Micro hint';
                mhData.type = "mh";
                mhData.containerId = '_ft_microhint_content_container__';
                mhData.x = 10;
                mhData.y = 10;
                mhData.w = 80;
                mhData.h = 60;
                mhData.content = this.model.mh;
                mhData.mmc = this.model.mmc;
                helper.showPopup(mhData);
            }.bind(this));
        }
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
    },
    setModel: function (m) {
        this.model = m;
        if (this.model.isSolution)
            this.field.write(this.model.e);
    },
    /*showAnswer: function () {
        this.field.write(this.model.e);
    }*/
});