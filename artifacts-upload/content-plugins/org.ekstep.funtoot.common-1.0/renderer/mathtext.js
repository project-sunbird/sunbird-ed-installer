//@ sourceURL=mathtext.js
/**
 *Math text plugin
 * @extends Plugin
 * @author EkStep team
 */
Plugin.extend({
    target: '',
    buttonSounds: [],
    buttons: [],
    _testis: undefined,
    _type: 'mathtext',
    _isContainer: false,
    _render: true,
    //_input:"",
    initPlugin: function (data) {
        var instance = this;
        var dims = this.relativeDims();

        var asset = data.asset;
        var div = document.getElementById(data.id);
        if (div)
            jQuery("#" + data.id).remove();
        /* div = document.createElement('div');
        div.id = data.identifier;
        div.style.width = dims.w + "px";
        div.style.height = dims.h + "px";
        div.style.zIndex = data.isSolution ? 10 : 1;
        div.style.textAlign = data.align;
        div.style.verticalAlign = data.valign; */
        var latexList = data.content.match(/``.*?``/g);
        _.each(latexList, function (latex) {
            var latexContent = latex.replace(new RegExp("``", 'g'), "");
            var span = '<span class="math" style="font-family:inherit">' + latexContent + '</span>'
            data.content = data.content.replace(latex, span)
        });
        div = this.getHtmlElement(data.identifier, data.content, dims, data.align);
        div.style.width = dims.w + "px";
        div.style.height = dims.h + "px";
        if (data.fontsize)
            div.style.fontSize = data.fontsize;
        /*var blankList = data.content.match(/__.*?__/g);
        _.each(blankList, function (blank) {
            var blankContent = "fib" + blank.replace(new RegExp("__", 'g'), "");
            var input = '<input style="pointer-events: fill; border:1px solid black"  id ="' + blankContent + '">';
            data.content = data.content.replace(blank, input)

        });*/
        //div.innerHTML = data.content;

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
        var MQ = MathQuill.getInterface(2);
        var problemSpans = div.getElementsByClassName('math');
        _.each(problemSpans, function (problemSpan) {
            MQ.StaticMath(problemSpan);
        })

        /*var inputlist = document.getElementsByTagName("input")
        _.each(inputlist, function (input) {
            input.addEventListener("click", new FibEval().onClick);
        });*/
    },
    getHtmlElement: function (id, content, dims, align) {
        if(align == undefined)align = "center";
        var template = document.createElement('div');
        template.innerHTML =
            '<div id="' + id + '" style="pointer-events: none;"><div style="display:table; margin:0 auto; width:' + dims.w + 'px; height:' + dims.h + 'px">\
                <div style="display:table-cell; vertical-align:middle; text-align:'+ align +'">' + content + '</div>\
            </div></div>';
        return template.firstChild;
    },
    eventFire: function (el, etype) {
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }
});
