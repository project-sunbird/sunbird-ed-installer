//@ sourceURL=ftEditorApp.js
/**
 * funtoot Editor App and related services, controllers and Directives
 * - shared by editor plugins for providing common functionality of configuring funtoot templates.
 *
 * @author Sandhya M (sandhya.m@funtoot.com)
 */
var ftEditorApp = angular.module('ftEditorApp', []);

/**
 * Service: ftEditorConfigService
 * this is a common services used to read the configuration Json file and processing it to get
 * the required data such as question type, grade, level, sub-level, etc...
 * @param {object} $http the $http service
 * @param {object} $filter the $filter service
 * @return {object} the service
 */
ftEditorApp.factory('ftEditorConfigService', ['$http', '$filter', function ($http, $filter) {
    var jsonData = null;
    var types = [];

    /**
     * Utility function to pluck multiple keys from a collection of objects
     * @param {*} the first argument is the collection, subsequent arguments are the keys to be picked
     * @returns {object} the object with plucked properties
     */
    var pluckMany = function () {
        // get the property names to pluck
        var source = arguments[0];
        var propertiesToPluck = ecEditor._.drop(arguments);
        return ecEditor._.map(source, function (item) {
            var obj = {};
            ecEditor._.each(propertiesToPluck, function (property) {
                obj[property] = item[property];
            });
            return obj;
        });
    };

    /**
     * Utility function that returns the unique set of values out of a collection of objects
     * @param {collection} coll Collection from which unique values to be obtained
     * @param {string} prop the property based on which the unique entries are to be filetered
     * @returns {object[]} the collection with unique entries
     */
    var unique = function (coll, prop) {
        var uniqueObjs = {};
        ecEditor._.each(coll, function (v) {
            if (!uniqueObjs[v[prop]])
                uniqueObjs[v[prop]] = v;
        });
        coll = [];
        ecEditor._.each(uniqueObjs, function (v) {
            coll.push(v);
        });
        return coll;
    }

    /**
     * The configuration file
     */
    var _configFile = '';

    return {
        /**
         * Returns the editor configuration data as read from the JSON file
         * @param {string} file the JSON configuration file
         * @returns {object} the promise that will return the editor configuration data
         */
        getEditorConfigData: function (file) {
            if (_configFile == file && jsonData) {
                return Promise.resolve(jsonData);
            } else {
                return $http.get(file).success(function (response) {
                    jsonData = response;
                    _configFile = file;
                    types = ecEditor._.uniq(ecEditor._.map(jsonData, 'Type'));
                });
            }
        },
        /**
         * returns the types from the configuration data
         * @returns {string[]} the types available in the configuration
         */
        getTypes: function () {
            return types;
        },

        /**
         * returns the unique grades for a specified type
         * @param {string} type the type for which grade values are to be obtained
         * @returns {string[]} the unique grades avaialble in the configuration
         */
        getGrades: function (type) {
            var grades = [];
            var gVals = ecEditor._.map(jsonData, 'Grade');
            ecEditor._.each(gVals, function (a) {
                var arrVal = ecEditor._.toString(a);
                ecEditor._.each(arrVal.split(','), function (ar, j, val) {
                    ecEditor._.each(val, function (arr) {
                        var g = arr.trim();
                        if (!ecEditor._.includes(grades, g))
                            grades.push(g);
                    });
                });
            });
            return grades;
        },
        /**
         * returns the levels for the type and grade
         * @param {string} type the type for which levels are to be returned
         * @param {string} grade the grades for which levels are to be returned
         * @returns {object[]} the distinct levels for the type and grade
         */
        getLevels: function (grade) {
            var filtered = ecEditor._.filter(jsonData, function (item) {
                var gradeVal = typeof (item.Grade) == "string" ? item.Grade : ecEditor._.toString(item.Grade);
                return gradeVal.includes(grade);
            });
            var levels = pluckMany(filtered, "Level", "LevelDesc");
            return unique(levels, 'Level');
        },

        /**
         * returns the sub-levels for the specified type, grade and level
         * @param {string} type the type
         * @param {string} grade the grade
         * @param {string} level the level
         * @returns {object[]} the unique Sub levels for the type, grade and level
         */
        getSubLevels: function (grade, level) {
            var filtered = ecEditor._.filter(jsonData, function (item) {
                var gradeVal = typeof (item.Grade) == "string" ? item.Grade : ecEditor._.toString(item.Grade);
                return (gradeVal.includes(grade) && item.Level == level);
            });
            var sublevel = pluckMany(filtered, "SubLevel", "SubLevelDesc");
            return unique(sublevel, 'SubLevel');
        },

        /**
         * returns all the configuration objects that match type, grade, level and sub-level
         * @param {string} type the type
         * @param {string} grade the grade
         * @param {string} level the level
         * @param {string} sublevel the Sub-level
         * @returns {object} the data corresponding to the specified type, grade, level and sublevel
         */
        getData: function (grade, level, sublevel) {
            var filtered = ecEditor._.filter(jsonData, function (item) {
                var gradeVal = typeof (item.Grade) == "string" ? item.Grade : ecEditor._.toString(item.Grade);
                return (gradeVal.includes(grade) && item.Level == level && item.SubLevel == sublevel);
            });
            //return ecEditor._.map(filtered, 'Description');
            return filtered;
        }
    }
}]);

