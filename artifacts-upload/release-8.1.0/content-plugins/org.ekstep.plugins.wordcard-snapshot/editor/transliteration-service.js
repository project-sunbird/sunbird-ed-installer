/**
 * @class  org.ekstep.plugins.WordCard.TransliterationService
 */
org.ekstep.plugins.WordCard.TransliterationService = Class.extend({

    init: function(promisifier, languageService) {
        this.promisifier = promisifier;
        this.languageService = languageService;
    },
    /**
     * This method Takes an array of words and a language code and returns a
     * words transliterated text in the given language.
     * @param {string} words -  Orignial words in english.
     * @param {string} languageCode - language code
     * @param {function} callback - callback function to be called when API call returns
     * @returns {void}
     */
    transliterate: function(words, languageCode, callback) {
        var instance = this;
        var promises = _.map(words, function(word) {
            var data = {};
            data.text = word.lemma;
            data.languages = [languageCode];

            return instance.promisifier.promisify(instance.languageService.getTransliteration.bind(instance.languageService), data);
        });

        this.promisifier.allSettled(promises).then(function(result) {
            var transliterations = [];
            _.each(result, function(item, index) {
                if (item.state == 'fulfilled' && item.value.data.result.transliterations[languageCode]) {
                    var transliterationOutput = item.value.data.result.transliterations[languageCode]['output'];
                    transliterations[index] = transliterationOutput ? decodeURIComponent(transliterationOutput) : '';
                }
            });
            callback(transliterations);
        })
    }
})

/**
 * creates TransliterationService instance
 * @memberof org.ekstep.plugins.WordCard.TransliterationService
 * @param  {class} promisifier it handle promises
 * @param  {class} languageService instance of languageService
 * @returns {class} TransliterationService instance of TransliterationService
 */
org.ekstep.plugins.WordCard.TransliterationService.create = function(promisifier, languageService) {
    return new org.ekstep.plugins.WordCard.TransliterationService(promisifier, languageService)
}
