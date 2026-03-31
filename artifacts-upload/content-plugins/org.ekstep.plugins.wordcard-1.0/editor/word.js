org.ekstep.plugins.WordCard.Word = Class.extend({
    /**
     * @memberof org.ekstep.plugins.WordCard.Word#
     * @member {object} _detail word detail
     */
    _detail: undefined,

    /**
     * @memberof org.ekstep.plugins.WordCard.Word#
     * @member {Number} _maximumExample maximum number of examples should be shown in a word card
     */
    _maximumExample: 1,

    /**
     * Word class to process word details and return word data in expected format
     * @constructs org.ekstep.plugins.WordCard.Word
     * @param  {object} wordDetails  word detail of a perticular word
     */
    init: function(wordDetails) {
        this._detail = wordDetails;
    },

    /**
     * @memberof org.ekstep.plugins.WordCard.Word#
     * @param {array} selectedLanguagaes list of languages
     * @returns {object} wordInfo- word informations
     */
    getWordInfo: function(selectedLanguagaes) {
        var wordInfo = {
            meaning: this._detail.meaning,
            name: this._detail.lemma,
            audio: this._getAudio(),
            image: this._getPicture(),
            exampleSentences: this._getExamples(),
            translations: this._getTranslations(selectedLanguagaes),
            transliteration: this._detail.transliteration
        };
        return wordInfo;
    },

    /**
     * @memberof org.ekstep.plugins.WordCard.Word#
     * @param {string} audioURL url string for audio
     * @returns {object} audio- object containing assetMedia and asset
     */
    _getAudio: function() {
        var audio;
        if (_.some(this._detail.pronunciations)) {
            audio = org.ekstep.plugins.WordCard.Word.getMedia(this._detail.pronunciations[0], "audio");
        }
        return audio;
    },
    /**
     * @memberof org.ekstep.plugins.WordCard.Word#
     * @returns {object} picture- object containing assetMedia and asset
     */
    _getPicture: function() {
        var picture;
        if (_.some(this._detail.pictures)) {
            picture = org.ekstep.plugins.WordCard.Word.getMedia(this._detail.pictures[0], "image");
        }
        return picture;

    },
    /**
     * @memberof org.ekstep.plugins.WordCard.Word#
     * @returns {array} exampleSentences- array containing example sentences
     */
    _getExamples: function() {
        var exampleSentences;
        if (this._detail.exampleSentences && this._detail.exampleSentences.length > 0) {
            exampleSentences = ecEditor._.map(this._detail.exampleSentences, function(val, index) {
                var exampleNumber = index + 1;
                return "Example " + exampleNumber + ":" + val;
            });
            if (exampleSentences.length > this._maximumExample) {
                exampleSentences = exampleSentences.slice(0, this._maximumExample);
            }
        } else {
            exampleSentences = [];
        }
        return exampleSentences;
    },
    /**
     * @memberof org.ekstep.plugins.WordCard.Word#
     * @param {array} selectedLanguagaes list of languages
     * @returns {array} translations- an array containing translation for all words
     */
    _getTranslations: function(selectedLanguagaes) {
        var translations = [];
        if (this._detail.languageWiseTranslation && selectedLanguagaes.length > 0) {
            var languageWiseTranslation = this._detail.languageWiseTranslation;

            ecEditor._.each(selectedLanguagaes, function(language) {
                var translatedWord = {};
                var translationsForThisLanguage = languageWiseTranslation[language.code];
                if (_.some(translationsForThisLanguage)) {
                    translatedWord.languageName = language.name;
                    translatedWord.wordName = translationsForThisLanguage[0].lemma;
                    translatedWord.audio = org.ekstep.plugins.WordCard.Word.getMedia(translationsForThisLanguage[0].audioSrc, "audio");

                    translations.push(translatedWord);
                }
            });
        }
        return translations;
    }
});

/**
 * Returns media object in expected structure
 * @memberof org.ekstep.plugins.WordCard.Word
 * @param  {String} assetUrl audio or image url
 * @param  {String} type audio or image
 * @returns {Object} media- media object containing assetMedia as object
 */
org.ekstep.plugins.WordCard.Word.getMedia = function(assetUrl, type) {
    var media, urlParts;
    if (assetUrl) {
        media = {};
        urlParts = assetUrl.split("/");
        media.asset = _.last(urlParts);
        media.assetMedia = {
            id: media.asset,
            assetId: media.asset,
            src: assetUrl,
            type: type
        }
    }
    return media;
}

//# sourceURL=WordcardPluginWord.js
