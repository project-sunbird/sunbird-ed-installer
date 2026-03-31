'use strict';

angular.module('flashcardapp', [])
    .controller('flashcardEditorController', ['$scope', '$injector', 'instance', 'attrs', function($scope, $injector, instance, attrs) {

        var ctrl = this;
        ctrl.isAksharaBrowser = true;
        ctrl.isGameLevel = false;
        ctrl.language = [];
        ctrl.selectedWords = [];
        ctrl.isSelected = [];
        ctrl.selectedProperty = {};
        ctrl.wordSearchText = {};
    

        /*########## Method to prepare proper query object and making Words api call ######*/
        ctrl.getWords = function() {
            var tags = [];
            tags.push(ctrl.word);

            var exactWordVal = {
                "request": {
                    "query": "",
                    "limit": 10,
                    "sort_by": {
                        "lemma": "asc"
                    },
                    "filters": {
                        "objectType": ["word"],
                        "graph_id": ["en"],
                        "status": ["Live"],
                        "lemma": ctrl.word
                            // "tags": tags
                    }
                }
            }

            /*API call to get exact word details*/

            EkstepEditorAPI.getService('searchService').search(exactWordVal, function(err, response) {
                console.log("exact word data : ", response);
                ctrl.wordData = [];

                // if((ctrl.wordData!=undefined))//&&(response.data.result.count>0))
                // {
                //     ctrl.wordData = ctrl.wordData.concat(response.data.result.words);
                // }

                if (response.data.result.words != undefined) {
                    ctrl.wordData = response.data.result.words;
                    $scope.$safeApply();
                }

                console.log("THIS IS FROM EXACT WORD NET : ", ctrl.wordData);
            });


            var wordVal = {
                "request": {
                    "query": "",
                    "limit": 10,
                    "sort_by": {
                        "lemma": "asc"
                    },
                    "filters": {
                        "objectType": ["word"],
                        "graph_id": ["en"],
                        "status": ["Live"],
                        "tags": tags
                    }
                }
            }

            /*API call to get related word details*/

            EkstepEditorAPI.getService('searchService').search(wordVal, function(err, res) {
                console.log("related word data : ", res);

                if ((ctrl.wordData == undefined)) //&&(res.data.result.words.length>0))
                {
                    ctrl.wordData = res.data.result.words;
                    $scope.$safeApply();
                } else if ((ctrl.wordData != undefined) && (res.data.result.count > 0)) {
                    ctrl.wordData = ctrl.wordData.concat(res.data.result.words);
                    $scope.$safeApply();
                }
                console.log("THIS IS FROM WORD NET : ", ctrl.wordData);
            });


        }

        /*########## Method to update selected words array as user select and unselect the words in word browser ######*/
        ctrl.toggleWordSelection = function(word) {
            word.isSelected = !word.isSelected;
            console.log("This is toggle function");
            ctrl.getSelectedWords();

        };


        ctrl.getSelectedWords = function() {
                console.log("This is selected word", ctrl.wordData);
                ctrl.selectedWords = [];
                for (var i = 0; i < ctrl.wordData.length; i++) {
                    if (ctrl.wordData[i].isSelected) {
                        ctrl.selectedWords.push(ctrl.wordData[i]);
                        console.log("This is the word : ", ctrl.selectedWords);
                    }
                }


            }
    
        /*########## Method to add content to stage ######*/
        ctrl.addtoLesson = function() {
            console.log("THis is running");

            var configObj = {};

            var configData = {};
            instance.selectedProperty = ctrl.selectedWords[0];
            console.log("THis is the selected data : ", instance.selectedProperty);
       
            EkstepEditorAPI.dispatchEvent("org.ekstep.flashcarddev:create", instance.selectedProperty);
            EkstepEditorAPI.render();
            ctrl.cancel();
        }

        /*########## Method to dismiss the modal ######*/
        ctrl.cancel = function() {
            $scope.closeThisDialog();
        }

    }]);
