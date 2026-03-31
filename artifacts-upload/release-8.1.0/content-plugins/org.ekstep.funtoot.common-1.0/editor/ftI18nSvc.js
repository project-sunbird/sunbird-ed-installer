//@ sourceURL=ftI18nSvc.js
/**
 * Angular service for i18n.
 * Retrieves the i18n data from a set of JSON files and returns to the caller
 */
var ftEditori18nServices = angular.module('ftEditori18nServices', []);

ftEditori18nServices.factory('ftI18nService', ['$http', '$timeout', function ($http, $timeout) {
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
         */
        getData: function (file) {
            // If the data is already available, just return (a promise)
            if (_file == file && _i18nData) {
                return Promise.resolve(_i18nData);
            }
            else {
                // read the file specified by the caller, then read the common i18n file, and
                // merge both the data to include common strings with the plugin specific data.
                var res1;
                return $http.get(file).then(function (response) {
                    _file = file;
                    _i18nData = response.data;
                    return _i18nData;
                });
                /*.then(function (resp1) {
                    res1 = resp1.data;
                    return $http.get('/plugins/org.ekstep.funtoot.common-1.0/editor/i18n.json.js');
                }).then(function (resp2) {
                    _i18nData = ecEditor._.merge({}, res1, resp2.data);
                    return _i18nData;
                });*/
            }
        },
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
