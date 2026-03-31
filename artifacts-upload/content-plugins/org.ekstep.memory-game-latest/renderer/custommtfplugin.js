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
                ins.showFeedback();
            });
        }
        setTimeout(addEvent, 1000)
    },
    /**
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
