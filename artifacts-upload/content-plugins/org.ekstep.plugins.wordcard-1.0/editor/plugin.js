/**
 *
 * Plugin to create wordcards
 * @class org.ekstep.plugins.WordCard.EditorPlugin
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Devendra Singh<devendra.singh@tarento.com>
 */
org.ekstep.plugins.WordCard.EditorPlugin = org.ekstep.contenteditor.basePlugin.extend({
    type: "org.ekstep.plugins.wordcard",
    /**
     *  Adds event listeners and loads template and controller
     *  @memberof org.ekstep.plugins.WordCard.EditorPlugin#
     */
    initialize: function() {
        var instance = this;
        ecEditor.addEventListener("org.ekstep.plugins.wordcard:showpopup", this.loadHtml, this);
        var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/word-card-editor-config.html');
        var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/word-card-editor-app.js');
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);
    },
    /**
     *  Process the word data and display everything as individual elements on the stage.
     *  @memberof org.ekstep.plugins.WordCard.EditorPlugin#
     */
    newInstance: function() {
        this.parent = undefined; //undefined ,because there is no parent plugin which  instantiates word card plugin
        this._addNewStages();
    },

    /**
     *  Open wizard to select words and configurations
     *  @memberof org.ekstep.plugins.WordCard.EditorPlugin#
     */
    loadHtml: function() {
        ecEditor.getService(ServiceConstants.POPUP_SERVICE).open({
            template: 'wordcard',
            controller: 'wordCardEditorController',
            controllerAs: '$ctrl',
            width: 900,
            showClose: false,
        });
    },

    /**
     *  Adds new stages for each word
     *  @memberof org.ekstep.plugins.WordCard.EditorPlugin#
     */
    _addNewStages: function() {
        var instance = this;
        var pluginData = this.getData();
        var words = pluginData.words;
        var wordCardConfig = this.getConfig();
        var wordcard = org.ekstep.plugins.WordCard.WordCard.create(instance);
        var lastStageId = undefined;
        ecEditor._.each(words, function(wordDetails, index) {
            var currentStage = ecEditor.instantiatePlugin('org.ekstep.stage', { "position": "end" });
            if (index == words.length - 1 && ecEditor._.isUndefined(lastStageId)) lastStageId = currentStage.id;
            var word = new org.ekstep.plugins.WordCard.Word(wordDetails);
            var wordInfo = word.getWordInfo(wordCardConfig.translationLanguages);
            wordcard.generate(wordInfo, wordCardConfig, currentStage);
        });
        ecEditor.dispatchEvent("stage:select", { stageId: lastStageId });
    }

});
//# sourceURL=WordCardPlugin.js
