//@ sourceURL=ftEditorAppIb.js
/**
 * funtoot Editor App and related services, controllers and Directives
 * - shared by editor plugins for providing common functionality of configuring funtoot templates.
 *
 * @author Sandhya M (sandhya.m@funtoot.com)
 */
var ftEditorAppIb = angular.module('ftEditorAppIb', []);

/**
 * Service: ftItemBankConfigService
 * this is a common services used to read the configuration Json file and processing it to get
 * the required data such as question type, grade, level, sub-level, etc...
 * @param {object} $http the $http service
 * @param {object} $filter the $filter service
 * @return {object} the service
 */
ftEditorAppIb.factory('ftItemBankConfigService', ['$http', '$filter', function ($http, $filter) {
    var jsonData = null;
    var types = [];

    /**
     * The configuration file
     */
    var _filtersFile = '';

    return {
        /**
         * Returns the editor configuration data as read from the JSON file
         * @param {string} file the JSON configuration file
         * @returns {object} the promise that will return the editor configuration data
         */
        getEditorConfigData: function (data, file, fn) {
            if (_filtersFile == file && jsonData) {
                fn(jsonData);
            } else {
                // get Questions from questions api
                return ecEditor.getService('assessment').getQuestions(data, function (err, resp) {
                    if (!err) {
                        jsonData = resp.data.result.items;
                        _filtersFile = file;
                        ecEditor._.each(jsonData, function (item, index) {
                            if (typeof (item.i18n) == 'string')
                                item.i18n = JSON.parse(item.i18n);
                            if (!_.isArray(item.grade))
                                item.grade = [item.grade.toString()];
                        });
                        fn(jsonData);
                    } else {
                        console.log("Error on loading questions", err);
                        return;
                    }
                });
            }
        },
        /**
         * returns the unique grades
         * @returns {string[]} the unique grades avaialble in the configuration
         */
        getLanguages: function () {
            var languages = [];
            return ecEditor._.reduce(jsonData, function (languages, item, index) {
                var itemLangs = ecEditor._.keys(item.i18n);
                return ecEditor._.union(languages, itemLangs);
            }, []);
        },

        /**
         * returns the unique grades
         * @returns {string[]} the unique grades avaialble in the configuration
         */
        getGrades: function (lang) {
            var grades = [];
            return ecEditor._.reduce(jsonData, function (grades, item, index) {
                grades = _.sortBy(grades, function (g) {
                    return g
                });
                return (item.i18n[lang]) ? ecEditor._.union(grades, item.grade) : grades;
            }, []);
        },
        /**
         * returns the levels for the language and grade
         * @param {string} lang the language for which levels are to be returned
         * @param {string} grade the grades for which levels are to be returned
         * @returns {object[]} the distinct levels for the type and grade
         */
        getLevels: function (lang, grade) {
            var filtered = ecEditor._.filter(jsonData, function (item) {
                return (item.i18n[lang] && item.grade.indexOf(grade) > -1);
            });
            return ecEditor._.uniqBy(ecEditor._.map(filtered, function (item) {
                return {
                    level: item.level,
                    levelDesc: item.bloomsTaxonomyLevel
                }
            }), 'level');
        },

        /**
         * returns the sub-levels for the specified type, grade and level
         * @param {string} lang the language
         * @param {string} grade the grade
         * @param {string} level the level
         * @returns {object[]} the unique Sub levels for the type, grade and level
         */
        getSubLevels: function (lang, grade, level) {
            var filtered = ecEditor._.filter(jsonData, function (item) {
                return (item.i18n[lang] && item.grade.indexOf(grade) > -1 && item.level == level);
            });
            return ecEditor._.uniqBy(ecEditor._.map(filtered, function (item) {
                return {
                    subLevel: item.sublevel,
                    subLevelDesc: 'Difficulty Level ' + item.sublevel
                }
            }), 'subLevel');
        },

        /**
         * returns all the configuration objects that match type, grade, level and sub-level
         * @param {string} lang the language
         * @param {string} grade the grade
         * @param {string} level the level
         * @param {string} sublevel the Sub-level
         * @returns {object} the data corresponding to the specified type, grade, level and sublevel
         */
        getData: function (lang, grade, level, sublevel) {
            var filtered = ecEditor._.filter(jsonData, function (item) {
                return (item.i18n[lang] && item.grade.indexOf(grade) > -1 && item.level == level && item.sublevel == sublevel);
            });
            return filtered;
        }
    }
}]);

/**
 * Service: ftI18nIbService
 * this is a common services for reading the i18n configuration data for the editor
 * @param {object} $http the $http service
 * @return {object} the service
 */
