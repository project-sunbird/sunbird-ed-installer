//@ sourceURL=CustomNumKeyboard.js
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
    _type: 'nkeyboard',
    _isContainer: false,
    _render: true,
    //_input:"",
    initPlugin: function (data) {
        var instance = this;
        var div = document.getElementById(data.id);
        var dims = this.relativeDims();

        var asset = data.asset;
        if (div) {
            jQuery("#" + data.id).remove();
        }

        div = document.createElement('div');

        target = data.target;
        //get language specific unicodes for displaying numbers in specified language
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var langId = i18n.config.numericLangId
        buttons = i18n.getNumbers(langId);
        var specialChar = ["+", "-", "\u00D7", "\u00F7", "=", "<", ">", "/"];
        buttons = buttons.concat(specialChar);
        //buttons = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "-", "\u00D7", "\u00F7", "=", "<", ">", "/", "."];

        div.id = "keyboardNumber";
        div.style.width = dims.w + "px";
        div.style.height = dims.h + "px";
        div.innerHTML = '';

        var clearKey = '<div class="key_number key_number_clear " id="clear_btn"></div>';

        var customKeys = '';
        for (var i = 0; i < buttons.length; i++) {
            if (i % 10 == 0) {
                customKeys += '<div class="key_number firstkey" id="' + buttons[i] + '_btn">' + buttons[i] + '</div>';
            } else {
                customKeys += '<div class="key_number" id="' + buttons[i] + '_btn">' + buttons[i] + '</div>';
            }
        }


        customKeys += clearKey;
        div.innerHTML = customKeys;
        function applyStyle() {
            var lh = dims.h * 41 / 100;
            $(".key_number").css("line-height", lh + "px");
        };
        $(document).ready(function () {
            setTimeout(applyStyle, 100);
        });


        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        for (var i = buttons.length - 1; i >= 0; i--) {
            this.assignButtonEvent(buttons[i], asset, data.limit);
        };

        var clear_btn = document.getElementById('clear_btn');
        clear_btn.addEventListener("click", function () {
            var txtObject = PluginManager.getPluginObject(target);
            var currentText = txtObject._self.text;
            currentText = currentText.slice(0, -1);
            txtObject._self.text = currentText;
            Renderer.update = true;
            (!instance._data.controller) ? instance._stage.setModelValue(txtObject._data.model, txtObject._self.text) :
                instance.updateModel(txtObject._data.model, txtObject._self.text);
        });

        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
    },
    switchTarget: function (action) {
        target = action.id;
    },
    assignButtonEvent: function (id, asset, limit) {
        var btn = document.getElementById(id + '_btn');
        var instance = this;
        btn.addEventListener("click", function () {
            var newText = PluginManager.getPluginObject(target);
            limit = newText._data.limit || limit;
            if (newText._self.text.length < limit) {
                newText._self.text += id;
            }
            Renderer.update = true;
            (!instance._data.controller) ? instance._stage.setModelValue(newText._data.model, newText._self.text) :
                instance.updateModel(newText._data.model, newText._self.text);
        });
    },
    updateModel: function (model, value) {
        var ctrl = this._stage.getController(this._data.controller);
        //  ctrl.setModelValue(model, value);
        // [Ram 20170209] Since ctrl.setModelValue does not work when the model parameter has a '.' in it
        // the below code is used for the time being, until we have the ctrl.setModelValue fixed
        // to handle when model come with dots
        eval('ctrl.getModel().model.' + model + '=' + JSON.stringify(value));
    }
});
