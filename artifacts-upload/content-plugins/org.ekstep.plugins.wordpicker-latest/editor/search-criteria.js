org.ekstep.plugins.WordPicker.SearchCriteria = Class.extend({
    /**
     * @private
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @member {Class} _languageService instance of language Service
     */
    _languageService: undefined,

    /**
     * @private
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @member {Boolean} _selectAllCategory used to select and remove all category in one click
     */
    _selectAllCategory: false,

    /**
     * @private
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @member {Boolean} _selectAllPos used to select and remove all pos in one click
     */
    _selectAllPos: false,
    _noFilterMetaData: "Filters meta data are not available !",

    /**
     * SearchCriteria to manage all search criteria in word picker
     * @constructs org.ekstep.plugins.WordPicker.SearchCriteria
     * @param  {Class} languageService instance of language Service
     * @param  {Object} callBacks an object containing callbacks
     * @param  {Class} wordDuniya instance of wordDuniya
     */

    init: function(languageService, callBacks, wordDuniya) {
        this._languageService = languageService;
        this._updateFilter = callBacks.updateValues;
        this._updateErrors = callBacks.updateErrors;
        this._wordDuniya = wordDuniya;
        this._filter = { wordPattern: "exact", categoryList: [], posList: [], syllableCount: { min: 1, max: 50, equal: 1 }, syllableCountOption: 'any' };
    },



    /**
     * Makes api call to get filter meta data
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     */
    getWordDefinition: function() {
        var self = this;
        this._languageService.getWordDefinition(function(err, res) {
            if (!err && res.data.responseCode == "OK") {
                var properties = res.data.result.definition_node.properties;
                var category = _.find(properties, function(property) {
                    return property.propertyName == "category";
                });
                var pos = _.find(properties, function(property) {
                    return property.propertyName == "pos";
                });
                self._filter.categoryList = category ? _.map(category.range, function(value) {
                    return { name: value, selected: false }
                }) : [];
                self._filter.posList = pos ? _.map(pos.range, function(value) {
                    return { name: value, selected: false }
                }) : [];
                self._wordDuniya.updateSourceErrors(self._wordDuniya, self._noFilterMetaData, false);
            } else {
                self._wordDuniya.updateSourceErrors(self._wordDuniya, self._noFilterMetaData, true);
            }
            self._wordDuniya._updateErrors();
            self._updateFilter();
        });
    },

    /**
     * Creates 'Exact Word' filter request object as per selected option by user
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @param {String} text user input in search field to search a word or words
     * @returns {Object} exactWordFilter - filter object with either one option (Starts With, Ends With, Contains)
     */
    getLemma: function(text) {
        var exactWordFilter;
        switch (this._filter.wordPattern) {
        case 'start':
            exactWordFilter = { startsWith: text };
            break;
        case 'end':
            exactWordFilter = { endsWith: text };
            break;
        case 'contains':
            exactWordFilter = { value: text };
            break;
        default:
            exactWordFilter = text;
        }
        return exactWordFilter;
    },

    /**
     * Provides selected categories by user
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @returns {Array} array - selected categories name
     */
    getCategory: function() {
        var self = this;
        return _.map(_.reject(self._filter.categoryList, function(category) {
            return category.selected === false;
        }), function(category) {
            return category.name;
        });
    },

    /**
     * Provides selected part of speech by user
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @returns {Array} array - selected part of speech name
     */
    getPos: function() {
        var self = this;
        return _.map(_.reject(self._filter.posList, function(pos) {
            return pos.selected === false;
        }), function(pos) {
            return pos.name;
        });
    },

    /**
     * Provides number of letters given by user as range (min, max) or an exact number
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @returns {Object/Number} syllableCount - a number or an object
     */
    getSyllableCount: function() {
        var syllableCount = {};
        switch (this._filter.syllableCountOption) {
        case 'range':
            syllableCount['>='] = this._filter.syllableCount.min;
            syllableCount['<='] = this._filter.syllableCount.max;
            break;
        case 'equal':
            syllableCount = this._filter.syllableCount.equal;
            break;
        default:
            syllableCount = { ">=": 1 };
        }
        return syllableCount;
    },

    /**
     * Select and Remove all options of a given filter
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @param {String} filterName name of the filter
     */
    selectAll: function(filterName) {
        var self = this;
        switch (filterName) {
        case 'category':
            _.each(this._filter.categoryList, function(category) {
                category.selected = self._selectAllCategory;
            });
            break;
        case 'pos':
            _.each(this._filter.posList, function(pos) {
                pos.selected = self._selectAllPos;
            });
            break;
        }
    },

    /**
     * Updates select all checkbox of given filter based on all option status of respective filter
     * @memberof org.ekstep.plugins.WordPicker.SearchCriteria#
     * @param {String} filterName name of the filter
     */
    updateSelectAll: function(filterName) {
        switch (filterName) {
        case 'category':
            this._selectAllCategory = _.find(this._filter.categoryList, function(category) {
                return category.selected === false;
            }) ? false : true;
            break;
        case 'pos':
            this._selectAllPos = _.find(this._filter.posList, function(pos) {
                return pos.selected === false;
            }) ? false : true;
            break;
        }
    }
});

/**
 * creates SearchCriteria instance
 * @memberof org.ekstep.plugins.WordPicker.SearchCriteria
 * @param  {class} languageService language service containing language apis
 * @param  {Object} callBacks an object having multiple callback functions
 * @param  {Class} wordDuniya instance of wordDuniya
 * @returns {class} SearchCriteria - instance of SearchCriteria
 */
org.ekstep.plugins.WordPicker.SearchCriteria.create = function(languageService, callBacks, wordDuniya) {
    return new org.ekstep.plugins.WordPicker.SearchCriteria(languageService, callBacks, wordDuniya);
}

//# sourceURL=wordPickerSearchCriteria.js
