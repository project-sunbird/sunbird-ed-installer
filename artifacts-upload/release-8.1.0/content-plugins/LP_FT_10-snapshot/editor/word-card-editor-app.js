/**
 * word card controller to process configuration data from wizard
 * @class wordCardEditorController
 * @author Devendra  Singh <devendra.singh@tarento.com>
 */
'use strict';
angular.module('wordCardApp', []).controller('wordCardEditorController', ['$scope', '$q', '$rootScope', function($scope, $q, $rootScope) {
    var ctrl = this;
    ctrl.config = {};
    ctrl.languages = [];
    ctrl.transliterationLanguage;
    ctrl.isError = false;
    ctrl.selectedLanguageCodes = [];
    ctrl.config.meaning = true;
    ctrl.config.audio = true;
    ctrl.config.picture = true;
    ctrl.config.exampleUsage = true;
    ctrl.config.translationLanguages = [];
    ctrl.translatedWordsAudios = [];
    ctrl.wordsWithoutTranslation = [];
    ctrl.wordsWithoutAudio = [];
    ctrl.isLanguageError = false;
    ctrl.noTranslation = false;
    ctrl.isTranslationAudioError = false;
    ctrl.isProcessing = false;
    ctrl.showConfiguration = false;
    ctrl.showWordSource = true;
    ctrl.words = [];
    ctrl.isFreshForm = true;
    ctrl.noOfAttempt = 0;
    var languageService = ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE);
    var searchService = ecEditor.getService(ServiceConstants.SEARCH_SERVICE);
    var wordCardService = org.ekstep.plugins.WordCard.WordCardService.create(languageService, searchService);
    var promisifier = org.ekstep.plugins.WordCard.Promisifier.create($q);
    var translationService = org.ekstep.plugins.WordCard.TranslationService.create(promisifier, languageService);
    var transliterationService = org.ekstep.plugins.WordCard.TransliterationService.create(promisifier, languageService);
    var $ = ecEditor.jQuery;
    var _ = ecEditor._;


    /**
     *  Getting language list from wordnet
     *  @memberof wordcardEditorController
     */
    wordCardService.getLanguages(function(err, res) {
        if (!err) {
            ctrl.languages = res.data.result.languages;
            $('.ui.dropdown').dropdown({ useLabels: false });
        } else {
            ctrl.isLanguageError = true;
            ctrl.isError = true;
        }
    });



    /**
     *  Getting tranlations for all words for selected languages
     *  @memberof wordcardEditorController
     */

    ctrl.getTranslations = function() {
        ctrl.noOfAttempt = 0;
        ctrl.isFreshForm = false;
        ctrl.isProcessing = true;
        translationService.getWordsTranslation(ctrl.words, ctrl.selectedLanguageCodes, function(translations) {
            ctrl.isProcessing = false;
            var isAnyTranslation = false;
            ctrl.wordsWithoutTranslation = [];
            ctrl.wordsWithoutAudio = [];
            _.each(ctrl.words, function(word) {
                _.each(translations, function(translation) {
                    if (translation[word.primaryMeaningId]) {
                        word.languageWiseTranslation = translation[word.primaryMeaningId];
                        isAnyTranslation = true;
                    } else {
                        ctrl.wordsWithoutTranslation.push({ "lemma": word.lemma });
                    }
                });
            });
            ctrl.noTranslation = _.size(translations) === 0;
            if ((_.size(translations) && _.size(ctrl.wordsWithoutTranslation)) || _.size(translations) === 0) ctrl.isError = true;
            isAnyTranslation ? ctrl.getPronunciations() : ctrl.addtoLesson();
        });
    }

    /**
     *  Getting Transliteration for all words for selected language
     *  @memberof wordcardEditorController
     */
    ctrl.getTransliteration = function() {
        transliterationService.transliterate(ctrl.words, ctrl.transliterationLanguage, function(transliterations) {
            _.each(transliterations, function(transliteration, index) {
                ctrl.words[index].transliteration = transliteration;
            });
        });
    }

    /**
     *  Getting pronunciations for all translated words
     *  @memberof wordcardEditorController
     */
    ctrl.getPronunciations = function() {
        var allTranslatedWords = [];
        _.each(ctrl.selectedLanguageCodes, function(languageCode) {
            var languageWiseWords = _.compact(_.map(ctrl.words, 'languageWiseTranslation[' + languageCode + '][0].lemma'));
            allTranslatedWords = _.union(allTranslatedWords, languageWiseWords);
        });
        ctrl.isProcessing = true;
        wordCardService.getPronunciation(allTranslatedWords, function(err, res) {
            ctrl.isProcessing = false;
            if (!err) {
                ctrl.translatedWordsAudios = res.data.result.count > 0 ? res.data.result.words : [];
                ctrl.wordsWithoutAudio = _.difference(allTranslatedWords, _.map(ctrl.translatedWordsAudios, "lemma"));
                ctrl.isError = _.size(ctrl.wordsWithoutAudio) > 0;
            } else {
                ctrl.isTranslationAudioError = true;
                ctrl.isError = true;
            }
            $rootScope.$safeApply();
            ctrl.addtoLesson();
        });
    }

    /**
     *  Dispatching event to create word card with given data and config
     *  @memberof wordcardEditorController
     */
    ctrl.addtoLesson = function() {
        ctrl.noOfAttempt += 1;
        if ((ctrl.noOfAttempt <= 1 && !ctrl.isError) || (ctrl.noOfAttempt > 1 && ctrl.isError)) {
            ctrl.config.translationLanguages = _.filter(ctrl.languages, function(language) {
                return _.includes(ctrl.selectedLanguageCodes, language.code);
            });
            _.each(ctrl.words, function(word) {
                _.each(word.languageWiseTranslation, function(translation, key) {
                    var translatedWordAudio = _.find(ctrl.translatedWordsAudios, function(wordAudio) {
                        return wordAudio.lemma == translation[0].lemma;
                    });
                    if (translatedWordAudio)
                        word.languageWiseTranslation[key][0].audioSrc = translatedWordAudio.pronunciations[0];

                });
            });
            var eventData = {};
            eventData["config"] = { __cdata: JSON.stringify(ctrl.config) };
            eventData["data"] = { __cdata: JSON.stringify({ words: ctrl.words }) };
            ecEditor.dispatchEvent("org.ekstep.plugins.wordcard:create", eventData);
            ctrl.cancel();
        }
    }

    /**
     *  closing the config model
     *  @memberof wordcardEditorController
     */
    ctrl.cancel = function() {
        ctrl.isProcessing = false;
        $scope.closeThisDialog();
    }

    /**
     *  enabling first step to edit words
     *  @memberof wordcardEditorController
     */
    ctrl.editWords = function() {
        ctrl.showWordSource = true;
        ctrl.showConfiguration = false;
    }

    /**
     *  enabling second step to edit configurations
     *  @memberof wordcardEditorController
     */
    ctrl.editConfigurations = function() {
        ctrl.resetForm();
        ctrl.showWordSource = false;
        ctrl.showConfiguration = true;
    }

    /**
     *  removing words
     *  @memberof wordcardEditorController
     *  @param {string} wordIdentifier identifier of a word
     */
    ctrl.removeWord = function(wordIdentifier) {
        ctrl.words = _.reject(ctrl.words, function(word) {
            return word.identifier == wordIdentifier;
        });
    }

    /**
     *  reseting form
     *  @memberof wordcardEditorController
     */
    ctrl.resetForm = function() {
        ctrl.noOfAttempt = 0;
        ctrl.isFreshForm = true;
        ctrl.isError = false;
        ctrl.isTranslationAudioError = false;
    }

}]);
//# sourceURL=wordcardapp.js
