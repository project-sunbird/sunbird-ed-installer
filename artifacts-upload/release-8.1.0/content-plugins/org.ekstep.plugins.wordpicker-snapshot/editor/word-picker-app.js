/**
 * Word picker controller to process configuration data from wizard
 * @class Wordpickerapp
 * @author Srivathsa Dhanraj <srivathsa.dhanraj@goodworklabs.com>
 */
'use strict';
angular.module('wordpickerapp', ['editorApp'])
    .directive('wordpicker', function() {
        return {
            scope: {
                "selectedWords": "=",
                "errors": "=?",
                "config": "=?"
            },
            controller: 'wordpickerController',
            templateUrl: 'wordpickertemplate',
        }
    })
    .controller('wordpickerController', ['$scope', '$rootScope', function($scope, $rootScope) {
        $scope.selectedWords = [];
        $scope.errors = [];
        $scope.config = $scope.config || {};
        /**
         * Calls $rootScope.$safeApply(). Called from other classes when data bound to wizard's UI are updated
         * @memberOf wordpickerController
         * @returns {void}
         */
        $scope.updateValues = function() {
            $rootScope.$safeApply();
        };

        /**
         * Updates $scope.errors. This can be called from any word source.
         * @memberOf wordpickerController
         * @returns {void}
         */
        $scope.updateErrors = function() {
            var errors = [];
            $scope.sources.forEach(function(source) {
                errors = _.union(errors, source._errors);
            });
            $scope.errors = errors;
        };

        $scope.sources = [org.ekstep.plugins.WordPicker.WordsExtractor.create({ updateValues: $scope.updateValues, updateErrors: $scope.updateErrors }), org.ekstep.plugins.WordPicker.WordDuniya.create({ updateValues: $scope.updateValues, updateErrors: $scope.updateErrors })];
        $scope.selectedSource = $scope.sources[0];
        /**
         * Updates $scope.selectedWords. This can be called from any word source.
         * @memberOf wordpickerController
         * @param {array} newValue - new list of words
         * @param {array} oldValue - old list of words
         * @returns {void}
         */
        $scope.updateSelectedWordsList = function(newValue, oldValue) {
            if (newValue.length > oldValue.length) {
                $scope.selectedWords.push(_.difference(newValue, oldValue)[0]);
            } else {
                oldValue.length > newValue.length && $scope.selectedWords.splice($scope.selectedWords.indexOf(_.difference(oldValue, newValue)[0]), 1);
            }
            $scope.notifyAllSources($scope.selectedWords);
            $rootScope.$safeApply();
        };

        /**
         * Callback when a word is deleted from the wordsList screen. Removes the word from the
         * selectedWords array and notifies all sources about the deletion.
         * @memberOf wordpickerController
         * @param {array} wordId - identifier of the word that was removed
         * @returns {void}
         */
        $scope.removeWordFromWordsList = function(wordId) {
            var indexOfRemovedWord = $scope.selectedWords.indexOf(_.find($scope.selectedWords, function(word) {
                return word.identifier == wordId;
            }));
            $scope.selectedWords.splice(indexOfRemovedWord, 1);
            $scope.notifyAllSources($scope.selectedWords);
        };
        /**
         * Notifies all the sources with the latest list of selected words. Used for
         * informing other sources when a selection or deletion of word happens in one of the sources.
         * @memberOf wordpickerController
         * @param {array} selectedWords - Array of all selected words ($scope.selectedWords)
         * @returns {void}
         */
        $scope.notifyAllSources = function(selectedWords) {
            $scope.sources.forEach(function(source) {
                source.updateSelectedWords(selectedWords);
            });
        };
        /**
         * Method that simply returns the currently selected words. Used by Word duniya
         * to check if a word from the search result is already selected in other sources.
         * @memberOf wordpickerController
         * @param {array} selectedWords - Array of all selected words ($scope.selectedWords)
         * @returns {void}
         */
        $scope.getSelectedWords = function() {
            return $scope.selectedWords;
        };


        $scope.sources.forEach(function(source) {
            source.registerCallback($scope.updateSelectedWordsList);
        });

        $scope.$watch('selectedWords', function(newValue) {
            $scope.notifyAllSources(newValue);
        });

        $scope.switchSource = function(source) {
            $scope.selectedSource.showSelectedWords = false;
            $scope.selectedSource = source;
            if ($scope.selectedSource.hasOwnProperty("searchCriteria")) {
                this.checkWordLength();
            }

        };

        /**
         * Function to check if a language is supported by Word Picker
         * @param {String} language - language code (en,hi etc)
         * @returns {boolean} boolean - true or false
         */
        $scope.checkSupportLanguage = function(language) {
            if ($scope.config.hasOwnProperty("languagesupported")) {
                var supportlanguage = $scope.config.languagesupported;
                if (Array.isArray(supportlanguage) && supportlanguage.length) {
                    return supportlanguage.indexOf(language.toLowerCase()) == -1;
                } else {
                    return false;
                }
            }
        };

        /**
         * Function to check if word contain image and audio
         * @param {Object} word - word object
         * @returns {String} boolean - return disableword or ""
         */
        $scope.checkWordWithImageAudio = function(word) {
            if ($scope.config.required) {
                switch (true) {
                case ($scope.config.required.pronunciations && $scope.config.required.pictures):
                    return ((word.hasOwnProperty('pictures')) && (word.hasOwnProperty('pronunciations')) ? "" : "disableword");
                case $scope.config.required.pronunciations:
                    return word.hasOwnProperty('pronunciations') ? "" : "disableword";
                case $scope.config.required.pictures:
                    return word.hasOwnProperty('pictures') ? "" : "disableword";
                default:
                    return "";
                }
            }
        }

        /**
         * Function to checkword length  propert and return that word
         * @param {Object} wordLength - wordLength object {min: 2,max:5,equal:3}
         * @returns {boolean} boolean - return false
         */
        $scope.checkWordLength = function() {
            if ($scope.config.wordLength) {
                switch ($scope.config.hasOwnProperty('wordLength')) {
                case $scope.config.wordLength.equal >= 1 && $scope.config.wordLength.equal <= 50:
                    $scope.selectedSource.searchCriteria._filter.syllableCountOption = "equal";
                    $scope.selectedSource.searchCriteria._filter.syllableCount.equal = $scope.config.wordLength.equal;
                    break;
                case $scope.config.wordLength.min >= 1 && $scope.config.wordLength.max <= 50:
                    $scope.selectedSource.searchCriteria._filter.syllableCountOption = "range";
                    $scope.selectedSource.searchCriteria._filter.syllableCount.min = $scope.config.wordLength.min;
                    $scope.selectedSource.searchCriteria._filter.syllableCount.max = $scope.config.wordLength.max;
                    break;
                case $scope.config.wordLength.min >= 1 && $scope.config.wordLength.min <= 50:
                    $scope.selectedSource.searchCriteria._filter.syllableCountOption = "range";
                    $scope.selectedSource.searchCriteria._filter.syllableCount.min = $scope.config.wordLength.min;
                    break;
                case $scope.config.wordLength.max >= 1 && $scope.config.wordLength.max <= 50:
                    $scope.selectedSource.searchCriteria._filter.syllableCountOption = "range";
                    $scope.selectedSource.searchCriteria._filter.syllableCount.max = $scope.config.wordLength.max;
                    break;
                default:
                    $scope.selectedSource.searchCriteria._filter.syllableCountOption = "any";
                    $scope.selectedSource.searchCriteria._filter.syllableCount.min = 1;
                    $scope.selectedSource.searchCriteria._filter.syllableCount.max = 50;
                }
            } else {
                return false;
            }

        }
    }]);