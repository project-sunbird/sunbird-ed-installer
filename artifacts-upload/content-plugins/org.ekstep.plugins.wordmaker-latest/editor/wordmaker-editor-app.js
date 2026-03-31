/**
 * word maker editor controller to process configuration data from wizard
 * @class wordmakerEditorController
 * @author Daipayan Roy <roy.d@goodworklabs.com>
 */
'use strict';
angular.module('wordmakerEditorApp', ['wordpickerapp']).controller('wordmakerEditorController', ['$scope', '$q', 'instance', function($scope, $q, instance) {

    var ctrl = this;
    ctrl.showWordpickerWindow = false;
    ctrl.showConfigWindow = true;
    ctrl.words = [];
    ctrl.fullKeyboardImageURL = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/fullkeyboard.png")
    ctrl.jumbledKeyboardImageURL = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/jumbledkeyboard.png")
    ctrl.keyboardType = "jumbled";
    ctrl.showImmediateFeedback = true;
    ctrl.hintEnable = true;
    ctrl.errors = [];
    ctrl.isWaitingForSyllables = false;
    ctrl.config = {};
    ctrl.showHintDescription = true;
    var languageService = org.ekstep.services.SyllableSearchService;
    // Use ecEditor.getService after PR(https://github.com/ekstep/Content-Editor/pull/382/files) merged
    //ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE);
    var promisifier = org.ekstep.plugins.WordMaker.Promisifier.create($q);
    var wordMakerSyllableService = org.ekstep.plugins.WordMaker.SyllableService.create(promisifier, languageService);
    var messageForWordmaker = "Can't add Wordmaker for this word. Please try another word.";
    var messageForSomethingWrong = "Something went wrong. Please try again.";
    /**
     *  Display wordpicker wizard.
     *  @memberof wordmakerEditorController
     */
    ctrl.showWordPicker = function() {
        ctrl.showWordpickerWindow = true;
        ctrl.config.languagesupported = ["en","hi","ka","mr","te"];
        ctrl.config.wordLength = {
            min: 1,
            max: 9
        }
        if (ctrl.keyboardType == "full") {
            ctrl.config.languagesupported = ["en"];
            ctrl.config.wordLength = {
                min: 1,
                max: 8
            }
        }
        ctrl.showConfigWindow = false;
    }

    /**
     *  Display wordmaker editor wizard.
     *  @memberof wordmakerEditorController
     */
    ctrl.showConfigurations = function() {
        ctrl.showWordpickerWindow = false;
        ctrl.showConfigWindow = true;
        ctrl.config.languagesupported = [];
    }

    /**
     *  Determine if word is in English language and splits word into characters.
     *  @memberof wordmakerEditorController
     */
    ctrl.getSyllablesForEnglish = function() {
        var englishWords = [];
        var otherLanguageWords = [];
        _.each(ctrl.words, function(words) {
            if (words.graph_id == 'en') {
                if (ctrl.keyboardType == "full") {
                    englishWords.push(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
                } else {
                    englishWords.push(words.lemma.toUpperCase().split(""));
                }
            } else {
                otherLanguageWords.push(words);
            }
        });

        if (otherLanguageWords.length) {
            ctrl.getSyllables(otherLanguageWords, function(results) {
                ctrl._prepareWordObject(ctrl.words, englishWords.concat(results));
            });
        } else {
            ctrl.errors = [];
            ctrl._prepareWordObject(ctrl.words, englishWords);
        }
    }

    ctrl.getSyllables = function(otherLanguageWords, cb) {
        ctrl.errors = [];
        wordMakerSyllableService.getWordsSyllable(otherLanguageWords, function(results) {
            if (results[0].value) {
                if (results[0].value.data.result.result.length > 0) {
                    ctrl.isWaitingForSyllables = true;
                    cb(results);
                } else {
                    ctrl._addToErrors(messageForWordmaker);
                    cb(ctrl._addToErrors);
                }
            } else {
                ctrl._addToErrors(messageForSomethingWrong);
                cb(ctrl._addToErrors);
            }
        });
    }

    /**
     *  Add errors to the 'errors' array to be displayed in the wizard.
     *  @private
     *  @memberof wordmakerEditorController
     *  @param {string} errorMessage error message to be displayed in the wizard.
     */
    ctrl._addToErrors = function(errorMessage) {
        ctrl.errors.push(errorMessage);
    }

    /**
     * Get asset id from the URL received from wordnet.
     * @private
     * @memberof wordmakerEditorController
     * @param {String} url URL of audio or image received from wordnet
     * @returns {String} assetId asset id.
     */
    ctrl._convertURLtoAssetId = function(url) {
        var tempURL = url.split("/");
        var assetId = tempURL[tempURL.length - 1];
        return assetId
    }

    /**
     *  Prepare data object to be sent to wordmaker renderer
     *  @private
     *  @memberof wordmakerEditorController
     *  @param {array} words array of selected words objects from the wordnet
     *  @param {array} syllables array of syllables
     */
    ctrl._prepareWordObject = function(words, syllables) {
        var selectedWordsObject = {};
        var selectedWordsDataObj = {};
        var selectedWordsForRendering = [];
        var selectedWordsForManifest = [];
        for (var i = 0; i < words.length; i++) {
            var queIndex = 1 + i;
            var alphabetKeys = (ctrl.keyboardType == "full") ? words[i].lemma.toUpperCase().split('') : (syllables[i].value ? syllables[i].value.data.result.result : syllables[i]);
            selectedWordsObject = {
                "identifier": "org.wordmaker.que" + queIndex,
                "qid": "org.wordmaker.que" + queIndex,
                "type": "ftb",
                "template_id": ctrl.keyboardType == "full" ? "org.ekstep.wordmaker.template.fullKeyboardWord" : "org.ekstep.wordmaker.template.jumbledword",
                "template": ctrl.keyboardType == "full" ? "org.ekstep.wordmaker.template.fullKeyboardWord" : "org.ekstep.wordmaker.template.jumbledword",
                "title": "Title goes here",
                "question": "Question goes here",
                "model": {
                    "name": words[i].lemma,
                    "image": words[i].pictures ? ctrl._convertURLtoAssetId(words[i].pictures[0]) : "wordmaker_image_unavailable",
                    "alphabets": syllables[i].value ? _.shuffle(syllables[i].value.data.result.result) : (ctrl.keyboardType == "full" ? syllables[i] : _.shuffle(syllables[i])),
                    "audio": words[i].pronunciations ? ctrl._convertURLtoAssetId(words[i].pronunciations[0]) : ""
                },
                "answer": ctrl.createAnswerOptions(alphabetKeys)
            };
            selectedWordsDataObj = {
                picture: words[i].pictures ? words[i].pictures[0] : "",
                pronunciations: words[i].pronunciations ? words[i].pronunciations[0] : undefined
            }
            selectedWordsForRendering.push(selectedWordsObject);
            selectedWordsForManifest.push(selectedWordsDataObj);
        }
        /*istanbul ignore else*/
        if (ctrl.errors.length == 0) {
            ctrl.addToLesson(selectedWordsForRendering, selectedWordsForManifest);
        }
    }

    /**
     *  Prepare answer values for a word
     *  @private
     *  @memberof wordmakerEditorController
     *  @param {array} alphabetKeys array word
     *  @return {Object} answer object containing value and score for a word
     */
    ctrl.createAnswerOptions = function(alphabetKeys) {
        var answer = {};
        for (var i = 0; i < alphabetKeys.length; i++) {
            var index = 1 + i;
            answer["ans" + index] = { "value": alphabetKeys[i], "score": (i == alphabetKeys.length - 1) ? 1 : 0 }
        }
        return answer;
    }

    /**
     *  Send data to the wordmaker renderer
     *  @memberof wordmakerEditorController
     *  @param {array} wordObjectArray array of prepared word objects for each word.
     *  @param {array} wordObjectData array of urls to be added in manifest
     */
    ctrl.addToLesson = function(wordObjectArray, wordObjectData) {
        var configData = {};
        configData["config"] = {
            __cdata: JSON.stringify({
                "identifier": "org.ekstep.wordmaker",
                "type": "items",
                "title": "Word maker",
                "total_items": ctrl.words.length,
                "max_score": ctrl.words.length,
                "shuffle": false,
                "subject": "LIT",
                "showImmediateFeedback": ctrl.showImmediateFeedback,
                "hints": ctrl.hintEnable,
                "item_sets": [{
                    "id": "set_1",
                    "count": ctrl.words.length
                }],
                "items": { "set_1": wordObjectArray }
            })
        };
        configData["data"] = { __cdata: JSON.stringify(wordObjectData) };
        ecEditor.dispatchEvent("org.ekstep.plugins.wordmaker:create", configData);
        ctrl.isWaitingForSyllables = false;
        ctrl.closeWizard();
    }

    /**
     *  Close wordmaker editor wizard.
     *  @memberof wordmakerEditorController
     */
    ctrl.closeWizard = function() {
        $scope.closeThisDialog();
    }

}]);
//# sourceURL= wordmakerApp.js