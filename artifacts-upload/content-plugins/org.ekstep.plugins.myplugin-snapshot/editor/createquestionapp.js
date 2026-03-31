/**
 * Plugin to create question
 * @class org.ekstep.plugins.myplugin:createquestionController
 * Jagadish P<jagadish.pujari@tarento.com>
 */
'use strict';
angular.module('createquestionapp', [])
    .controller('QuestionFormController', ['$scope', 'instance', function($scope, instance) {

        $scope.config = [];
        $scope.questionData = [];
        $scope.config = [{ maxLen: 220, isImage: false, isText: true, isAudio: false, isOption: false, isHeader: true, headerName: 'Enter the question', isQuestion: true, isAnswer: false },
            { maxLen: 25, isImage: true, isText: true, isAudio: true, isOption: true, isHeader: true, headerName: 'Set answer', isQuestion: false, isAnswer: true },
            { maxLen: 25, isImage: true, isText: true, isAudio: true, isOption: true, isHeader: false, headerName: '', isQuestion: false, isAnswer: true }
        ];

        $scope.image = false;
        $scope.audio = false;
        $scope.question = "";
        if (!ecEditor._.isUndefined(instance.editorObj)) {
            $scope.questionData = instance.config;
            console.log("Config", ecEditor);
            if ($scope.questionData.answers.length > 2) {
                for (var j = 2; j < $scope.questionData.answers.length; j++) {
                    $scope.config.push({ maxLen: 25, isImage: true, isText: true, isAudio: true, isOption: true, isHeader: true, headerName: ' ', isQuestion: false, isAnswer: true });
                }
            }
        }


        $scope.addAnswerField = function() {
            if($scope.config.length <= 8)
            $scope.config.push({ maxLen: 25, isImage: true, isText: true, isAudio: true, isOption: true, isHeader: true, headerName: ' ', isQuestion: false, isAnswer: true });
        }


        $scope.cancel = function() {
            $scope.closeThisDialog();
        }

        $scope.showPreview = true;
        $scope.setPreviewData = function() {

            this.previewURL = (ecEditor.getConfig('previewURL') || 'content/preview/preview.html') + '?webview=true';
            var instance = this;
            var contentService = ecEditor.getService('content');
            var defaultPreviewConfig = { showEndpage: true };
            var previewContentIframe = ecEditor.jQuery('#previewContentIframe')[0];
            previewContentIframe.src = instance.previewURL;
            var userData = ecEditor.getService('telemetry').context;
            previewContentIframe.onload = function() {
                var configuration = {};
                userData.etags = userData.etags || {};
                configuration.context = {
                    'mode': 'edit',
                    'sid': userData.sid,
                    'uid': userData.uid,
                    'channel': userData.channel,
                    'pdata': userData.pdata,
                    'app': userData.etags.app,
                    'dims': userData.etags.dims,
                    'partner': userData.etags.partner,
                    'contentId': ecEditor.getContext('contentId'),
                };
                if (ecEditor.getConfig('previewConfig')) {
                    configuration.config = ecEditor.getConfig('previewConfig');
                } else {
                    configuration.config = defaultPreviewConfig;
                }
                configuration.metadata = ecEditor.getService(ServiceConstants.CONTENT_SERVICE).getContentMeta(ecEditor.getContext('contentId'));
                //configuration.data = {};
                previewContentIframe.contentWindow.initializePreview(configuration);

            };
        }

        $scope.addToLesson = function() {

            var data = {};
            data.question = {};
            data.answers = [];
            var result = false;
            var check = false;
            var temp = {};
            var text1 = $("#textQ").val();
            // var image1 = $('#imageQ').attr('src');
            // var audio1 = $('#audioQ').attr('src');
            if (text1.length > 0) {
                data.question.text = text1;
                $("#textQ").css('border-bottom-color', 'inherit');
            } else {
                result = false;
                $("#textQ").css('border-bottom-color', 'red');
            }

            for (var i = 1; i < $scope.config.length; i++) {

                var temp = {};
                temp.isAnswerCorrect = false;
                if ($("#correctAnswer_" + i).is(":checked") || check) {
                    $("#correctAnswerLabel_" + i).css('color', 'inherit');
                    check = true;
                } else {
                    check = false;
                    $("#correctAnswerLabel_" + i).css('color', 'red');
                }
                var text2 = $("#answerField_" + i).val();
                var text3 = $("#answerField_" + i).val().length > 0 ? true : false;

                var image2 = $('#image_' + i).attr('src');
                var image3 = image2 == undefined || image2.length == 0 ? false : true;

                var audio2 = $('#audio_' + i).attr('src');

                var audio3 = audio2 == undefined || audio2.length == 0 ? false : true;
                if (text3 || image3 || audio3) {
                    temp.text = text2;
                    temp.image = image2;
                    temp.audio = audio2;
                    $("#answerField_" + i).css('border-bottom-color', 'inherit');
                    result = true;
                } else {
                    result = false;
                    $("#answerField_" + i).css('border-bottom-color', 'red');
                    break;
                }


                data.answers.push(temp);
            }
            var checks = [];
            //console.log("Checks", data);
             for (var j = 1; j < $scope.config.length; j++) {

                //temp.isAnswerCorrect = false;
                if ($("#correctAnswer_" + j).is(":checked")) {
                    //console.log("#correctAnswer_" + j);
                    data.answers[j-1].isAnswerCorrect = true;
                    //checks.push($(this).val());
                } 
            }

            if (result && check) {
                var configData = {};
                console.log(data);
                configData["config"] = { __cdata: JSON.stringify(data) };
                ecEditor.dispatchEvent("org.ekstep.plugins.myplugin:create", configData);
                $scope.cancel();
            }
        }

    }])
    .directive('editor1', function() {
        return {
            scope: {
                "config": "=?",
                "index": "=?",
                "questionData": "=?",
                "jags": "=?"
            },
            controller: 'createquestionController',
            templateUrl: 'editortemplate1',
        }
    })

    .controller('createquestionController', ['$scope', '$compile', '$injector', function($scope, $compile, $injector) {

        $scope.config = $scope.config || {};
        $scope.maxLen = $scope.config.maxLen;
        $scope.isText = $scope.config.isText;
        $scope.isImage = $scope.config.isImage;
        $scope.isAudio = $scope.config.isAudio;
        $scope.isOption = $scope.config.isOption;
        $scope.headerName = $scope.config.headerName;
        $scope.isQuestion = $scope.config.isQuestion;
        $scope.isAnswer = $scope.config.isAnswer;
        $scope.isHeader = $scope.config.isHeader;
        var count = $scope.index;

        //$scope.editorObj1 = {"question":{"text":"What is sky color?"},"answers":[{"text":"Red","image":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/do_1123553273100124161194/artifact/assetsb91f07a9debf690080dc529ec88933be_636_1508218495_1508218665895.jpg","audio":"","isAnswerCorrect":false},{"text":"blue","image":"","audio":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/1b_1466487334574.mp3","isAnswerCorrect":true}]};
        $scope.editorObj1 = $scope.jags || {};

        $scope.question = '';
        $scope.activeMenu = 'Text'
        $scope.selectedImageURL = '';
        $scope.selectedAudioURL = '';
        $scope.audioPlay = true;
        $scope.audioPause = false;
        $scope.addtolesson = true;
        $scope.play1 = true;
        ecEditor.jQuery('.ui.dropdown').dropdown({ useLabels: false });
        $('.longer.modal')
            .modal('show');

        $('.demo.menu .item').tab({ history: false });
        $('.test.modal')
            .modal('show');

        $scope.addTab = function(type, id) {

            if (type == 'image') {
                $scope.addImage(id);
            } else if (type == 'audio') {
                $scope.addAudio(id);
            }

        }
        $scope.addImage = function(id) {
            ecEditor.dispatchEvent('org.ekstep.assetbrowser:show', {
                type: 'image',
                search_filter: {}, // All composite keys except mediaType
                callback: function(data) {
                    data.x = 20;
                    data.y = 20;
                    data.w = 50;
                    data.h = 50;
                    data.from = 'plugin';
                    $scope.selectedImageURL = data.assetMedia.src;

                    if ($scope.editorObj1 != undefined && $scope.editorObj1.answers != undefined && $scope.editorObj1.answers[id - 1] != undefined && $scope.editorObj1.answers[id - 1].image != undefined ? true : false) {
                        $scope.editorObj1.answers[id - 1].image = "";
                    }
                    $scope.image = true;
                    $("#first_" + id).removeClass('active');
                    $("#firstTab_" + id).removeClass('active');

                    $("#third_" + id).removeClass('active');
                    $("#thirdTab_" + id).removeClass('active');

                    $("#second_" + id).addClass('active');
                    $("#secondTab_" + id).addClass('active');
                }
            });
        }

        $scope.addAudio = function(id) {
            ecEditor.dispatchEvent('org.ekstep.assetbrowser:show', {
                type: 'audio',
                search_filter: {}, // All composite keys except mediaType
                callback: function(data) {
                    $scope.selectedAudioURL = data.assetMedia.src;
                    if ($scope.editorObj1 != undefined && $scope.editorObj1.answers != undefined && $scope.editorObj1.answers[id - 1] != undefined && $scope.editorObj1.answers[id - 1].audio != undefined ? true : false) {
                        $scope.editorObj1.answers[id - 1].audio = "";
                    }
                    $scope.audio = true;
                    //$scope.image = false;
                    $scope.play = true;
                    $scope.pause = false;

                    $("#first_" + id).removeClass('active');
                    $("#firstTab_" + id).removeClass('active');

                    $("#second_" + id).removeClass('active');
                    $("#secondTab_" + id).removeClass('active');

                    $("#third_" + id).addClass('active');
                    $("#thirdTab_" + id).addClass('active');
                }
            });
        }

        $scope.playAudio = function(track, status) {
            var audio = new Audio(track);
            if (status == 1) {

                audio.play();
                $scope.play = false;
                $scope.play1 = false;
                $scope.pause = true;

            }
            if (status == 0) {

                audio.pause();
                $scope.play = true;
                $scope.play1 = true;
                $scope.pause = false;
            }

        }

        $scope.deleteAudio = function(id) {
            $scope.audio = false;
            if ($scope.editorObj1 != undefined && $scope.editorObj1.answers != undefined && $scope.editorObj1.answers[id - 1] != undefined && $scope.editorObj1.answers[id - 1].audio != undefined ? true : false) {
                $scope.editorObj1.answers[id - 1].audio = "";
            }
            $('#audio_' + id).attr('src', '');
            $("#third_" + id).removeClass('active');
            $("#thirdTab_" + id).removeClass('active');
            $("#first_" + id).addClass('active');
            $("#firstTab_" + id).addClass('active');

        }

        $scope.deleteImage = function(id) {
            $scope.image = false;
            if ($scope.editorObj1 != undefined && $scope.editorObj1.answers != undefined && $scope.editorObj1.answers[id - 1] != undefined && $scope.editorObj1.answers[id - 1].image != undefined ? true : false) {
                $scope.editorObj1.answers[id - 1].image = "";
            }
            $('#image_' + id).attr('src', '')
            $("#second_" + id).removeClass('active');
            $("#secondTab_" + id).removeClass('active');
            $("#first_" + id).addClass('active');
            $("#firstTab_" + id).addClass('active');

        }

        $scope.deleteAnswer = function(id) {
            $("#main_" + id).hide();
        }



    }]);

//# sourceURL=createquestion.js