//@ sourceURL= wscomposer-editor.js
'use strict';

angular.module('wscomposer', [])
    .controller('wscomposerController', ['$scope', '$injector', 'instance', '$http', function ($scope, $injector, instance, $http) {
        ecEditor.jQuery('.modal').addClass('item-activity');
        // var config = { "showStartPage": false, "showEndPage": false },
        var ctrl = this;
        // var itemIframe;

        ctrl.isAdvanceOptionOpen = true;
        ctrl.isMyQuestions = false;
        ctrl.errorMessage = false;
        ctrl.languagecode = 'en';
        ctrl.assessment = {};
        ctrl.activity = {
            'title': 'Word Problem',
            'qlevel': '',
            'qtype': '',
            'type': '',
            'question_id': '',
            'language': 'English',
            'gradeLevel': '',
            'conceptIds': []
        };
        if (instance.data == undefined) {
            instance.data = '';
        }
        if (ecEditor._.isUndefined(instance.data.questionnaire)) {
            ctrl.activityOptions = {
                title: "",
                shuffle: false,
                showImmediateFeedback: true,
                myQuestions: false,
                concepts: '(0) Concepts'
            };
        } else {
            ctrl.activityOptions = {
                title: instance.data.questionnaire.title,
                shuffle: instance.data.questionnaire.shuffle,
                showImmediateFeedback: instance.data.questionnaire.showImmediateFeedback,
                myQuestions: instance.data.questionnaire.myQuestions,
                concepts: instance.data.questionnaire.concepts
            };
            ctrl.cart = {
                "items": instance.data.questionnaire.items[instance.data.questionnaire.item_sets[0].id]
            };
            ctrl.isAdvanceOptionOpen = false;
            ctrl.activityOptions.total_items = ctrl.cart.items.length;
            ctrl.activityOptions.max_score = ctrl.activityOptions.total_items;
            ctrl.activityOptions.range = ecEditor._.times(ctrl.activityOptions.total_items).splice(1);
            ctrl.activityOptions.range.push(ctrl.activityOptions.total_items);
            ecEditor.jQuery('.displayCount .text').html(ctrl.activityOptions.total_items);
            ctrl.isItemAvailable = true;
            ctrl.itemsLoading = false;
            $scope.$safeApply();
        }
        ctrl.context = window.context;

        //get languages from languages api
        ecEditor.getService('language').getLanguages(function (err, respLan) {
            if (!err) {
                var assessmentlanguages = {};
                ecEditor._.forEach(respLan.data.result.languages, function (lang) {
                    assessmentlanguages[lang.code] = lang.name;
                });
                ctrl.assessment.language = ecEditor._.values(assessmentlanguages);
                //get questiontype, grade and difficulty dropdown values from definitions api
                ecEditor.getService('meta').getDefinitions('AssessmentItem', function (err, resp) {
                    if (!err) {
                        var questionTypes = {};
                        ecEditor._.forEach(resp.data.result.definition_node.properties, function (prop) {
                            switch (prop.propertyName) {
                                case "qlevel":
                                    ctrl.assessment.qlevel = prop.range;
                                    break;
                                case "gradeLevel":
                                    ctrl.assessment.gradeLevel = prop.range;
                                    break;
                                case "type":
                                    ctrl.assessment.type = prop.range;
                                    break;
                                case "qtype":
                                    ctrl.assessment.qtype = prop.range;
                            }
                        });
                        ctrl.assessment.qtype = {
                            "legacy-word-problem": "Legacy Word Problems",
                            "mcq": "Multiple Choice Questions",
                            "freeResponse": "Fill in the blanks",
                            "mdd": "Multiple Drop Down"
                        };

                        //get question type full defination from resource bundles api
                        ecEditor.getService('meta').getResourceBundles(ctrl.languagecode, function (err, resourceResp) {
                            if (!err) {
                                ecEditor._.forEach(ctrl.assessment.type, function (data) {
                                    if (resourceResp.data.result.en[data] == undefined) {
                                        questionTypes[data] = data;
                                    } else {
                                        questionTypes[data] = resourceResp.data.result.en[data];
                                    }
                                });
                                ctrl.assessment.type = questionTypes;
                                $scope.$safeApply();
                            } else {
                                ctrl.errorMessage = true;
                                $scope.$safeApply();
                                return;
                            }
                        });
                        ecEditor.jQuery('.ui.dropdown.lableCls').dropdown({
                            useLabels: false,
                            forceSelection: false
                        });
                    } else {
                        ctrl.errorMessage = true;
                        $scope.$safeApply();
                        return;
                    }
                });
            } else {
                ctrl.errorMessage = true;
                $scope.$safeApply();
                return;
            }
        });

        ctrl.searchQuestions = function () {
            var activity = ctrl.activity;
            ctrl.isItemAvailable = true;
            ctrl.itemsLoading = true;
            var data = {
                request: {
                    filters: {
                        objectType: ["AssessmentItem"],
                        status: [],
                    },

                    sort_by: {
                        "name": "desc"
                    },
                    limit: 200
                }
            };
            if (ctrl.activityOptions.myQuestions) {
                ctrl.isMyQuestions = true;
                data.request.filters.portalOwner = ecEditor._.isUndefined(ctrl.context) ? '' : ctrl.context.user.id;
            } else {
                ctrl.isMyQuestions = false;
            }
            // setting filters values and title to request data
            data.request.filters.author = "funtoot";
            ecEditor._.forEach(activity, function (value, key) {
                if (value) {
                    switch (key) {
                        case "question_title":
                            data.request.query = value;
                            break;
                        case "gradeLevel":
                            if (value.length) {
                                data.request.filters.gradeLevel = value;
                            }
                            break;
                        case "language":
                            data.request.filters.language = [value];
                            break;
                        case "qlevel":
                            data.request.filters.qlevel = value;
                            break;
                        case "qtype":
                            data.request.filters.qtype = value;
                            break;
                        case "type":
                            if (value.length) {
                                data.request.filters.type = value;
                            }
                            break;
                        case "concepts":
                            data.request.filters.concepts = value;
                            break;
                        case "question_id":
                            data.request.filters.IL_UNIQUE_ID = value.split(",");
                            break;
                        case "keywords":
                            if (value.length) {
                                data.request.filters.keywords = value;
                            }
                    }
                }
            });
            // get Questions from questions api
            ecEditor.getService('assessment').getQuestions(data, function (err, resp) {
                if (!err) {
                    ctrl.itemsLoading = false;
                    var item;
                    ctrl.items = [];
                    if (!resp.data.result.count || resp.data.result.count <= 0) {
                        ctrl.isItemAvailable = false;
                    } else {
                        ecEditor._.forEach(resp.data.result.items, function (value) {
                            if (!ecEditor._.isUndefined(value.template_id)) {
                                item = {};
                                item = value;
                                if (ecEditor._.findIndex(ctrl.cart.items, function (i) {
                                        return i.identifier === value.identifier
                                    }) === -1) {
                                    item.isSelected = false;
                                } else {
                                    item.isSelected = true;
                                }
                                ctrl.items.push(item);
                            }
                        });
                    }
                    ctrl.totalItems = ctrl.items.length;
                    if (instance.qCodes != undefined && instance.qCodes.length != 0) {
                        _.each(instance.qCodes, function (item) {
                            ctrl.cart.add(_.filter(ctrl.items, {
                                'code': item
                            })[0]);
                        });
                        delete instance["qCodes"];
                    }
                    $scope.$safeApply();
                } else {
                    ctrl.itemsLoading = false;
                    ctrl.errorMessage = true;
                    $scope.$safeApply();
                    return;
                }
            });
        };

        ctrl.cart = {
            "items": (ecEditor._.isUndefined(instance.data.questionnaire)) ? [] : instance.data.questionnaire.items[instance.data.questionnaire.item_sets[0].id],
            "getItemIndex": function (item) {
                return ecEditor._.findIndex(ctrl.items, function (i) {
                    return i.identifier === item.identifier
                });
            },
            "add": function (item) {
                this.items.push(item);
                var itemIndex = this.getItemIndex(item);
                ctrl.items[itemIndex].isSelected = true;
                $scope.$safeApply();
            },
            "remove": function (item) {
                ecEditor._.remove(this.items, function (cartItem) {
                    return item.identifier == cartItem.identifier;
                });
                var itemIndex = this.getItemIndex(item);
                if (itemIndex != -1) ctrl.items[itemIndex].isSelected = false;
                ecEditor.jQuery(".displayCount #total_items option[value='number:" + (parseInt(this.items.length + 1)) + "']").remove();
                ctrl.activityOptions.total_items = this.items.length;
                ecEditor.jQuery('.displayCount .text').html(ctrl.activityOptions.total_items);
                $scope.$safeApply();
            }
        };

        ctrl.addActivityOptions = function () {
            ctrl.isAdvanceOptionOpen = false;
            ctrl.activityOptions.count = ctrl.cart.items.length;
            ctrl.activityOptions.max_score = ctrl.activityOptions.total_items;
            ctrl.activityOptions.range = ecEditor._.times(ctrl.activityOptions.total_items).splice(1);
            ctrl.activityOptions.range.push(ctrl.activityOptions.total_items);
            ecEditor.jQuery('.displayCount .text').html(ctrl.activityOptions.total_items);
            $scope.$safeApply();
        };


        ctrl.addItemActivity = function () {
            if (ctrl.cart.items.length) {
                if (!ecEditor._.isUndefined(instance.callback)) {
                    var commoni18nFile = ecEditor.resolvePluginResource("org.ekstep.funtoot.common",
                        "1.0", '/editor/assets/i18n/en.json');
                    $http.get(commoni18nFile).then(function (response) {
                        $scope["common"] = {};
                        $scope.common["i18n"] = response.data;
                        _.each(ctrl.cart.items, function (item) {
                            var langId = JSON.parse(item.model).langId;
                            var i18nObj = JSON.parse(item.i18n);
                            i18nObj[langId] = Object.assign({}, $scope.common.i18n[langId], i18nObj[langId]);
                            var expressions = i18nObj[langId].EXPRESSIONS;
                            item.i18n = JSON.stringify(i18nObj);
                            var variables = {};
                            if (expressions && typeof (expressions) == "string") {
                                _.each(expressions.split(/\r?\n/), function (exp) {
                                    var tokens = exp.split('=');
                                    variables[tokens[0]] = tokens[1];
                                });
                                var item_model = JSON.parse(item.model);
                                item_model["variables"] = variables;
                                item.model = JSON.stringify(item_model);
                            }
                            item.model = JSON.parse(item.model);
                        });
                        instance.callback(
                            ctrl.cart.items
                        );
                        ctrl.cancel();
                    });
                }
            }
        }

        ctrl.cancel = function () {
            $scope.closeThisDialog();
        };

        ctrl.searchQuestions();
        ecEditor.dispatchEvent('org.ekstep.conceptselector:init', {
            element: 'assessmentConceptSelector',
            selectedConcepts: [], // All composite keys except mediaType
            callback: function (data) {
                ctrl.activityOptions.concepts = '(' + data.length + ') concepts selected';
                ctrl.activity.concepts = _.map(data, function (concept) {
                    return concept.id;
                });
                $scope.$safeApply();
                ctrl.searchQuestions();
            }
        });

        ctrl.generateTelemetry = function (data) {
            if (data) ecEditor.getService('telemetry').interact({
                "type": data.type,
                "subtype": data.subtype,
                "target": data.target,
                "pluginid": instance.manifest.id,
                "pluginver": instance.manifest.ver,
                "objectid": "",
                "stage": ecEditor.getCurrentStage().id
            })
        }
    }]);
//# sourceURL=wscomposer-editor.js