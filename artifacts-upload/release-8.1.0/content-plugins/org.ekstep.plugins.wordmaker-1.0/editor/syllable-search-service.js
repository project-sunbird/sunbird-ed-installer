/* istanbul ignore next: syllable search service */
org.ekstep.services.SyllableSearchService = new(org.ekstep.services.iService.extend({

    syllableSearchURL: function() {
        return this.getBaseURL() + this.getAPISlug() + '/language/';
    },

    requestHeaders: {
        "headers": {
            "content-type": "application/json",
            "user-id": "content-editor"
        }
    },

    getSyllables: function(data, callback) {
        this.postFromService(this.syllableSearchURL() + '/v3/varnas/syllables/list', data, this.requestHeaders, callback);
    }
}));
