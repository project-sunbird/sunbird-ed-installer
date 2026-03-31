'use strict';

angular.module('resultsummarizerapp', [])
    .controller('resultsummarizer', ['$scope', '$injector', 'instance', function($scope, $injector, instance) {
        var ctrl = this;
        ctrl.showLevel = true;
        ctrl.audioChanged = false;
        ctrl.audioSelected = false;
        ctrl.selectedDetails = {};
        ctrl.selectedDetails.levelArray = [];
        ctrl.selectedDetails.tableHeader = [];
        ctrl.levelArray = [];
        ctrl.tableHeader = ["qindex", "qtitle"];
        ctrl.levelNo;
        ctrl.validateLevelValue = true;
        if (!ecEditor._.isUndefined(instance.editorObj)) {
            ctrl.validateLevelValue = false;
            //level array contains the details of each array
            ctrl.levelArray = instance.config.levelArray;
            // table header array contains the checked header fields 
            ctrl.tableHeader = instance.config.tableHeader;
            for (var i = 2; i < ctrl.tableHeader.length; i++) {
                var checkedVal = ctrl.tableHeader[i];
                switch (checkedVal) {
                    case "pass":
                        ctrl.pass = true;
                        break;
                    case "score":
                        ctrl.score = true;
                        break;
                    case "ansEntered":
                        ctrl.ansEntered = true;
                        break;
                    case "correctAns":
                        ctrl.correctAns = true;
                        break;
                    case "attempt":
                        ctrl.attempt = true;
                        break;
                    case "timeTaken":
                        ctrl.timeTaken = true;
                        break;
                }
            }
            ctrl.levelNo = ctrl.levelArray.length;
        }
        /*This function prepares an array for each level*/
        ctrl.submitlevels = function() {
                //noOfLevels: number of levels captured from the input     
                var noOfLevels = ctrl.levelNo;
                //levelarrayLength: level array length. 
                var levelarrayLength = ctrl.levelArray.length;
                if ((noOfLevels > levelarrayLength) && (levelarrayLength != 0)) {
                    for (var i = levelarrayLength + 1; i <= noOfLevels; i++) {
                        ctrl.levelArray.push({
                            levelId: i,
                            levelName: '',
                            textReward: '',
                            audioReward: '',
                            audioRewardSrc: '',
                            imageReward: '',
                            imageRewardSrc: ''
                        });
                    }
                } else if ((noOfLevels < levelarrayLength) && (levelarrayLength != 0)) {
                    ctrl.levelArray.splice(noOfLevels, (levelarrayLength - noOfLevels));
                } else if (levelarrayLength == 0) {
                    for (var i = 1; i <= noOfLevels; i++) {
                        ctrl.levelArray.push({
                            levelId: i,
                            levelName: '',
                            textReward: '',
                            audioReward: '',
                            audioRewardSrc: '',
                            imageReward: '',
                            imageRewardSrc: ''
                        });
                    }
                }
            }
            /*This button takes back to the selecting the number of levels page
             *retains already entered value*/
        ctrl.editLevel = function() {
                ctrl.showLevelOptions = false;
                ctrl.showLevel = true;
                ctrl.showTable = false;
                ctrl.levelNo = ctrl.levelArray.length;
            }
            /*This button takes back to the filling the details of levels page
             *retains already entered value*/
        ctrl.editLevelOptions = function(arraydetails) {
                ctrl.showLevelOptions = true;
                ctrl.showLevel = false;
                ctrl.showTable = false;
                angular.copy(levelArray, $ctrl.arraydetails);
            }
            /*This button allows you to select the audio for audio reward*/
        ctrl.selectAudio = function(value) {
            ecEditor.dispatchEvent('org.ekstep.assetbrowser:show', {
                type: 'audio',
                search_filter: {},
                callback: function(data) {
                    ctrl.levelArray[value - 1].audioReward = data.assetMedia.id;
                    ctrl.levelArray[value - 1].audioRewardSrc = data.assetMedia.src;
                    ctrl.validateLevel();
                    ctrl.audioSelected = true;
                    if (!ecEditor._.isUndefined(instance.editorObj))
                        ctrl.audioChanged = true;
                }
            });
        };
        /*This button allows you to select the image for audio reward*/
        ctrl.selectImage = function(value) {
            ecEditor.dispatchEvent('org.ekstep.assetbrowser:show', {
                type: 'image',
                search_filter: {},
                callback: function(data) {
                    ctrl.levelArray[value - 1].imageReward = data.assetMedia.id;
                    ctrl.levelArray[value - 1].imageRewardSrc = data.assetMedia.src;
                    ctrl.validateLevel();
                    ctrl.imageSelected = true;
                    if (!ecEditor._.isUndefined(instance.editorObj))
                        ctrl.imageChanged = true;
                }
            });
        };
        /*Shows the first page
         *select the number of levels*/
        ctrl.finalLevel = function() {
                ctrl.showLevelOptions = true;
                ctrl.showLevel = false;
                ctrl.showTable = false;
            }
            /*Shows the second page
             *details of each level*/
        ctrl.finalLevelOptions = function(fillValue) {
                ctrl.showLevelOptions = false;
                ctrl.showLevel = false;
                ctrl.showTable = true;
            }
            /*This button allows you close the wizard*/
        ctrl.cancel = function() {
            $scope.closeThisDialog();
        };
        /*This function checks if madatory fields are filled
         *level name, min and max percentage and atleast one among the rewards(tesxtreward, image reward, audio reward)*/
        ctrl.validateLevel = function() {
                var count = 0;
                _.each(ctrl.levelArray, function(object) {
                    if ((object.levelName && object.maxLevel) && (object.audioReward || object.textReward || object.imageReward)) {
                        if (object.minLevel >= 0) {
                            count++;
                        }
                    }
                });
                if (count == ctrl.levelArray.length) {
                    ctrl.validateLevelValue = false;
                }
            }
            /*prepares an array of table header fields*/
        ctrl.addHeader = function(val) {
                var allHeader = ["qindex", "qtitle", "pass", "score", "ansEntered", "correctAns", "attempt", "timeTaken"];
                var headerIndex = 0;
                headerIndex = ctrl.tableHeader.indexOf(val);
                if (headerIndex == -1) {
                    ctrl.tableHeader.push(val);
                } else {
                    ctrl.tableHeader.splice(headerIndex, 1);
                }
                var uncheckedHeaders = _.difference(allHeader, ctrl.tableHeader);
                if (ctrl.tableHeader.length > 5) {
                    for (var i = 0; i < uncheckedHeaders.length; i++) {
                        var uncheckedVal = uncheckedHeaders[i];
                        switch (uncheckedVal) {
                            case "pass":
                                ctrl.pass = false;
                                break;
                            case "score":
                                ctrl.score = false;
                                break;
                            case "ansEntered":
                                ctrl.ansEntered = false;
                                break;
                            case "correctAns":
                                ctrl.correctAns = false;
                                break;
                            case "attempt":
                                ctrl.attempt = false;
                                break;
                            case "timeTaken":
                                ctrl.timeTaken = false;
                                break;
                        }
                    }
                }
            }
            /*This function prepares config data*/
        ctrl.addtoLesson = function() {
            if (!ecEditor._.isUndefined(instance.editorObj)) {
                var configObj = {};
                configObj.levelArray = instance.config.levelArray;
                configObj.tableHeader = instance.config.tableHeader;
                var configData = {};
                configData["config"] = { __cdata: JSON.stringify(configObj) };
                instance.addAllMedia();
            } else {
                var configObj = {};
                configObj.levelArray = ctrl.levelArray;
                configObj.tableHeader = ctrl.tableHeader;
                var configData = {};
                configData["config"] = { __cdata: JSON.stringify(configObj) };
                ecEditor.dispatchEvent("org.ekstep.summarizer:create", configData);
                ecEditor.render();
            }
            $scope.closeThisDialog();
        }

    }]);

 //# sourceURL=summarizerController
