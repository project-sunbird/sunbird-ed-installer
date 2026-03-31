//@ sourceURL=orderingNumbers-editor.js
'use strict';
/**
 * The Angular app for the Ordering Numbers editor plugin
 */
var ftOrderingNumbersApp = angular.module('ftOrderingNumbersApp', ['ftEditorServices', 'ftEditori18nServices']);

/**
 * The angular controller for the pop-up dialog for configuring the question using editor interface
 * Although the user can specify the number of questions as > 1, this controller just returns
 * only one in the items array. The editor plugin will clone this one question and returns as many
 * items as needed in the getData() callback.
 * 
 * As most of the functionality of this controller will be same, this code will be refactored to contain
 * only the plugin specific functionality and moving the commong functionality to a common angular service
 */
ftOrderingNumbersApp.controller('orderingNumbersController', ['$scope', 'ftEditorConfigService', 'ftI18nService', '$http', 'instance', function ($scope, ftEditorConfigService, ftI18nService, $http, instance) {

	instance.selectedConfig = (instance.data) ? instance.data.selectedConfig : undefined;
	$scope.items = [];
	$scope.itemData = {};
	var config = {
		title: 'Arrange the numbers',
		count: 0
	};
	var item = {
		langid: 'en',
		language: ["English"],
		identifier: 'ordering_numbers',
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
		template: 'orderingNumbers',
		title: 'Arrange the numbers',
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
		newItem.qid = instance.manifest.id + "-g" + $scope.selectedGrade + "-l" + $scope.selectedLevel.Level + "-sl" + $scope.selectedSubLevel.SubLevel;
		//conceptCode
		//newItem.concepts.identifier = newItem.qid;
		newItem.subject = ($scope.itemData.Subject) ? $scope.itemData.Subject : "NUM";
		newItem.grade = $scope.selectedGrade;
		newItem.gradeLevel.push("Grade " + $scope.selectedGrade);
		newItem.bloomsTaxonomyLevel = $scope.itemData.BTLO;
		newItem.level = $scope.selectedLevel.Level;
		newItem.sublevel = $scope.selectedSubLevel.SubLevel;
		// populate the hint message for the question
		newItem.model.hintMsg = $scope.itemData.HintID;
		var expr = $scope.itemData.Expression.split('\n');
		for (var ex in expr) {
			var obj = expr[ex].split('=');
			var rhs = obj[1].trim();
			var re = /\[([0-9])+\s*-\s*([0-9])+\]/;
			var m = re.test(rhs);
			if (m)
				rhs = rhs.replace(re, "random($1,$2)");
			newItem.model.variables[obj[0].trim()] = rhs;
		}
		// populate the title of the question from the config
		newItem.langid = $scope.contentLocale.id;
		newItem.model.langId = $scope.contentLocale.id;
		newItem.model.numericLangId = $scope.numeralLocale.id;
		config.locales = {
			contentLocale: $scope.contentLocale.id,
			numeralLocale: $scope.numeralLocale.id
		};
		var localeFile = ecEditor.resolvePluginResource(instance.manifest.id,
			instance.manifest.ver, '/editor/assets/i18n/' + $scope.contentLocale.id + '.json');
		$http.get(localeFile).then(function (response) {
			var localeData = response.data;
			newItem.title = config.title = localeData[$scope.contentLocale.id]["QUESTION_TITLE"];
			$scope.items.push(newItem);
			$scope.i18nData = localeData;
			config.count = $scope.itemData.QCount;
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
	 * Handles when the grade combo box selection is changed. It loads the levels applicable
	 * for the selected grade
	 */
	$scope.onGradeChange = function () {
		$scope.levels = ftEditorConfigService.getLevels($scope.Types[0], $scope.selectedGrade);
		$scope.selectedLevel = $scope.levels[0];
		$scope.onLevelChange();
	}

	/**
	 * handles the change of levels. It loads the sub-level corresponding to the selected level
	 */
	$scope.onLevelChange = function () {
		$scope.sublevels = ftEditorConfigService.getSubLevels($scope.Types[0], $scope.selectedGrade, $scope.selectedLevel.Level);
		$scope.selectedSubLevel = $scope.sublevels[0];
		$scope.onSubLevelChange();
	}

	/**
	 * handles changes to the sub-level. obtains the question data for the selected sub-level, and
	 * also initializes the question count, if not already initialized
	 */
	$scope.onSubLevelChange = function () {
		$scope.itemData = ftEditorConfigService.getData($scope.Types[0], $scope.selectedGrade, $scope.selectedLevel.Level, $scope.selectedSubLevel.SubLevel)[0];
		instance.selectedConfig = $scope.itemData;
		instance.selectedConfig.selectedGrade = $scope.selectedGrade;
		if (!$scope.itemData.QCount)
			$scope.itemData.QCount = 3;
	}
	var onSelectedConfig = function () {
		$scope.itemData.QCount = instance.config.count;
		$scope.Types = ftEditorConfigService.getTypes();
		$scope.selectedType = instance.selectedConfig.Type;
		$scope.Grades = ftEditorConfigService.getGrades($scope.selectedType);
		$scope.selectedGrade = instance.selectedConfig.selectedGrade;
		$scope.levels = ftEditorConfigService.getLevels($scope.Types[0], $scope.selectedGrade);
		$scope.selectedLevel = ecEditor._.find($scope.levels, { Level: instance.selectedConfig.Level });
		$scope.sublevels = ftEditorConfigService.getSubLevels($scope.Types[0], $scope.selectedGrade, $scope.selectedLevel.Level);
		$scope.selectedSubLevel = ecEditor._.find($scope.sublevels, { 'SubLevel': instance.selectedConfig.SubLevel });
		$scope.itemData = ftEditorConfigService.getData($scope.Types[0], $scope.selectedGrade, $scope.selectedLevel.Level, $scope.selectedSubLevel.SubLevel)[0];
		$scope.itemData.QCount = instance.config.count;
	}

	/**
	 * initilizes the dialog. Retrieves the configuration data by reading the JSON file.
	 */

	var init = function () {
		var configFile = ecEditor.resolvePluginResource(instance.manifest.id,
			instance.manifest.ver, '/editor/ordering.numbers.json');
		ftEditorConfigService.getEditorConfigData(configFile, null).then(function (response) {
			//$scope.result = response;
			if (instance.selectedConfig) {
				onSelectedConfig();
			}
			else {
				$scope.Types = ftEditorConfigService.getTypes();
				$scope.selectedType = $scope.Types[0];
				$scope.Grades = ftEditorConfigService.getGrades($scope.selectedType);
				$scope.selectedGrade = $scope.Grades[0];
				$scope.onGradeChange();
			}
		});

		// retrieve the i18n data
		var i18nJson = ecEditor.resolvePluginResource(instance.manifest.id,
			instance.manifest.ver, '/editor/i18n.json');
		var templateLocales;
		$scope.locales = [];
		ftI18nService.getData(i18nJson).then(function (response) {
			//$scope.i18nData = response;
			return response;
		}).then(function (locales) {
			templateLocales = locales;
			return ftI18nService.getLocales();
		}).then(function (response) {
			var availableLocales = response;
			ecEditor._.each(availableLocales, function (locData, i) {
				ecEditor._.each(templateLocales, function (tl) {
					if (locData.id == tl) $scope.locales.push(availableLocales[i]);
				});
			});
			var cl = 'en';
			var nl = 'en';
			if (instance.config && instance.config.locales) {
				cl = instance.config.locales.contentLocale || 'en';
				nl = instance.config.locales.numeralLocale || 'en'
			}
			$scope.contentLocale = ecEditor._.find($scope.locales, { id: cl }) || $scope.locales[0];
			$scope.numeralLocale = ecEditor._.find($scope.contentLocale.numerals, { id: nl }) || $scope.contentLocale.numerals[0];
		});
	}();
}]);

