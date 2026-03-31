/**
 * Source base class provides all the common functionality required by all the sources used by wordpicker.
 * @class org.ekstep.plugins.WordPicker.SourceBase
 * @author Srivathsa Dhanraj <srivathsa.dhanraj@goodworklabs.com>
 */
org.ekstep.plugins.WordPicker.SourceBase = Class.extend({
    _words: [],
    _selectedWords: [],
    _selectedWordsUpdateCallbacks: [],
    _updateCallback: undefined,
    _updateErrors: undefined,
    isLoading: false,
    /**
     * Groups the words by lemma and prepares objects array that will be used by the wizard to display the words.
     * @private
     * @memberof org.ekstep.plugins.WordPicker.SourceBase
     * @returns {void}
     */
    _createWordStructure: function() {
        var self = this;
        self.nameWiseWords = [];
        _.each(self._words, function(word) { word.lemma = word.lemma.toLowerCase(); });
        var wordsGroupedByLemma = _.groupBy(self._words, "lemma");
        _.each(_.keys(wordsGroupedByLemma), function(lemma) {
            self.nameWiseWords.push({ wordName: lemma, words: wordsGroupedByLemma[lemma] });
        })
        self._updateCallback();
        self._callRegisteredCallbacks([], []);
    },
    /**
     * Callback for checkbox toggle for any word. Updates the _selectedWords
     * array can calls all registered callbacks
     * @memberof org.ekstep.plugins.WordPicker.SourceBase#
     * @returns {void}
     */
    onWordSelectionChange: function() {
        var self = this;
        var previousSelectedWords = self._selectedWords;
        self._selectedWords = _.filter(self._words, 'isSelected');
        var newSelectedWords = self._selectedWords;
        self._callRegisteredCallbacks(newSelectedWords, previousSelectedWords);
    },
    /**
     * Method to add callback functions to _selectedWordsUpdateCallbacks array. All registered callbacks
     * are fired when any change to selected words are made
     * @memberof org.ekstep.plugins.WordPicker.SourceBase#
     * @param {array} callback - Array of functions
     * @returns {void}
     */
    registerCallback: function(callback) {
        this._selectedWordsUpdateCallbacks.push(callback);
    },
    /**
     * Method to call all callbacks that may be registered by other classes. Used to update
     * selected words in the app controller
     * @private
     * @memberOf org.ekstep.plugins.WordPicker.SourceBase
     * @param {array} newSelectedWords - new list of words.
     * @param {array} previousSelectedWords - previous list of words.
     * @returns {void}
     */
    _callRegisteredCallbacks: function(newSelectedWords, previousSelectedWords) {
        _.each(this._selectedWordsUpdateCallbacks, function(callback) {
            callback(newSelectedWords, previousSelectedWords)
        })
    },
    /**
     * Method that gets called by app controller when there's a change in selected words
     * from other sources.
     * @memberOf org.ekstep.plugins.WordPicker.SourceBase#
     * @param {array} wordsList - array of currently selected words from all sources
     * @returns {void}
     */
    updateSelectedWords: function(wordsList) {
        var self = this;
        var selectedWordIdentifiers = _.map(wordsList, 'identifier');
        var wordsToSelect = _.filter(self._words, function(word) {
            return _.indexOf(selectedWordIdentifiers, word.identifier) > -1;
        });
        var wordsToUnselect = _.filter(self._words, function(word) {
            return _.indexOf(selectedWordIdentifiers, word.identifier) == -1;
        });
        _.each(wordsToSelect, function(word) { word.isSelected = true });
        _.each(wordsToUnselect, function(word) { word.isSelected = false });
        this._selectedWords = wordsToSelect;
    },

    /**
     * It adds and removes error message in errors array of provided source
     * @memberOf org.ekstep.plugins.WordPicker.SourceBase#
     * @param {Class} source - instance of any source (WordDuniya, WordsExtractor etc)
     * @param {String} error - error message to add or remove
     * @param {Boolean} isAddition - if true adds the error else remove the error
     */
    updateSourceErrors: function(source, error, isAddition) {
        if (isAddition) {
            !_.find(source._errors, function(message) {
                return message == error;
            }) && source._errors.push(error);
        } else {
            source._errors = _.reject(source._errors, function(message) {
                return message == error
            });
        }
        source._updateCallback();
    }
});
//# sourceURL=WordPickerSourceBase.js
