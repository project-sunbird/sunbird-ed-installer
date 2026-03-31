/**
 * @class  org.ekstep.plugins.ExtractWords.EditorPlugin
 */
org.ekstep.plugins.ExtractWords.EditorPlugin = org.ekstep.contenteditor.basePlugin.extend({

    /**
     * Initializes extractWordsService which will be used for delegating call to extract words for all stages
     * @memberOf org.ekstep.plugins.ExtractWords.EditorPlugin#
     */
    newInstance: function() {
        var searchService = ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE);
        var wordSearchService = new org.ekstep.plugins.ExtractWords.WordSearchService(searchService);
        var editorContent = new org.ekstep.plugins.ExtractWords.EditorContent()
        this.extractWordsService = new org.ekstep.plugins.ExtractWords.ExtractWordsService(editorContent, wordSearchService);
    },

    /**
     * @memberOf org.ekstep.plugins.ExtractWords.EditorPlugin#
     * @param  {Function} callback - callback for the response
     */
    getWordsFromAllStages: function(callback) {
        this.extractWordsService.getWordsFromAllStages(callback);
    }
});
//# sourceURL=ExtractWordsPlugin.js