/**
 * Service: ftI18nService
 * this is a common services for reading the i18n configuration data for the editor
 * @param {object} $http the $http service
 * @return {object} the service
 */
ftEditorApp.factory('ftI18nService', ['$http', function ($http) {
    /**
     * the i18n data read from the JSON file
     */
    var _i18nData = null;
    /**
     * the JSON file
     */
    var _file = '';

    /**
     * locales data read from i18n.json
     */
    var _locales = null;
    return {
        /**
         * Returns the i18n data read from JSON files. It first reads the common i18n JSON file
         * and merges that with the file specified by the caller.
         * @param {string} file the file from which the i18n resources are to be retrieved
         * @returns {object} the i18n data from the specified file
         */
        getData: function (file) {
            // If the data is already available, just return (a promise)
            if (_file == file && _i18nData) {
                return Promise.resolve(_i18nData);
            } else {
                // read the file specified by the caller, then read the common i18n file, and
                // merge both the data to include common strings with the plugin specific data.
                var res1;
                return $http.get(file).then(function (response) {
                    _file = file;
                    _i18nData = response.data;
                    return _i18nData;
                });
            }
        },
        /**
         * returns the locales available for the editor
         * @returns {object} the locales which can be supported by the editor
         */
        getLocales: function () {
            if (_locales && _locales.length > 0)
                return Promise.resolve(_locales);
            var i18nFile = ecEditor.resolvePluginResource('org.ekstep.funtoot.common', '1.0', '/editor/i18n.json');
            return $http.get(i18nFile).then(function (response) {
                _locales = response.data.locales;
                return _locales;
            });
        }
    };
}]);

/**
 * Directive ft-wizard which encapsulates the functionality associated with the Editor Configuration Wizard (Dialog)
 */
