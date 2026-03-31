org.ekstep.plugins.WordMaker.SyllableService = Class.extend({
    /**
     * Syllable service helps to get syllable of words in different languages.
     * @memberof org.ekstep.plugins.WordMaker.SyllableService#
     * @param  {class} promisifier it handle promises
     * @param {class} searchService instance of searchServices
     */
    init: function(promisifier, searchService) {
        this.searchService = searchService;
        this.promisifier = promisifier;
    },


    /**
     * Makes api call by creating promises for different words in given languages
     * @memberof org.ekstep.plugins.WordMaker.SyllableService#
     * @param {array} words array of words which will be splitted into letters
     * @param {Function} callback callback function
     */
    getWordsSyllable: function(words, callback) {
        var instance = this;
        var promises = _.map(words, function(word) {
            var data = {
                "request": {
                    "word": word.lemma
                }
            };
            return instance.promisifier.promisify(instance.searchService.getSyllables.bind(instance.searchService), data);
        });

        this.promisifier.allSettled(promises).then(function(result) {
            result.filter(function(val) {
                return val.state == 'fulfilled';
            });
            callback(result);
        });
    }
});

/**
 * creates SyllableService instance
 * @memberof org.ekstep.plugins.WordMaker.SyllableService#
 * @param  {class} promisifier it handle promises
 * @param {class} searchService instance of searchServices
 * @returns {class} SyllableService instance of SyllableService
 */
org.ekstep.plugins.WordMaker.SyllableService.create = function(promisifier, searchService) {
    return new org.ekstep.plugins.WordMaker.SyllableService(promisifier, searchService);
}

//# sourceURL=wordmakerSyllableService.js
