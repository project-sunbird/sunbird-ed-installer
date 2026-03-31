/**
 * This method renders cmtf to add a custom mtf on the canvas and manages lhs and rhs
 * @memberof cmtf
 */
Plugin.extend({
    _type: 'cmtf',
    _isContainer: true,
    _render: true,
    _lhs_options: [],
    _rhs_options: [],
    _force: false,
    _controller: undefined,
    initPlugin: function(data) {

        this._lhs_options = [];
        this._rhs_options = [];
        this._force = false;
        var qid;
        var model = data.model;
        if (model) {
            var controller = this._stage.getController(model);
            if (controller) {
                this._controller = controller;
                this._force = data.force;
                if ((typeof this._force) == 'undefined' || this._force == null) {
                    this._force = false;
                }
                this._data.x = this._parent._data.x;
                this._data.y = this._parent._data.y;
                this._data.w = this._parent._data.w;
                this._data.h = this._parent._data.h;
                this._self = new createjs.Container();
                var dims = this.relativeDims();
                this._self.x = dims.x;
                this._self.y = dims.y;
                this.invokeChildren(data, this, this._stage, this._theme);
                qid = controller._model.identifier;
            }
        }
        var instance = this;
        if (qid)
            this._assessStartEvent = TelemetryService.assess(qid, "LIT", "EASY", { stageId: instance._stage._currentState.stage.id, subtype: " " });
        this.addSubmitEvent();
    },
    /**
     * This method returns a lhs object based on given index
     * @param {number} index, it is the index no of an object in the array
     * @memberof cmtf
     */
    getLhsOption: function(index) {
        var option;
        this._lhs_options.forEach(function(opt) {
            if (opt._index == index) {
                option = opt;
            }
        });
        return option;
    },
    // Deprecated - Use setAnswerMapping instead
    setAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, 'selected');
    },
    /**
     * This method sets answer for each lhs object 
     * @param {object} rhsOption, it is a rhs object
     * @param {object} lhsOption, it is a lhs object
     * @memberof cmtf
     */
    setAnswerMapping: function(rhsOption, lhsOption) {
        if (!_.isUndefined(lhsOption)) {
            rhsOption._value.mapped = lhsOption._value.resvalue;
            this._controller.setModelValue(rhsOption._model, lhsOption._index, 'selected');
        } else {
            delete rhsOption._value.mapped;
            this._controller.setModelValue(rhsOption._model, undefined, 'selected');
        }
    },
    /**
     * This method removes anwser for a given rhs option
     * @param {object} rhsOption, it is a rhs object
     * @param {number} lhsIndex, it is the index number of lhs option
     * @memberof cmtf
     */
    removeAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, '');
    },
    /**
     * This method adds submit event and associated actions for the submit button
     * @memberof cmtf
     */
    addSubmitEvent: function() {
        var ins = this;

        function addEvent() {
            PluginManager.getPluginObject("submit_enabled")._self.on("click", function() {
                var item = ins._controller._model;
                var result = ins.getCMTFEvaluator().evaluate(item);
                if (result) {
                    pass = result.pass;
                    item.score = result.score;
                }
                try {
                    var data = {
                        pass: result.pass,
                        score: item.score,
                        res: result.res,
                        mmc: item.mmc,
                        qindex: item.qindex,
                        mc: _.pluck(item.concepts, 'identifier'),
                        qtitle: item.title,
                        qdesc: item.description ? item.description : ""
                    };
                    TelemetryService.assessEnd(ins._assessStartEvent, data);

                } catch (e) {
                    console.log(e);

                }
                console.info("Item Eval result:", result);
                ins.makePopup(result.pass);
            });
        }
        setTimeout(addEvent, 1000)
    },
    /**
     * Deprecated: See makePopup()
     * This method displays completition popup and plays completition sound
     * @memberof cmtf
     */
    showFeedback: function() {
        var ins = this;
        var overLayObj = PluginManager.getPluginObject("overlayPopup");
        var popupObj = PluginManager.getPluginObject("gdjobimg");
        audiManager.getAudiManager().play({ asset: "goodjob_sound", stageId: this._stage._id });
        overLayObj._self.visible = true;
        popupObj._self.visible = true;
        ins._stage._self.setChildIndex(overLayObj._self, ins._stage._self.numChildren - 2);
        ins._stage._self.setChildIndex(popupObj._self, ins._stage._self.numChildren - 1);
        Renderer.update = true;
    },
    makePopup: function(isCorrect) {
        var popupObj = {};
        var overLay = {};
        overLay.id = "overlayPopup2";
        overLay.x = "0";
        overLay.y = "0";
        overLay.h = "100";
        overLay.w = "100";
        overLay.type = "rect";
        overLay.hitArea = "true";
        overLay.fill = "#000";
        overLay.visible = false;
        overLay.opacity = 0.5;
        //Creating goodjob and retry popup
        if (isCorrect === true) {
            popupObj = PluginManager.getPluginObject("gdjobimg");
        } else if (isCorrect === false) {
            console.log('makepopup', isCorrect);
            var popup = {};
            popup.id = "retry_image";
            popup.x = "15";
            popup.y = "10";
            popup.h = "65";
            popup.hitArea = "true";
            popup.visible = true;
            popup.asset = "retry_image";
            popup.valign = "middle";
            popup.align = 'center';
            if(this._stage._childIds.indexOf('retry_image') < 0) {
                PluginManager.invoke("image", popup, this._stage, this._stage, this._theme);
            }
            popupObj = PluginManager.getPluginObject("retry_image");
        }
        if(this._stage._childIds.indexOf('overlayPopup2') < 0) {
            PluginManager.invoke('shape', overLay, this._stage, this._stage, this._theme);
        }
        var OverlayObj = PluginManager.getPluginObject("overlayPopup2");
        OverlayObj._self.visible = true;
        popupObj._self.visible = true;
        this._stage._self.setChildIndex(OverlayObj._self, this._stage._self.numChildren - 2);
        this._stage._self.setChildIndex(popupObj._self, this._stage._self.numChildren - 1);
        this.addPopupEvent(isCorrect);
    },

    addPopupEvent: function(which) { //Click event on popups
        var ins = this;
        var dims = this.relativeDims();
        console.log("this is click on goodjob", dims);
        var OverlayObj = PluginManager.getPluginObject("overlayPopup2");
        //adding click event on the level complete popup
        if (which === false) {
            var retryPopupObj = PluginManager.getPluginObject("retry_image");

            var nextbutton = new createjs.Shape().set({name: 'nextbutton'});
            nextbutton.graphics = new createjs.Graphics().beginFill("#ffffff").drawRect( //this is the skip button on retry popup
                83 * dims.w * 0.01,
                56 * dims.h * 0.01,
                13 * dims.w * 0.01,
                24 * dims.h * 0.01);
            nextbutton.alpha = 1;
            retryPopupObj._parent.addChild(nextbutton);

            var againbutton = new createjs.Shape().set({name: 'againbutton'});
            againbutton.graphics.beginFill("#ffffa5").drawRect( //this is the retry button on the retry popup
                80 * dims.w * 0.01,
                20 * dims.h * 0.01,
                20 * dims.w * 0.01,
                33 * dims.h * 0.01);
            againbutton.alpha = 0.1;
            retryPopupObj._parent.addChild(againbutton);

            againbutton.addEventListener("click", function(e) {
                // instance.addInteractEvent("TOUCH", "TOUCH", "retryPopup : again");
                retryPopupObj._self.visible = false;
                OverlayObj._self.visible = false;
                var stageChilds = retryPopupObj._parent._self.children;
                stageChilds.forEach(function (c) {
                   if(c.name === 'nextbutton' || c.name === 'againbutton') {
                       c.visible = false;
                       retryPopupObj._parent.removeChild(e.target);
                   }
                });
                Renderer.update = true;
            });

            this._stage._self.setChildIndex(nextbutton, this._stage._self.numChildren - 2);
            this._stage._self.setChildIndex(againbutton, this._stage._self.numChildren - 1);
        }

    },
    /**
     * This method implements evaluation logic for custom mtf evaluation
     * @return {object} evalObj, object containing evaulate method to evaluate a submitted cmtf
     * @memberof cmtf
     */
    getCMTFEvaluator: function() {
        var evalObj = {
            evaluate: function(item) {
                var result = {};
                var pass = true;
                var score = 0;
                var res = [];

                if (item) {
                    var options = item.rhs_options;
                    if (_.isArray(options)) {
                        _.each(options, function(opt) {

                            // Generate telemetry if there was a response to this option (rhs -> lhs)
                            if (typeof opt.selected != 'undefined') {
                                var obj = {};
                                obj[opt.value.resvalue] = opt.value.mapped;
                                res.push(obj);
                            }

                            // Answer is specified and correctly matched
                            if (typeof opt.answer != 'undefined') {
                                if (opt.answer == opt.selected) {
                                    score += (_.isNumber(opt.score)) ? opt.score : 1;
                                }
                            } else {
                                // Answer is not specified, but still matched (distractor)
                                if (typeof opt.selected != 'undefined') {
                                    pass = false;
                                }
                            }
                        });
                    }

                    if (pass) {
                        var ansMatched = _.isEqual(_.pluck(options, "selected"), _.pluck(options, "answer"));
                        pass = ansMatched;
                    }

                    if (!pass) {
                        result.feedback = item.feedback;
                        if (!item.partial_scoring) {
                            score = 0;
                        }
                    }
                }

                result.pass = pass;
                result.score = score;
                result.res = res;

                return result;
            },

            reset: function(item) {
                if (item) {
                    var options = item.rhs_options;
                    if (_.isArray(options)) {
                        options.forEach(function(opt) {
                            opt.selected = undefined;
                            delete opt.value.mapped;
                        });
                    }
                }
            }
        }
        return evalObj;
    }
});
