//@ sourceURL=ftEditorConfigSvc.js
/**
 * Editor Configuration Service - shared by editor plugins for providing common
 * functionality of displaying grade, level and sub-level for configuring funtoot templates.
 *
 * @author Sandhya M (sandhya.m@funtoot.com)
 */
var ftEditorServices = angular.module('ftEditorServices', []);

/**
 * Service: ftEditorConfigService
 * this is a common services used to read the configuration Json file and processing it to get
 * the required data such as question type, grade, level, sub-level, etc...
 * @param {object} $rootScope the root scope
 * @param {object} $http the $http service
 * @param {object} $filter the $filter service
 * @param {object} $timeout the $timeout service
 * @return {object} the service
 */
ftEditorServices.factory('ftEditorConfigService', ['$rootScope', '$http', '$filter', '$timeout', function ($rootScope, $http, $filter, $timeout) {
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
                return $timeout(function () {
                    return jsonData;
                });
            }
            else {
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
            var filtered = ecEditor._.filter(jsonData, function (e) {
                return e.Type == type;
            });
            var gVals = ecEditor._.map(filtered, 'Grade');
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
        getLevels: function (type, grade) {
            var filtered = $filter('filter')(jsonData, { "Type": type, "Grade": grade });
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
        getSubLevels: function (type, grade, level) {
            var filtered = $filter('filter')(jsonData, { "Type": type, "Grade": grade, "Level": level });
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
        getData: function (type, grade, level, sublevel) {
            var filtered = $filter('filter')(jsonData, { "Type": type, "Grade": grade, "Level": level, "SubLevel": sublevel });
            //return ecEditor._.map(filtered, 'Description');
            return filtered;
        }
    }
}]);
