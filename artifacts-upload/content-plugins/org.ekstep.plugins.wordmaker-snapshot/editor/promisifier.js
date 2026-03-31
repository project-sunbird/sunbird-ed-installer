/* istanbul ignore next: syllable search service */
org.ekstep.plugins.WordMaker.Promisifier = Class.extend({
    /**
     * Promisifier class to create promises and keep track of them
     * @constructs org.ekstep.plugins.WordMaker.Promisifier
     * @param  {class} $q angular service to handle promises
     */
    init: function($q) {
        this.$q = $q;
    },

    /**
     * creates promise for each api call
     * @memberof org.ekstep.plugins.WordMaker.Promisifier#
     * @param {Function} method makes an api callback
     * @param {object} rquestObj it is request object
     * @returns {Function} promise - a promise function
     */
    promisify: function(method, rquestObj) {
        var deferer = this.$q.defer();
        method(rquestObj, function(err, data) {
            if (err) {
                deferer.reject(err);
            } else {
                deferer.resolve(data);
            }
        });
        return deferer.promise;
    },

    /**
     * Maps callback for each promise
     * @private
     * @memberof org.ekstep.plugins.WordMaker.Promisifier#
     * @param {Array} obj an array of promises or a promise object
     * @param {Function} callback a callback function
     * @return {object} ret - an object with all promises and respective callbacks
     */
    _mapValues: function(obj, callback) {
        if (angular.isArray(obj))
            return obj.map(callback);

        /* istanbul ignore next  */
        var ret = {};
        /* istanbul ignore next  */
        Object.keys(obj).forEach(function(key) {
            ret[key] = callback(obj[key], key);
        });
        /* istanbul ignore next  */
        return ret;
    },

    /**
     * Checks if all promises are settled
     * @memberof org.ekstep.plugins.WordMaker.Promisifier#
     * @param {Array} promises an array of promises or a promise object
     * @return {object} object- an object with state as fulfilled or rejected and corresponding values
     */
    allSettled: function(promises) {
        var instance = this;
        return this.$q.all(instance._mapValues(promises, function(promiseOrValue) {
            /* istanbul ignore if  */
            if (!promiseOrValue.then)
                return { state: 'fulfilled', value: promiseOrValue };

            return promiseOrValue.then(function(value) {
                return { state: 'fulfilled', value: value };
            }, function(reason) {
                return { state: 'rejected', reason: reason };
            });

        }));
    }

});

/**
 * Creates Promisifier instance
 * @memberof org.ekstep.plugins.WordMaker.Promisifier
 * @param  {class} $q service to handle promises
 * @returns {class} Promisifier - instance of Promisifier
 */
org.ekstep.plugins.WordMaker.Promisifier.create = function($q) {
    return new org.ekstep.plugins.WordMaker.Promisifier($q);
}

//# sourceURL=WordMakerPromisifier.js