/**
 * Words Extractor will extract all the text from the content and do a search on wordnet
 * @class org.ekstep.plugins.WordPicker.WordsExtractor
 * @author Srivathsa Dhanraj <srivathsa.dhanraj@goodworklabs.com>
 */

org.ekstep.plugins.WordPicker.WordsExtractor = org.ekstep.plugins.WordPicker.SourceBase.extend({
    title: "From this lesson",
    _selectedWordsUpdateCallbacks: [],
    noWordError: "No word is found in this lesson, Click on From Word Duniya !",
    isLoading: false,
    templateId: 'wordsExtractorTemplate',
    _errors: [],
    init: function(callbacks) {
        var self = this;
        self._updateCallback = callbacks.updateValues;
        self._updateErrors = callbacks.updateErrors;
        var extractWordsPlugin = ecEditor.instantiatePlugin('org.ekstep.plugins.extractwords');
        extractWordsPlugin.getWordsFromAllStages(function(err, result) {
            if (!err && result.words.length > 0) {
                self._words = result.words;
                self._createWordStructure();
                self.updateSourceErrors(self, self.noWordError, false);
            } else {
                self.updateSourceErrors(self, self.noWordError, true);
            }
        });
    },
});
/**
 * Method to create a new instance of WordsExtractor
 * @memberOf org.ekstep.plugins.WordPicker.WordsExtractor
 * @param  {Object} callbacks an object having multiple callback functions
 * @returns {class} instance of this class
 */
org.ekstep.plugins.WordPicker.WordsExtractor.create = function(callbacks) {
    return new org.ekstep.plugins.WordPicker.WordsExtractor(callbacks);
}
