/**
 * Plugin to create FTB question
 * @class org.ekstep.questionunitftb:ftbQuestionFormController
 * Jagadish P<jagadish.pujari@tarento.com>
 */

angular.module('ftbApp', ['org.ekstep.question']).controller('ftbQuestionFormController', ['$scope', '$rootScope', 'questionServices', function($scope, $rootScope, questionServices) { // eslint-disable-line no-unused-vars
  $scope.keyboardConfig = {
    keyboardType: 'Device',
    customKeys: []
  };
  $scope.formVaild = false;
  $scope.ftbConfiguartion = {
    'questionConfig': {
      'isText': true,
      'isImage': true,
      'isAudio': true,
      'isHint': false
    }
  };
  $scope.questionMedia = {};
  $scope.keyboardTypes = ['Device', 'English', 'Custom'];
  $scope.ftbFormData = {
    question: {
      text: '',
      image: '',
      audio: '',
      audioName: '',
      keyboardConfig: $scope.keyboardConfig
    },
    answer: [],
    media: []
  };
  var eraserIcon = {
    id: "org.ekstep.keyboard.eras_icon",
    src: ecEditor.resolvePluginResource("org.ekstep.keyboard", "1.0", 'renderer/assets/eras_icon.png'),
    assetId: "org.ekstep.keyboard.eras_icon",
    type: "image",
    preload: true
  };
  $scope.ftbFormData.media.push(eraserIcon);
  var languageIcon = {
    id: "org.ekstep.keyboard.language_icon",
    src: ecEditor.resolvePluginResource("org.ekstep.keyboard", "1.0", 'renderer/assets/language_icon.png'),
    assetId: "org.ekstep.keyboard.language_icon",
    type: "image",
    preload: true
  };
  $scope.ftbFormData.media.push(languageIcon);
  var hideKeyboardIcon = {
    id: "org.ekstep.keyboard.hide_keyboard",
    src: ecEditor.resolvePluginResource("org.ekstep.keyboard", "1.0", 'renderer/assets/keyboard.svg'),
    assetId: "org.ekstep.keyboard.hide_keyboard",
    type: "image",
    preload: true
  };
  $scope.ftbFormData.media.push(hideKeyboardIcon);
  var questionInput = CKEDITOR.replace('ftbQuestion', { // eslint-disable-line no-undef
    customConfig: CKEDITOR.basePath + "config.js", // eslint-disable-line no-undef
    skin: 'moono-lisa,' + CKEDITOR.basePath + "skins/moono-lisa/", // eslint-disable-line no-undef
    contentsCss: CKEDITOR.basePath + "contents.css" // eslint-disable-line no-undef
  });
  questionInput.on('change', function() {
    $scope.ftbFormData.question.text = this.getData();
  });
  questionInput.on('focus', function() {
    $scope.generateTelemetry({ type: 'TOUCH', id: 'input', target: { id: 'questionunit-ftb-question', ver: '', type: 'input' } })
  });
  $scope.init = function() {
    $scope.ftbPluginInstance = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.questionunit.ftb")
    $('.menu .item').tab();
    $('.ui.dropdown').dropdown({
      useLabels: false
    });
    if (!ecEditor._.isUndefined($scope.questionEditData)) {
      var data = $scope.questionEditData.data;
      $scope.ftbFormData.question = data.question;
      $scope.keyboardConfig = data.question.keyboardConfig;
    }
    $scope.$parent.$on('question:form:val', function() { // eslint-disable-line no-unused-vars
      var regexForAns = /(?:^|)\[\[(.*?)(?:\]\]|$)/g;
      $scope.ftbFormData.answer = $scope.getMatches($scope.ftbFormData.question.text, regexForAns, 1).map(function(a) {
        return a.toLowerCase().trim();
      });
      if ($scope.formValidation()) {
        $scope.$emit('question:form:valid', $scope.ftbFormData);
      } else {
        $scope.$emit('question:form:inValid', $scope.ftbFormData);
      }
    })
  }

  $scope.getMatches = function(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) { // eslint-disable-line no-cond-assign
      matches.push(match[index]);
    }
    return matches;
  }
  
  $scope.formValidation = function() {
    $scope.submitted = true;
    var ftbQuestionLength = $scope.ftbFormData.question.text.length;
    var formValid = (ftbQuestionLength > 0) && /\[\[.*?\]\]/g.test($scope.ftbFormData.question.text);
    if (formValid) {
      return true;
    } else {
      $scope.ftbForm.ftbQuestion.$valid = false;
      return false;
    }
  }

  $scope.generateTelemetry = function (data) {
    data.plugin = data.plugin || {
      "id": $scope.ftbPluginInstance.id,
      "ver": $scope.ftbPluginInstance.ver
    }
    data.form = data.form || 'question-creation-ftb-form';
    questionServices.generateTelemetry(data);
  }
  /**
   * invokes the asset browser to pick an image to add to either the question or the options
   * @param {string} id if `q` then it is image for question, else for options
   * @param {string} type if `id` is not `q` but an index, then it can be either 'LHS' or 'RHS'
   * @param {string} mediaType `image` or `audio`
   */
  $scope.addMedia = function (type, index, mediaType) {
    var mediaObject = {
      type: mediaType,
      search_filter: {} // All composite keys except mediaType
    }
    //Defining the callback function of mediaObject before invoking asset browser
    mediaObject.callback = function (data) {
      var telemetryObject = { type: 'TOUCH', id: 'button', target: { id: 'questionunit-ftb-add-' + mediaType, ver: '', type: 'button' } };
      var media = {
        "id": Math.floor(Math.random() * 1000000000), // Unique identifier
        "src": org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src), // Media URL
        "assetId": data.assetMedia.id, // Asset identifier
        "type": data.assetMedia.type, // Type of asset (image, audio, etc)
        "preload": false // true or false
      };

      $scope.ftbFormData.question[mediaType] = org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src);
      data.assetMedia.type == 'audio'  ? $scope.ftbFormData.question.audioName = data.assetMedia.name : '';
      $scope.questionMedia[mediaType] = media;
      $scope.generateTelemetry(telemetryObject)
    }
    questionServices.invokeAssetBrowser(mediaObject);
  }

  $scope.deleteMedia = function (type, index, mediaType) {
    var telemetryObject = { type: 'TOUCH', id: 'button', target: { id: 'questionunit-ftb-delete-' + mediaType, ver: '', type: 'button' } };
    $scope.ftbFormData.question[mediaType] = '';
    delete $scope.questionMedia.image;
    $scope.generateTelemetry(telemetryObject)
  }

  $scope.callbacks = {
    deleteMedia: $scope.deleteMedia,
    addMedia: $scope.addMedia,
    qtype: 'ftb'
  }

}]);
//# sourceURL=horizontalFTB.js