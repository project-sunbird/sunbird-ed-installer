Plugin.WordMaker = {};

/**
 * @class Plugin.WordMaker.WordMakerLayout
 */
Plugin.WordMaker.WordMakerLayout = Class.extend({
    /**
     * Initializing word maker view
     * @memberof Plugin.WordMaker.WordMakerLayout#
     */
    init: function() {
        this._inputBoxWidth = 9;
        this._inputBoxGap = 2;
    },

    getKeyLayoutForFullKeyboard: function() {
        var keyboardLayout = {
            "keyWidth": 7.7,
            "keyHeight": 12,
            "numberOfColumns": 13,
            "model": "item.alphabets",
            "xPosition": 0,
            "yPosition": 65,
            "id": "keyBoardPluginId"
        };
        return keyboardLayout;
    },

    getEraserLayoutForFullKeyboard: function(numberOfKeys) {
        var inputWidth = 7.34;
        var inputsGap = 1.15;
        var imageOffset = 34
        var eraserData = {
            "xPosition": (numberOfKeys * (inputWidth + inputsGap)) + imageOffset,
            "yPosition": 17,
            "id": "eraserPluginId"
        }
        return eraserData;
    },

    /**
     * Get object for keyboard plugin
     * @param {Object} keys The keys to show
     * @memberof Plugin.WordMaker.WordMakerLayout#
     * @returns {Object} keyboardLayout
     */
    getKeyLayoutForJumbbledWord: function(keys) {
        var keyboardLayout = {
            "keyWidth": 12.67,
            "keyHeight": 16.67,
            "numberOfColumns": 3,
            "model": "item.alphabets",
            "xPosition": 63,
            "yPosition": 15,
            "id": "keyBoardPluginId"
        };
        if (keys.length <= 3) {
            keyboardLayout.yPosition = 31
        }
        /*istanbul ignore else*/
        else if (keys.length > 3 && keys.length <= 6) {
            keyboardLayout.yPosition = 24
        }
        return keyboardLayout;
    },

    /**
     * Get object for eraser plugin
     * @param {Number} numberOfKeys, Number of keys are showing on keyboard
     * @memberof Plugin.WordMaker.WordMakerLayout#
     * @returns {Object} eraserData
     */
    getEraserLayout: function(numberOfKeys) {
        var eraserData = {
            "xPosition": numberOfKeys * (this._inputBoxWidth + this._inputBoxGap),
            "yPosition": 74,
            "id": "eraserPluginId"
        }
        return eraserData;
    },

    /**
     * Get word maker rendering layout group
     * @memberof Plugin.WordMaker.WordMakerLayout#
     * @returns {Object} renderingGroup
     */
    getGroupLayout: function() {
        var renderingGroup = {
            "image": {
                "w": 100,
                "x": 0,
                "y": 0,
                "h": 100,
                "asset": "wordmaker_image_border",
                "stretch": true
            },
            "g": {
                "w": 84,
                "x": 8,
                "y": 8,
                "h": 84,
                "image": {
                    "w": 100,
                    "x": 0,
                    "y": 0,
                    "model": "item.image",
                    "valign": "middle",
                    "align": "center",
                    "stretch": false
                }
            }
        }
        return renderingGroup;
    },

    /**
     * Get input boxs layout
     * @param {Object} keys The keys to show
     * @param {Object} answer hint answer to show
     * @param {String} templateType type of wordmaker
     * @memberof Plugin.WordMaker.WordMakerLayout#
     * @returns {Object} inputGroup
     */
    getInputBoxes: function(keys, answer, templateType) {
        this._inputBoxWidth = (templateType == "org.ekstep.wordmaker.template.fullKeyboardWord") ? 11.3 : this._inputBoxWidth;
        var inputGroup = {};
        inputGroup.shapeArray = [];
        inputGroup.hintArray = [];
        inputGroup.textArray = [];
        inputGroup.imageInputArray = [];
        var x = 0;
        var opt;
        for (var i = 0; i < keys; i++) {
            opt = i + 1;
            if (i != 0) {
                x = this._inputBoxGap + this._inputBoxWidth + x;
            }
            var hintText = {
                "x": x,
                "y": 10,
                "w": this._inputBoxWidth,
                "h": 90,
                "align": "center",
                "valign": "middle",
                "color": "#e5e5e5",
                "fontsize": "3.5vw",
                "weight": "bold",
                "font": "'Noto Sans', sans-serif",
                "z-index": 2,
                "$t": answer["ans" + opt]["value"]
            }
            var text = {
                "align": "center",
                "valign": "middle",
                "color": "white",
                "fontsize": "3.5vw",
                "weight": "bold",
                "font": "'Noto Sans', sans-serif",
                "x": x,
                "y": 10,
                "w": this._inputBoxWidth,
                "h": 90,
                "z-index": 10,
                "model": "item.ans" + opt,
                "id": _.uniqueId("inputBoxId_")
            }
            var shape = {
                "w": this._inputBoxWidth,
                "x": x,
                "y": 0,
                "asset": "wordmaker_input_box",
                "visible": true,
                "id": _.uniqueId("inputboxImageId_"),
                "stretch": false
            }
            var imageShape = {
                "w": this._inputBoxWidth,
                "x": x,
                "y": 0,
                "asset": "wordmaker_small_button",
                "visible": false,
                "id": _.uniqueId("inputImageId_"),
                "stretch": false
            }
            inputGroup.textArray.push(text);
            inputGroup.hintArray.push(hintText);
            inputGroup.shapeArray.push(shape);
            inputGroup.imageInputArray.push(imageShape);
        }
        return inputGroup;
    },

    getHintImage: function(sound) {
        var hintImage;
        if (sound) {
            hintImage = {
                "x": 0,
                "y": 0,
                "w": 100,
                "asset": "wordmaker_hint_sound",
                "z-index": 10,
                "event": {
                    "action": [{
                        "asset_model": "item.audio",
                        "command": "stop",
                        "sound": "true",
                        "type": "command"
                    }, {
                        "asset_model": "item.audio",
                        "command": "play",
                        "type": "command"
                    }],
                    "type": "click"
                },
                "visible": false,
                "stretch": false
            }
        } else {
            hintImage = {
                "x": 0,
                "y": 0,
                "w": 100,
                "asset": "wordmaker_hint_no_sound",
                "z-index": 10,
                "visible": false,
                "stretch": false
            }
        }
        hintImage["id"] = "wordmaker_hint_sound_image";
        return hintImage;
    },
});

