/**
 *
 * Language service helps to get languages and wordnet data.
 * @class org.ekstep.services.languageService
 * @author Santhosh Vasabhaktula <santhosh@ilimi.in>
 *
 */
org.ekstep.services.relatedSearchService = new(org.ekstep.services.iService.extend({
    /**
     * @member {string} learningURL
     * @memberof org.ekstep.services.languageService
     */
    learningURL: function() {
        return this.getBaseURL() + this.getAPISlug() + this.getConfig('learningEndPoint', '/learning');
    },
    /**
     * @member {string} languageURL
     * @memberof org.ekstep.services.languageService
     */
    languageURL: function() {
        return this.getBaseURL() + this.getAPISlug() + this.getConfig('languageEndPoint', '/language');
    },

    getRelatedWords: function(wordId, lemma, relation, language, callback) {
        var url = this.languageURL() + "/v3/synsets/read/" + wordId+"?language_id="+language;
        var self = this;
        self.relation = relation;
        self.relatedLemmas = [];
        this.getFromService(url, this.requestHeaders, function(err, res){

            switch(self.relation){
                case 'synonyms':
                    self.relatedLemmas = _.map(res.data.result.Synset.synonyms,'name');
                break;
                case 'antonyms':
                    self.relatedLemmas = _.map(res.data.result.Synset.antonyms,'name');
                break;
                case 'parts':
                    self.relatedLemmas = _.map(res.data.result.Synset.objects,'name');
                break;
                case 'action':
                    self.relatedLemmas = _.map(res.data.result.Synset.actions,'name');
                break;
            }

            self.relatedLemmas.forEach(function(word, i){ self.relatedLemmas[i] = self.relatedLemmas[i].toLowerCase()});
            var indexOfDuplicate = self.relatedLemmas.indexOf(lemma);
            indexOfDuplicate != -1?self.relatedLemmas.splice(indexOfDuplicate, 1):0;

            if(self.relatedLemmas.length){
                self.getWordsData(callback);
            }
        });
    },

    getWordsData: function(callback){
        var self = this;
        var data = {
                "request": {
                    "filters": {
                        "objectType": ["word"],
                        "graph_id": "en",
                        "status": ["Live"],
                        "lemma": self.relatedLemmas
                    },
                    "sort_by": { "lemma": "asc" }
                }
            };
        var searchService = org.ekstep.contenteditor.api.getService(ServiceConstants.SEARCH_SERVICE);
        searchService.search(data, function(err, response) {
            callback(err, response.data.result.words);
        });
    }

}));