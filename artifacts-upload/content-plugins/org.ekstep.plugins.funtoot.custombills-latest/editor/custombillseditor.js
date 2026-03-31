//@ sourceURL=custombills-editor.js
'use strict';
// Initialize the plugin namespace
org.ekstep.plugins = org.ekstep.plugins || {};
org.ekstep.plugins.funtoot.custombills = {};
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
/**
   * @param {object} $scope the scope of the current bill
   * @param {object} $http request to get the json file
   * @param {object} instance current instance of the bill
   */
ftEditorApp.controller('custombillsController', ['$scope', '$http', 'instance', function ($scope, $http, instance) {
    //instance.selectedConfig = (instance.data) ? instance.data.selectedConfig : undefined;
    $scope.items = [];
    var config = {
        title: 'Prepare the bill for the given items and find the total amount',
        count: 0
    };
    var item = {
        langid: 'en',
        language: ["English"],
        identifier: 'bills',
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
        template: 'bills',
        title: 'Prepare the bill for the given items and find the total amount',
        question_audio: '',
        question_image: '',
        model: {
            numericLangId: "en",
            langId: "en",
            numberType: "",
            hintMsg: "",
            tileImgPrefix: "tile",
            itemArray: [],
            itemQtyArray: [],
            ppuArray: [],
            maskArray: [0, 0, 1],
            totalPrice: 0,
            variables: {
                totItemsAvail: [],
                totItemsQtyAvail: [],
                totItemsPPuAvail: []
            }
        },
        concepts: {
            identifier: 'C6',
            name: 'Counting'
        }
    };

	/**
	 * Adds the question based on the configuration specified by the author
	 */
    $scope.addQuestion = function () {
        $scope.totCount = 0;
        var item = {};
        if ($scope.config.selectedConfig.areVariablesStatic) {
            for (var i = 0; i < $scope.config.selectedConfig.QCount; i++) {
                item.variablesProcessed = true;
                $scope.addNewItem(item);
            }
        }
        else {
            $scope.addNewItem(item);
        }
    };
    $scope.addNewItem = function (itemVar) {
        var newItem = ecEditor._.cloneDeep(item);
        newItem.qid = instance.manifest.id + "-g" + $scope.config.selectedConfig.Grade + "-l" + $scope.config.selectedConfig.Level.Level + "-sl" + $scope.config.selectedConfig.SubLevel.SubLevel;
        newItem.subject = $scope.config.selectedConfig.itemData.Subject || "NUM";
        newItem.grade = $scope.config.selectedConfig.Grade;
        newItem.gradeLevel.push("Grade " + $scope.config.selectedConfig.Grade);
        newItem.bloomsTaxonomyLevel = $scope.config.selectedConfig.itemData.BTLO;
        newItem.level = $scope.config.selectedConfig.Level.Level;
        newItem.sublevel = $scope.config.selectedConfig.SubLevel.SubLevel;
        newItem.maskArray = $scope.config.selectedConfig.itemData.MaskArray;
        newItem.totalItems = $scope.config.selectedConfig.itemData.TotalItems;
        // populate the hint message for the question
        newItem.model.hintMsg = $scope.config.selectedConfig.itemData.HintID;
        // newItem.model.variables = itemVar.variables;
        if (itemVar.variablesProcessed) {
            newItem.model.variablesProcessed = true;
        }
        // populate the title of the question from the config
        newItem.model.langId = newItem.langid = $scope.config.selectedConfig.contentLocale;
        newItem.model.numericLangId = $scope.config.selectedConfig.numeralLocale;
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
                newItem.title = config.title = localeData[contentLocaleVal][$scope.config.selectedConfig.itemData.QuestionText] == undefined ? localeData[contentLocaleVal]["QUESTION_TITLE"] : localeData[contentLocaleVal][$scope.config.selectedConfig.itemData.QuestionText];
                newItem.model.variables.totItemsAvail = localeData[contentLocaleVal]["ITEM_LIST"].split(',');
                newItem.model.variables.totItemsQtyAvail = localeData[contentLocaleVal]["ITEM_QTY_LIST"].split(',');
                newItem.model.variables.totItemsPPuAvail = localeData[contentLocaleVal]["ITEM_PPU_LIST"].split(',');
                $scope.items.push(newItem);
                $scope.i18nData = localeData;
                config.count = $scope.config.selectedConfig.QCount;
                if (newItem.model.variablesProcessed) {
                    var indArray = [];
                    while (indArray.length < newItem.totalItems) {
                        var randInd = new org.ekstep.generators().random(newItem.model.variables.totItemsAvail.length - 1);
                        if (indArray.indexOf(randInd) == -1) {
                            indArray.push(randInd);
                        }
                    }
                    var itemsArray = [];
                    var itemQtyArray = [];
                    var ppuArray = [];
                    _.each(indArray, function (ind) {
                        itemsArray.push(newItem.model.variables.totItemsAvail[ind]);
                        var qtyRange = newItem.model.variables.totItemsQtyAvail[ind].split("-");
                        itemQtyArray.push(new org.ekstep.generators().random(Number(qtyRange[0]), Number(qtyRange[1])));
                        var ppuRange = newItem.model.variables.totItemsPPuAvail[ind].split("-");
                        ppuArray.push(new org.ekstep.generators().random(Number(ppuRange[0]), Number(ppuRange[1])));
                    });
                    newItem.model.variables.indArray = indArray;
                    newItem.model.variables.itemArray = itemsArray;
                    newItem.model.variables.itemQtyArray = itemQtyArray;
                    newItem.model.variables.ppuArray = ppuArray;
                    newItem.model.isNumbersProcessed = false;
                    $scope.totCount++;
                    if ($scope.totCount == config.count) {
                        $scope.config.selectedConfig["isVarPreProcessed"] = true;
                        $scope.exeCallback(config);
                    }
                }
                else {
                    $scope.exeCallback(config);
                }
            });
        });
    };

    $scope.exeCallback = function (config) {
        // call the plugin using the callback
        if (!ecEditor._.isUndefined(instance.callback)) {
            instance.callback($scope.items, config, $scope.i18nData);
            $scope.cancel();
        }
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
            instance.manifest.ver, '/editor/custombills.json');
        $scope.config.i18nFile = ecEditor.resolvePluginResource(instance.manifest.id,
            instance.manifest.ver, '/editor/i18n.json');
        $scope.config.selectedConfig = (instance.config && instance.config.selectedConfig) ? instance.config.selectedConfig : {};
    };
    init();
}]);