/**
 * @class Plugin.WordMaker.WordMakerView
 */
Plugin.WordMaker.WordMakerView = Class.extend({
    /**
     * Initializing word maker view
     * @param {Object} parentContainer this scope of Plugin.WordMaker
     * @param {Object} stage stage scope of Plugin.WordMaker
     * @param {Object} theme theme scope of Plugin.WordMaker
     * @param {Object} itemData, itemData from ECML
     * @param {Object} wordMakerLayout, wordMakerLayout
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    init: function(parentContainer, stage, theme, itemData, wordMakerLayout) {
        this.parentContainer = parentContainer;
        this._stage = stage;
        this._theme = theme;
        this._itemData = itemData;
        this._textTargets = [];
        this._imageTargets = [];
        this._shapeTargets = [];
        this._currentTargetIndex = 0;
        this._hintGroupId = "";
        this.wordMakerLayout = wordMakerLayout;
    },

    /**
     * Creating word maker view
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    createWordMaker: function() {
        this._initQuestions();
        this._invokeTemplate();
        this._invokeEmbed();
        this._listenToKeyPress();
        this._listenToEraserPress();
        var instance = this;
        /*istanbul ignore else*/
        if (this._itemData.showImmediateFeedback && this._itemData.hints) {
            var count = 0;
            EkstepRendererAPI.addEventListener("telemetryEvent", function(telemetryData) {
                var teleObj = JSON.parse(telemetryData.target);
                if (teleObj.eid == "OE_ASSESS" && teleObj.edata.eks.pass == 'No') {
                    count++;
                    var hintSoundImage = PluginManager.getPluginObject("wordmaker_hint_sound_image");
                    hintSoundImage._self.visible = true;
                    Renderer.update = true;
                    /*istanbul ignore else*/
                    if (count >= 3) {
                        instance._currentTargetIndex = 0;
                        for (var i = 0; i < instance._textTargets.length; i++) {
                            /*istanbul ignore else*/
                            if (instance._currentTargetIndex < instance._textTargets.length) {
                                var currentShapeId = instance._shapeTargets[instance._currentTargetIndex];
                                var currentShapeObject = PluginManager.getPluginObject(currentShapeId);
                                currentShapeObject._self.visible = true;

                                var currentImageId = instance._imageTargets[instance._currentTargetIndex];
                                var currentImageObject = PluginManager.getPluginObject(currentImageId);
                                currentImageObject._self.visible = false;

                                var currentTargetId = instance._textTargets[instance._currentTargetIndex];
                                var currentTextObject = PluginManager.getPluginObject(currentTargetId);
                                currentTextObject._self.text = "";

                                var hintInputs = PluginManager.getPluginObject(instance._hintGroupId);
                                hintInputs._self.visible = true;

                                Renderer.update = true;
                                instance._stage.setModelValue(currentTextObject._data.model, currentTextObject._self.text);
                                instance._currentTargetIndex = instance._currentTargetIndex + 1;
                            }
                        }
                        /*istanbul ignore else*/
                        if (instance._currentTargetIndex != 0) {
                            instance._currentTargetIndex = 0;
                            instance._showTextIntoInputBox();
                            instance._showErasedTextInput();
                        }
                    }
                }
            });
        }
    },

    /**
     * initialize item controller for questions
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    _initQuestions: function() {
        var assessmentid = (Renderer.theme._currentStage + "_assessment");
        var stageController = this._theme._controllerMap[assessmentid];
        // Check if the controller is already initialized, if yes, skip the init
        /*istanbul ignore else*/
        if (!stageController) {
            var controllerData = {};
            controllerData.__cdata = this._itemData;
            controllerData.type = 'items';
            controllerData.name = assessmentid;
            controllerData.id = assessmentid;
            EkstepRendererAPI.addController(controllerData);
            stageController = EkstepRendererAPI.getController('items', assessmentid);
        }
        this._stage._stageControllerName = "item";
        this._stage._stageController = stageController;
        this._stage._stageController.next();
        var stageKey = this._stage.getStagestateKey();
        this._stage._currentState = this._theme.getParam(stageKey);
        /*istanbul ignore else*/
        if (_.isUndefined(this._stage._currentState)) {
            this._stage.setParam(this._stage._type, {
                id: Renderer.theme._currentStage,
                stateId: stageKey
            });
        }
    },

    /**
     * On key press attach pressed key to input box
     * @private
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    _listenToKeyPress: function() {
        var keyboard = PluginManager.getPluginObject('keyBoardPluginId');
        var instance = this;
        keyboard.onKeyPress(function(keyValue) { instance._showTextIntoInputBox(keyValue); });
    },

    /**
     * Show the pressed key as a text on input box
     * @private
     * @param {String} keyValue pressed key value
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    _showTextIntoInputBox: function(keyValue) {
        var instance = this;
        /*istanbul ignore else*/
        if (this._currentTargetIndex < this._textTargets.length) {
            var currentShapeId = this._shapeTargets[this._currentTargetIndex];
            var currentShapeObject = PluginManager.getPluginObject(currentShapeId);
            currentShapeObject._self.visible = false;

            var currentImageId = this._imageTargets[this._currentTargetIndex];
            var currentImageObject = PluginManager.getPluginObject(currentImageId);
            currentImageObject._self.visible = true;

            var currentTargetId = this._textTargets[this._currentTargetIndex];
            var currentTextObject = PluginManager.getPluginObject(currentTargetId);
            currentTextObject._self.text = keyValue;

            Renderer.update = true;
            instance._stage.setModelValue(currentTextObject._data.model, currentTextObject._self.text);
            this._currentTargetIndex = this._currentTargetIndex + 1;
        }
    },

    /**
     * On eraser button press erase text from input box
     * @private
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    _listenToEraserPress: function() {
        var eraser = PluginManager.getPluginObject('eraserPluginId');
        var instance = this;
        eraser.onEraserPress(function() {
            instance._showErasedTextInput();
        });
    },

    /**
     * Erased text from input box and show blank input box
     * @private
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    _showErasedTextInput: function() {
        var instance = this;
        var erasedIndex = this._currentTargetIndex - 1;
        /*istanbul ignore else*/
        if (erasedIndex != -1) {
            var currentShapeId = this._shapeTargets[erasedIndex];
            var currentShapeObject = PluginManager.getPluginObject(currentShapeId);
            currentShapeObject._self.visible = true;

            var currentImageId = this._imageTargets[erasedIndex];
            var currentImageObject = PluginManager.getPluginObject(currentImageId);
            currentImageObject._self.visible = false;

            var currentTargetId = this._textTargets[erasedIndex];
            var currentTextObject = PluginManager.getPluginObject(currentTargetId);
            currentTextObject._self.text = "";
            this._currentTargetIndex = this._currentTargetIndex - 1;
            Renderer.update = true;
            instance._stage.setModelValue(currentTextObject._data.model, currentTextObject._self.text);
        }
    },

    /**
     * Prepare jumbled word template layout
     * @private
     * @memberof Plugin.WordMaker.WordMakerView#
     * @returns {Object} jumbledWordMakerLayout
     */
    _prepareJumbleWordmakerTemplate: function() {
        var instance = this;
        var keys = this._stage.getModelValue('item.alphabets');
        var sound = this._stage.getModelValue('item.audio');
        var answer = this._stage.getModelValue('item.answer');
        var inputBoxes = this.wordMakerLayout.getInputBoxes(keys.length, answer);
        _.each(inputBoxes.textArray, function(text) {
            /*istanbul ignore else*/
            if (text.id) {
                instance._textTargets.push(text.id);
            }
        });
        _.each(inputBoxes.imageInputArray, function(image) {
            /*istanbul ignore else*/
            if (image.id) {
                instance._imageTargets.push(image.id);
            }
        });
        _.each(inputBoxes.shapeArray, function(shape) {
            /*istanbul ignore else*/
            if (shape.id) {
                instance._shapeTargets.push(shape.id);
            }
        });

        var groupLayout = this.wordMakerLayout.getGroupLayout();
        var imageGroupLayout = {
            "x": "0",
            "y": "7",
            "h": "66",
            "w": "40",
            "image": groupLayout.image,
            "g": groupLayout.g

        }
        var inputGroup = { "image": [inputBoxes.shapeArray, inputBoxes.imageInputArray], "text": inputBoxes.textArray, "x": "0", "y": "80", "h": "16.5", "w": "99" }
        var hintInputGroup = { "text": inputBoxes.hintArray, "x": "0", "y": "80", "h": "16.5", "w": "99", "visible": false, "id": _.uniqueId("showHintGroupJumble_") }
        this._hintGroupId = hintInputGroup.id;
        var jumbledWordMakerLayout = {
            "id": "org.ekstep.wordmaker.template.jumbledword",
            "image": { "x": "-15", "y": "-15", "h": "142", "w": "130", "asset": "wordmaker_patternfill_img" },
            "g": [imageGroupLayout, hintInputGroup, inputGroup, { "x": "35", "y": "60", "w": "16", "h": "17", "image": this.wordMakerLayout.getHintImage(sound) }],
            "org.ekstep.plugins.common.keyboard": this.wordMakerLayout.getKeyLayoutForJumbbledWord(keys),
            "org.ekstep.plugins.common.eraser": this.wordMakerLayout.getEraserLayout(keys.length),
            "shape": { "w": 0.4, "x": 51.5, "h": 62.5, "y": 8.5, "fill": "#c2c2c2", "type": "rect" }

        };
        return jumbledWordMakerLayout;
    },

    _prepareFullKeyboardWordmakerTemplate: function() {
        var instance = this;
        var templateId = "org.ekstep.wordmaker.template.fullKeyboardWord";
        var keys = this._stage.getModelValue('item.name');
        var sound = this._stage.getModelValue('item.audio');
        var answer = this._stage.getModelValue('item.answer');
        var inputBoxes = this.wordMakerLayout.getInputBoxes(keys.length, answer, templateId);
        var groupLayout = this.wordMakerLayout.getGroupLayout();
        var imageGroupLayout = { "x": "0", "y": "8", "h": "55", "w": "32", "image": groupLayout.image, "g": groupLayout.g };
        _.each(inputBoxes.textArray, function(text) {
            /*istanbul ignore else*/
            if (text.id) {
                instance._textTargets.push(text.id);
            }
        });
        _.each(inputBoxes.imageInputArray, function(image) {
            /*istanbul ignore else*/
            if (image.id) {
                instance._imageTargets.push(image.id);
            }
        });
        _.each(inputBoxes.shapeArray, function(shape) {
            /*istanbul ignore else*/
            if (shape.id) {
                instance._shapeTargets.push(shape.id);
            }
        });
        var inputGroup = { "image": [inputBoxes.shapeArray, inputBoxes.imageInputArray], "text": inputBoxes.textArray, "x": "34", "y": "10", "h": "13.5", "w": "65" };
        var hintInputGroup = { "text": inputBoxes.hintArray, "x": "34", "y": "10", "h": "13.5", "w": "65", "visible": false, "id": _.uniqueId("showHintGroupFull_") }
        this._hintGroupId = hintInputGroup.id;
        var fullKeyboardWordMakerLayout = {
            "id": "org.ekstep.wordmaker.template.fullKeyboardWord",
            "image": { "x": "-15", "y": "-15", "h": "142", "w": "130", "asset": "wordmaker_patternfill_img" },
            "org.ekstep.plugins.common.keyboard": this.wordMakerLayout.getKeyLayoutForFullKeyboard(),
            "org.ekstep.plugins.common.eraser": this.wordMakerLayout.getEraserLayoutForFullKeyboard(keys.length),
            "g": [imageGroupLayout, hintInputGroup, inputGroup, { "x": "27", "y": "52", "w": "15", "h": "15", "image": this.wordMakerLayout.getHintImage(sound) }],
        };
        return fullKeyboardWordMakerLayout;
    },

    /**
     * Invoke templates for questions
     * @private
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    _invokeTemplate: function() {
        var wordmakerTemplate;
        var selectedTemplateId = this._itemData.items.set_1[0].template_id;
        if (selectedTemplateId == 'org.ekstep.wordmaker.template.fullKeyboardWord') {
            wordmakerTemplate = this._prepareFullKeyboardWordmakerTemplate();
        } else {
            wordmakerTemplate = this._prepareJumbleWordmakerTemplate();
        }
        var templateType = "item";
        var templateId = this._stage.getTemplate(templateType);
        this._theme._templateMap[templateId];
        this._theme._templateMap[selectedTemplateId] = wordmakerTemplate;
    },

    /**
     * creates the embed ECML tag for item controller
     * @private
     * @memberof Plugin.WordMaker.WordMakerView#
     */
    _invokeEmbed: function() {
        var embedData = {};
        embedData.template = "item";
        embedData["var-item"] = "item";
        PluginManager.invoke('embed', embedData, this.parentContainer, this._stage, this._theme);
    }
});

/**
 * @class Plugin.Plugin.WordMaker
 */
/* istanbul ignore next: init plugin */
Plugin.WordMaker.RendererPlugin = Plugin.extend({
    _type: 'org.ekstep.plugins.wordmaker',
    _isContainer: false,
    _render: true,
    /**
     * Initializing word maker plugin
     * @param {Object} data the config details
     * @memberof Plugin.WordMaker.RendererPlugin#
     * @fire {Function} createWordMaker call to create word maker on stage
     */
    initPlugin: function(data) {
        data.x = 10;
        data.y = 10;
        data.h = 80;
        data.w = 80;
        var dims = this.relativeDims();
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.h = dims.h;
        this._self.w = dims.w;
        var itemData = JSON.parse(data.config.__cdata);
        var wordMakerLayout = new Plugin.WordMaker.WordMakerLayout();
        var wordMakerView = new Plugin.WordMaker.WordMakerView(this, this._stage, this._theme, itemData, wordMakerLayout);
        var instance = this;
        EkstepRendererAPI.addEventListener('retryClick', function (event) {
            instance._stage.isStageStateChanged(true);
        });
        wordMakerView.createWordMaker();
    }
});
//# sourceURL=wordMakerPlugin.js