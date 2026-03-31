//@ sourceURL=spnib.js
'use strict';
/**
 * The Angular app for the Numerals Counting editor plugin
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
ftEditorApp.controller('spnibController', ['$scope', '$http', 'instance', function ($scope, $http, instance) {
	//instance.selectedConfig = (instance.data) ? instance.data.selectedConfig : undefined;
	$scope.items = [];
	$scope.itemData = {};
	var config = {
		title: 'Fill in the missing numbers',
		count: 0
	};
	var item = {
		langid: 'en',
		language: ["English"],
		identifier: 'spnib',
		qid: '',
		subject: "NUM",
		grade: 0,
		gradeLevel: [],
		bloomsTaxonomyLevel: '',
		level: '',
		sublevel: '',
		qindex: '',
		qlevel: 'EASY',
		type: 'ftb',
		template_id: '',
		template: 'spnib',
		title: 'Successor, Predecessor, Numbers In Between',
		question_audio: '',
		question_image: '',
		model: {
			numericLangId: "en",
			numbers: "$nums",
			langId: "en",
			isRoman: "",
			numberType: "",
			qtype: "",
			rows: 0,
			cols: 0,
			hintMsg: "",
			tileImgPrefix: "house",
			bgImg: "successor_predecessor_train",
			mask: '',
			variables: {
				$expr: "'[2-9],[11-19]'",
				$totalNums: "0",
				//$langId: "'en'",
				$numberType: "''",
				$nums: "getNumberSequence($expr, $totalNums, 1,'en', $numberType)"
			}
		},
		concepts: {
			identifier: 'C7',
			name: 'Sequence'
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
		newItem.subject = $scope.config.selectedConfig.itemData.Subject || "NUM";
		newItem.grade = $scope.config.selectedConfig.Grade;
		newItem.gradeLevel.push("Grade " + $scope.config.selectedConfig.Grade);
		newItem.bloomsTaxonomyLevel = $scope.config.selectedConfig.itemData.BTLO;
		newItem.level = $scope.config.selectedConfig.Level.Level;
		newItem.sublevel = $scope.config.selectedConfig.SubLevel.SubLevel;
		newItem.model.rows = 1;
		newItem.model.cols = 2;
		if ($scope.config.selectedConfig.Type == "Number-In-Between") {
			newItem.model.cols = 3;
			newItem.model.bgImg = "number_inbetween_train";
		}
		newItem.model.mask = eval($scope.config.selectedConfig.itemData.Mask);
		// populate the hint message for the question
		newItem.model.hintMsg = $scope.config.selectedConfig.itemData.HintID;
		// the expression for generating the start number
		// newItem.model.variables.$expr = "'" + $scope.config.selectedConfig.itemData.Expression + "'";
		// total items - to be used in the variables.
		newItem.model.variables.$totalNums = newItem.model.rows + '*' + newItem.model.cols;
		// populate the editable boxes through the input mask
		newItem.model.mask = ($scope.config.selectedConfig.Type.indexOf("Predecessor") < 0) ? [2] : [1];
		newItem.model.qtype = ($scope.config.selectedConfig.Type.indexOf("Predecessor") >= 0) ? "Predecessor" :
			($scope.config.selectedConfig.Type.indexOf("Successor") >= 0 ? "Successor" : "Number-In-Between");
		// populate the title of the question from the config
		newItem.model.langId = newItem.langid = $scope.config.selectedConfig.contentLocale;
		newItem.model.numericLangId = $scope.config.selectedConfig.numeralLocale;
		if (!_.isUndefined($scope.config.selectedConfig.itemData.IsRoman)) {
			var isRoman = ($scope.config.selectedConfig.itemData.IsRoman.toLowerCase() == ('y' || 'yes')) ? true : false;
			newItem.model.numericLangId = isRoman ? 'roman' : $scope.config.selectedConfig.numeralLocale;
			if (isRoman)
				newItem.model.variables.$expr = $scope.config.selectedConfig.itemData.Expression;
			else
				newItem.model.variables.$expr = "'" + $scope.config.selectedConfig.itemData.Expression + "'";
		}
		else
			newItem.model.variables.$expr = $scope.config.selectedConfig.itemData.Expression;
		config.locales = {
			contentLocale: $scope.config.selectedConfig.contentLocale,
			numeralLocale: $scope.config.selectedConfig.numeralLocale
		};
		config.selectedConfig = $scope.config.selectedConfig;
		var commoni18nFile = ecEditor.resolvePluginResource("org.ekstep.funtoot.common",
			"1.0", '/editor/assets/i18n/' + $scope.config.selectedConfig.contentLocale + '.json');
		$http.get(commoni18nFile).then(function (response) {
			$scope["common"] = {};
			$scope.common["i18n"] = response.data;
			var localeFile = ecEditor.resolvePluginResource(instance.manifest.id,
				instance.manifest.ver, '/editor/assets/i18n/' + $scope.config.selectedConfig.contentLocale + '.json');
			$http.get(localeFile).then(function (response) {
				var localeData = {};
				var contentLocaleVal = $scope.config.selectedConfig.contentLocale;
				localeData[contentLocaleVal] = Object.assign({}, $scope.common.i18n[contentLocaleVal], response.data[contentLocaleVal]);
				newItem.title = config.title = localeData[contentLocaleVal]["QUESTION_TITLE"];
				$scope.items.push(newItem);
				$scope.i18nData = localeData;
				config.count = $scope.config.selectedConfig.QCount;
				// call the plugin using the callback
				if (!ecEditor._.isUndefined(instance.callback)) {
					instance.callback($scope.items, config, $scope.i18nData);
					$scope.cancel();
				}
			});
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
			instance.manifest.ver, '/editor/spnib.json');
		$scope.config.i18nFile = ecEditor.resolvePluginResource(instance.manifest.id,
			instance.manifest.ver, '/editor/i18n.json');
		$scope.config.selectedConfig = (instance.config && instance.config.selectedConfig) ? instance.config.selectedConfig : {};
	}();
}]);

