//@ sourceURL=ftBasePlugin.js
/**
 * Base plugin for all funtoot template renderer plugins.
 * @extends Plugin
 * @author Henrietta D (henrietta.d@funtoot.com)
 */
Plugin.extend({
    _type: "ftBasePlugin",

    /* funtoot template specific constants */
    _ftTitleTextId: "__ft_title_text__",
    _ftHintBtnId: "__ft_hint_button__",
    _ftSolutionBtnId: "__ft_solution_button__",
    _ftSuperContentContainerId: "__ft_super_content_container__",
    _ftContentContainerId: "__ft_content_container__",
    _ftHelperPluginId: "__ft_helper_plugin__",
    _ftSubmitButtonId: "__ft_submit_button__",
    _ftNextButtonId: "__ft_next_button__",
    _ftDisabledSubmitButtonId: "__ft_disabled_submit_button__",
    _ftAttemptsId: "__ft_attempts__",
    _rendererPlugin: true,
    TITLE_FONTSIZE: 3.0,
    BODY_FONTSIZE: 2.7,
    SOLUTION_FONTSIZE_SCALING: 0.8,

    /**
     * initializes the constants for solution and non-solution display
     */
    initializeIds: function (data) {
        if (data.isSolution) {
            this._ftTitleTextId += 'sol';
            this._ftSuperContentContainerId += 'sol';
            this._ftContentContainerId += 'sol';
            this._ftHelperPluginId += 'sol';
        }
    },
    /**
     * initializes the plugin.
     */
    initPlugin: function (data) {
        this.initializeIds(data);

        // create a container for ourself
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        // parse config
        this._pluginConfig = (data.config && data.config.__cdata) ? JSON.parse(data.config.__cdata) : {};
        this._pluginData = (data.data && (data.data.__cdata)) ? JSON.parse(data.data.__cdata) : {};

        // the item data is for solution display
        if (data.item && data.item.__cdata)
            this._pluginItem = JSON.parse(data.item.__cdata);

        if (!data.itemCtrlInited) {
            //this.invokeEmbed();
            this.initQuestions();
        }

        this.addSuperContentContainer(data);
        this.addQuestionTitle(data);
        this.addContentContainer(data);
        this.addHelper(data);
        this.addGenerators(data);
        this.addI18n(data);
        //this.addGenerators(data);
        this.addParams(data);
        this.addHint(data);
        this.addSolution(data);
        this.addSubmitButton(data);
        this.addNextButton(data);
        this.addDisabledSubmitButton(data);
        this.addQuestionStatus(data);

        //Handle start of question - allow some time for telemetry service to get activated
        setTimeout((function () {
            this.handleQuestionStart();
        }).bind(this), 1000);
    },
    /**
     * creates the embed ECML tag for item controller
     */
    invokeEmbed: function () {
        var embedData = {};
        embedData.template = "item";
        embedData["var-item"] = "item";
        PluginManager.invoke('embed', embedData, this, this._stage, this._theme);
    },
    /**
     * initializes the controller tag to bind the item to the controller
     */
    initQuestions: function () {
        var controllerName = this._pluginConfig.var;
        var assessmentid = (Renderer.theme._currentStage + "_assessment");
        var stageController = this._theme._controllerMap[assessmentid];

        // Check if the controller is already initialized, if yes, skip the init
        var initialized = (stageController != undefined);
        if (!initialized) {
            var controllerData = {};
            controllerData.__cdata = this._pluginData;
            controllerData.type = this._pluginConfig.type;
            controllerData.name = assessmentid;
            controllerData.id = assessmentid;

            this._theme.addController(controllerData);
            stageController = this._theme._controllerMap[assessmentid];
        }

        if (stageController) {
            this._stage._stageControllerName = controllerName;
            this._stage._stageController = stageController;
            this._stage._stageController.next();
        }
    },

    /**
     * creates the super container. Note that the funtoot renderer plugins always occupy 100% of
     * width and height on the canvas. The super container carves out the rendering area leaving
     * out the space for Genie control buttons
     */
    addSuperContentContainer: function (data) {
        var containerData = {
            id: this._ftSuperContentContainerId,
            x: 10,
            y: 0,
            w: 80,
            h: 100
        };
        PluginManager.invoke('g', containerData, this, this._stage, this._theme);
    },
    /**
     * creates a content container as the child of super container for rendering the question content
     * This excludes the question title.
     */
    addContentContainer: function (data) {
        var superContainer = PluginManager.getPluginObject(this._ftSuperContentContainerId);
        var containerData = {
            id: this._ftContentContainerId,
            x: 0,
            y: 21,
            w: 100,
            h: 72
        };
        PluginManager.invoke('g', containerData, superContainer, this._stage, this._theme);
    },
    /**
     * creates the question title as the child of super container.
     */
    addQuestionTitle: function (data) {
        // Add this as the child of the content container
        var superContainer = PluginManager.getPluginObject(this._ftSuperContentContainerId);
        var titleObj = {
            id: this._ftTitleTextId,
            align: "center",
            valign: "middle",
            color: "#4c4c4c",
            fontsize: this.getFontSize(data.isSolution, 3.0),
            lineHeight: "1.4",
            model: "item.title",
            x: "0",
            y: "10",
            w: "100",
            h: "11"
        };
        PluginManager.invoke('text', titleObj, superContainer, this._stage, this._theme);
    },
    /**
     * invokes ftPluginHelper Plugin for use by renderer plugin derived classes
     */
    addHelper: function (data) {
        var pluginData = {
            id: "plugin_helper"
        };
        PluginManager.invoke('ftPluginHelper', pluginData, this, this._stage, this._theme);
    },
    /**
     * invokes generators plugin for use by renderer plugin derived classes
     */
    addGenerators: function (data) {
        var pluginData = {
            id: "generators"
        };
        PluginManager.invoke('generators', pluginData, this, this._stage, this._theme);
    },
    /**
     * invokes ftI18n Plugin for use by renderer plugin derived classes
     */
    addI18n: function (data) {
        // FIX: Get the language id from question, rather than hard-code here
        var item = this._stage.getController("item");
        var nlangId = item.getModelValue("numericLangId");
        var langId = item.getModelValue("langId");
        var pluginData = {
            id: "i18n_helper",
            config: {
                langId: langId,
                numericLangId: nlangId
            },
            data: this._pluginData.i18n
        };
        PluginManager.invoke('org.ekstep.plugins.i18n', pluginData, this, this._stage, this._theme);
    },
    /**
     * invokes ftGenerators Plugin for use by renderer plugin derived classes
     */
    /* addGenerators: function (data) {
         var pluginData = { id: "plugin_generators" };
         PluginManager.invoke('org.ekstep.generators', pluginData, this, this._stage, this._theme);
     },*/
    /**
     * creates the hint button icon
     */
    addHint: function (data) {
        if (data.isSolution) return;
        var hintBtn = {
            id: this._ftHintBtnId,
            stretch: "false",
            asset: "org.ekstep.funtoot.hint-icon",
            x: 92,
            y: 10,
            w: 7,
            visible: false
        };
        PluginManager.invoke('image', hintBtn, this, this._stage, this._theme);
        var hintBoxObj = PluginManager.getPluginObject(hintBtn.id);
        hintBoxObj._self.on("click", this._onHint, this);
    },
    /**
     * creates the solution button icon
     */
    addSolution: function (data) {
        if (data.isSolution) return;
        var solutionBtn = {
            id: this._ftSolutionBtnId,
            stretch: "false",
            asset: "org.ekstep.funtoot.solution-icon",
            x: 92,
            y: 26,
            w: 7,
            visible: false
        };
        PluginManager.invoke('image', solutionBtn, this, this._stage, this._theme);
        var solBtn = PluginManager.getPluginObject(solutionBtn.id);
        solBtn._self.on("click", this._onSolution, this);
    },
    /**
     * Disables the default submit and next button
     * @NOTE: Next button is not disabled as yet. The default implementation still works
     * for navigation
     */
    addParams: function (data) {
        var param1Data = {
            param: "overlaySubmit",
            scope: "stage",
            value: "off"
        };
        PluginManager.invoke('set', param1Data, this, this._stage, this._theme);
        var param2Data = {
            param: "overlayNext",
            scope: "stage",
            value: "off"
        };
        PluginManager.invoke('set', param2Data, this, this._stage, this._theme);
    },
    /**
     * creates our custom submit button
     */
    addSubmitButton: function (data) {
        if (data.isSolution) return;
        var submitButton = {
            id: this._ftSubmitButtonId,
            stretch: "false",
            asset: "submit",
            x: 92,
            y: 85,
            w: 7,
            visible: true
        };
        if (PluginManager.getPluginObject('__ft_submit_button__') && Object.keys(PluginManager.getPluginObject('__ft_submit_button__')._self._listeners).length == 0) {
            PluginManager.invoke('image', submitButton, this, this._stage, this._theme);
            var submitObj = PluginManager.getPluginObject(submitButton.id);
            submitObj._self.on("click", this._onSubmit, this);
        } else {
            if (PluginManager.getPluginObject('__ft_submit_button__') && Object.keys(PluginManager.getPluginObject('__ft_submit_button__')._self._listeners).length > 0) {
                PluginManager.getPluginObject('__ft_submit_button__')._self._listeners = {}
                PluginManager.invoke('image', submitButton, this, this._stage, this._theme);
                var submitObj = PluginManager.getPluginObject(submitButton.id);
                submitObj._self.on("click", this._onSubmit, this);
            } else {
                PluginManager.invoke('image', submitButton, this, this._stage, this._theme);
                var submitObj = PluginManager.getPluginObject(submitButton.id);
                submitObj._self.on("click", this._onSubmit, this);
            }
        }
    },

    /**
     * creates our custom submit button with disabled state
     */
    addDisabledSubmitButton: function () {
        var submitButton = {
            id: this._ftDisabledSubmitButtonId,
            stretch: "false",
            asset: "disabledsubmit",
            x: 92,
            y: 85,
            w: 7,
            visible: false
        };
        PluginManager.invoke('image', submitButton, this, this._stage, this._theme);
    },
    /**
     * creates our custom next button
     */
    addNextButton: function (data) {
        if (data.isSolution || !this.isNextButtonEnabled()) return;
        var nextButton = {
            id: this._ftNextButtonId,
            stretch: "false",
            asset: "org.ekstep.funtoot.asset.next",
            x: 92,
            y: 45,
            w: 7,
            visible: true
        };

        if (PluginManager.getPluginObject('__ft_next_button__') && Object.keys(PluginManager.getPluginObject('__ft_next_button__')._self._listeners).length == 0) {
            PluginManager.invoke('image', nextButton, this, this._stage, this._theme);
            var nextObj = PluginManager.getPluginObject(nextButton.id);
            nextObj._self.on("click", this._onNext, this);
        } else {
            if (PluginManager.getPluginObject('__ft_next_button__') && Object.keys(PluginManager.getPluginObject('__ft_next_button__')._self._listeners).length > 0) {
                PluginManager.getPluginObject('__ft_next_button__')._self._listeners = {}
                PluginManager.invoke('image', nextButton, this, this._stage, this._theme);
                var nextObj = PluginManager.getPluginObject(nextButton.id);
                nextObj._self.on("click", this._onNext, this);
            } else {
                PluginManager.invoke('image', nextButton, this, this._stage, this._theme);
                var nextObj = PluginManager.getPluginObject(nextButton.id);
                nextObj._self.on("click", this._onNext, this);
            }
        }
    },

    /**
     * creates the status buttons for display of attempts
     */
    addQuestionStatus: function (data) {
        if (data.isSolution || this.getMaxNoOfAttempts() == 1) return;
        var item = this._stage.getController("item");
        this._maxAttempts = item.maxAttempts || 2; // assume max attempts as 2
        //initially set remainingAttempts as maxAttempts
        this._remainingAttempts = this._maxAttempts;
        this._hintAtAttempt = item.hintAtAttempt || 2;
        // var superContentContainer = PluginManager.getPluginObject(this._ftSuperContentContainerId);
        var attemptData = {
            id: this._ftAttemptsId,
            maxAttempts: this._maxAttempts
        };
        PluginManager.invoke('ftAttempts', attemptData, this, this._stage, this._theme);
    },
    /**
     * handles submit button click event
     * reduces the no of remainingAttempts and sends telemetry events
     */
    _onSubmit: function (evt) {
        console.log('ftBasePlugin - _onSubmit called!');
        var evalResult = this.onSubmit(evt, this);

        if (evalResult) {
            this.handleAttemptEnd(evalResult);
            //on submit update remainingAttempts by decrementing it by one
            // show hint icon only if a hint message is present
            if (this._remainingAttempts > 0) {
                --this._remainingAttempts;
                var currentAttempt = this._maxAttempts - this._remainingAttempts;
                if (!evalResult.isSolved) {
                    var item = this._stage.getController("item");
                    if (currentAttempt == this._hintAtAttempt - 1 && item.getModelValue().model.hintMsg && this.isHintEnabled()) //show hint
                        this._showHintIcon();
                    if (this._remainingAttempts == 0) //show solution
                    {
                        //Hide active submit button
                        var disabledSubmitObj = PluginManager.getPluginObject(this._ftDisabledSubmitButtonId);
                        disabledSubmitObj._self.visible = true;
                        //Display inactive submit button
                        var submitObj = PluginManager.getPluginObject(this._ftSubmitButtonId);
                        submitObj._self.visible = false;
                        Renderer.update = true;
                        if (this.isSolutionEnabled())
                            this._showSolutionIcon();
                    }
                }
                //Update attempt status
                var attemptStatus = PluginManager.getPluginObject(this._ftAttemptsId);
                attemptStatus.updateStatus(evalResult.isSolved, currentAttempt);
                //show feedback on successful attempt
                if (this.isFeedbackDialogEnabled())
                    this.showFeedback(evalResult.isSolved);
            }
            if (!this.isFeedbackDialogEnabled())
                OverlayManager.skipAndNavigateNext();
        }
        // pop a message prompting the user to answer when no answer is given
        else {
            var helper = PluginManager.getPluginObject('plugin_helper');
            helper.onNoResponse(evt, this);
        }
    },
    /**
     * handles next button click event
     */
    _onNext: function (evt) {
        console.log('ftBasePlugin - _onNext called!');
        evt.nextClicked = true;
        if (this._remainingAttempts > 0)
            this._onSubmit(evt);
        else
            OverlayManager.skipAndNavigateNext();
    },

    _showHintIcon: function () {
        var item = this._stage.getController("item");
        if (item.getModelValue().model.hintMsg) {
            var hintIcon = PluginManager.getPluginObject(this._ftHintBtnId);
            hintIcon._self.visible = true;
            hintIcon._data.visible = true;
            Renderer.update = true;
        }
    },
    _showSolutionIcon: function () {
        var solIcon = PluginManager.getPluginObject(this._ftSolutionBtnId);
        solIcon._self.visible = true;
        solIcon._data.visible = true;
        Renderer.update = true;
    },
    /**
     * handles hint icon click event and invokes the popup
     * @FIX: move the hardcoded string to resource bundle
     */
    _onHint: function (evt) {
        console.log('ftBasePlugin - _onHint called!');
        var helper = PluginManager.getPluginObject('plugin_helper');
        var item = this._stage.getController("item");
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var hintData = {
            title: 'Hint',
            type: "hint",
            content: i18n.translate(item.getModelValue().model.hintMsg) || i18n.translate("NO_HINT"), //There is no hint for this question',
            x: 10,
            y: 10,
            w: 80,
            h: 60
        };
        helper.showPopup(hintData);
    },
    /**
     * handles solution icon click event and invokes the popup
     */
    _onSolution: function (evt) {
        console.log('ftBasePlugin - _onSolution called!');
        var problemPage = PluginManager.getPluginObject(this._ftContentContainerId);
        problemPage._self.visible = false;
        Renderer.update = true;
        var helper = PluginManager.getPluginObject('plugin_helper');
        var solData = {
            content: {}
        };
        solData.content[this._type] = {
            isSolution: true,
            data: {
                __cdata: ''
            },
            config: {
                __cdata: ''
            },
            item: {
                __cdata: ''
            },
            x: 0,
            y: 0,
            w: 100,
            h: 100
        };
        solData.title = 'Solution';
        solData.type = "solution";
        solData.x = 10;
        solData.y = 10;
        solData.w = 80;
        solData.h = 80;
        solData.content[this._type].data.__cdata = JSON.stringify(this._pluginData);
        solData.content[this._type].config.__cdata = JSON.stringify(this._pluginConfig);
        // pass the item controller to the solution plugin
        solData.content[this._type].item.__cdata = JSON.stringify(this._item);
        helper.showPopup(solData);
    },

    /**
     * Displays feedback on the performance on this question
     */
    showFeedback: function (solved) {
        /**
         * For now, we'll display the overlay GoodJob and Tryagain messages
         */
        if (solved)
            OverlayManager.showGoodJobFb(true);
        //Not using default replay modal for now
        else
            OverlayManager.showTryAgainFb(true);
    },
    /**
     * handles start of question. Also starts OE_ASSESS telemetry event
     */
    handleQuestionStart: function () {
        // start OE_ASSESS telemetry event
        var stageCtrl = this._stage._stageController.getModelValue();
        this._assessStartEvent = TelemetryService.assess(
            stageCtrl.identifier,
            stageCtrl.subject,
            stageCtrl.qlevel, {
                stageId: this._stage._currentState.stage.id,
                subtype: " "
            });

        // create OE_LEVEL_SET telemetry event (TBD)
    },

    /**
     * handles the start of a new attempt
     */
    handleAttemptStart: function () {},
    /**
     * end OE_ASSESS Telemetry event and create OE_ITEM_RESPONSE telemetry event
     */
    handleAttemptEnd: function (evalResult) { // end OE_ASSESS telemetry event
        var model = jQuery.extend({}, this._item.getModelValue());
        model["maxAttempts"] = this._maxAttempts;
        model["curAttempt"] = this._maxAttempts - this._remainingAttempts;
        var pluginConf = {};
        if (this._pluginConfig.count != undefined) {
            pluginConf["count"] = this._pluginConfig.count;
        }
        if (this._pluginConfig.selectedConfig != undefined) {
            pluginConf["selectedConfig"] = {};
            pluginConf.selectedConfig["Grade"] = this._pluginConfig.selectedConfig.Grade;
            pluginConf.selectedConfig["Level"] = this._pluginConfig.selectedConfig.Level;
            pluginConf.selectedConfig["QCount"] = this._pluginConfig.selectedConfig.QCount;
            pluginConf.selectedConfig["SubLevel"] = this._pluginConfig.selectedConfig.SubLevel;
            pluginConf.selectedConfig["Type"] = this._pluginConfig.selectedConfig.Type;
            pluginConf.selectedConfig["contentLocale"] = this._pluginConfig.selectedConfig.contentLocale;
            pluginConf.selectedConfig["numeralLocale"] = this._pluginConfig.selectedConfig.numeralLocale;
        }
        if (this._pluginConfig.title != undefined) {
            pluginConf["title"] = this._pluginConfig.title;
        }
        if (this._pluginConfig.type != undefined) {
            pluginConf["type"] = this._pluginConfig.type;
        }
        if (this._pluginConfig.var != undefined) {
            pluginConf["var"] = this._pluginConfig.var;
        }
        if (this._pluginConfig.selectedConfig != undefined && this._pluginConfig.selectedConfig.hasOwnProperty("itemData")) {
            pluginConf["locales"] = this._pluginConfig.locales;
        } else if (this._pluginConfig.selectedConfig != undefined && this._pluginConfig.selectedConfig.hasOwnProperty("itemsData")) {
            pluginConf.selectedConfig["language"] = this._pluginConfig.selectedConfig.language;
        }
        var params = [{
            item: model,
            config: pluginConf
        }];
        var data = {
            pass: evalResult.isSolved,
            score: evalResult.isSolved ? 1 : 0,
            res: evalResult.resValues,
            mmc: evalResult.mmc,
            params: params,
            qindex: model.qindex,
            mc: [model.concepts.identifier],
            qtitle: model.title,
            qdesc: model.description || ""
        };
        TelemetryService.assessEnd(this._assessStartEvent, data);

        // create OE_ITEM_RESPONSE telemetry event
        var itemData = {
            "qid": this._item.getModelValue().identifier,
            "type": "", // type of interaction. CHOOSE,DRAG,SELECT,MATCH,INPUT,SPEAK,WRITE
            "state": "", // state of the response (SELECTED, UNSELECTED) - to allow the child to unselect an option
            "resvalues": evalResult.resValues,
            "itemId": this._item.getModelValue().identifier
        }
        TelemetryService.itemResponse(itemData);
    },

    /**
     * handles the end of the question
     * e.g., enables viewing solution, enabling next button and so on
     */
    handleQuestionEnd: function () {

    },

    initQuestionState: function () {
        // hide solution and hint buttons
    },

    updateQuestionState: function () {

    },
    /**
     * returns the font size, and scales it depending on the scaleVal parameter
     * @param
     */
    getFontSize: function (scale, baseSize, scaleVal) {
        baseSize = baseSize || this.BODY_FONTSIZE;
        scale = scale || false;
        if (scale) {
            scaleVal = scaleVal || this.SOLUTION_FONTSIZE_SCALING;
            baseSize = baseSize * scaleVal;
        }
        return baseSize + "vw";
    },

    /**
     * Checks if the variables are processed and calls processVariables method
     * of generator if not processed already
     */
    processVariables: function (variables) {
        var model = this._stage.getController("item").getModelValue("model");
        if (_.isUndefined(model.variablesProcessed) || !model.variablesProcessed) {
            if (!model.variablesProcessed) {
                new org.ekstep.generators().processVariables(variables);
                model.variablesProcessed = true;
            }
        }
    },
    /**
     * returns true if next button enabled
     */
    isNextButtonEnabled: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.enableNextButton))
            return this._pluginConfig.selectedConfig.enableNextButton
        else return true
    },
    /**
     * returns the number of max attempts,
     */
    getMaxNoOfAttempts: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.maxNoOfAtt))
            return this._pluginConfig.selectedConfig.maxNoOfAtt
        else return 2
    },
    /**
     * returns true if hint icon is enabled
     */
    isHintEnabled: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.enableHint))
            return this._pluginConfig.selectedConfig.enableHint
        else return true
    },
    /**
     * returns true if solution icon is enabled
     */
    isSolutionEnabled: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.enableSolution))
            return this._pluginConfig.selectedConfig.enableSolution
        else return true
    },
    /**
     * returns true if feedback dialog is enabled
     */
    isFeedbackDialogEnabled: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.enableFeedback))
            return this._pluginConfig.selectedConfig.enableFeedback
        else return true
    },
    /**
     * returns true if microhints are enabled
     */
    areMicrohintsEnabled: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.areMicrohintsEnabled))
            return this._pluginConfig.selectedConfig.areMicrohintsEnabled
        else return true
    },
    /**
     * returns true if variables should be static
     * returns true if assessment
     */
    areVariablesStatic: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.areVariablesStatic))
            return this._pluginConfig.selectedConfig.areVariablesStatic
        else return false
    },
    /**
     * returns true if answers are supposed to be retained
     */
    shouldAnswersPersist: function () {
        if (this._pluginConfig.selectedConfig && !_.isUndefined(this._pluginConfig.selectedConfig.retainAnswers))
            return this._pluginConfig.selectedConfig.retainAnswers
        else return false
    }
});