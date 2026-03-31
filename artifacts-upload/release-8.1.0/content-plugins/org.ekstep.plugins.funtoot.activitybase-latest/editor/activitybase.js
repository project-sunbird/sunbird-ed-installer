//@ sourceURL=activitybase-editor-ctrl.js
'use strict';
/**
 * The Angular app for the funtoot Editor
 */
var ftEditorAppIb = angular.module('ftEditorAppIb');

/**
 * The angular controller for the pop-up dialog for configuring the question using editor interface
 * Although the user can specify the number of questions as > 1, this controller just returns
 * only one in the items array. The editor plugin will clone this one question and returns as many
 * items as needed in the getData() callback.
 * @param{Object} $scope scope
 * @param{Object} $timeout timeout
 * @param{Object} $http http
 * @param{Object} instance information
 * @param{Object} filters filters
 * As most of the functionality of this controller will be same, this code will be refactored to contain
 * only the plugin specific functionality and moving the commong functionality to a common angular service
 */
ftEditorAppIb.controller('activityBaseCtrl', ['$scope', '$timeout', '$http', 'instance', 'filters', function ($scope, $timeout, $http, instance, filters) {
    var config = {
        title: '<!!fix me!!>',
        count: 0
    };
    var ctrl = this;
    $scope.instance = instance;
    ctrl.searchQuestions = function () {
        ctrl.isItemAvailable = true;
        ctrl.itemsLoading = true;
        $http.get(filters).then(function (response) {
            // get Questions from questions api
            $scope.$broadcast('ft-get-itembank-questions', {
                filters: response.data,
                file: filters
            })
        });
    };

    /**
     * Adds the question based on the configuration specified by the author
     * @param{Object} $event event information
     */

    $scope.$on('ngDialog.opened', function (e, $dialog) {
        //coming here
    });

    $scope.constructQuestions = function ($event) {
        config.selectedConfig = $scope.config.selectedConfig;
        config.isQa = $scope.config.isQa;
        config.title = $scope.config.i18nData[config.selectedConfig.contentLocale]['QUESTION_TITLE'];
        if ($event && $event.ctrlKey) {
            $scope.config.selectedConfig.itemsData = ecEditor._.filter($scope.config.allItems, function (item) {
                return item.grade.indexOf($scope.config.selectedConfig.Grade) > -1;
            });
            config.count = $scope.config.selectedConfig.QCount = $scope.config.selectedConfig.itemsData.length;
        } else {
            config.count = $scope.config.selectedConfig.QCount;
        }
        var selectedQuestions = ecEditor._.take($scope.config.selectedConfig.itemsData, config.count);
        selectedQuestions = _.sortBy(selectedQuestions, ['level', 'sublevel']);

        var commoni18nFile = ecEditor.resolvePluginResource("org.ekstep.funtoot.common",
            "1.0", '/editor/assets/i18n/' + $scope.config.selectedConfig.contentLocale + '.json');
        return $http.get(commoni18nFile).then(function (response) {
            $scope["common"] = {};
            $scope.common["i18n"] = response.data;
            selectedQuestions.forEach(function (item) {
                var langId = $scope.config.selectedConfig.contentLocale;
                var itemModel = JSON.parse(item.model);
                itemModel.langId = langId;
                itemModel.numericLangId = $scope.config.selectedConfig.numeralLocale;
                item.model = JSON.stringify(itemModel);
                item.i18n[langId] = Object.assign({}, $scope.common.i18n[langId], item.i18n[langId]);
                var expressions = item.i18n[langId].EXPRESSIONS;
                if (!item.title && config.title)
                    item.title = config.title;
                var variables = {};
                if (expressions && typeof (expressions) == "string") {
                    ecEditor._.each(expressions.split(/\r?\n/), function (exp) {
                        var tokens = exp.split('=');
                        variables[tokens[0]] = tokens[1];
                    });
                    var item_model = JSON.parse(item.model);
                    if ($scope.config.selectedConfig.areVariablesStatic) {
                        new org.ekstep.generators().processVariables(variables);
                        item_model["variablesProcessed"] = true;
                    }
                    item_model["variables"] = variables;
                    item.model = JSON.stringify(item_model);
                }
            });
            return selectedQuestions;
        });
    }

    $scope.addQuestion = function ($event) {
        if (!ecEditor._.isUndefined(instance.callback)) {
            $scope.constructQuestions($event).then(function (questions) {
                instance.callback(questions, config);
                $scope.cancel();
            });
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
        $scope.config.i18nFile = ecEditor.resolvePluginResource(instance.manifest.id,
            instance.manifest.ver, '/editor/i18n.json');
        $scope.config.selectedConfig = (instance.config && instance.config.selectedConfig) ? instance.config.selectedConfig : {};
        $timeout(function () {
            ctrl.searchQuestions();
        }, 1000);
    };
    init();
}]);