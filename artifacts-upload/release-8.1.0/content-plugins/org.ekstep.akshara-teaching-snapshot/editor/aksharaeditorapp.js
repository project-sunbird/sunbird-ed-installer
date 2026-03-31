'use strict';
/**
 *
 *   Controller for aksharaconfig.html
 *   @memberof org.ekstep.akshara-teaching
 *   @author Swati Singh <swati.singh@tarento.com>
 *
 *
 */
angular.module('aksharaEditorapp', [])
    .controller('aksharaEditorController', ['$scope', '$injector', 'instance', 'attrs', function($scope, $injector, instance, attrs) {

        var ctrl = this;
        ctrl.isAksharaBrowser = true;
        ctrl.isWordBrowser = false;
        ctrl.isGameLevel = false;
        ctrl.language = [];
        ctrl.selectedWords = [];
        ctrl.selectedAksharas = [];
        ctrl.isSelected = [];
        ctrl.selectBtnDisable = true;
        ctrl.selectedProperty = {};
        ctrl.lessWordSelected = false;
        ctrl.selectedGameLevels = [];
        ctrl.noOfRepetition = 1;
        ctrl.selectedLevelPath = "";
        ctrl.selectedLevelText = "";
        ctrl.wordSearchText = {};
        ctrl.wordSearchText.orthographic_complexity = {};
        ctrl.wordSearchText.phonologic_complexity = {};
        ctrl.wordSearchText.pos = [];
        ctrl.noLevelSelected = false;
        //ctrl.basepath = ecEditor.getPluginRepo();
        ctrl.levelMetaData = [{
            "selected": false,
            "path": ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/level-1.png"),
            "level": "Level1",
            "levelText": "Audio, Text to Text, Audio, Image.",
            "tiles": {
                "one": ["audio", "text"],
                "two": ["text", "image", "audio"]
            }
        }, {
            "selected": false,
            "path": ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/level-2.png"),
            "level": "Level2",
            "levelText": "Audio, Text to Audio, Text.",
            "tiles": {
                "one": ["audio", "text"],
                "two": ["audio", "text"]
            }
        }, {
            "selected": false,
            "path": ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/level-3.png"),
            "level": "Level3",
            "levelText": "Audio, Text to Text.",
            "tiles": {
                "one": ["text", "audio"],
                "two": ["text"]
            }
        }, {
            "selected": false,
            "path": ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/level-4.png"),
            "level": "Level4",
            "levelText": "Text to Audio.",
            "tiles": {
                "one": ["text"],
                "two": ["audio"]
            }
        }, {
            "selected": false,
            "path": ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/level-5.png"),
            "level": "Level5",
            "levelText": "Image, Audio, Text to Image, Audio, Text.",
            "tiles": {
                "one": ["text", "image", "audio"],
                "two": ["text", "image", "audio"]
            }
        }, {
            "selected": false,
            "path": ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/level-6.png"),
            "level": "Level6",
            "levelText": "Image, Audio to Image, Audio.",
            "tiles": {
                "one": ["image", "audio"],
                "two": ["image", "audio"]
            }
        }]


        /**
         *
         *   Language Callback method which will be called after language api call
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        function languageCb(err, res) {
            if (!err) {
                ctrl.language = res.data.result.languages;
                $scope.$safeApply();
            }
        }

        /*########## Calling Api to get languages ######*/
        ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE).getLanguages(languageCb);


        /**
         *
         *   Word type Callback method which will be called after wordtype api call
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        function wordTypeCb(err, res) {
            var properties = res.data.result.definition_node.properties;
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].propertyName == 'pos') {
                    ctrl.wordTypes = properties[i].range;
                }
            }


            $scope.$safeApply();
            ecEditor.jQuery('.ui.dropdown').dropdown({ useLabels: false });
        }


        ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE).getWordDefinition(wordTypeCb); // call Method to get types of word. eg. Nouns, verbs etc;

        /**
         *
         *   Aksharas Callback method which will be called after Akshara api call
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        function aksharaCb(err, cons, vow) {
            if (vow && vow.data.result.result) {
                ctrl.loadingImage = false;
                ctrl.aksharas = [];
                ctrl.aksharas = vow.data.result.result;
                if (cons && cons.data.result.result) {
                    for (var i = 0; i < cons.data.result.result.length; i++) {
                        ctrl.aksharas.push(cons.data.result.result[i]);
                    }
                }
            } else {
                ctrl.aksharas = [];
            };
            $scope.$safeApply();
        };



        /**
         *
         *   Update words array by adding akashara to each object
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.updateWords = function(strtwords, contwords, ak) {
            var obj = {};
            obj.startwords = [];
            obj.containswords = [];
            obj.akshara = ak;
            obj.isLessWords = false;

            if (strtwords.length < ctrl.noOfRepetition) {
                obj.isLessWords = true;
            }
            for (var i = 0; i < strtwords.length; i++) {
                strtwords[i].akshara = ak;
                strtwords[i].isStartWith = true;
                strtwords[i].isSelected = false;
                obj.startwords.push(strtwords[i]);
            }
            for (var i = 0; i < contwords.length; i++) {
                contwords[i].akshara = ak;
                contwords[i].isStartWith = false;
                contwords[i].isSelected = false;
                obj.containswords.push(contwords[i]);
            }
            if (obj.startwords.length > 0) {
                ctrl.words.push(obj);
            }

        }

        /**
         *
         *   Word Callback method which will be called after Words api call
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        function wordAssetCb(err, startRes, containsRes, varna) {
            ctrl.isAksharaBrowser = false;
            ctrl.isWordBrowser = true;
            ctrl.isGameLevel = false;
            var startwords = [];
            var containswords = [];
            if (startRes) {
                ctrl.loadingImage = false;
                startwords = startRes;
            } else {
                startwords = [];
            };
            if (containsRes) {
                ctrl.loadingImage = false;
                containswords = containsRes;
            } else {
                containswords = [];
            };
            if (startwords.length || containswords.length)
                ctrl.updateWords(startwords, containswords, varna);
            // ctrl.updateWords(words, varna);
            else {
                if (!ctrl.showAdvancedFilter) {
                    ctrl.selectedAksharas = ecEditor._.reject(ctrl.selectedAksharas, function(o) {
                        return o.varna == varna;
                    });
                    ctrl.updateSelectedAksharas();
                }
            }
            var obj = {};
            //  ctrl.aksharaWords.words.push(obj);
            $scope.$safeApply();
        };

        /**
         *
         *   Method to get selected words
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.getSelectedAksharas = function() {
            ctrl.selectedAksharas = [];
            for (var i = 0; i < ctrl.aksharas.length; i++) {
                if (ctrl.isSelected[ctrl.aksharas[i].identifier] == 'akshara-selected') {
                    ctrl.selectedAksharas.push(ctrl.aksharas[i]);
                }
            }
        }

        /**
         *
         *   Method to get selected aksharas
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.getSelectedWords = function() {
            ctrl.selectedWords = [];
            for (var i = 0; i < ctrl.words.length; i++) {
                for (var j = 0; j < ctrl.words[i].startwords.length; j++) {
                    if (ctrl.words[i].startwords[j].isSelected) {
                        ctrl.selectedWords.push(ctrl.words[i].startwords[j]);
                    }
                }
                for (var j = 0; j < ctrl.words[i].containswords.length; j++) {
                    if (ctrl.words[i].containswords[j].isSelected) {
                        ctrl.selectedWords.push(ctrl.words[i].containswords[j]);
                    }
                }

            }
        }

        /**
         *
         *   Method to prepare proper query object and making Words api call
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.getWords = function() {
            instance.aksharas = ctrl.aksharas;
            ctrl.aksharaWords = [];
            ctrl.words = [];
            ctrl.akSelected;
            ctrl.updateSelectedAksharas();
            ctrl.selectedProperty.repetition = ctrl.noOfRepetition;
            ecEditor._.each(ctrl.selectedAksharas, function(obj) {
                var searchText = {};
                searchText.language_id = [ctrl.languageSelected];
                searchText.objectType = ["Word"];
                searchText.lemma = {};
                /*searchText.lemma.startsWith = obj.varna;*/
                searchText.lemma.value = obj.varna;
                searchText.status = ["Live"];
                ctrl.getWordCall(searchText, obj);
            });
        }

        /**
         *
         *   Word api service call
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.getWordCall = function(searchText, obj) {
            var requestObj = {
                "request": {
                    "filters": {},
                    "exists": ["pictures", "pronunciations"]
                }
            }
            ecEditor._.isUndefined(searchText) ? null : requestObj.request.filters = searchText;
            ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE).getWords(requestObj, function(err, res) {
                var startRes = [];
                var conRes = [];
                angular.forEach(res.data.result.words, function(value, key) {
                    var str = value.lemma.toLowerCase();
                    if (str.indexOf(obj.varna.toLowerCase()) == 0) {
                        startRes.push(value);
                    } else if (str.indexOf(obj.varna) > 1) {
                        conRes.push(value);
                    }
                });
                wordAssetCb(err, startRes, conRes, obj.varna);
            });
        }

        /**
         *
         *   Method for Words api call with filters
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.getFilterWords = function() {
            ctrl.aksharaWords = [];
            ctrl.words = [];
            ecEditor._.each(ctrl.selectedAksharas, function(obj) {
                var serachText = {};
                serachText.syllableCount = {};
                serachText.syllableCount.min = 2;
                serachText.syllableCount.max = ctrl.wordSearchText.syllableCount;
                serachText.pos = ctrl.wordSearchText.pos;
                serachText.phonologic_complexity = ctrl.wordSearchText.phonologic_complexity;
                serachText.orthographic_complexity = ctrl.wordSearchText.orthographic_complexity;
                serachText.language_id = [ctrl.languageSelected];
                serachText.objectType = ["Word"];
                serachText.lemma = {};
                serachText.lemma.value = obj.varna;
                serachText.status = ["Live"];
                ctrl.getWordCall(serachText, obj);
            });
        }


        /**
         *
         *   Method to make akshara api call with selected languagae
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.searchAksharas = function(languageSelected) {
            ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE).getVowel(languageSelected, function(err, res) {
                var resp1 = res;
                ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE).getConsonant(languageSelected, function(err, res) {
                    aksharaCb(err, res, resp1);
                });
            });
        }

        /**
         *
         *   Method to update selected words array as user select and unselect the words in word browser 
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.toggleWordSelection = function(identifier, word) {
            word.isSelected = !word.isSelected;
            ctrl.getSelectedWords();

        };

        /**
         *
         *   Method to update selected akshara array as user select and unselect the akshara in akshara browser
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.toggleAksharaSelection = function(identifier, akshara) {
            if (ctrl.isSelected[identifier] == 'akshara-selected') {
                ctrl.isSelected[identifier] = "";
            } else {
                ctrl.isSelected[identifier] = 'akshara-selected';
            }
            ctrl.getSelectedAksharas();
        };



        /**
         *
         *   Method to collect all selected words and prepare a proper object structure
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.addWords = function() {
            ctrl.updateSelectedWords();
            var counter = 0;

            ctrl.selAksharas = [];
            for (var i = 0; i < ctrl.words.length; i++) {
                if (ctrl.words[i].startwords.length > 0) {
                    ctrl.selAksharas.push(ctrl.words[i].akshara);
                }
            }
            for (var i = 0; i < ctrl.selAksharas.length; i++) {
                var ak = ctrl.selAksharas[i];
                if (!angular.isUndefined(ctrl.selectedProperty.words[ak])) {
                    if ((ctrl.selectedProperty.words[ak].one.length) < ctrl.selectedProperty.repetition) {
                        counter++;
                    }
                } else {
                    counter++;
                }

            }

            if (counter > 0) {
                ctrl.lessWordSelected = true;
            } else {
                ctrl.lessWordSelected = false;
                ctrl.isAksharaBrowser = false;
                ctrl.isWordBrowser = false;
                ctrl.isGameLevel = true;
            }

        }

        /**
         *
         *   Method to collect all selected words and prepare a proper object structure Method to switch to select akshara tab
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.Editakshara = function() {
            ctrl.isAksharaBrowser = true;
            ctrl.isWordBrowser = false;
            ctrl.isGameLevel = false;
        }

        /**
         *
         *   Method to switch to select word tab
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.EditWord = function() {
            ctrl.isAksharaBrowser = false;
            ctrl.isWordBrowser = true;
            ctrl.isGameLevel = false;
        }

        /**
         *
         *   Method to structure the words object as it is required for renderer plugin
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.updateSelectedWords = function() {
            ctrl.selectedProperty.words = {};
            var count = 1;
            angular.forEach(ctrl.selectedWords, function(value, key) {
                var word = {};
                word.text = value.lemma;
                word.audioSrc = value.pronunciations != undefined && value.pronunciations[0] != undefined ? value.pronunciations[0] : "";
                word.imageSrc = value.pictures != undefined && value.pictures[0] != undefined ? value.pictures[0] : "";
                word.id = count;
                word.imageAsset = value.identifier + "_image" + count;
                word.audioAsset = value.identifier + "_audio" + count;
                count++;
                if (ecEditor._.isUndefined(ctrl.selectedProperty.words[value.akshara])) {
                    var obj = {};
                    obj.one = [];
                    obj.two = [];
                    if (value.isStartWith) {
                        obj.one.push(word);
                    } else {
                        obj.two.push(word);
                    }
                    ctrl.selectedProperty.words[value.akshara] = obj;
                } else {
                    if (value.isStartWith) {
                        ctrl.selectedProperty.words[value.akshara].one.push(word);
                    } else {
                        ctrl.selectedProperty.words[value.akshara].two.push(word);
                    }

                }
            })
        }


        /**
         *
         *   Method to structure the aksharas array as it is required for renderer plugin
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.updateSelectedAksharas = function() {
            ctrl.selectedProperty.aksharas = [];
            var count = 1;
            ctrl.updateRowsCols(ctrl.selectedAksharas.length);
            angular.forEach(ctrl.selectedAksharas, function(value, key) {
                var akshara = {};
                akshara.text = value.varna;
                akshara.audioSrc = value.audio != undefined ? value.audio : "";
                akshara.id = count;
                akshara.audioAsset = value.identifier + "_audio" + count;
                count++;
                ctrl.selectedProperty.aksharas.push(akshara);
            });
        }

        /**
         *
         *   Method to update rows and cols based on the selected aksharas
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.updateRowsCols = function(length) {
            var cols;
            if (length <= 5) {
                cols = length;
            } else if (length > 5) {
                var rem5 = length % 5;
                var rem4 = length % 4;
                var rem3 = length % 3;
                if (rem5 == 0) {
                    cols = 5;
                } else if ((rem4 == 0 && rem3 == 0) || rem4 == 0) {
                    cols = 4;
                } else if (rem3 == 0) {
                    cols = 3;
                } else if (rem5 > 2) {
                    cols = 5;
                } else if (rem4 > 2) {
                    cols = 4;

                } else {
                    cols = 3;
                }
            }
            ctrl.cols = cols;
            instance.attributes.columns = cols;


        }


        /**
         *
         *   Method to add content to stage
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.addtoLesson = function() {
            var configObj = {};
            var allAksharas = ctrl.selectedProperty.aksharas;
            ctrl.selectedProperty.aksharas = [];
            for (var i = 0; i < ctrl.selAksharas.length; i++) {
                for (var j = 0; j < allAksharas.length; j++) {
                    if (allAksharas[j].text == ctrl.selAksharas[i]) {
                        ctrl.selectedProperty.aksharas.push(allAksharas[j]);
                    }
                }
            }
            ctrl.updateRowsCols(ctrl.selectedProperty.aksharas.length);
            ctrl.updateGamelevel();
            if (ctrl.selectedGameLevels.length > 0) {
                ctrl.noLevelSelected = true;
                ctrl.selectedProperty.gameLevels = ctrl.selectedGameLevels;
                configObj = ctrl.selectedProperty;
                instance.selectedProperty = configObj;
                var configData = {};
                configData["config"] = { __cdata: JSON.stringify(instance.selectedProperty) };
                configData["attr"] = {
                    __cdata: JSON.stringify({
                        "rows": 2,
                        "columns": ctrl.cols,
                        "fill": "#008000",
                        "x": 10,
                        "y": 10,
                        "w": 80,
                        "h": 80,
                        "frontFaceColor": "#008000",
                        "backFaceColor": "#002b80",
                        "textColor": "#ffffff",
                        "fixRows": true

                    })
                };
                ecEditor.dispatchEvent("org.ekstep.akshara-teaching:create", configData);
                ecEditor.render();
                ctrl.cancel();
            } else {
                ctrl.noLevelSelected = true;
            }

        }

        /**
         *
         *    Method to dismiss the modal
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.cancel = function() {
            $scope.closeThisDialog();
        }



        /**
         *
         *   Method to select game levels
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.addGamelevel = function(gameLevelObj) {
            ctrl.selectedLevelPath = gameLevelObj.path;
            ctrl.selectedLevelText = gameLevelObj.levelText;
        }


        /**
         *
         *   Method to get selected game levels
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.updateGamelevel = function() {
            for (var i = 0; i < ctrl.levelMetaData.length; i++) {
                if (ctrl.levelMetaData[i].selected) {
                    ctrl.selectedGameLevels.push(ctrl.levelMetaData[i]);
                }
            }
        }



        /**
         *
         *   Method to handle drag drop event for game levels 
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.onLevelDragDrop = function(dragEl, dropEl) {
            ctrl.onLevelDragDrop1(org.ekstep.contenteditor.jQuery('#' + dragEl).attr('data-id'), org.ekstep.contenteditor.jQuery('#' + dropEl).attr('data-id'));
        }

        /**
         *
         *   Method to update game levels array as user changes the sequence
         *   @memberof org.ekstep.akshara-teaching
         *
         *
         */
        ctrl.onLevelDragDrop1 = function(srcLevelId, destLevelId) {
            var srcIdx = ctrl.getLevelIndexById(srcLevelId);
            var destIdx = ctrl.getLevelIndexById(destLevelId);
            if (srcIdx < destIdx) {
                var src = ctrl.levelMetaData[srcIdx];
                for (var i = srcIdx; i <= destIdx; i++) {
                    ctrl.levelMetaData[i] = ctrl.levelMetaData[i + 1];
                    if (i === destIdx) ctrl.levelMetaData[destIdx] = src;
                }
            }
            if (srcIdx > destIdx) {
                var src = ctrl.levelMetaData[srcIdx];
                for (var i = srcIdx; i >= destIdx; i--) {
                    ctrl.levelMetaData[i] = ctrl.levelMetaData[i - 1];
                    if (i === destIdx) ctrl.levelMetaData[destIdx] = src;
                }
            }
            $scope.$safeApply();
        }

        ctrl.getLevelIndexById = function(levelId) {
            return ecEditor._.findIndex(ctrl.levelMetaData, function(level) {
                return level.level == levelId;
            });
        }



    }]);

//# sourceURL=aksharaEditoPlugin.js