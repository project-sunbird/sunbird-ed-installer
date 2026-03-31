/**
 * Word Duniya class handles search and maintain words data from wordnet as a source
 * @class org.ekstep.plugins.WordPicker.WordDuniya
 * @author Srivathsa Dhanraj <srivathsa.dhanraj@goodworklabs.com>
 */
org.ekstep.plugins.WordPicker.WordDuniya = org.ekstep.plugins.WordPicker.SourceBase.extend({
    title: "From Word Duniya",
    languageList: [],
    languageSelected: "en",
    inValidForm: false,
    isFreshForm: true,
    _selectedWordsUpdateCallbacks: [],
    templateId: 'wordDuniyaTemplate',
    searchCriteria: undefined,
    _errors: [],
    noLanguageError: "Languages are not found !",
    noWordError: "Words are not found !",
    init: function(callbacks) {
        var self = this;
        var languageService = org.ekstep.contenteditor.api.getService(ServiceConstants.LANGUAGE_SERVICE);
        self._updateCallback = callbacks.updateValues;
        self._updateErrors = callbacks.updateErrors;
        self.searchCriteria = org.ekstep.plugins.WordPicker.SearchCriteria.create(languageService, callbacks, self);
        self.searchCriteria.getWordDefinition();
        languageService.getLanguages(function(err, res) {
            if (!err && res.data.responseCode == "OK") {
                self.languageList = res.data.result.languages;
                angular.element(document).ready(function() {
                    $('.wordpicker .dropdown').dropdown();
                });
                self.updateSourceErrors(self, self.noLanguageError, false);
            } else {
                self.updateSourceErrors(self, self.noLanguageError, true);
            }
            self._updateErrors();
        });

    },

    /**
     * Method to create the request object based on form input.
     * @memberof org.ekstep.plugins.WordPicker.WordDuniya
     * @private
     * @param {Object} form - data from input form
     * @param {string} language - Language code of the language selected from dropdown
     * @param {function} callback - callback to call
     * @returns {void}
     */
    _search: function(form, language, callback) {
        var self = this;
        if (form.$invalid) {
            callback({
                invalidForm: true
            }, {});
        } else {
            var words = [];
            var selwords = self.word ? self.word.replace(/\s+/g, '') : undefined; //$scope.word.replace(/\s+/g, '');
            words = selwords ? selwords.split(",") : [];
            var lemma = self.searchCriteria.getLemma(words);
            var category = self.searchCriteria.getCategory();
            var pos = self.searchCriteria.getPos();
            var syllableCount = self.searchCriteria.getSyllableCount();
            var exactWordVal = {
                "request": {
                    "filters": {
                        "objectType": ["word"],
                        "language_id": [language],
                        "status": ["Live"],
                        "lemma": lemma,
                        "category": category,
                        "pos": pos,
                        "syllableCount": syllableCount
                    },
                    "sort_by": { "lemma": "asc" }
                }
            };
            self._callSearchAPI(exactWordVal, callback);
        }
    },
    /**
     * Calls the language search API. Saves the response in _words array.
     * @memberof org.ekstep.plugins.WordPicker.WordDuniya
     * @private
     * @param {Object} data - data object for search API
     * @param {function} callback - callback to be called when response is received.
     * @returns {void}
     */
    _callSearchAPI: function(data, callback) {
        var self = this;
        var searchService = org.ekstep.contenteditor.api.getService(ServiceConstants.LANGUAGE_SERVICE);
        searchService.getWords(data, function(err, response) {
            if (!err && response.data.responseCode == "OK" && response.data.result.words) {
                self._words = response.data.result.words;
                callback(null, self._words);
                self.updateSourceErrors(self, self.noWordError, false);
            } else {
                self.updateSourceErrors(self, self.noWordError, true);
                self.isLoading = false;
                callback({
                    noResult: true
                }, {});
            }
            self._updateErrors();
        });
    },
    /**
     * Calls the method to create data object for search with given form input.
     * Handles response and invalid form inputs.
     * @memberof org.ekstep.plugins.WordPicker.WordDuniya#
     * @param {Object} form - form data
     * @returns {void}
     */
    getWords: function(form) {
        var self = this;
        self.isLoading = true;
        self.nameWiseWords = [];
        self._search(form, self.languageSelected, function(error) {
            self.isLoading = false;
            if (error == null) {
                self.inValidForm = false;
                self._createWordStructure();
            } else if (error.invalidForm) {
                self.inValidForm = true;
            }
            self._updateCallback();
        })
    }
});
/**
 * Method to create a new instance of WordDuniya
 * @memberOf org.ekstep.plugins.WordPicker.WordDuniya
 * @param  {Object} callbacks an object having multiple callback functions
 * @returns {class} instance of this class
 */
org.ekstep.plugins.WordPicker.WordDuniya.create = function(callbacks) {
    return new org.ekstep.plugins.WordPicker.WordDuniya(callbacks);
};

//# sourceURL=WordPickerWordDuniya.js