ftEditorApp.directive('ftWizard', ['$sce', 'ftEditorConfigService', 'ftI18nService', function ($sce, ftEditorConfigService, ftI18nService) {
    return {
        /**
         * Returns the template URL for the directive
         * @param {object} the JQuery element to which the directive is attached
         * @param {object} the map of the attributes and the values for the $element
         * @returns {object} the sanitized url of the wizard template HTML file
         */
        templateUrl: function ($element, $attrs) {
            return $sce.trustAsResourceUrl(ecEditor.resolvePluginResource('org.ekstep.funtoot.common',
                '1.0', '/editor/wizardtemplate.html'));
        },
        /**
         * the scope isolation for the directive - accesses `config` from parent scope, `onOk` and `onCancel`
         * are callback functions to be called depending on the user's actions
         */
        scope: {
            config: '=',
            onOk: '&',
            onCancel: '&'
        },
        /**
         * The link function of the directive
         * @param {object} the scope associated with the directive
         * @param {object} the DOM element to which the directive is associated with
         * @param {object} the map of attributes and their values
         */
        link: function ($scope, $element, $attrs) {
            $scope.config.selectedConfig.enableNextButton = true

            /**
             * Watch for immediate feedback flag
             */
            $scope.$watch('config.selectedConfig.showImmediateFeedback', function (newValue, oldValue, scope) {
                if (newValue != undefined && typeof newValue == 'boolean') {
                    $scope.config.selectedConfig.showImmediateFeedback = newValue;
                    $scope.config.selectedConfig.areMicrohintsEnabled = newValue;
                    $scope.config.selectedConfig.enableFeedback = newValue;
                    $scope.config.selectedConfig.enableSolution = newValue;
                    $scope.config.selectedConfig.enableHint = newValue;
                    $scope.config.selectedConfig.retainAnswers = true;
                    $scope.config.selectedConfig.maxNoOfAtt = newValue ? 2 : 1;
                }
            }, true);
            /**
             * Handles when the type combo box selection is changed. It loads the levels applicable
             * for the selected type
             */
            $scope.onTypeChange = function () {
                $scope.Grades = ftEditorConfigService.getGrades();
                $scope.config.selectedConfig.Grade = $scope.Grades[0];
                $scope.onGradeChange();
            }
            /**
             * Handles when the grade combo box selection is changed. It loads the levels applicable
             * for the selected grade
             */
            $scope.onGradeChange = function () {
                $scope.levels = ftEditorConfigService.getLevels($scope.config.selectedConfig.Grade);
                $scope.config.selectedConfig.Level = $scope.levels[0];
                $scope.onLevelChange();
            }
            /**
             * handles the change of levels. It loads the sub-level corresponding to the selected level
             */
            $scope.onLevelChange = function () {
                $scope.sublevels = ftEditorConfigService.getSubLevels($scope.config.selectedConfig.Grade, $scope.config.selectedConfig.Level.Level);
                $scope.config.selectedConfig.SubLevel = $scope.sublevels[0];
                $scope.onSubLevelChange();
            }
            /**
             * handles changes to the sub-level. obtains the question data for the selected sub-level, and
             * also initializes the question count, if not already initialized
             */
            $scope.onSubLevelChange = function () {
                $scope.config.selectedConfig.itemData = ftEditorConfigService.getData(
                    $scope.config.selectedConfig.Grade,
                    $scope.config.selectedConfig.Level.Level,
                    $scope.config.selectedConfig.SubLevel.SubLevel)[0];
                if (!$scope.config.selectedConfig.QCount)
                    $scope.config.selectedConfig.QCount = 3;
            }

            /**
             * handles changes in "No. of Questions" from user
             * if user input is beyond the accepted ranges, sets it to max value possible i.e. 10
             */
            $scope.validateQCount = function () {
                if (_.isUndefined($scope.config.selectedConfig.QCount))
                    $scope.config.selectedConfig.QCount = 10
                else if ($scope.config.selectedConfig.QCount == null)
                    $scope.config.selectedConfig.QCount = 1;
            }

            /**
             * Handles the selection change on the Content Locale combo box
             */
            $scope.onContentLocalChange = function () {
                $scope.config.selectedConfig.contentLocale = $scope.locales.contentLocale.id;
            }

            /**
             * Handles the selection change on the Numerals Locale combo box
             */
            $scope.onNumeralLocaleChange = function () {
                $scope.config.selectedConfig.numeralLocale = $scope.locales.numeralLocale.id;
            }

            /**
             * initializes the configuration object based on the selected configuration, if any
             * @param {object} config the object with already selected values, if applicable
             */
            var initConfig = function (config) {
                $scope.questionType = ftEditorConfigService.getTypes()[0];
                $scope.Grades = ftEditorConfigService.getGrades();
                var gIndex = ecEditor._.findIndex($scope.Grades, function (g) {
                    return g == config.Grade
                });
                config.Grade = gIndex > -1 ? $scope.Grades[gIndex] : $scope.Grades[0];

                $scope.levels = ftEditorConfigService.getLevels(config.Grade);
                config.Level = config.Level ? ecEditor._.find($scope.levels, {
                        Level: config.Level.Level
                    }) :
                    $scope.levels[0];

                $scope.sublevels = ftEditorConfigService.getSubLevels(
                    config.Grade, config.Level.Level);
                config.SubLevel = config.SubLevel ?
                    ecEditor._.find($scope.sublevels, {
                        'SubLevel': config.SubLevel.SubLevel
                    }) : $scope.sublevels[0];

                config.itemData = ftEditorConfigService.getData(
                    config.Grade, config.Level.Level, config.SubLevel.SubLevel)[0];
                if (!config.QCount) config.QCount = 3;

                if ($scope.config.selectedConfig.showImmediateFeedback == undefined)
                    $scope.config.selectedConfig.showImmediateFeedback = true;
                if ($scope.config.selectedConfig.areVariablesStatic == undefined)
                    $scope.config.selectedConfig.areVariablesStatic = false;

                ecEditor.getAngularScope().$safeApply();
            }

            /**
             * initializes the directive upon load
             */
            var init = function () {
                $scope.iconImg = ecEditor.resolvePluginResource('org.ekstep.funtoot.common', '1.0', '/assets/ft-icon-2.png');
                $scope.dlgCloseIconImg = ecEditor.resolvePluginResource('org.ekstep.funtoot.common', '1.0', '/editor/assets/close.png');
                var templateLocales;
                $scope.locales = {
                    validLocales: []
                };
                ftEditorConfigService.getEditorConfigData($scope.config.configFile, null).then(function (response) {
                    $scope.config.selectedConfig = $scope.config.selectedConfig || {};
                    initConfig($scope.config.selectedConfig);
                    // retrieve the i18n data
                    ftI18nService.getData($scope.config.i18nFile).then(function (response) {
                        return response;
                    }).then(function (locales) {
                        templateLocales = locales;
                        return ftI18nService.getLocales();
                    }).then(function (response) {
                        var availableLocales = response;
                        ecEditor._.each(availableLocales, function (locData, i) {
                            ecEditor._.each(templateLocales, function (tl) {
                                if (locData.id == tl) $scope.locales.validLocales.push(availableLocales[i]);
                            });
                        });
                        var cl = 'en';
                        var nl = 'en';
                        if ($scope.config.selectedConfig) {
                            cl = $scope.config.selectedConfig.contentLocale || 'en';
                            nl = $scope.config.selectedConfig.numeralLocale || 'en';
                        }
                        $scope.locales.contentLocale = ecEditor._.find($scope.locales.validLocales, {
                            id: cl
                        }) || $scope.locales.validLocales[0];
                        $scope.config.selectedConfig.contentLocale = $scope.locales.contentLocale.id;
                        $scope.locales.numeralLocale = ecEditor._.find($scope.locales.contentLocale.numerals, {
                                id: nl
                            }) ||
                            $scope.locales.contentLocale.numerals[0];
                        $scope.config.selectedConfig.numeralLocale = $scope.locales.numeralLocale.id;
                        ecEditor.getAngularScope().$safeApply();
                    });
                });
            }();
        }
    };
}]);