ftEditorAppIb.factory('ftI18nIbService', ['$http', function ($http) {
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
                return $http.get(file).then(function (response) {
                    _file = file;
                    _i18nData = response.data;
                    return _i18nData;
                });
                _i18nData = i18n;
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
 * Directive ft-wiz which encapsulates the functionality associated with the Editor Configuration Wizard (Dialog)
 */
ftEditorAppIb.directive('ftIbWizard', ['$sce', '$timeout', 'ftItemBankConfigService', 'ftI18nIbService', function ($sce, $timeout, ftItemBankConfigService, ftI18nIbService) {
    return {
        /**
         * Returns the template URL for the directive
         * @param {object} the JQuery element to which the directive is attached
         * @param {object} the map of the attributes and the values for the $element
         * @returns {object} the sanitized url of the wizard template HTML file
         */
        templateUrl: function ($element, $attrs) {
            return $sce.trustAsResourceUrl(ecEditor.resolvePluginResource('org.ekstep.funtoot.common',
                '1.0', '/editor/wizardtemplateib.html'));
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
            var itemIframe = org.ekstep.contenteditor.jQuery('#funtootCommonPreviewFrame')[0];
            jQuery(itemIframe).on('load', function () {
                console.log('-----loaded!!!!!!!')
                $scope.previewInProgress = false;
            });
            /**
             * Watch for immediate feedback flag
             */
            $scope.$watch('[config.selectedConfig, locales]', function (newValue, oldValue, scope) {
                if (newValue) {
                    if (newValue[0].showImmediateFeedback != undefined && typeof newValue[0].showImmediateFeedback == 'boolean') {
                        $scope.config.selectedConfig.showImmediateFeedback = newValue[0].showImmediateFeedback;
                        $scope.config.selectedConfig.areMicrohintsEnabled = newValue[0].showImmediateFeedback;
                        $scope.config.selectedConfig.enableFeedback = newValue[0].showImmediateFeedback;
                        $scope.config.selectedConfig.enableSolution = newValue[0].showImmediateFeedback;
                        $scope.config.selectedConfig.enableHint = newValue[0].showImmediateFeedback;
                        $scope.config.selectedConfig.retainAnswers = true;
                        $scope.config.selectedConfig.maxNoOfAtt = newValue[0].showImmediateFeedback ? 2 : 1;
                    }
                    $scope.showPreview();
                }
            }, true);
            /**
             * Invokes funtoot common preview (ftEditorPreview.js) to display the preview inside Editor
             * for the selected grade
             */
            $scope.showPreview = function () {
                if ($scope.config.i18nData) {
                    $timeout(function () {
                        if ($scope.previewInProgress) return;
                        $scope.previewInProgress = true;
                        $scope.$parent.constructQuestions().then(function (questions) {
                            var questionSet = {
                                items: questions,
                                config: {}
                            };
                            questionSet.config.title = $scope.config.i18nData[$scope.locales.contentLocale.id].QUESTION_TITLE,
                                questionSet.config.count = $scope.config.selectedConfig.QCount
                            questionSet.config.selectedConfig = $scope.config.selectedConfig;
                            questionSet.config.isQa = $scope.config.isQa;
                            var itemObj = $scope.$parent.instance.getItemDataAndConfig(questionSet);
                            var _assessmentData = {
                                data: {
                                    __cdata: JSON.stringify(itemObj.data)
                                },
                                config: {
                                    __cdata: JSON.stringify(itemObj.config)

                                },
                            };
                            funtootCommonPluginPreview($scope.$parent.instance.manifest.id, _.cloneDeep(_assessmentData), _.cloneDeep(org.ekstep.contenteditor.stageManager.currentStage))

                        });
                    });
                }
            }
            /**
             * Handles when the grade combo box selection is changed. It loads the levels applicable
             * for the selected grade
             */
            $scope.onGradeChange = function () {
                $scope.levels = ftItemBankConfigService.getLevels($scope.config.selectedConfig.contentLocale, $scope.config.selectedConfig.Grade);
                $scope.config.selectedConfig.Level = $scope.levels[0];
                $scope.onLevelChange();
            }
            /**
             * handles the change of levels. It loads the sub-level corresponding to the selected level
             */
            $scope.onLevelChange = function () {
                $scope.sublevels = ftItemBankConfigService.getSubLevels($scope.config.selectedConfig.contentLocale, $scope.config.selectedConfig.Grade, $scope.config.selectedConfig.Level.level);
                $scope.config.selectedConfig.SubLevel = $scope.sublevels[0];
                $scope.onSubLevelChange();
            }
            /**
             * handles changes to the sub-level. obtains the question data for the selected sub-level, and
             * also initializes the question count, if not already initialized
             */
            $scope.onSubLevelChange = function () {
                var items = ftItemBankConfigService.getData(
                    $scope.config.selectedConfig.contentLocale,
                    $scope.config.selectedConfig.Grade,
                    $scope.config.selectedConfig.Level.level,
                    $scope.config.selectedConfig.SubLevel.subLevel);
                $scope.config.selectedConfig.itemsData = items;
                //   if (!$scope.config.selectedConfig.QCount)
                //$scope.config.selectedConfig.itemsData = items;
                $scope.config.selectedConfig.QCount = $scope.config.selectedConfig.itemsData.length;
            }

            /**
             * handles changes in "No. of Questions" from user
             * if user input is beyond the accepted ranges, sets it to max value possible
             */
            $scope.validateQCount = function () {
                if (_.isUndefined($scope.config.selectedConfig.QCount))
                    $scope.config.selectedConfig.QCount = $scope.config.selectedConfig.itemsData.length
                else if ($scope.config.selectedConfig.QCount == null)
                    $scope.config.selectedConfig.QCount = 1;
            }

            /**
             * Handles the selection change on the Content Locale combo box
             */
            $scope.onContentLocalChange = function () {
                $scope.config.selectedConfig.contentLocale = $scope.locales.contentLocale.id;
                $scope.Grades = ftItemBankConfigService.getGrades($scope.config.selectedConfig.contentLocale);
                $scope.config.selectedConfig.Grade = $scope.Grades[0];
                $scope.onGradeChange();
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
                $scope.languages = ftItemBankConfigService.getLanguages();
                var lIndex = ecEditor._.findIndex($scope.languages, function (g) {
                    return g == config.language
                });
                config.language = gIndex > -1 ? $scope.languages[gIndex] : $scope.languages[0];

                $scope.Grades = ftItemBankConfigService.getGrades(config.language);
                var gIndex = ecEditor._.findIndex($scope.Grades, function (g) {
                    return g == config.Grade
                });
                config.Grade = gIndex > -1 ? $scope.Grades[gIndex] : $scope.Grades[0];

                $scope.levels = ftItemBankConfigService.getLevels(config.language, config.Grade);
                config.Level = config.Level ? ecEditor._.find($scope.levels, {
                        'level': config.Level.level
                    }) :
                    $scope.levels[0];

                $scope.sublevels = ftItemBankConfigService.getSubLevels(
                    config.language, config.Grade, config.Level.level);
                config.SubLevel = config.SubLevel ?
                    ecEditor._.find($scope.sublevels, {
                        'subLevel': config.SubLevel.subLevel
                    }) : $scope.sublevels[0];

                config.itemsData = ftItemBankConfigService.getData(config.language, config.Grade, config.Level.level, config.SubLevel.subLevel);
                config.QCount = config.itemsData.length;
                if ($scope.config.selectedConfig.showImmediateFeedback == undefined)
                    $scope.config.selectedConfig.showImmediateFeedback = true;
                if ($scope.config.selectedConfig.areVariablesStatic == undefined)
                    $scope.config.selectedConfig.areVariablesStatic = false;
                ecEditor.getAngularScope().$safeApply();
            }
            /**
             * checks if the content is on QA or Production
             * @returns true if QA
             */
            var isQa = function () {
                // if (org.ekstep.contenteditor.config.absURL.includes("qa.ekstep.in")) return true;
                //if (org.ekstep.developer) return true;
                //else 
                return false;
            }

            /**
             * initializes the directive upon load
             */
            $scope.$on('ft-get-itembank-questions', function (event, args) {
                $scope.config.filterData = {
                    request: {
                        filters: {
                            objectType: ["AssessmentItem"],
                            status: [],
                        },
                        sort_by: {
                            "name": "desc"
                        },
                        limit: 500
                    }
                };
                $scope.config.filterData.request.filters = angular.extend($scope.config.filterData.request.filters, args.filters);

                if (isQa())
                    $scope.config.filterData.request.filters.state = ['Verified', 'Published', 'Ready For Publish', 'Reviewed', 'In-Review', 'Draft'];
                else
                    $scope.config.filterData.request.filters.state = 'Verified';
                $scope.iconImg = ecEditor.resolvePluginResource('org.ekstep.funtoot.common', '1.0', '/assets/ft-icon-2.png');
                $scope.dlgCloseIconImg = ecEditor.resolvePluginResource('org.ekstep.funtoot.common', '1.0', '/editor/assets/close.png');

                $scope.locales = {
                    validLocales: []
                };
                ftItemBankConfigService.getEditorConfigData($scope.config.filterData, args.file, function (response) {
                    $scope.config.allItems = response;
                    $scope.config.selectedConfig = $scope.config.selectedConfig || {};
                    initConfig($scope.config.selectedConfig);
                    $scope.config.isQa = isQa();
                    ftI18nIbService.getData($scope.config.i18nFile).then(function (response) {
                        $scope.config.i18nData = response;
                        return $scope.languages;
                    }).then(function (locales) {
                        templateLocales = locales;
                        return ftI18nIbService.getLocales();
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
                        $scope.config.selectedConfig.Type = $scope.config.i18nData[$scope.config.selectedConfig.contentLocale].QUESTION_TITLE
                        ecEditor.getAngularScope().$safeApply();
                        $scope.showPreview();
                    });
                });
            });
        }
    };
}]);