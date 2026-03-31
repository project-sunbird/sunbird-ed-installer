org.ekstep.plugins.ExtractWords.WordSearchService = Class.extend({
    /**
     * @constructs org.ekstep.plugins.ExtractWords.WordSearchService
     * @param  {SearchService} searchService used for searching words in wordnet
     */
    init: function(searchService) {
        this.searchService = searchService;
    },

    /**
     * Searches word net for given words in given language and calls the call back with words or error
     * Aggregates paginated results from searchService
     * @memberOf org.ekstep.plugins.ExtractWords.WordSearchService#
     * @param  {Array<String>} textWords - Words to search in wordnet
     * @param  {String} languageCode - languageCode of the words to search
     * @param  {Function} callback - callback for the response
     */
    searchWords: function(textWords, languageCode, callback) {
        this._searchWordsForGivenOffset(textWords, languageCode, 0, [], callback);
    },

    _searchWordsForGivenOffset: function(textWords, languageCode, offset, wordsFromPreviousCalls, callback) {
        var self = this;
        var searchWordsRequest = {
            "request": {
                "offset": offset,
                "filters": {
                    "objectType": ["word"],
                    "graph_id": [languageCode],
                    "status": ["Live"],
                    "lemma": textWords
                }
            }
        };
        self.searchService.search(searchWordsRequest, function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                var result = response.data.result;
                var totalWordsCount = result.count;
                var wordsFromCurrentCall = result.words;
                var wordsRetievedTillNow = _.concat(wordsFromPreviousCalls, wordsFromCurrentCall);
                var retrivedWordsCount = _.size(wordsRetievedTillNow);
                if (totalWordsCount > retrivedWordsCount) {
                    var offsetForNextPage = retrivedWordsCount;
                    self._searchWordsForGivenOffset(textWords, languageCode, offsetForNextPage, wordsRetievedTillNow, callback);
                } else {
                    callback(err, { count: totalWordsCount, words: wordsRetievedTillNow });
                }
            }
        });
    }
});
