/**
 * This plugin renders the org.ekstep.akshara-teaching and invokes serveral other plugins 
 * create a content (learn aksharas through a series of memorygame)
 * @class org.ekstep.akshara-teaching
 * @extends Plugin
 * @author Devendra Singh <devendra.singh@tarento.com>
 */
Plugin.extend({
    _type: 'org.ekstep.akshara-teaching',
    _isContainer: true,
    _render: true,
    _options: [],
    _controller: undefined,
    _shadow: '#0470D8',
    _blur: 30,
    _offsetX: 0,
    _offsetY: 0,
    _highlight: '#E89241',
    _memory_values: [],
    _memory_tiles: [],
    _tiles_flipped: 0,
    _levelIndex: 0,
    _maxLevelIndex: 0,
    _isLocked: false,
    _repeatIndex: 0,
    _maxRepeatIndex: 0,
    _roundIndex: 0,
    _textPlugin: undefined,
    _contPattern: undefined,
    _assessStartEvent: undefined,
    _noOfClicks: undefined,
    initPlugin: function(data) {
        this._options = [];
        this._shadow = '#0470D8';
        this._blur = 30;
        this._offsetX = 0;
        this._offsetY = 0;
        this._memory_values = [];
        this._memory_tiles = [];
        this._noOfClicks = 0;
        var model = data.config.__cdata;
        if (model) {
            this.initController(data);
            this.addTemplates();
            var controller = this._stage._stageController;
            if (controller) {
                this._contPattern = "data." + data.id;
                this._controller = controller;
                this.resetLevelIndex();
                this.resetRepeatIndex();
                if (!this._controller.oldAksharas) {
                    this._controller.oldAksharas = this._controller._data.aksharas;
                }
                this.resetRoundIndex();
                if (!this._controller.isResetAkshara) {
                    this.resetAksharas(model);
                }

                if (!this._controller.selectedWords) {
                    this.resetWords(model);
                }
                var newIns = this;

                function updateView() {
                    if (!newIns._controller.isMTF) {
                        newIns.updateGameStatus();
                        PluginManager.getPluginObject("game_status")._self.visible = true;
                        newIns._self.visible = true;
                        PluginManager.getPluginObject("assess_group")._self.visible = false;
                        PluginManager.getPluginObject("submit_btn_group")._self.visible = false;
                    } else {
                        PluginManager.getPluginObject("game_status")._self.visible = false;
                        newIns._self.visible = false;
                        if (!newIns._controller.quesIndex || newIns._controller.quesIndex == 1) {
                            PluginManager.getPluginObject("assess_group")._self.visible = true;
                        } else if (newIns._controller.quesIndex == 2) {
                            PluginManager.getPluginObject("assess_group_one")._self.visible = true;
                            newIns._controller.quesIndex = undefined;
                        }
                        PluginManager.getPluginObject("submit_btn_group")._self.visible = true;


                    }
                }
                setTimeout(updateView, 100);
                this._data.x = data.x;
                this._data.y = data.y;
                this._data.w = data.w;
                if (!this._controller.isDimUpdated) {
                    this._data.h = data.h - 10;
                    this._controller.isDimUpdated = true;
                }
                var dims = this.relativeDims();
                this._self = new createjs.Container();
                this._self.x = dims.x;
                this._self.y = dims.y + 10;

                if (controller._data.backFaceColor) {
                    this._highlight = controller._data.backFaceColor;
                }
                if (controller._data.frontFaceColor) {
                    this._fillColor = controller._data.frontFaceColor;
                }
                if (controller._data.textColor) {
                    this._textColor = controller._data.textColor;
                }
                if (controller.getModelValue("cols")) {
                    data.cols = controller.getModelValue("cols");
                }
                if (controller.getModelValue("rows")) {
                    data.rows = controller.getModelValue("rows");
                }
                PluginManager.invoke('tiles', data, this, this._stage, this._theme);
                PluginManager.invoke('set', { "param": "overlayNext", "scope": "stage", "value": "off" }, this._stage, this._stage, this._theme);
                this.createPopup();
                this.addGameElements(data);
                var instance = this;
                this._assessStartEvent = TelemetryService.assess("eks.aksharaTeaching.01", "LIT", "EASY", { stageId: instance._stage._currentState.stage.id, subtype: " " });

            }
        }
    },
    /**
     * This method sets game level index and max game level Index
     * @memberof org.ekstep.akshara-teaching
     */
    resetLevelIndex: function() {
        this._maxLevelIndex = this._controller._data.gameLevels.length - 1;
        if (!this._controller.levelIndex) {
            this._controller.levelIndex = this._levelIndex;
        } else if (this._controller.levelIndex > this._maxLevelIndex) {
            this._levelIndex = this._maxLevelIndex;
        } else {
            this._levelIndex = this._controller.levelIndex;
        }
    },
    /**
     * This method sets game repeat index and max game repeat Index
     * @memberof org.ekstep.akshara-teaching
     */
    resetRepeatIndex: function() {
        this._maxRepeatIndex = this._controller._data.repetition - 1;
        if (!this._controller.repeatIndex) {
            this._controller.repeatIndex = this._repeatIndex;
        } else if (this._controller.repeatIndex > this._maxRepeatIndex) {
            this._repeatIndex = this._maxRepeatIndex;
        } else {
            this._repeatIndex = this._controller.repeatIndex;
        }

    },
    /**
     * This method sets game round index and max game round Index
     * @memberof org.ekstep.akshara-teaching
     */
    resetRoundIndex: function() {
        var l = this._controller.oldAksharas.length;
        var maxRoundIndex;
        if (l <= 5) {
            maxRoundIndex = 0;
        } else if (l > 5) {
            var rem5 = l % 5;
            var rem4 = l % 4;
            var rem3 = l % 3;
            if (rem5 == 0) {
                maxRoundIndex = l / 5 - 1;
            } else if ((rem4 == 0 && rem3 == 0) || rem4 == 0) {
                maxRoundIndex = l / 4 - 1;
            } else if (rem3 == 0) {
                maxRoundIndex = l / 3 - 1;
            } else if (rem5 > 2) {
                maxRoundIndex = Math.floor(l / 5);
            } else if (rem4 > 2) {
                maxRoundIndex = Math.floor(l / 4);
            } else {
                maxRoundIndex = Math.floor(l / 3) - 1;
            }


        }
        this._maxRoundIndex = maxRoundIndex;
        if (!this._controller.roundIndex) {
            this._controller.roundIndex = this._roundIndex;
        } else if (this._controller.roundIndex > this._maxRoundIndex) {
            this._roundIndex = this._maxRoundIndex;
        } else {
            this._roundIndex = this._controller.roundIndex;
        }

    },
    /**
     * This method prepares the words array to be used in the tiles
     * @memberof org.ekstep.akshara-teaching
     */
    resetWords: function() {
        if (!this._controller.oldWords) {
            this._controller.oldWords = this._controller._data.words;
        }
        var index = this._repeatIndex;
        var aks = this._controller._data.aksharas;
        var originalWords = this._controller.oldWords;
        var w = [];
        var maxRepeatIndex = this._maxRepeatIndex;
        _.each(aks, function(obj) {
            var owordcopy = originalWords[obj.text];
            var newObj;
            if (owordcopy.two.length) {
                if (index < ((maxRepeatIndex + 1) / 2)) {
                    newObj = owordcopy.one[index];

                } else {
                    newObj = owordcopy.two[index];
                    // w.push(owordcopy.two[index]);
                }
            } else {
                newObj = owordcopy.one[index];
                // w.push(owordcopy.one[index]);
            }
            newObj.alphabet = obj.text;
            newObj.alphaSound = obj.audioAsset;
            w.push(newObj);
        });
        this._controller.setModelValue("words", w);

    },
    /**
     * This method prepares the aksharas array to be used in the tiles for each individual round
     * @memberof org.ekstep.akshara-teaching
     */
    resetAksharas: function() {
        var a = [];
        var originalAksharas = this._controller.oldAksharas;
        var startIndex = this._roundIndex;
        var length = originalAksharas.length;
        if (length <= 5) {
            a = originalAksharas;
            this._controller.setModelValue("cols", length);
        } else if (length > 5) {
            var rem5 = length % 5;
            var rem4 = length % 4;
            var rem3 = length % 3;
            if (rem5 == 0) {
                this._controller.setModelValue("cols", 5);
                a = originalAksharas.slice(startIndex * 5, (startIndex * 5) + 5);
            } else if ((rem4 == 0 && rem3 == 0) || rem4 == 0) {
                this._controller.setModelValue("cols", 4);
                a = originalAksharas.slice(startIndex * 4, (startIndex * 4) + 4);
            } else if (rem3 == 0) {
                this._controller.setModelValue("cols", 3);
                a = originalAksharas.slice(startIndex * 3, (startIndex * 3) + 3);
            } else if (rem5 > 2) {
                var newcol = 5;
                if (startIndex == this._maxRoundIndex) {
                    newcol = rem5;
                }
                this._controller.setModelValue("cols", newcol);
                a = originalAksharas.slice(startIndex * 5, (startIndex * 5) + newcol);
            } else if (rem4 > 2) {
                var newcol = 4;
                if (startIndex == this._maxRoundIndex) {
                    newcol = rem4;
                }
                this._controller.setModelValue("cols", newcol);
                a = originalAksharas.slice(startIndex * 4, (startIndex * 4) + newcol);
            } else {
                var newcol = 3;
                if (startIndex == this._maxRoundIndex) {
                    newcol = 3 + rem3;
                }
                this._controller.setModelValue("cols", newcol);
                a = originalAksharas.slice(startIndex * 3, (startIndex * 3) + newcol);
            }
        }
        this._controller.setModelValue("rows", 2);
        this._controller.setModelValue("aksharas", a);
        this._controller.isResetAkshara = true;
    },
    /**
     * This method will be called on click of each tile and implements the logic of flipping the tile,
     * match the two consecutively clicked tiles and switches the levels, repetition and round
     * @memberof org.ekstep.akshara-teaching
     */
    flipTile: function(instance) {
        if (this._isLocked)
            return;
        var defaultColor = this._fillColor;
        var obj = instance._value;
        var isImage = instance._self.children[2];
        var isText = instance._self.children[1];
        var lastIndex = instance._self.children.length - 1;
        if (lastIndex === 1) {
            isText = false;
        } else if (lastIndex === 2) {
            isImage = false;
        }

        if (((instance._self.children.length > 1 && !instance._self.children[1].visible) || (instance._self.children.length == 1 && instance._self.children[0].graphics._fill.style == defaultColor)) && !obj.selected) {
            if (instance._value.audioAsset && instance._value.alphaSound) {
                // audiManager.getAudiManager().stopAll();
                audiManager.getAudiManager().play({ asset: instance._value.alphaSound, stageId: this._stage._id, delay: 1500 });
                audiManager.getAudiManager().play({ asset: instance._value.audioAsset, stageId: this._stage._id });
            } else if (instance._value.audioAsset) {
                // audiManager.getAudiManager().stopAll();
                audiManager.getAudiManager().play({ asset: instance._value.audioAsset, stageId: this._stage._id });
            } else if (instance._value.alphaSound) {
                // audiManager.getAudiManager().stopAll();
                audiManager.getAudiManager().play({ asset: instance._value.alphaSound, stageId: this._stage._id });
            }
            this._noOfClicks += 1;
            var tileshape = instance._self.children[0];
            var tile_w = tileshape.width;
            var tile_h = tileshape.height;
            createjs.Tween.get(tileshape, { loop: false }).to({ regX: tileshape.x + tile_w, scaleX: -1 }, 500);
            if (isImage)
                createjs.Tween.get(instance._self.children[2], { loop: false }).wait(200).to({ visible: true }, 250);
            if (isText)
                createjs.Tween.get(instance._self.children[1], { loop: false }).wait(200).to({ visible: true }, 250);
            instance._self.children[0].graphics._fill.style = this._highlight;
            createjs.Tween.get(instance._self.children[lastIndex], { loop: false }).to({ visible: false }, 500);
            //instance._self.children[lastIndex].visible= false;
            createjs.Ticker.addEventListener("tick", tickHandler);
            // push telemetry
            var inst = this;
            var lName = inst._controller._data.gameLevels[inst._levelIndex];

            if (this._memory_values.length === 0 && !obj.selected) {
                obj.selected = true;
                this._memory_values.push(obj);
                this._memory_tiles.push(instance);
                var data = {
                    pos: [{ "x": instance._data.row, "y": instance._data.col, "Round": inst._roundIndex + 1, "Level": inst._levelIndex + 1, "Level Name": lName.levelText }]
                }
                audiManager.getEvenManager().processAppTelemetry({}, 'SHOW', instance, data);
            } else if (this._memory_values.length === 1) {
                if (!obj.selected) {
                    obj.selected = true;
                    this._memory_values.push(obj);
                    this._memory_tiles.push(instance);
                    var data = {
                        pos: [{ "x": instance._data.row, "y": instance._data.col, "Round": inst._roundIndex + 1, "Level": inst._levelIndex + 1, "Level Name": lName.levelText }]
                    }
                    audiManager.getEvenManager().processAppTelemetry({}, 'MATCH', instance, data);
                }
                this._isLocked = false;
                if (this._memory_values.length > 1) {
                    this._isLocked = true;
                    if (this._memory_values[0].id === this._memory_values[1].id) {
                        //If block will execute when both tiles matches which are clicked consecutively
                        this._memory_values[0].selected = true;
                        this._memory_values[1].selected = true;
                        this._tiles_flipped += 2;
                        this._memory_values = [];
                        this._memory_tiles = [];

                        if (this._tiles_flipped === this._options.length) {
                            //If block will execute when last tile matches with its duplicate one in the screen
                            var ins = this;
                            var overLayObj = PluginManager.getPluginObject("overlayPopup");
                            var popupObj = PluginManager.getPluginObject("gdjobimg");
                            var lName = ins._controller._data.gameLevels[ins._levelIndex];

                            if (ins._assessStartEvent) {
                                var data = {
                                    "pass": true,
                                    "score": 1,
                                    "res": [{ "Round": ins._roundIndex + 1, "Level": ins._levelIndex + 1, "Repetition": ins._repeatIndex + 1, "No of clicks": ins._noOfClicks, "Level Name": lName.levelText }],
                                    "qdesc": "Akshara Teaching"
                                };
                                TelemetryService.assessEnd(ins._assessStartEvent, data);
                            }
                            setTimeout(showPopup, 1000);

                            function showPopup() {
                                overLayObj._self.visible = true;
                                popupObj._self.visible = true;
                                ins._stage._self.setChildIndex(overLayObj._self, ins._stage._self.numChildren - 2);
                                ins._stage._self.setChildIndex(popupObj._self, ins._stage._self.numChildren - 1);
                                audiManager.getAudiManager().play({ asset: "goodjob_sound", stageId: ins._stage._id });
                            }



                        }
                        this._isLocked = false;
                    } else {
                        //This block of code executes when both tiles which are clicked consecutively do not matches
                        var ins = this;
                        var instance1 = this._memory_tiles[0];
                        var instance2 = this._memory_tiles[1];
                        var isFlipped = false;
                        //  var newInstance= this;
                        var isImage1 = instance1._self.children[2];
                        var isImage2 = instance2._self.children[2];
                        var isText1 = instance1._self.children[1];
                        var isText2 = instance2._self.children[1];
                        var lastIndex1 = instance1._self.children.length - 1;
                        var lastIndex2 = instance2._self.children.length - 1;
                        if (lastIndex1 === 1) {
                            isText1 = false;
                        } else if (lastIndex1 === 2) {
                            isImage1 = false;
                        }
                        if (lastIndex2 === 1) {
                            isText2 = false;
                        } else if (lastIndex2 === 2) {
                            isImage2 = false;
                        }

                        function flip2Back() {
                            var tileshape1 = instance1._self.children[0];
                            var tileshape2 = instance2._self.children[0];
                            createjs.Tween.get(tileshape1, { loop: false }).wait(400).to({ regX: 0, scaleX: 1 }, 500);
                            createjs.Tween.get(tileshape2, { loop: false }).wait(400).to({ regX: 0, scaleX: 1 }, 500);
                            if (isImage1)
                                createjs.Tween.get(instance1._self.children[2], { loop: false }).to({ visible: false }, 250);
                            if (isText1)
                                createjs.Tween.get(instance1._self.children[1], { loop: false }).to({ visible: false }, 250);
                            if (isImage2)
                                createjs.Tween.get(instance2._self.children[2], { loop: false }).to({ visible: false }, 250);
                            if (isText2)
                                createjs.Tween.get(instance2._self.children[1], { loop: false }).to({ visible: false }, 250);
                            createjs.Tween.get(instance1._self.children[lastIndex1], { loop: false }).to({ visible: true }, 550);
                            createjs.Tween.get(instance2._self.children[lastIndex2], { loop: false }).to({ visible: true }, 550);
                            createjs.Ticker.addEventListener("tick", tickHandler);
                            instance1._self.children[0].graphics._fill.style = defaultColor;
                            instance2._self.children[0].graphics._fill.style = defaultColor;
                            ins._isLocked = false;
                            Renderer.update = true;

                        }
                        setTimeout(flip2Back, 1300)
                        this._memory_values[0].selected = false;
                        this._memory_values[1].selected = false;
                        this._memory_values = [];
                        this._memory_tiles = [];
                    }
                }

            }
        }

        function tickHandler(e) {
            Renderer.update = true;
        }
    },
    /**
     * This method sets a new MTF question in the controller
     * @memberof org.ekstep.akshara-teaching
     */

    resetMTF: function() {
        if (!this._controller.quesIndex) {
            this._controller.quesIndex = 1;
        } else if (this._controller.quesIndex == 1) {
            this._controller.quesIndex = 2;
        }
        var cInstance = audiManager.getContManager().getControllerInstance(this._contPattern);
        var akshras = this._controller.getModelValue("aksharas");
        var words = this._controller.getModelValue("words");
        var it1;
        if (this._controller.quesIndex == 1) {
            it1 = this.getEachItem(1, akshras);
        } else if (this._controller.quesIndex == 2) {
            it1 = this.getEachItem(2, words);
        }
        cInstance._model.identifier = it1.identifier;;
        cInstance._model.qid = it1.qid;
        cInstance._model.qlevel = it1.qlevel;
        cInstance._model.title = it1.title;
        cInstance._model.question = it1.question;
        cInstance._model.max_score = it1.max_score;
        cInstance._model.partial_scoring = it1.partial_scoring;
        cInstance._model.lhs_options = it1.lhs_options;
        cInstance._model.rhs_options = it1.rhs_options;


    },
    /**
     * This method creates a new question item based on given aksharas and question index
     * @param {number} quesIndex, it is the index no of the question   
     * @param {array} akshras, it is array of akshara object which is being used in current round
     * @return {object} newObj, it is the newly created question item
     * @memberof org.ekstep.akshara-teaching
     */
    getEachItem: function(quesIndex, akshras) {
        var newObj = {};
        var roundNo = this._roundIndex + 1;
        newObj.identifier = "aksharaTeaching.round" + roundNo + ".mtf." + quesIndex;
        newObj.qid = "aksharaTeaching.round" + roundNo + ".mtf." + quesIndex;
        newObj.qlevel = "EASY";
        if (quesIndex === 1) {
            newObj.template = "mtf_assessment_one";
            newObj.template_id = "mtf_assessment_one";
        } else {
            newObj.template = "mtf_assessment_two";
            newObj.template_id = "mtf_assessment_two";
        }
        newObj.title = "Match the following.";
        newObj.question = "Match the following.";
        newObj.max_score = 1;
        newObj.partial_scoring = false;
        newObj.lhs_options = [];
        newObj.rhs_options = [];
        _.each(akshras, function(obj, i) {
            var v = {};
            v.type = "mixed";
            v.audio = obj.audioAsset;
            if (obj.alphabet)
                v.text = obj.alphabet
            else
                v.text = obj.text;
            if (obj.imageAsset)
                v.image = obj.imageAsset;
            else
                v.image = "";
            var b = {};
            b.index = i;
            b.value = v;
            var a = {};
            a.value = v;
            a.answer = i;
            newObj.lhs_options.push(b);
            newObj.rhs_options.push(a);
        });
        newObj.rhs_options = _.shuffle(newObj.rhs_options);
        return newObj;
    },
    /**
     * This method creates completition popup to display when a level/repetition/round is completed
     * @memberof org.ekstep.akshara-teaching
     */
    createPopup: function() {
        var overLay = {};
        overLay.id = "overlayPopup"
        overLay.x = "0";
        overLay.y = "0";
        overLay.h = "100";
        overLay.w = "100";
        overLay.type = "rect";
        overLay.hitArea = "true";
        overLay.fill = "#000";
        overLay.visible = false;
        overLay.opacity = 0.5;

        var popup = {};
        popup.id = "gdjobimg"
        popup.x = "15";
        popup.y = "15";
        popup.h = "70";
        popup.hitArea = "true";
        popup.visible = false;
        popup.asset = "goodjob_image";
        popup.valign = "middle";
        popup.align = 'center';

        PluginManager.invoke('shape', overLay, this._stage, this._stage, this._theme);
        PluginManager.invoke("image", popup, this._stage, this._stage, this._theme);
        this.addPopupEvent();
    },
    /**
     * This method adds event and associated action to the completition popup
     * @memberof org.ekstep.akshara-teaching
     */
    addPopupEvent: function() {
        var overLayObj = PluginManager.getPluginObject("overlayPopup");
        var popupObj = PluginManager.getPluginObject("gdjobimg");
        var ins = this;
        popupObj._self.on('click', function(event) {
            // This block of code executes when you click on the success image
            if (ins._controller.repeatIndex < ins._maxRepeatIndex) {
                var isResetRepeat = false;
                if (ins._controller.isMTF) {
                    isResetRepeat = true;
                }
                ins._controller.isMTF = false;
                if (ins._controller.roundIndex <= ins._maxRoundIndex) {
                    if (ins._controller.isAksharas) {
                        changeLevel();
                    } else {
                        ins._controller.repeatIndex = ins._controller.repeatIndex + 1;
                        ins._controller.selectedWords = undefined;
                        if (isResetRepeat) {
                            ins._controller.repeatIndex = 0;
                        }

                        hidePopup();
                        reloadStage();
                    }
                } else {
                    switchStage();
                }

            } else {
                changeLevel();
            }

            function changeLevel() {
                var isLevelFour = false;
                if (ins._controller._model.gameLevels[0].level.toLowerCase() == "level4" && ins._controller.repeatIndex == 0 && ins._controller.roundIndex > 0 && ins._maxRepeatIndex > 0) {
                    isLevelFour = true;
                } else {

                    ins._controller.levelIndex = ins._controller.levelIndex + 1;
                }
                ins._controller.repeatIndex = 0;
                ins._repeatIndex = 0;
                ins._controller.selectedWords = undefined;
                if (ins._controller.levelIndex <= ins._maxLevelIndex || (!_.isUndefined(ins._controller.isSingleRepeatLevel) && ins._controller.isSingleRepeatLevel) || isLevelFour) {
                    if (ins._controller.roundIndex <= ins._maxRoundIndex) {
                        if (ins._controller.isMTF) {
                            ins._controller.levelIndex = 0;
                        }
                        ins._controller.isMTF = false;
                        hidePopup();
                        if (ins._controller.isSingleRepeatLevel)
                            ins._controller.isSingleRepeatLevel = false;
                        if (isLevelFour)
                            ins._controller.repeatIndex = ins._controller.repeatIndex + 1;
                        reloadStage();

                    } else {
                        switchStage();
                    }
                } else {
                    if (ins._controller.roundIndex < ins._maxRoundIndex) {
                        hidePopup();
                        ins.resetMTF();
                        ins._controller.isMTF = true;
                        if (ins._controller.quesIndex == 2) {
                            ins._controller.isResetAkshara = false;
                            ins._controller.roundIndex = ins._controller.roundIndex + 1;
                            ins._controller.levelIndex = 0;
                            ins._levelIndex = 0;
                            if (ins._maxRepeatIndex == 0 && ins._maxLevelIndex == 0) {
                                ins._controller.isSingleRepeatLevel = true;
                            } else {
                                ins._controller.isSingleRepeatLevel = false;
                            }

                        } else {
                            ins._controller.repeatIndex = ins._maxRepeatIndex;
                        }
                        reloadStage();

                    } else {

                        hidePopup();
                        if (ins._controller.roundIndex == ins._maxRoundIndex) {
                            ins.resetMTF();
                            ins._controller.isMTF = true;
                            if (ins._controller.quesIndex == 2) {

                                ins._controller.levelIndex = 0;
                                ins._levelIndex = 0;
                                ins._controller.roundIndex = ins._controller.roundIndex + 1;


                            } else {
                                ins._controller.repeatIndex = ins._maxRepeatIndex;
                            }
                            reloadStage();
                        } else {

                            switchStage();
                        }

                    }
                }
            }

            function hidePopup() {
                overLayObj._self.visible = false;
                popupObj._self.visible = false;

            }

            function reloadStage() {
                var a = {};
                a.type = "command";
                a.command = "reload";
                a.asset = "theme";
                a.value = "homeScreen";
                ins._stage.reload(a);
            }

            function switchStage() {
                OverlayManager.skipAndNavigateNext();
            }

        });
    },
    /**
     * This method update the game status which is displayed on top of screen
     * @memberof org.ekstep.akshara-teaching
     */
    updateGameStatus: function() {
        PluginManager.getPluginObject("game_level")._self.text = this._levelIndex + 1;
        PluginManager.getPluginObject("game_round")._self.text = this._roundIndex + 1;
        PluginManager.getPluginObject("game_repeat")._self.text = this._repeatIndex + 1;
        Renderer.update = true;
    },
    /**
     * This method initializes the controller with the data available for akshara editor
     * @memberof org.ekstep.akshara-teaching
     */
    initController: function(data, contData) {
        var controllerName = "data";
        var controllerId = data.id;
        var stageController = this._theme._controllerMap[controllerId];
        var initialized = (stageController != undefined);
        if (!initialized) {
            var controllerData = {};
            controllerData.__cdata = data.config.__cdata;
            controllerData.type = "data";
            controllerData.name = controllerId;
            controllerData.id = controllerId;
            this._theme.addController(controllerData);
            stageController = this._theme._controllerMap[controllerId];
        }

        if (stageController) {
            this._stage._stageControllerName = controllerName;
            this._stage._stageController = stageController;
            this._stage._stageController.next();
        }
    },
    /**
     * This method adds the game status text and submit btn on the canvas, it also embed the mtf templates in the stage
     * @param {object} data,  it is the data object which contains all the information about org.ekstep.akshara-teaching plugin
     * @memberof org.ekstep.akshara-teaching
     */
    addGameElements: function(data) {
        var gameStatus = {
            "x": 2,
            "y": -8,
            "w": 90,
            "h": 12,
            "id": "game_status",
            "text": [{
                "x": 0,
                "y": 0,
                "w": 15,
                "h": 100,
                "font": "Verdana",
                "fontsize": 100,
                "align": "left",
                "color": "#4c4c4c",
                "__text": "Round: "
            }, {
                "x": 16,
                "y": 0,
                "w": 5,
                "h": 100,
                "font": "Verdana",
                "fontsize": 100,
                "align": "left",
                "color": "#4c4c4c",
                "weight": "bold",
                "id": "game_round"
            }, {
                "x": 22,
                "y": 0,
                "w": 12,
                "h": 100,
                "font": "Verdana",
                "fontsize": 100,
                "align": "left",
                "color": "#4c4c4c",
                "__text": "Level: "
            }, {
                "x": 36,
                "y": 0,
                "w": 5,
                "h": 100,
                "font": "Verdana",
                "fontsize": 100,
                "align": "left",
                "color": "#4c4c4c",
                "weight": "bold",
                "id": "game_level"
            }, {
                "x": 45,
                "y": 0,
                "w": 15,
                "h": 100,
                "font": "Verdana",
                "fontsize": 100,
                "align": "left",
                "color": "#4c4c4c",
                "__text": "Repetition: "
            }, {
                "x": 68,
                "y": 0,
                "w": 5,
                "h": 100,
                "font": "Verdana",
                "fontsize": 100,
                "align": "left",
                "color": "#4c4c4c",
                "weight": "bold",
                "id": "game_repeat"
            }]
        }
        var assessGroup = {
            "id": "assess_group",
            "x": 12,
            "y": 5,
            "w": 76,
            "h": 95,
            "visible": false,
            "embed": {}
        }
        assessGroup.embed["template-name"] = "mtf_assessment_one";
        assessGroup.embed["var-data"] = data.id;
        var assessGroupOne = {
            "id": "assess_group_one",
            "x": 12,
            "y": 5,
            "w": 76,
            "h": 95,
            "visible": false,
            "embed": {}
        }
        assessGroupOne.embed["template-name"] = "mtf_assessment_two";
        assessGroupOne.embed["var-data"] = data.id;
        var submitBtnGrp = {
            "id": "submit_btn_group",
            "x": 0,
            "y": 0,
            "w": 100,
            "h": 100,
            "visible": false,
            "image": [{
                "id": "submit_disabled",
                "asset": "submit_disabled_image",
                "x": 90,
                "y": 80,
                "w": 10
            }, {
                "id": "submit_enabled",
                "asset": "submit_image",
                "x": 90,
                "y": 80,
                "w": 10,
                "visible": false
            }]
        }
        PluginManager.invoke('g', gameStatus, this, this._stage, this._theme);
        PluginManager.invoke('g', assessGroup, this._stage, this._stage, this._theme);
        PluginManager.invoke('g', assessGroupOne, this._stage, this._stage, this._theme);
        PluginManager.invoke('g', submitBtnGrp, this._stage, this._stage, this._theme);
    },
    /**
     * This method creates and set the mtf templates strucure
     * @memberof org.ekstep.akshara-teaching
     */
    addTemplates: function() {
        var temp = [{
            "id": "mtf_assessment_one",
            "text": {
                "x": 0,
                "y": 0,
                "w": 100,
                "h": 10,
                "font": "Verdana",
                "fontsize": 100,
                "align": "center",
                "color": "#4c4c4c",
                "model": "data.question",
                "weight": "bold",
                "valign": "middle"
            },
            "cmtf": {
                "model": "data",
                "force": "false",
                "coptions": [{
                    "layout": "table",
                    "x": 0,
                    "y": 15,
                    "w": 30,
                    "h": 80,
                    "cols": 1,
                    "marginX": 0,
                    "marginY": 2,
                    "options": "lhs_options",
                    "snapX": 90,
                    "snapY": 0,
                    "image": {
                        "asset": "icon_sound_image",
                        "x": 0,
                        "y": 0,
                        "w": 100
                    },
                    "shape": {
                        "x": 90,
                        "y": 0,
                        "w": 100,
                        "h": 100,
                        "fill": "#ddd",
                        "opacity": "0.5",
                        "type": "rect"
                    },
                    "event": {
                        "type": "click",
                        "action": {
                            "type": "command",
                            "command": "play",
                            "asset_model": "option.value.audio"
                        }
                    }
                }, {
                    "layout": "table",
                    "x": 60,
                    "y": 15,
                    "w": 30,
                    "h": 80,
                    "cols": 1,
                    "marginX": 0,
                    "marginY": 2,
                    "options": "rhs_options",
                    "shape": {
                        "x": 0,
                        "y": 0,
                        "w": 100,
                        "h": 100,
                        "fill": "#ccc",
                        "opacity": "0.5",
                        "type": "rect"
                    },
                    "text": {
                        "x": 0,
                        "y": 0,
                        "w": 100,
                        "h": 100,
                        "font": "Verdana",
                        "fontsize": 400,
                        "align": "center",
                        "color": "#000",
                        "model": "option.value.text",
                        "weight": "bold",
                        "valign": "middle"
                    }
                }]
            }
        }, {
            "id": "mtf_assessment_two",
            "text": {
                "x": 0,
                "y": 0,
                "w": 100,
                "h": 10,
                "font": "Verdana",
                "fontsize": 100,
                "align": "center",
                "color": "#4c4c4c",
                "model": "data.question",
                "weight": "bold",
                "valign": "middle"
            },
            "cmtf": {
                "model": "data",
                "force": "false",
                "coptions": [{
                    "layout": "table",
                    "x": 0,
                    "y": 15,
                    "w": 30,
                    "h": 80,
                    "cols": 1,
                    "marginX": 0,
                    "marginY": 2,
                    "options": "lhs_options",
                    "snapX": 75,
                    "snapY": 0,
                    "image": {
                        "model": "option.value.image",
                        "x": 0,
                        "y": 0,
                        "w": 100
                    },
                    "shape": {
                        "x": 75,
                        "y": 0,
                        "w": 100,
                        "h": 100,
                        "fill": "#ddd",
                        "opacity": "0.5",
                        "type": "rect"
                    }
                }, {
                    "layout": "table",
                    "x": 60,
                    "y": 15,
                    "w": 30,
                    "h": 80,
                    "cols": 1,
                    "marginX": 0,
                    "marginY": 2,
                    "options": "rhs_options",
                    "shape": {
                        "x": 0,
                        "y": 0,
                        "w": 100,
                        "h": 100,
                        "fill": "#ccc",
                        "opacity": "0.5",
                        "type": "rect"
                    },
                    "text": {
                        "x": 0,
                        "y": 0,
                        "w": 100,
                        "h": 100,
                        "font": "Verdana",
                        "fontsize": 400,
                        "align": "center",
                        "color": "#000",
                        "model": "option.value.text",
                        "weight": "bold",
                        "valign": "middle"
                    }
                }]
            }
        }];
        var instance = this;
        var templateType = "data";
        var templateId = this._stage.getTemplate(templateType);
        var template = this._theme._templateMap[templateId];
        if (template === undefined) {
            temp.forEach(function(t) {
                if (t.id) {
                    // push i.template into the collection arrey of the templates.
                    instance._theme._templateMap[t.id] = t;
                }
            });
        }

    }
});
