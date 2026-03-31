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



    getEnAksharaDetail: function(data, callback) {
        console.log("data");


       var req = {
            "request": {
                "filters": {
                    "language_id": ["en"],
                    "objectType": ["Word"],
                    "lemma": data,
                    "status": ["Live", "Draft"]
                }
            }
        }

        this.postFromService(this.syllableSearchURL() + 'v3/search', req, this.requestHeaders, callback);
    },

    /* checkIsVowel: function(data, callback) {
         this.getFromService(this.syllableSearchURL() + 'v1/varna/isvowel/' + data, this.requestHeaders, callback);
     }*/

    /* getOtherAksharaDetail: function(data, callback) {
         this.getFromService(this.syllableSearchURL() + 'v1/varna/isvowel/' + data, this.requestHeaders, callback);
     }*/

}));