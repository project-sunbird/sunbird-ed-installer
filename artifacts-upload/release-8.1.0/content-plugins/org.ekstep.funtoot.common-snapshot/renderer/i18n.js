//@ sourceURL=i18n.js
/**
 * Common plugin for internationalization (i18n)
 * @extends Plugin
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
    _type: 'i18n',
    /**
     * initializes the plugin
     * @param {object} data the data for the plugin
     */
    initPlugin: function (data) {
        // save the data in the instance
        this.data = data.data;
        this.config = data.config;
    },
    /**
     * returns the string for the specified id
     */
    translate: function (id) {
        return this.data[this.config.langId][id];
    },

    numeralsMap: {
        "en": {
            0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9"
        },
        "tn": {
            0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9"
        }
    }
});
