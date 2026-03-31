/**
 * Language mtf controller to process configuration data from wizard
 * @class org.ekstep.plugins.languagemtf:configurationController
 * @author Swati  Singh <swati.singh@tarento.com>
 */
'use strict';
angular.module('languagemtfapp', ['wordpickerapp'])
    .controller('org.ekstep.plugins.languagemtf:configurationController', ['$scope', 'instance', function($scope, instance) {
        var ctrl = this;
        ctrl.isVertical = true;
        ctrl.imageSrc;
        ctrl.isFlipSide = false;
        ctrl.isMtfConfiguration = true;
        ctrl.showWordSource = false;
        ctrl.selectedProperty = {};
        ctrl.words = [];
        ctrl.wordPickerConfig = { "required": {} };

        ctrl.menuItems = [{ "id": "word-picture", "text": "Word --- Picture", "isPicture": true, "isAudio": false, "relatedWords":false},
            { "id": "word-audio", "text": "Word --- Audio", "isPicture": false, "isAudio": true , "relatedWords":false},
            { "id": "word-alphabet", "text": "Word --- Alphabet", "isPicture": false, "isAudio": false , "relatedWords":false},
            { "id": "wordPicture-alphabet", "text": "Word + Picture --- Alphabet", "isPicture": true, "isAudio": false , "relatedWords":false},
            { "id": "picture-alphabet", "text": "Picture --- Alphabet", "isPicture": true, "isAudio": false , "relatedWords":false},
            { "id": "alphabet-audio", "text": "Alphabet --- Audio", "isPicture": false, "isAudio": true , "relatedWords":false},
            { "id": "word-word", "text": "Word --- Word", "isPicture": false, "isAudio": false , "relatedWords":true},
            { "id": "wordPicture-wordPicture", "text": "Word + Picture --- Word + Picture", "isPicture": true, "isAudio": false , "relatedWords":true}
        ];

        ctrl.activeItem = "word-picture";
        ctrl.wordPickerConfig.required.pictures = true;
        ctrl.wordPickerConfig.required.pronunciations = false;
        ctrl.wordPickerConfig.required.relatedWords = false;
        var imageLocation = "/assets/" + ctrl.activeItem + "/v1.png";

        ctrl.imageSrc = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, imageLocation);

        /**
         *  selecting active item
         *  @memberof org.ekstep.plugins.languagemtf:configurationController
         *  @param {string} itemId id of selected menu item
         */
        ctrl.selectMenuItem = function(itemId) {
            ctrl.activeItem = itemId;
            ctrl.changePreviewImage();
        }

        /**
         *  changing flip side configuration
         *  @memberof org.ekstep.plugins.languagemtf:configurationController
         */
        ctrl.flipSide = function() {
            ctrl.isFlipSide = !ctrl.isFlipSide;
            ctrl.changePreviewImage();
        }

        /**
         *  Showing Preview image based on configuartion selected
         *  @memberof org.ekstep.plugins.languagemtf:configurationController
         */
        ctrl.changePreviewImage = function() {
            var imgName;
            /* istanbul ignore next: if cases */
            if (ctrl.isVertical && !ctrl.isFlipSide) {
                imgName = "v1.png";
            } else if (ctrl.isVertical && ctrl.isFlipSide) {
                imgName = "v2.png";
            } else if (!ctrl.isVertical && !ctrl.isFlipSide) {
                imgName = "h1.png";
            } else if (!ctrl.isVertical && ctrl.isFlipSide) {
                imgName = "h2.png";
            }
            imageLocation = "/assets/" + ctrl.activeItem + "/" + imgName;
            ctrl.imageSrc = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, imageLocation);
            angular.forEach(ctrl.menuItems, function(item) {
                if (item.id == ctrl.activeItem) {
                    ctrl.wordPickerConfig.required.pictures = item.isPicture;
                    ctrl.wordPickerConfig.required.pronunciations = item.isAudio;
                    ctrl.wordPickerConfig.required.relatedWords = item.relatedWords;
                }

            })

        }

        /**
         *  Updating selected word structure for render
         *  @memberof org.ekstep.plugins.languagemtf:configurationController
         */
        ctrl.updateSelectedWords = function() {
            ctrl.selectedWords = [];
            var count = 0;
            angular.forEach(ctrl.words, function(value) {
                var word = {};
                word.value = {};
                // console.log(value);
                word.value.text = value.lemma;
                word.value.audio = value.pronunciations != undefined && value.pronunciations[0] != undefined ? value.pronunciations[0] : "";
                word.value.image = value.pictures != undefined && value.pictures[0] != undefined ? value.pictures[0] : "";
                word.index = count;
                word.value.imageAsset = value.identifier + "_image" + count;
                word.value.audioAsset = value.identifier + "_audio" + count;
                word.value.type = "mixed";
                word.value.rel_text = value.relatedWords != undefined ? value.relatedWords[0].lemma : "";
                word.value.rel_image = value.relatedWords != undefined && value.relatedWords[0].pictures != undefined ? value.relatedWords[0].pictures[0] : "";
                word.value.rel_imageAsset = value.relatedWords != undefined ? value.relatedWords[0].identifier + "_image" + count : "";
                //console.log("Related word object---",value.relatedWords[0].pictures[0]);
                var alphabet = value.lemma.charAt(0);
                word.value.firstAlphabet = alphabet.toUpperCase();
                count++;
                ctrl.selectedWords.push(word);
            });
        }

        /**
         *  Creating item controller structure as required in render side
         *  @memberof org.ekstep.plugins.languagemtf:configurationController
         *  @return {Object} assesmentObj assessment object created for renderer item controller
         */
        ctrl.getWordAssesmentStructure = function() {
            var assesmentObj = {};
            var set_1 = [];
            var mtfObj = {};
            mtfObj.identifier = "languageMtf.q1";
            mtfObj.type = "mtf";
            mtfObj.template_id = "org.ekstep.languageMtf.template";
            mtfObj.template = "org.ekstep.languageMtf.template";
            mtfObj.question = "Match the following";
            mtfObj.model = {};
            mtfObj.max_score = 1;
            mtfObj.feedback = "true";
            mtfObj.keywords = ["array", "of", "strings"];
            mtfObj.lhs_options = ctrl.selectedWords;
            mtfObj.rhs_options = [];
            angular.forEach(ctrl.selectedWords, function(selWord) {
                var rhs_opt = {};
                rhs_opt.value = selWord.value;
                rhs_opt.answer = selWord.index;
                mtfObj.rhs_options.push(rhs_opt);
            });
            set_1.push(mtfObj);
            assesmentObj.items = {};
            assesmentObj.items.set_1 = set_1;
            return assesmentObj;
        }

        /**
         *  Dispatching event to create language mtf with given data and config
         *  @memberof org.ekstep.plugins.languagemtf:configurationController
         */
        ctrl.addtoLesson = function() {
            ctrl.selectedProperty.activeItem = ctrl.activeItem;
            ctrl.selectedProperty.isVertical = ctrl.isVertical;
            ctrl.selectedProperty.isFlipSide = ctrl.isFlipSide;
            ctrl.updateSelectedWords();
            ctrl.selectedProperty.wordAssesment = ctrl.getWordAssesmentStructure();
            ctrl.selectedProperty.words = ctrl.selectedWords;
            var configData = {};
            configData["config"] = { __cdata: JSON.stringify(ctrl.selectedProperty) };
            ecEditor.dispatchEvent("org.ekstep.plugins.languagemtf:create", configData);
            ctrl.cancel();
        }

        /**
         *  closing the config model
         *  @memberof org.ekstep.plugins.languagemtf:configurationController
         */
        ctrl.cancel = function() {
            ctrl.isProcessing = false;
            $scope.closeThisDialog();
        }

    }]);
//# sourceURL=languagemtfapp.js