var playServices = new(Class.extend({

initializer: function(){
org.ekstep.services.languageService.requestHeaders = {
        "headers": {
            "content-type": "application/json",
            "user-id": "ideaphora",
            //"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYTQ4Y2FkYzlmMWU0ZDQ5ODQ3NDk3YzM5M2I4MmU4OCIsImlhdCI6bnVsbCwiZXhwIjpudWxsLCJhdWQiOiIiLCJzdWIiOiIifQ.n4VYM6jT8EyXdAllyeEqXKmgmStVTePZEtdkBjt-8iU" //working version
            //"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIyYmQ0Njg2YzlmNTM0NzM4ODE2NGUzOTlhMzk0OGQ2OCIsImlhdCI6MTUwOTk4MzExMiwiZXhwIjoxNTQxNTE5MTEyLCJhdWQiOiJjb21tdW5pdHkuZWtzdGVwLmluIiwic3ViIjoiaWRlYXBob3JhIiwiR2l2ZW5OYW1lIjoiUmFtYWtyaXNobmFuIiwiU3VybmFtZSI6IksiLCJFbWFpbCI6InJhbWFrcmlzaG5hbkBpZGVhcGhvcmEuY29tIiwiUm9sZSI6WyJNYW5hZ2VyIiwiUHJvamVjdCBBZG1pbmlzdHJhdG9yIl19.V3ZBOVUHoKZVMa1VaS3FcniUIk7GSy1MdSWX7axXOaY"
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1Njc0NWQyYzY0ZDM0NmM5YTdkYWZlNGJjMzFjMmJkNCIsImlhdCI6bnVsbCwiZXhwIjpudWxsLCJhdWQiOiIiLCJzdWIiOiIifQ.cZ9oRiLNB1vMzVbGd_vKBJGlvXXZD5FapKuOoRWkYCA"
        }
     }
     org.ekstep.services.languageService.wordHeaders = org.ekstep.services.languageService.requestHeaders; 
},

getRelatedWords: function(data, language, callback) {
  var connectedWord = new Object();
  var cb = callback;

  this.initializer();
  org.ekstep.services.languageService.getWords(data,function(err,res) {
    var resul=JSON.parse(JSON.stringify(res));
    if (err != null ) {
      cb(err,null);
    } else if ( (resul.data.result.count == undefined) || (resul.data.result.count == 0) ) {
      cb("no related words found", null);
    } else {
      if ( (resul.data.result.words[0].synonyms != null) && 
           (resul.data.result.words[0].synonyms.length > 0) ) {
        synList = JSON.parse(JSON.stringify(resul.data.result.words[0].synonyms));

        connectedWord.synonyms=[];
        connectedWord.antonyms=[];
        connectedWord.hypernyms = [];
        connectedWord.hyponyms = [];
        connectedWord.holonyms = [];
        connectedWord.meronyms = [];
        connectedWord.troponyms = [];
        connectedWord.entailments = [];
        connectedWord.translations = [];
        connectedWord.themes = [];

        var innercount=synList.length;
        for(var i in synList) {
          playServices.getSynsetDetails(synList[i],language,function(err,res) {
            var r=JSON.parse(JSON.stringify(res));
            if(err == null && r.data.result.Synset != null) {
              if (r.data.result.Synset.synonyms != undefined) {
                connectedWord.synonyms=connectedWord.synonyms.concat(r.data.result.Synset.synonyms);
              }
              if (r.data.result.Synset.antonyms != undefined) {
                connectedWord.antonyms=connectedWord.antonyms.concat(r.data.result.Synset.antonyms);
              }
              if (r.data.result.Synset.hypernyms != undefined) {
                connectedWord.hypernyms = connectedWord.hypernyms.concat(r.data.result.Synset.hypernyms);
              }
              if (r.data.result.Synset.hyponyms != undefined) {
                connectedWord.hyponyms = connectedWord.hyponyms.concat(r.data.result.Synset.hyponyms);
              }
              if (r.data.result.Synset.holonyms != undefined) {
                connectedWord.holonyms = connectedWord.holonyms.concat(r.data.result.Synset.holonyms);
              }
              if (r.data.result.Synset.meronyms != undefined) {
                connectedWord.meronyms = connectedWord.meronyms.concat(r.data.result.Synset.meronyms);
              }
              if (r.data.result.Synset.troponyms != undefined) {
                connectedWord.troponyms = connectedWord.troponyms.concat(r.data.result.Synset.troponyms);
              }
              if (r.data.result.Synset.entailments != undefined) {
                connectedWord.entailments = connectedWord.entailments.concat(r.data.result.Synset.entailments);
              }
              if (r.data.result.Synset.translations != undefined) {
                connectedWord.translations = connectedWord.translations.concat(r.data.result.Synset.translations);
              }
              if (r.data.result.Synset.keywords != undefined) {
                connectedWord.themes = connectedWord.themes.concat(r.data.result.Synset.keywords);
              }
            }
            innercount--;
            if(innercount <1) {
              //eliminate duplicates for each category.
              connectedWord.synonyms=playServices.eliminateDuplicateObjects(connectedWord.synonyms, data.request.filters.lemma);
              connectedWord.antonyms=playServices.eliminateDuplicateObjects(connectedWord.antonyms, data.request.filters.lemma);
              connectedWord.hypernyms=playServices.eliminateDuplicateObjects(connectedWord.hypernyms, data.request.filters.lemma);
              connectedWord.hyponyms=playServices.eliminateDuplicateObjects(connectedWord.hyponyms, data.request.filters.lemma);
              connectedWord.holonyms=playServices.eliminateDuplicateObjects(connectedWord.holonyms, data.request.filters.lemma);              
              connectedWord.meronyms=playServices.eliminateDuplicateObjects(connectedWord.meronyms, data.request.filters.lemma);
              connectedWord.troponyms=playServices.eliminateDuplicateObjects(connectedWord.troponyms, data.request.filters.lemma);
              connectedWord.entailments=playServices.eliminateDuplicateObjects(connectedWord.entailments, data.request.filters.lemma);
              connectedWord.translations=playServices.eliminateDuplicateObjects(connectedWord.translations, data.request.filters.lemma);
              connectedWord.themes=playServices.eliminateDuplicateObjects(connectedWord.themes, data.request.filters.lemma);
              playServices.getTranslations(language,data.request.filters.lemma,function(err,res) {
                if (err == null) {
                  connectedWord.translations=res;
                }
                cb(null, connectedWord);
              });
            }
          });
        }//end of for
      }
    }
  });
},

eliminateDuplicateObjects: function(listOfObjects, objToDelete) {
  var objMap=new Map(listOfObjects.map((i) => [i.identifier, i]));
  listOfObjects=Array.from(objMap.values());
  var objMap=new Map(listOfObjects.map((i) => [i.name, i]));
  objMap.delete(objToDelete);
  listOfObjects=Array.from(objMap.values());
  listOfObjects.splice(3);//TODO: Remove this to show all objects
  return listOfObjects;
},

getSimilarWordList: function(data,language, callback) {
      var connectedWord = new Object();
      var newSyn = [];
      var synList =[];
      var antynList =[];
      var hyperList = [];
      var hypoList = [];
      var meroList = [];
      var holoList = [];
      var topoList = [];
      var entailmentList = [];
      var isSynDone = false;
      var isAntynmDone = false;
      var isHyperDone = false;
      var isHypoDone = false;
      var isMeroDone = false;
      var isHoloDone = false;
      var istopoDone = false;
      var isEntailmentDone = false;
     
      var isTranslationDone = false;
      var cb =callback;
      this.initializer();
    org.ekstep.services.languageService.getWords(data,function(err,res){
      var resul = JSON.parse(JSON.stringify(res));
      if (err != null ) {
          cb(err,null);
      } else if ( (resul.data.result.count == undefined) || (resul.data.result.count == 0) ) {
         cb("no related words found",null);
      } else {
         if(resul.data.result.words[0].synonyms != null){
              synList = JSON.parse(JSON.stringify(resul.data.result.words[0].synonyms));
         }
         if(resul.data.result.words[0].antonyms != null){
            antynList = JSON.parse(JSON.stringify(resul.data.result.words[0].antonyms));
         }
          if(resul.data.result.words[0].hyponym != null){
            hypoList = JSON.parse(JSON.stringify(resul.data.result.words[0].hyponym));
         }
          if(resul.data.result.words[0].hypernym != null){
            hyperList = JSON.parse(JSON.stringify(resul.data.result.words[0].hypernym));
         }
          if(resul.data.result.words[0].meronym != null){
            meroList = JSON.parse(JSON.stringify(resul.data.result.words[0].meronym));
         }
          if(resul.data.result.words[0].holonym != null){
            holoList = JSON.parse(JSON.stringify(resul.data.result.words[0].holonym));
         }
         if(resul.data.result.words[0].troponym != null){
            topoList = JSON.parse(JSON.stringify(resul.data.result.words[0].troponym));
         }
          if(resul.data.result.words[0].entailment != null){
            entailmentList = JSON.parse(JSON.stringify(resul.data.result.words[0].entailment));
         }
         // get list of synonyms
         if(synList.length == 0){
          isSynDone = true;
          connectedWord.synonyms =[];
        } else {
            var innercount = synList.length;

            playServices.getWordList(synList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null ){
                    connectedWord.synonyms = res;
                    isSynDone = true;
                } else if(err != null){
                  connectedWord.synonyms =[];
                  isSynDone = true;
                } 
                if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
        }

         // get list of antonyms
        newSyn =[];
        if(antynList.length == 0){
          isAntynmDone = true;
           connectedWord.antonyms = [];
        } else {
          var innercount = antynList.length;
             playServices.getWordList(antynList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null ){
                    connectedWord.antonyms = res;
                    isAntynmDone = true;
                } else if(err != null){
                  connectedWord.antonyms = [];
                  isAntynmDone = true;
                }
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
       }

  // get list of hypernym
        newSyn =[];
        if(hyperList.length == 0){
          isHyperDone = true;
           connectedWord.hypernym = [];
        } else {
             var innercount = hyperList.length;
             playServices.getWordList(hyperList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null ){
                    connectedWord.hypernym = res;
                    isHyperDone = true;
                } else if(err != null){
                  connectedWord.hypernym = [];
                  isHyperDone = true;
                }
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
       }

 // get list of hyponym
        newSyn =[];
        if(hypoList.length == 0){
          isHypoDone = true;
           connectedWord.hyponym = [];
        } else {
          var innercount = hypoList.length;
             playServices.getWordList(hypoList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null ){
                    connectedWord.hyponym = res;
                    isHypoDone = true;
                } else if(err != null){
                  connectedWord.hyponym = [];
                  isHypoDone = true; 
                }
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
       }
      // get list of holonym  
        newSyn =[];
        if(holoList.length == 0){
          isHoloDone = true;
           connectedWord.holonym = [];
        } else {
          var innercount = holoList.length;
             playServices.getWordList(holoList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null ){
                    connectedWord.holonym = res;
                    isHoloDone = true;
                } else if(err != null){
                  connectedWord.holonym = [];
                  isHoloDone = true; 
                }
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
       }
       // get list of Meronym
        newSyn =[];
        if(meroList.length == 0){
          isMeroDone = true;
           connectedWord.meronym = [];
        } else {
          var innercount = meroList.length;
             playServices.getWordList(meroList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null){
                    connectedWord.meronym = res;
                    isMeroDone = true;
                } else if(err != null){
                  connectedWord.meronym = [];
                  isMeroDone = true;
                }
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
       }

       // get list of toponym
        newSyn =[];
        if(topoList.length == 0){
          istopoDone = true;
           connectedWord.troponym = [];
        } else {
        var innercount = topoList.length;
             playServices.getWordList(topoList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null){
                    connectedWord.troponym = res;
                    istopoDone = true;
                } else if(err != null){
                  connectedWord.troponym = [];
                  istopoDone = true;
                } 
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
       }

       // get list of entailment
        newSyn =[];
        if(entailmentList.length == 0){
          isEntailmentDone = true;
           connectedWord.entailment = [];
        } else {
          var innercount =entailmentList.length;
             playServices.getWordList(entailmentList,language,resul,newSyn,innercount
              ,function(err,res){
                if(err == null && res != null ){
                    connectedWord.entailment = res;
                     isEntailmentDone = true;
                } else if(err != null){
                  connectedWord.entailment = [];
                   isEntailmentDone = true;
                } 
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
              });
           
       }
// get all the translation
       org.ekstep.services.languageService.getLanguages(function(err,res){ 
        if(err != null || res.data.result == null){
            isTranslationDone = true;
            connectedWord.translations = [];
        } else{
         var allLang = res.data.result.languages;
         var langList= [];
         for( var i=0;i<allLang.length;i++){
          if(allLang[i].code != language){}
              langList.push(allLang[i].code);
          }
          playServices.getWordTranslation(language,resul.data.result.words[0].lemma,langList,function(err,res){
                if(err == null && res != null){
                    connectedWord.translations = res;
                } else{
                  connectedWord.translations = [];
                }
                isTranslationDone = true;
                 if(isAntynmDone && isSynDone && isTranslationDone && isHyperDone && isHypoDone && isMeroDone && istopoDone && isHoloDone && isEntailmentDone){
                    cb(null,connectedWord)
                }
          });
        }
      });
        
    }
    }); 
  },

getWordList:function(lists,language,resul,newSyn,innercount,callback) {
  this.initializer();
  for(var i=0;i<lists.length; i++){
    playServices.getWordDetails(lists[i],language,function(err,res1){
              // console.log(res);  
              if(err == null && res1.data.result.Word.words != null){
                var synWord = JSON.parse(res1.data.result.Word.words);
                for(var j = 0;j<synWord.length;j++){
                 if(synWord[j].name != resul.data.result.words[0].lemma){
                  var flag = true;
                  for(var k =0;k<newSyn.length;k++){
                      if(newSyn[k].name.toLowerCase() == synWord[j].name.toLowerCase()){
                        flag = false;
                      }
                  }
                    if(flag){
                        newSyn.push(synWord[j]);
                    }
                } 
                } 
              }
              innercount--;
                if(innercount <=1){
                   callback(null, JSON.parse(JSON.stringify(newSyn)));     
                 } 
                 /*else{
                  playServices.getWordList(lists,language,resul,newSyn,++innercount,callback);
                 } 
            */
            }); 
  }
 },

getWordList2:function(lists,language,resul,newSyn,innercount,callback){
    this.initializer();
   var promises=[];
   var test =[];
    for(var i=0;i<lists.length;i++){
     promises.push(playServices.getWord2(lists[i],language,resul,function(res){
      test.push(res);
     // return res;
     }));
    }
 $.when.apply($,promises).then(function() {
   var merged = [].concat.apply([], test);
    callback(null,merged);
  }, function(err) {
    callback(err,null);
  });
 },

 getWord2:function(word,language,resul,callback){
    this.initializer();
  var newSyn =[];
  playServices.getWordDetails(word,language,function(err,res1){
              // console.log(res);  
              if(err == null && res1.data.result.Word.words != null){
                var synWord = JSON.parse(res1.data.result.Word.words);
                for(var j = 0;j<synWord.length;j++){
                 if(synWord[j].name != resul.data.result.words[0].lemma){
                  var flag = true;
                  for(var k =0;k<newSyn.length;k++){
                      if(newSyn[k].name.toLowerCase() == synWord[j].name.toLowerCase()){
                        flag = false;
                      }
                  }
                    if(flag){
                        newSyn.push(synWord[j]);
                       
                    }
                } 
                } 
              }
              callback(newSyn);
            });
 },
/*
*userData : [[ next word, is connected, is correct]]
*systemData : [next word,next word]
*/
scoringService : function(userData, systemData,callback){
        var correctScore =0 ;
        var incorrectScore = 0;
        var notConnectedScore = 0;
        var finalData =[];
        var result = new Object();
        for (var i =0;i<userData.length;i++){
            var data = userData[i];
            var flag = false;
            for(var j=0;j<systemData.length;j++) {
                if(data[0] == systemData[j] ) { // if word is present in the list of similar word or not
                  if( data[1] == true) {        // if the word is present check if it is connected.
                      data[2] = true;           // then it is correct
                      correctScore++;
                      flag = true;
                      break;
                  } else {
                      data[2] = false;          // if word is not connected then it is incorrect.
                      notConnectedScore++;
                      flag = true;
                      break;
                  }
                  
                }
            }
            if(!flag && data[1] == true){       // if the word is not present in the similar list then check if
               data[2] = false;                 // it is connected or not.
               incorrectScore++; 
            } else if(!flag && data[1]== false){
                data[2] = true;
             //  correctScore++; 
            }
            finalData.push(data);              // add the updated data into final array.
        }
        result.correct = correctScore;
        result.incorrectScore = incorrectScore;
        result.notconnected = notConnectedScore;
        result.data = finalData;
        var jsonString= JSON.stringify(result);
       callback(jsonString);
    
},

getWordDetails: function(wordid,language, callback) {
  this.initializer();
  var lang = org.ekstep.services.languageService;
  lang.getFromService(lang.languageURL() + "/v3/words/read/"+ wordid + "?language_id=" + language, lang.requestHeaders, callback);
},

getSynsetDetails: function(synSetid, language, callback) {
  this.initializer();
  var lang = org.ekstep.services.languageService;
  lang.getFromService(lang.languageURL() + "/v3/synsets/read/"+synSetid+"?language_id="+language, lang.requestHeaders, callback);
},

getRandomWord: function(data, callback) {
  this.initializer();
  var lang = org.ekstep.services.languageService;
  lang.getWords(data, function(err,res) {
    if ( err == null ) {
      if ( (res.data.result.words != undefined) && (0 < res.data.result.words.length) ) {
        var x = Math.floor(Math.random() * res.data.result.words.length);
        callback(null,res.data.result.words[x]);
      } else {
        callback('Search API returned empty list of words', null);
      }
    } else {
      callback(err,null);
    }
  });
},

getLanguages: function(callback){
  this.initializer();
  var lang = org.ekstep.services.languageService;
  lang.getLanguages(callback);
},

getWords: function(data, callback){
  this.initializer();
  var lang = org.ekstep.services.languageService;
  lang.getWords(data,callback);
},

getWordTranslation: function(wordLang,word,languages, callback) {
    this.initializer();
     var data = new Object();
     data.wordLang = wordLang;
     data.word = word;
     data.languages = languages;
    org.ekstep.services.languageService.getTranslation(data,function(err,res){
      if(res != null && res.data.result.translations != null){
         var result = _.values(res.data.result.translations);
         callback(err,result[0]);
     } else{
      callback(err,null);
     }
    });
},

getUnRelatedWords: function(language_id, themes, callback) {
  var unRelatedThemes=[];
  playServices.getAllSystemThemes(language_id, function(err, res) {
    if (err) {
      callback(err,null);
    } else {
      //Find all not related themes for word.
      for(var i in res) {
        if (themes.indexOf(res[i]) == -1) {
          unRelatedThemes.push(res[i]);
        }
      }

      //Find all words for all not related themes
      var innercount=(unRelatedThemes.length>5)?5:unRelatedThemes.length;//unRelatedThemes.length;
      var noOfThemesToFetch=innercount;
      var unRelatedWords=[];
      for(var i=0;i<noOfThemesToFetch;i++) {// in unRelatedThemes) {
        playServices.getThemeWords(language_id, unRelatedThemes[i], function(err,res) {
          if(res.length > 0) {
            unRelatedWords=unRelatedWords.concat(res);
          }
          innercount--;
          if (innercount < 1) {
            callback(unRelatedWords);
          }
        });
      }
    }
  })
},

getAllSystemThemes: function(language_id, callback) {
  this.initializer();

  var filters={};
  filters.objectType=["Word"];
  filters.language_id=[language_id];

  var request = {};
  request.filters=filters;
  request.facets=["keywords"];
  request.limit=0;

  var data={};
  data.request=request;

  var themes = [];

  org.ekstep.services.languageService.getWords(data, function(err, res) {
    if (err != null) {
      callback(err, null);
    } else if ( (res.data.result.count == undefined) || (res.data.result.count == 0) ) {
      callback("No themes found", null);
    } else {
      var values=res.data.result.facets[0].values;
      for(var i in values) {
        themes.push(values[i].name);
      }
      callback(null, themes);
    }
  });
},

getThemeWords: function(language_id, theme, callback) {
  this.initializer();

  var filters={};
  filters.objectType=["Word"];
  filters.language_id=[language_id];
  filters.keywords=theme;

  var request={};
  request.filters=filters;
  request.fields=["lemma"];

  var data={};
  data.request=request;

  var words = [];

  org.ekstep.services.languageService.getWords(data, function(err, res) {
    if (err != null) {
      callback(err, null);
    } else if ( (res.data.result.count == undefined) || (res.data.result.count == 0) ) {
      callback("No words found", null);
    } else {
      var values=res.data.result.words;
      for(var i in values) {
        var word={};
        word.identifier=values[i].identifier;
        word.name=values[i].lemma;
        word.isRelatedWord=false;
        words.push(word);
      }
      callback(null, words);
    }
  });
},

getDisimilarWordList: function(callback) {
        var word = [
            {
                identifier:"-1",
                name:'This',
                isRelatedWord:false
            },
            {
                identifier:"-2",
                name:'That',
                isRelatedWord:false
            },
            {
                identifier:"-3",
                name:'And',
                isRelatedWord:false
            },
            {
                identifier:"-4",
                name:'When',
                isRelatedWord:false
            },
            {
                identifier:"-5",
                name:'Why',
                isRelatedWord:false
            },
            {
                identifier:"-6",
                name:'Where',
                isRelatedWord:false
            },
            {
                identifier:"-7",
                name:'Which',
                isRelatedWord:false
            },
            {
                identifier:"-8",
                name:'How',
                isRelatedWord:false
            }
        ];
        callback(word);
},

getTranslations: function(language_id, word, callback) {
  this.initializer();

  var data={};
  data.wordLang=language_id;
  data.word=word;
  data.languages="bn,gu,hi,ka,mai,mr,pa,san,ta,te";

  var translations = [];
  org.ekstep.services.languageService.getTranslation(data, function(err, res) {
    if (err != null) {
      callback(err.statusText, null);
    } else if ( (res.data.result.translations == undefined) ) {
      callback("No translations found", null);
    } else {
      var values=res.data.result.translations;
      var keys=Object.keys(values);
      for(var i in keys) {
        var languageObj=values[keys[i]];
        var keys1=Object.keys(languageObj);
        for(var j in keys1) {
          if (keys1[j] !== language_id) {//Ignore the same language id in the translations!
            var tArr=languageObj[keys1[j]];
            if (tArr instanceof Array) {//TODO: Now showing only one translations from each language
              // for(var k in tArr) {
                var word={};
                word.identifier=tArr[0].id;
                word.name=tArr[0].lemma;
                word.isRelatedWord=true;
                word.languageid=keys1[j];
                translations.push(word);
              //}
            }
          }
        }
      }
      callback(null, translations);
    }
  });
}

}));
window.playServices = playServices;
org.ekstep.services.playServices = playServices;

var localStorageDispatcher =new(Class.extend({
    type: "localStorageDispatcher",
    counter :0,
    init: function() {
      counter = 0;
    },
    dispatch: function(event) {
        localStorage.setItem(++counter, JSON.stringify(event));
    },
    dispatchToTelemetry: function(event) {
      var data = [];
      for(var i=1;i<=counter;i++){
        data.push(localStorage.getItem(i));
      }
      // call the telemetry api to dispatch
    }
}));
window.localStorageDispatcher = localStorageDispatcher;
org.ekstep.contenteditor.localStorageDispatcher = localStorageDispatcher;

var telServices = new(Class.extend({
    addLocalStorageDispatch: function(){

      org.ekstep.services.telemetryService.dispatchers.push(localStorageDispatcher);
    },
    impression: function(data) {
     var telemetry = org.ekstep.services.telemetryService;
        if (!telemetry.hasRequiredData(data, telemetry.interactRequiredFields)) {
            console.error('Invalid impression data');
            return;
        }
        telemetry._dispatch(telemetry.getEvent('OE_IMPRESSION', data))
    }
}));
window.telServices = telServices;
org.ekstep.services.telServices = telServices;
//# sourceURL=word-connect-api.js