/**
 * @class Plugin.LanguageMtf.LanguageMtfLayout
 */
Plugin.LanguageMtf.LanguageMtfLayout = Class.extend({
    init: function(parentContainer, stage, theme, cData) {
        this.parentContainer = parentContainer;
        this._stage = stage;
        this._theme = theme;
        this._cData = cData;
        this._textTargets = [];
        this._currentTargetIndex = 0;
    },

    /**
     * Creating data for item controller
     * @memberof Plugin.LanguageMtf.LanguageMtfLayout#
     */
    _invokeItemData: function() {
        var itemData = {
            "id": "assesment",
            "name": "assesment",
            "type": "items",
            "__cdata": {
                "identifier": "language_mtf",
                "title": "Language mtf",
                "total_items": 1,
                "shuffle": false,
                "max_score": 1,
                "subject": "LIT",
                "item_sets": [{
                    "id": "set_1",
                    "count": 1
                }],
                "items": {}
            }
        };
        itemData.__cdata.items = this._cData.wordAssesment.items;
        this._initQuestions(itemData);
        this._invokeTemplate(this._cData);
        this._invokeEmbed();
    },

    /**
     * initialize item controller for question
     * @memberof Plugin.LanguageMtf.LanguageMtfLayout#
     * @param {Object} itemData item controller data
     */
    _initQuestions: function(itemData) {
        var assessmentid = (Renderer.theme._currentStage + "_assessment");
        var stageController = this._theme._controllerMap[assessmentid];
        var initialized = (stageController != undefined);
        if (!initialized) {
            itemData.name = assessmentid;
            itemData.id = assessmentid;
            EkstepRendererAPI.addController(itemData);
            stageController = EkstepRendererAPI.getController('items', assessmentid);
        }
        if (stageController) {
            this._stage._stageControllerName = "item";
            this._stage._stageController = stageController;
            this._stage._stageController.next();
            var stageKey = this._stage.getStagestateKey();
            if (typeof this._theme.getParam === "function") {
                this._stage._currentState = this._theme.getParam(stageKey);
                if (_.isUndefined(this._stage._currentState)) {
                    this._stage.setParam(this._stage._type, {
                        id: Renderer.theme._currentStage,
                        stateId: stageKey
                    });
                }
            }
        }
    },

    /**
     * invoking template as per config selected by user
     * @memberof Plugin.LanguageMtf.LanguageMtfLayout#
     * @param {Object} cData configuration data
     */
    _invokeTemplate: function(cData) {
        var templateLayout, mtfObj, tempObj;

        if (cData.isVertical) {
            templateLayout = new Plugin.LanguageMtf.VerticalMtfLayout();
        } else {
            templateLayout = new Plugin.LanguageMtf.HorizontalMtfLayout();
        }
        mtfObj = templateLayout.getTemplateLayout();

        /* istanbul ignore next: if cases */
        switch (cData.activeItem) {
        case "word-picture":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.PictureWordVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordPictureVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.PictureWordHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordPictureHorizontalLayout();
                }
            }
            break;
        case "word-word":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.WordWordVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordWordVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.WordWordHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordWordHorizontalLayout();
                }
            }
            break;
        case "word-audio":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AudioWordVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordAudioVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AudioWordHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordAudioHorizontalLayout();
                }
            }
            break;
        case "word-alphabet":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AlphabetWordVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordAlphabetVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AlphabetWordHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordAlphabetHorizontalLayout();
                }
            }
            break;
        case "wordPicture-alphabet":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AlphabetWordPictureVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordPictureAlphabetVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AlphabetWordPictureHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordPictureAlphabetHorizontalLayout();
                }
            }
            break;
        case "wordPicture-wordPicture":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.WordPictureWordPictureVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordPictureWordPictureVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.WordPictureWordPictureHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.WordPictureWordPictureHorizontalLayout();
                }
            }
            break;
        case "picture-alphabet":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AlphabetPictureVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.PictureAlphabetVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AlphabetPictureHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.PictureAlphabetHorizontalLayout();
                }
            }
            break;
        case "alphabet-audio":
            if (cData.isVertical) {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AudioAlphabetVerticalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.AlphabetAudioVerticalLayout();
                }
            } else {
                if (cData.isFlipSide) {
                    tempObj = new Plugin.LanguageMtf.AudioAlphabetHorizontalLayout();
                } else {
                    tempObj = new Plugin.LanguageMtf.AlphabetAudioHorizontalLayout();
                }
            }
            break;
        }

        mtfObj = tempObj.getUpdatedLayout(mtfObj);
        this._theme._templateMap['org.ekstep.languageMtf.template'] = mtfObj;
    },

     /**
     * creates the embed ECML tag for item controller
     * @private
     * @memberof Plugin.LanguageMtf.LanguageMtfLayout#
     */
    _invokeEmbed: function() {
        var embedData = {};
        embedData.template = "item";
        embedData["var-item"] = "item";
        PluginManager.invoke('embed', embedData, this.parentContainer, this._stage, this._theme);
    }

});
