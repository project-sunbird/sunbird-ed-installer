//@ sourceURL=asmVertical-editor.js
'use strict';
/**
 * The Angular app for the funtoot Editor
 */
var ftEditorApp = angular.module('ftEditorApp');

/**
 * The angular controller for the pop-up dialog for configuring the question using editor interface
 * Although the user can specify the number of questions as > 1, this controller just returns
 * only one in the items array. The editor plugin will clone this one question and returns as many
 * items as needed in the getData() callback.
 * 
 * As most of the functionality of this controller will be same, this code will be refactored to contain
 * only the plugin specific functionality and moving the commong functionality to a common angular service
 */
ftEditorApp.controller('asmVerticalController', ['$scope', '$http', 'instance', function ($scope, $http, instance) {
	$scope.items = [];
	var config = {
		title: 'Arrange the numbers',
		count: 0
	};
	var item = {
		langid: 'en',
		language: ["English"],
		identifier: 'asm_vertical',
		qid: '',
		subject: "NUM",
		grade: 0,
		gradeLevel: [],
		bloomsTaxonomyLevel: '',
		level: '',
		sublevel: '',
		qindex: '',
		qlevel: 'EASY',
		type: 'mtf',
		template_id: '',
		template: 'asmVertical',
		title: 'Addition',
		question_audio: '',
		question_image: '',
		model: {
			numbers: "$nums",
			numericLangId: "en",
			langId: "en",
			numberType: "",
			hintMsg: "",
			variables: {}
		},
		concepts: {
			identifier: 'C6',
			name: 'Counting'
		}
	}

	/**
	 * Adds the question based on the configuration specified by the author
	 */
	$scope.addQuestion = function () {
		var newItem = ecEditor._.cloneDeep(item);
		//qid
		newItem.qid = instance.manifest.id + "-g" + $scope.config.selectedConfig.Grade + "-l" + $scope.config.selectedConfig.Level.Level + "-sl" + $scope.config.selectedConfig.SubLevel.SubLevel;
		//conceptCode
		//newItem.concepts.identifier = newItem.qid;
		newItem.subject = ($scope.config.selectedConfig.itemData.Subject) ? $scope.config.selectedConfig.itemData.Subject : "NUM";
		newItem.grade = $scope.config.selectedConfig.Grade;
		newItem.gradeLevel.push("Grade " + $scope.config.selectedConfig.Grade);
		newItem.bloomsTaxonomyLevel = $scope.config.selectedConfig.itemData.BTLO;
		newItem.level = $scope.config.selectedConfig.Level.Level;
		newItem.sublevel = $scope.config.selectedConfig.SubLevel.SubLevel;
		// populate the hint message for the question
		newItem.model.hintMsg = $scope.config.selectedConfig.itemData.HintID;
		newItem.model.digits = $scope.config.selectedConfig.itemData.Digits;
		newItem.model.qType = $scope.config.selectedConfig.itemData.QType;
		var expr = $scope.config.selectedConfig.itemData.Expression.split('\n');
		for (var ex in expr) {
			var obj = expr[ex].split('=');
			var rhs = obj[1].trim();
			newItem.model.variables[obj[0].trim()] = rhs;
		}
		// populate the title of the question from the config
		newItem.langid = $scope.config.selectedConfig.contentLocale;
		newItem.model.langId = $scope.config.selectedConfig.contentLocale;
		newItem.model.numericLangId = $scope.config.selectedConfig.numeralLocale;
		config.locales = {
			contentLocale: $scope.config.selectedConfig.contentLocale,
			numeralLocale: $scope.config.selectedConfig.numeralLocale
		};
		config.selectedConfig = $scope.config.selectedConfig;
		var localeFile = ecEditor.resolvePluginResource(instance.manifest.id,
			instance.manifest.ver, '/editor/assets/i18n/' + $scope.config.selectedConfig.contentLocale + '.json');
		$http.get(localeFile).then(function (response) {
			var localeData = response.data;
			newItem.title = config.title = localeData[$scope.config.selectedConfig.contentLocale]["QUESTION_TITLE"];
			$scope.items.push(newItem);
			$scope.i18nData = localeData;
			config.count = $scope.config.selectedConfig.QCount;
			// call the plugin using the callback
			if (!ecEditor._.isUndefined(instance.callback)) {
				instance.callback($scope.items, config, $scope.i18nData);
				$scope.cancel();
			}
		});
	};

	/**
	 * closes the dialog
	 */
	$scope.cancel = function () {
		$scope.closeThisDialog();
	};

	/**
	 * initilizes the dialog. Retrieves the configuration data by reading the JSON file.
	 */
	var init = function () {
		$scope.config = {};
		$scope.config.configFile = ecEditor.resolvePluginResource(instance.manifest.id,
			instance.manifest.ver, '/editor/asm.vertical.json');
		$scope.config.i18nFile = ecEditor.resolvePluginResource(instance.manifest.id,
			instance.manifest.ver, '/editor/i18n.json');
		$scope.config.selectedConfig = (instance.config && instance.config.selectedConfig) ? instance.config.selectedConfig : {};
	}();
}]);

