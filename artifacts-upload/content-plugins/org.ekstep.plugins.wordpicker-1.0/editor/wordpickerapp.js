'use strict';
angular.module('wordpickerapp', ['editorApp']).directive('wordpicker', function() {
    return {
        scope: {
            "selectedWords": "=",
            "errors": "="
        },
        controller: 'wordpickerController',
        templateUrl: 'wordpickertemplate',

    }
}).controller('wordpickerController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.selectedWords = [];
    $scope.errors = [];
    $scope.selectedProperty = {};
    $scope.showSelectedWords = false;
    $scope.isFreshForm = true;
    $scope.inValidForm = false;
    $scope.languageSelected = "en";
    $scope.isLoading = false;
    $scope.languageList = [];
    var _ = ecEditor._;
    var languageService = org.ekstep.contenteditor.api.getService(ServiceConstants.LANGUAGE_SERVICE);

    languageService.getLanguages(function(err, res) {
        if (!err && res.data.responseCode == "OK") {
            $scope.languageList = res.data.result.languages;
            angular.element(document).ready(function() {
                $('.wordpicker .dropdown').dropdown();
            });
        } else {
            $scope.errors.push("Languages are not found !");
        }
        $rootScope.$safeApply();
    });

    /**
     * Method to prepare proper query object
     * Search api call for getting words
     * @param {Object} form -form data
     */
    $scope.getWords = function(form) {
        $scope.errors = [];
        if (form.$invalid) {
            $scope.inValidForm = true;
        } else {
            $scope.inValidForm = false;
            $scope.isLoading = true;
            $scope.showSelectedWords = false;
            var words = [];
            var selwords = $scope.word.replace(/\s+/g, '');
            words = selwords.split(",");
            var exactWordVal = {
                "request": {
                    "filters": {
                        "objectType": ["word"],
                        "graph_id": [$scope.languageSelected],
                        "status": ["Live"],
                        "lemma": words
                    }
                }
            };

            /*API call to get exact word details*/
            var searchService = org.ekstep.contenteditor.api.getService(ServiceConstants.SEARCH_SERVICE);
            searchService.search(exactWordVal, function(err, response) {
                $scope.nameWiseWords = [];
                $scope.words = [];
                $scope.isLoading = false;
                $scope.isFreshForm = false;
                if (!err && response.data.responseCode == "OK") {
                    $scope.selectedWords = [];
                    if (response.data.result.words) {
                        $scope.words = response.data.result.words;
                        $scope.createWordStructure();
                    }
                }
                if (!$scope.nameWiseWords.length) $scope.errors.push("Words are not found !");
                $rootScope.$safeApply();
            });
        }
    };


    $scope.createWordStructure = function() {
        var wordsGroupedByLemma = _.groupBy($scope.words, "lemma");
        _.each(_.keys(wordsGroupedByLemma), function(lemma) { $scope.nameWiseWords.push({ wordName: lemma, words: wordsGroupedByLemma[lemma] }); })
    };


    /*It watches the change of selected words.
     *If Scope.slectedWords get updated somewhere the function is executed.
     * After change in selectedWords It updates the $scope.nameWiseArray
     */
    $scope.$watch('selectedWords', function(newValue) {
        _.each($scope.words, function(word) {
            var found = _.find(newValue, { identifier: word.identifier });
            if (!found) word.isSelected = false;
        });
    });


    /**
     * Method to toggle selection of words
     * Calls getSelectedWord method to get all the selected words
     * @param {Object} word - selected word
     * @returns {void}
     */
    $scope.toggleWordSelection = function() {
        $scope.selectedWords = _.filter($scope.words, 'isSelected');
        $rootScope.$safeApply();
    };

    /**
     *  removing words
     *  @memberOf wordpickerController
     *  @param {string} wordIdentifier identifier of a word
     */
    $scope.removeSelectedWord = function(wordIdentifier) {
        $scope.selectedWords = _.reject($scope.selectedWords, function(word) {
            return word.identifier == wordIdentifier;
        });
        $rootScope.$safeApply();
    };
}]);

//# sourceURL=wordpickerController.js
