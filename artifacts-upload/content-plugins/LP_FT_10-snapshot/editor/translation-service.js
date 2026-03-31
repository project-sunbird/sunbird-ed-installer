org.ekstep.plugins.WordCard.TranslationService = Class.extend({
    /**
     * Translation service helps to get translation of words in different languages.
     * @constructs org.ekstep.plugins.WordCard.TranslationService
     * @param  {class} promisifier it handle promises
     * @param {class} languageService instance of languageSercive
     */
    init: function(promisifier, languageService) {
        this.languageService = languageService;
        this.promisifier = promisifier;
    },


    /**
     * Makes api call by creating promises for different words in given languages
     * @memberof org.ekstep.plugins.WordCard.TranslationService#
     * @param {array} words array of words which will be translated in given languages
     * @param {array} languages array of languages code which will be used to translate
     * @param {Function} callback callback function
     */
    getWordsTranslation: function(words, languages, callback) {
        var instance = this;
        var promises = _.map(words, function(word) {
            var data = {};
            data.wordLang = word.graph_id;
            data.word = word.lemma;
            data.languages = languages.toString();
            return instance.promisifier.promisify(instance.languageService.getTranslation.bind(instance.languageService), data);
        });

        this.promisifier.allSettled(promises).then(function(result) {
            var successfulResponse = result.filter(function(val) {
                return val.state == 'fulfilled';
            });
            var translationResults = _.compact(_.map(successfulResponse, 'value.data.result.translations'));
            callback(translationResults);
        });
    }
});

/**
 * creates TranslationService instance
 * @memberof org.ekstep.plugins.WordCard.TranslationService
 * @param  {class} promisifier it handle promises
 * @param  {class} languageService instance of language service
 * @returns {class} TranslationService instance of TranslationService
 */
org.ekstep.plugins.WordCard.TranslationService.create = function(promisifier, languageService) {
    return new org.ekstep.plugins.WordCard.TranslationService(promisifier, languageService);
}

//# sourceURL=translationService.js
