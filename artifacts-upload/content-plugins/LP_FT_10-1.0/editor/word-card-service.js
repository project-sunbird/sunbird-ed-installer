org.ekstep.plugins.WordCard.WordCardService = Class.extend({
    /**
     * WordCardService helps to get languages and wordnet data.
     * @constructs org.ekstep.plugins.WordCard.WordCardService
     * @param  {class} languageService used for searching languages, words in wordnet
     * @param  {class} searchService used for searching words in wordnet
     */
    init: function(languageService, searchService) {
        this.languageService = languageService;
        this.searchService = searchService;
    },

    /**
     * Searches word net for supported languages and calls the call back with languages or error
     * @memberof org.ekstep.plugins.WordCard.WordCardService#
     * @param  {Function} callback callback for the response
     */
    getLanguages: function(callback) {
        this.languageService.getLanguages(callback);
    },

    /**
     * Prepares API header and calls search method to get pronunciation for set of words
     * @memberof org.ekstep.plugins.WordCard.WordCardService#
     * @param  {array}   words array of words
     * @param {Function} callback callback function
     */
    getPronunciation: function(words, callback) {
        var requestData = {
            "request": {
                "filters": {
                    "objectType": ["Word"],
                    "lemma": words

                },
                "exists": ["pronunciations"],
                "fields": ["pronunciations", "lemma"]
            }
        }
        this.search(requestData, callback);
    },

    /**
     * Utility function which is used to call http get request
     * @memberof org.ekstep.plugins.WordCard.WordCardService#
     * @param  {object}   requestData  API headers
     * @param {Function} callback callback function
     */
    search: function(requestData, callback) {
        this.searchService.search(requestData, callback);
    }

});

/**
 * Creates WordCardService instance
 * @memberof org.ekstep.plugins.WordCard.WordCardService
 * @param  {class} languageService instance of language service
 * @param  {class} searchService instance of search service
 * @returns {class} WordCardService- instance of WordCardService
 */
org.ekstep.plugins.WordCard.WordCardService.create = function(languageService, searchService) {
    return new org.ekstep.plugins.WordCard.WordCardService(languageService, searchService);
}

//# sourceURL=WordCardService.js
