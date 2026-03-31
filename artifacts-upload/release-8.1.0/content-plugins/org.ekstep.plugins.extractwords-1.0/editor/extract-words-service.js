org.ekstep.plugins.ExtractWords.ExtractWordsService = Class.extend({
    /**
     * @constructs org.ekstep.plugins.ExtractWords.ExtractWordsService
     * @param  {org.ekstep.plugins.ExtractWords.EditorContent} editorContent is used to get words from content
     * @param  {org.ekstep.plugins.ExtractWords.WordSearchService} wordSearchService is used for searching words
     */
    init: function(editorContent, wordSearchService) {
        this.editorContent = editorContent;
        this.wordSearchService = wordSearchService;
    },

    /**
     * Extracts words from all stages and calls the callback with result containing words in word-net or error
     * @memberOf org.ekstep.plugins.ExtractWords.ExtractWordsService#
     * @param  {Function} callback - callback for the response
     */
    getWordsFromAllStages: function(callback) {
        var textWords = this.editorContent.getTextWordsFromAllStages();
        if (_.some(textWords)) {
            var currentContentMeta = ecEditor.Extension.getCurrentContentMeta();
            this.wordSearchService.searchWords(textWords, currentContentMeta.languageCode, callback);
        } else {
            callback(null, { count: 0, words: [] });
        }
    }
});
