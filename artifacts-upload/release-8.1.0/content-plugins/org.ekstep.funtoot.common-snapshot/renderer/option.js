//@ sourceURL=option.js
OptionPlugin.extend({
    _type: "org.ekstep.funtoot.option",
    initPlugin: function (data) {
        this._super(data);
    },
    /**
     * callback when microhint is clicked
     * gets the microhint data and displays the microhint popup
     */
    onMicroHint: function () {
        console.log("microhint");
        var model = this._modelValue;
        var mhData = {};
        mhData.title = 'Micro hint';
        mhData.type = "mh";
        mhData.x = 10;
        mhData.y = 10;
        mhData.w = 80;
        mhData.h = 60;
        mhData.content = model.mh;
        mhData.mmc = model.mmc;
        return mhData;
    },
    /**
     * callback - called after submit button is pressed.
     * shows or hides microhint depending on the answer given
     * @param {Object} cell- cellId on which the microhint is attached
     */
    onEvaluate: function (cell) {
        console.log('option - onEvaluate called!');
        var areMicrohintsEnabled = this._stage._stageController._data.selectedConfig && !_.isUndefined(this._stage._stageController._data.selectedConfig.areMicrohintsEnabled) ? this._stage._stageController._data.selectedConfig.areMicrohintsEnabled : true
        var model = this._modelValue;
        var tbcobj = PluginManager.getPluginObject(cell + '-mh-mhicon');
        tbcobj._self.visible = !areMicrohintsEnabled ? false : !model.isCorrect;
        tbcobj._data.visible = !areMicrohintsEnabled ? false : !model.isCorrect;
        Renderer.update = !0;
    },
    /**
     *
     */
    renderMCQOption: function () {
        var controller = this._parent._controller,
            itemId = controller.getModelValue("identifier");
        this._parent._options.push(this), this._self.cursor = "pointer";
        var instance = this;

        if (this._self._listeners && Object.keys(this._self._listeners).length > 0) {
            this._self._listeners = {}
        }

        !0 === this._modelValue.selected && this.addShadow(), this._self.on("click", function (event) {
            var val = instance._parent.selectOption(instance);
            var c = 0;
            _.each(instance._parent._options, function (op) {
                if (op._modelValue.answer == true)
                    c += 1;
            });
            if (c == 1) {
                _.each(instance._parent._options, function (op) {
                    var optBorder = PluginManager.getPluginObject(op.id + "_border");
                    if (op._modelValue.selected) {
                        console.log(op.id + " selected");
                        var defaultLineObj = {
                            id: instance.id + "_border",
                            stroke: "#FFCC66",
                            type: "roundrect",
                            h: 100,
                            w: 100,
                            x: 0,
                            y: 0
                        }
                        defaultLineObj["stroke-width"] = 4;
                        PluginManager.invoke('shape', defaultLineObj, instance, instance._stage, instance._theme);

                    } else {
                        console.log(op.id + " selected false");
                        if (optBorder)
                            optBorder._self.visible = false
                    }
                });
            } else if (c > 1) {
                var op = instance._parent._options[instance._index]
                var optBorder = PluginManager.getPluginObject(op._modelValue.value.$t + op.id + "_border");
                if (op._modelValue.selected) {
                    if (!optBorder) {
                        console.log(op.id + " selected");
                        var defaultLineObj = {
                            id: op._modelValue.value.$t + instance.id + "_border",
                            stroke: "#FFCC66",
                            type: "roundrect",
                            h: 100,
                            w: 100,
                            x: 0,
                            y: 0
                        }
                        defaultLineObj["stroke-width"] = 4;
                        PluginManager.invoke('shape', defaultLineObj, instance, instance._stage, instance._theme);
                    } else {
                        //if (optBorder._self.visible == true) {
                        var defaultLineObj = {
                            id: op._modelValue.value.$t + instance.id + "_border",
                            stroke: "#FFCC66",
                            type: "roundrect",
                            h: 100,
                            w: 100,
                            x: 0,
                            y: 0
                        }
                        defaultLineObj["stroke-width"] = 4;
                        PluginManager.invoke('shape', defaultLineObj, instance, instance._stage, instance._theme);
                        //}
                        optBorder._self.visible = true;
                    }
                } else {
                    console.log(op.id + " selected false");
                    if (optBorder)
                        optBorder._self.visible = false
                }
            }
            /* var optBorder = PluginManager.getPluginObject(instance.id + "_border");
             if (!instance.hasShadow()) {

                 if (!optBorder) {
                     var defaultLineObj = {
                         id: instance.id + "_border",
                         stroke: "#000000",
                         h: 100, w: 100, x: 0, y: 0, type: "rect",
                     }
                     PluginManager.invoke('shape', defaultLineObj, instance, instance._stage, instance._theme);
                 }
                 else optBorder._self.visible = true;

             }
             else {
                 optBorder._self.visible = false;
             }*/
            OverlayManager.handleSubmit();
            var data = {
                type: event.type,
                x: event.stageX,
                y: event.stageY,
                choice_id: instance._value.resindex,
                itemId: itemId,
                res: [{
                    option: instance._value.resvalue
                }],
                state: val ? "SELECTED" : "UNSELECTED",
                optionTag: "MCQ"
            };
            EventBus.dispatch("optionSelected", instance._value), EventManager.processAppTelemetry({}, "CHOOSE", instance, data);
        });
    },
    renderText: function (data) {
        data.id = data.id || this._data.id + '-text';
        data.identifier = _.uniqueId("opt-mathtext");
        data.content = data.$t = data.asset;
        var padx = this._data.padX || 0,
            pady = this._data.padY || 0;
        data.x = padx, data.y = pady, data.w = 100 - 2 * padx, data.h = 100 - 2 * pady,
            data.fontsize = data.fontsize ? data.fontsize : 200;
        var align = this._data.align ? this._data.align.toLowerCase() : "center",
            valign = this._data.valign ? this._data.valign.toLowerCase() : "middle";
        data.align = align, data.valign = valign;
        PluginManager.invoke("mathtext", data, this, this._stage, this._theme)
        this._data.asset = data.asset;
    },
    renderImage: function (value) {
        var data = {};
        data.asset = value.asset;
        data.align = "center";
        data.valign = "middle";
        var padx = this._data.padX || 0,
            pady = this._data.padY || 0;
        data.x = padx, data.y = pady, data.h = 95,
            value.count ? (data.count = value.count, data.type = "gridLayout", PluginManager.invoke("placeholder", data, this, this._stage, this._theme)) : PluginManager.invoke("image", data, this, this._stage, this._theme),
            this._data.asset = value.asset;
    },

});