//@ sourceURL=htmlpopup-plugin.js
/**
 * Number keyboard plugin - taken from one of the samples provided by EkStep.
 * @extends Plugin
 * @author EkStep team
 */
Plugin.extend({
    target: '',
    buttonSounds: [],
    buttons: [],
    _testis: undefined,
    _type: 'htmlpopup',
    _isContainer: false,
    _render: true,
    //_input:"",
    initPlugin: function (data) {
        var instance = this;
        var div = document.getElementById(data.id);
        var dims = this.relativeDims();
        var latexList = data.content.match(/``.*?``/g);
        _.each(latexList, function (latex) {
            var latexContent = latex.replace(new RegExp("``", 'g'), "");
            var span = '<span class="math" style="font-family:inherit">' + latexContent + '</span>'
            data.content = data.content.replace(latex, span)
        });
        div = document.createElement('div');
        div.id = data.id;
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.zIndex = 10;
        div.innerHTML = '<div class="html_popup" > \
        <div class="html_popup-overlay" onclick="hidePopup('+ data.id + ')"></div>\
        <div class="html_popup_model">\
        <div class="html_popup_header"> \
        <div class="html_popup_header_content">'+ data.type + '</div >\
        <div class="html_popup_clear_btn" style="zoom:30%" onclick="hidePopup('+ data.id + ')"></div></div >\
        <div class="html_popup_content">' + data.content + '</div >\
        </div>\
        </div>\
        </div>';

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
    },
});
