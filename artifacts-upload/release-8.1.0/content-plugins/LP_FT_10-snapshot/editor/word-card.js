org.ekstep.plugins.WordCard.WordCard = Class.extend({
    /**
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @member {object} _wordCardPluginInstance word card plugin instance
     */
    _wordCardPluginInstance: undefined,

    /**
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @member {object} _cardLayout word card layout
     */
    _cardLayout: undefined,
    /**
     * WordCard class to add word data on the canvas
     * @constructs org.ekstep.plugins.WordCard.WordCard
     * @param  {org.ekstep.plugins.WordCard.EditorPlugin} wordCardPluginInstance instance of word card plugin
     */
    init: function(wordCardPluginInstance) {
        this._wordCardPluginInstance = wordCardPluginInstance;
        this._cardLayout = new org.ekstep.plugins.WordCard.Layout().getLayout();
    },

    /**
     * Adds the word details on the stage as per author configurations
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @param  {object} wordInfo single word detais
     * @param  {object} wordCardConfig word card configurations
     * @param  {object} currentStage stage on which word details will be added
     *
     */
    generate: function(wordInfo, wordCardConfig, currentStage) {
        $('< canvas >').attr({ id: this.id }).css({ width: '720px', height: '405px' }).appendTo('#thumbnailCanvasContainer');
        var canvas = new fabric.Canvas(this.id, { backgroundColor: '#FFFFFF', preserveObjectStacking: true, width: 720, height: 405 });
        currentStage.setCanvas(canvas);
        var instance = this;
        var pluginCount = 0;
        var _ = ecEditor._;
        var audioIconProperty = { asset: "wordcard_icon_audio", assetMedia: { id: "wordcard_icon_audio", assetId: "wordcard_icon_audio", src: ecEditor.resolvePluginResource(instance._wordCardPluginInstance.manifest.id, instance._wordCardPluginInstance.manifest.ver, "assets/icon-audio.png"), type: "image" } };
        var noImageIconProperty = { asset: "wordcard_icon_no_image", assetMedia: { id: "wordcard_icon_no_image", assetId: "wordcard_icon_no_image", src: ecEditor.resolvePluginResource(instance._wordCardPluginInstance.manifest.id, instance._wordCardPluginInstance.manifest.ver, "assets/no-image.png"), type: "image" } };
        noImageIconProperty["z-index"] = 1000;
        audioIconProperty["z-index"] = 1000;
        var cardBgShapeProperty = this._cardLayout.cardBackgroundShape;
        this._addShape(cardBgShapeProperty, currentStage); // background shape for complete card
        pluginCount++;
        var wordBgShapeId = UUID();
        var wordBgShapeProperty = _.extend(this._cardLayout.wordBackgroundShape, { id: wordBgShapeId });
        this._addShape(wordBgShapeProperty, currentStage); //background shape for word name below image
        pluginCount++;
        var wordTwoProperty = this._cardLayout.wordTextTwo;
        var transliteration = wordInfo.transliteration ? " ( " + wordInfo.transliteration + " )" : "";
        this._addText(_.extend(wordTwoProperty, { __text: wordInfo.name.toUpperCase() + transliteration }), currentStage); //word name infront of image
        pluginCount++;
        if (wordCardConfig.meaning && wordInfo.meaning) { //meaning
            var wordMeaningProperty = this._cardLayout.meaning;
            this._addText(_.extend(wordMeaningProperty, { __text: wordInfo.meaning }), currentStage);
            pluginCount++;
        }

        var imageProperty = this._cardLayout.image;
        imageProperty["z-index"] = 1000;
        var imageAltTextBorderProps = this._cardLayout.imageAltTextBorderShape;
        this._addShape(imageAltTextBorderProps, currentStage);
        pluginCount++;
        if (wordCardConfig.picture && wordInfo.image && wordInfo.image.asset) { //picture
            this._addImage(_.extend(imageProperty, wordInfo.image), currentStage);
        } else {
            this._addImage(_.extend({ x: 15.5, y: 18.2, w: 24, h: 42, stretch: false }, noImageIconProperty), currentStage);
        }
        pluginCount++;

        if (wordCardConfig.audio && wordInfo.audio && wordInfo.audio.asset) { //audio
            var audioProperty = _.extend(wordInfo.audio, { autoplay: true });
            this._addAudio(audioProperty, currentStage);
            pluginCount++;
            var action = { command: "play", asset: wordInfo.audio.asset };
            this._addAction(wordBgShapeProperty.id, action);
            var audioIconDefaultProperty = this._cardLayout.wordAudioIcon;
            this._addImage(_.extend(audioIconDefaultProperty, audioIconProperty), currentStage);
            pluginCount++;
        }
        if (wordCardConfig.exampleUsage && wordInfo.exampleSentences.length > 0) {
            var exampleProperties = this._cardLayout.example;
            _.each(wordInfo.exampleSentences, function(example, index) {
                instance._addText(_.extend(exampleProperties[index], { __text: example }), currentStage); //Examples
                pluginCount++;
            });
        }
        if (wordCardConfig.translationLanguages.length > 0 && wordInfo.translations.length > 0) {
            var translationProperties;
            if (wordInfo.translations.length <= 2) {
                translationProperties = this._cardLayout.translation.two;
            } else if (wordInfo.translations.length <= 4) {
                translationProperties = this._cardLayout.translation.four;
            }
            _.each(wordInfo.translations, function(translation, index) {
                var shapeId = UUID();
                var shapeProperty = _.extend(translationProperties[index].shape, { id: shapeId });
                instance._addShape(shapeProperty, currentStage); //translated text bgshape
                pluginCount++;
                instance._addText(_.extend(translationProperties[index].text, { __text: translation.wordName }), currentStage); //translated text
                pluginCount++;
                instance._addText(_.extend(translationProperties[index].language, { __text: translation.languageName }), currentStage); //translated text
                pluginCount++;
                if (wordCardConfig.audio && translation.audio) {
                    pluginCount++;
                    instance._addAudio(translation.audio, currentStage);
                    var action = { command: "play", asset: translation.audio.asset };
                    instance._addAction(shapeProperty.id, action);
                    instance._addImage(_.extend(translationProperties[index].audioIcon, audioIconProperty), currentStage);
                    pluginCount++;
                }
            });

        }
        var wordOneProperty = this._cardLayout.wordTextOne;
        var newFontSize = wordInfo.name.length > 10 ? 16 : 25;
        this._addText(_.extend(wordOneProperty, { __text: wordInfo.name.toUpperCase(), fontSize: newFontSize }), currentStage); //word name below image
        pluginCount++;
        currentStage.destroyOnLoad(pluginCount, canvas, function() {});
    },

    /**
     * Adds shape on the stage
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @param  {object} shapeProperty properties of shape
     * @param  {object} stage stage on which shape will be added
     *
     */
    _addShape: function(shapeProperty, stage) {
        var fabricProperty = this._wordCardPluginInstance.convertToFabric(shapeProperty);
        ecEditor.instantiatePlugin('org.ekstep.shape', fabricProperty, stage);
    },

    /**
     * Adds text on the stage
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @param  {object} textProperty text properties
     * @param  {object} stage stage on which text will be added
     *
     */
    _addText: function(textProperty, stage) {
        var fabricProperty = this._wordCardPluginInstance.convertToFabric(textProperty);
        ecEditor.instantiatePlugin('org.ekstep.text', fabricProperty, stage);

    },

    /**
     * Adds image on the stage
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @param  {object} imageProperty image properties
     * @param  {object} stage stage on which image will be added
     *
     */
    _addImage: function(imageProperty, stage) {
        var fabricProperty = this._wordCardPluginInstance.convertToFabric(imageProperty);
        ecEditor.instantiatePlugin('org.ekstep.image', fabricProperty, stage);
    },

    /**
     * Adds audio on the stage
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @param  {object} audioProperty audio Properties
     * @param  {object} stage stage on which stage will be added
     *
     */
    _addAudio: function(audioProperty, stage) {
        ecEditor.instantiatePlugin("org.ekstep.audio", audioProperty, stage);
    },

    /**
     * Adds action on the given object
     * @memberof org.ekstep.plugins.WordCard.WordCard#
     * @param  {object} pluginId plugin instance id
     * @param  {object} action action which should be performed on click of the pluginInstance
     *
     */
    _addAction: function(pluginId, action) {
        ecEditor.getPluginInstance(pluginId).addEvent({ 'type': 'click', 'action': [{ 'id': UUID(), 'type': 'command', 'command': action.command, 'asset': action.asset }] });
    }
});

/**
 * creates WordCard instance
 * @memberof org.ekstep.plugins.WordCard.WordCard
 * @param  {class} wordCardPluginInstance instance of word card plugin
 * @returns {class} WordCard- instance of WordCard
 */
org.ekstep.plugins.WordCard.WordCard.create = function(wordCardPluginInstance) {
    return new org.ekstep.plugins.WordCard.WordCard(wordCardPluginInstance);
}

//# sourceURL=WordcardPluginWordCard.js
