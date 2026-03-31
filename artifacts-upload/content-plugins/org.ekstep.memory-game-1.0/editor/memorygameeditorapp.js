'use strict';
/**
 *
 *   Controller for aksharaconfig.html
 *   @memberof org.ekstep.memory-game
 *   @author Swati Singh <swati.singh@tarento.com>
 *
 *
 */
angular.module('memoryGameEditorapp', ['wordpickerapp'])
    .controller('memoryGameEditorController', ['$scope', '$injector', 'instance', 'attrs', '$q', function($scope, $injector, instance, attrs, $q) {

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
        ctrl.wordSearchText.pos = [];
        ctrl.noLevelSelected = false;
        ctrl.isMtfRequired = false;
        var languageService = org.ekstep.services.SyllableSearchService;
        var promisifier = org.ekstep.plugins.MemoryGame.Promisifier.create($q);
        var memoryGameSyllableService = org.ekstep.plugins.MemoryGame.SyllableService.create(promisifier, languageService);
        var myboolean = true;
        var counter = 0;

        //console.log("-------------------------------------------------------syllable service-----------------------", syllableservice);

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
            },
            {
                "selected": false,
                "path": ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/level-7.png"),
                "level": "Level7",
                "levelText": "Image to Text.",
                "tiles": {
                    "one": ["image"],
                    "two": ["text"]
                }
            }
        ]






        /**
         *
         *   Update words array by adding akashara to each object
         *   @memberof org.ekstep.memory-game
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
         *   Method to collect all selected words and prepare a proper object structure
         *   @memberof org.ekstep.memory-game
         *
         *
         */
        ctrl.addWords = function() {

            ctrl.lessWordSelected = false;
            ctrl.isAksharaBrowser = false;
            ctrl.isWordBrowser = false;
            ctrl.isGameLevel = true;
            ctrl.getAksharaForWords();


        }

        /**
         *
         *   Method to collect all selected words and prepare a proper object structure Method to switch to select akshara tab
         *   @memberof org.ekstep.memory-game
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
         *   Method to structure the words object as it is required for renderer plugin
         *   @memberof org.ekstep.memory-game
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
         *   Method to update rows and cols based on the selected aksharas
         *   @memberof org.ekstep.memory-game
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
         *   Method to make akshara api call with selected languagae
         *   @memberof org.ekstep.memory-game
         *
         *
         */
        ctrl.searchAksharas = function(aksharaslist, languageId) {

            if (languageId == "en") {
                memoryGameSyllableService.getAksharaValue(aksharaslist, function(results) {

                    console.log("hdfgdjfgygfyegfhdgfygdfhdfygdhfdyfgrdhgfrtyfdfrdtyefhvhfg", results);
                    var aksDetailList = []

                    angular.forEach(results, function(result, key) {
                        aksDetailList.push(result.value.data.result.words[0]);
                    });

                    angular.forEach(aksDetailList, function(result, key) {
                        var obj = {};
                        obj.varna = result.lemma;
                        if(result.pronunciations && result.pronunciations.length > 0){
                            obj.audio = result.pronunciations[0];
                        }
                        ctrl.selectedAksharas.push(obj);

                    });

                });
            } else {


                ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE).getVowel(languageId, function(err, res) {
                    var resp1 = res;
                    ecEditor.getService(ServiceConstants.LANGUAGE_SERVICE).getConsonant(languageId, function(err, res) {
                        ctrl.languageAksList = [];
                        ctrl.languageAksList = resp1.data.result.result;
                        if (res && res.data.result.result) {
                            for (var i = 0; i < res.data.result.result.length; i++) {
                                ctrl.languageAksList.push(res.data.result.result[i]);
                            }
                        }
                        console.log("other language letter details", ctrl.languageAksList);

                        angular.forEach(ctrl.languageAksList, function(aksVal, key) {
                            angular.forEach(aksharaslist, function(akshara, key) {
                                if(akshara == aksVal.identifier){
                                    ctrl.selectedAksharas.push(aksVal);
                                }
                            });
                        });


                    });
                });

            }




        }


        ctrl.getAksharaForWords = function() {
            var aksharaslist = [];
            angular.forEach(ctrl.selectedWords, function(value, key) {
                var firstLetter = value.lemma.charAt(0);
                value.akshara = firstLetter;
                value.isStartWith = true;
                if (aksharaslist.length == 0) {
                    aksharaslist.push(firstLetter);
                } else {
                    var count = 0;
                    // debugger;
                    for (var i = 0; i < aksharaslist.length; i++) {
                        if (aksharaslist[i] == firstLetter) {
                            count++;
                        }
                    }
                    if (count == 0) {
                        aksharaslist.push(firstLetter);
                    }
                }

            });
            /* for (var i = 0; i < aksharaslist.length; i++) {
                 debugger;
                 ctrl.searchAksharas(aksharaslist[i]);

             }*/
            //ctrl.callRepeat(0, aksharaslist);

            var languageId = ctrl.selectedWords[0].graph_id;


            ctrl.searchAksharas(aksharaslist, languageId);
            ctrl.updateSelectedWords();

        };

        /*    ctrl.callRepeat = function(counter, aksharaslist) {
                debugger;
                if (counter < aksharaslist.length) {
                    ctrl.searchAksharas(aksharaslist[counter], counter, aksharaslist);
                } else {
                    return;
                }
            }*/



        ctrl.updateSelectedAksharas = function() {
            debugger;
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
        };


        /**
         *
         *   Method to add content to stage
         *   @memberof org.ekstep.memory-game
         *
         *
         */
        ctrl.addtoLesson = function() {
            var configObj = {};
            console.log(ctrl.selectedProperty.words);
            ctrl.selectedProperty.repetition = ctrl.noOfRepetition;
            debugger;
            ctrl.updateSelectedAksharas();
            ctrl.updateRowsCols(ctrl.selectedWords.length);
            ctrl.updateGamelevel();
            if (ctrl.selectedGameLevels.length > 0) {
                ctrl.noLevelSelected = true;
                ctrl.selectedProperty.gameLevels = ctrl.selectedGameLevels;
                ctrl.selectedProperty.isMtfRequired = ctrl.isMtfRequired;
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
                ecEditor.dispatchEvent("org.ekstep.memory-game:create", configData);
                ecEditor.render();
                ctrl.cancel();
            } else {
                ctrl.noLevelSelected = true;
            }

        }


        /**
         *
         *    Method to dismiss the modal
         *   @memberof org.ekstep.memory-game
         *
         *
         */
        ctrl.cancel = function() {
            $scope.closeThisDialog();
        }



        /**
         *
         *   Method to select game levels
         *   @memberof org.ekstep.memory-game
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
         *   @memberof org.ekstep.memory-game
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
         *   @memberof org.ekstep.memory-game
         *
         *
         */
        ctrl.onLevelDragDrop = function(dragEl, dropEl) {
            ctrl.onLevelDragDrop1(org.ekstep.contenteditor.jQuery('#' + dragEl).attr('data-id'), org.ekstep.contenteditor.jQuery('#' + dropEl).attr('data-id'));
        }


        /**
         *
         *   Method to update game levels array as user changes the sequence
         *   @memberof org.ekstep.memory-game
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

//# sourceURL=memoryGameEditoPlugin.js