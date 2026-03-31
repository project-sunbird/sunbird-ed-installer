//@ sourceURL=mathedit.js
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
    _type: 'mathedit',
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
        div = document.createElement('div');
        div.id = data.identifier;
        div.style.width = dims.w + "px";
        div.style.height = dims.h + "px";
        div.style.zIndex = data.isSolution ? 10 : 1;
        div.style.textAlign = data.align;
        div.style.verticalAlign = data.valign;
        div.innerHTML = '<p><span style="width:' + dims.w + 'px; height:' + dims.h + 'px;" id="answer"></span></p>';

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
        var MQ = MathQuill.getInterface(2);
        var answerSpan = document.getElementById('answer');
        var answerMathField = MQ.MathField(answerSpan, {
            handlers: {
                edit: function () {
                    var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
                }
            }
        });

    },
});
