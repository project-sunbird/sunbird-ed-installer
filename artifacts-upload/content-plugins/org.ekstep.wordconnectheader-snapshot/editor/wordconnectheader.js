angular.module('org.ekstep.wordconnectheader:app', ["Scope.safeApply", "yaru22.angular-timeago"]).controller('headerController', ['$scope', function($scope) {

    var plugin = { id: "org.ekstep.wordconnectheader", ver: "1.0" };
    //$scope.contentDetails.contentImage = ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/images/ekstep_logo_white.png");
    $scope.internetStatusObj = {
        'status': navigator.onLine,
        'text': 'No Internet Connection!'
    };
    $scope.disableSaveBtn = true;
    $scope.lastSaved;
    $scope.score = 0;
    $scope.languages  = "";
    $scope.selectedLanguage = "";
    $scope.mode = 'play';
    $scope.search = function(word){
        //$scope.score = 0;
        if($scope.mode == 'play'){
            ecEditor.dispatchEvent("searchword",search,word);
            ecEditor.dispatchEvent("setExploreSearchWord",search,word);
        }else{
            ecEditor.dispatchEvent("exploresearchword",search,word);
        }
       /* org.ekstep.services.playServices.getSimilarWordList({"request":{"filters":{"lemma":wordlist.centerword.name,"language_id":["en"],"objectType":["Word"]}}},'en',function(err,res){
            //callback(err,res);
            ecEditor.dispatchEvent("searchword",search,word);
        });*/
    }

    $scope.saveContent = function() {
        $scope.disableSaveBtn = true;
        ecEditor.dispatchEvent("org.ekstep.collectioneditorfunctions:save", {
            showNotification: true,
            callback: function(err, res) {
                if(res && res.data && res.data.responseCode == "OK") $scope.lastSaved = Date.now();
                $scope.$safeApply();
            }
        });
    };
    
    $scope.changemode = function(mode){
        //$scope.score = 0;
        ecEditor.dispatchEvent("changemode",$scope.changemode,mode);
    }
     $scope.onlanguagechange = function(language){
        $scope.selectedLanguage=language;
        ecEditor.dispatchEvent("changelanguage",$scope.onlanguagechange,language);
    }
    $scope.pickRandomWord = function(){
        $scope.searchword = "";
        //$scope.score = 0;
        ecEditor.jQuery('.pickarandomword_link').addClass('custom-disabled');
        if($scope.mode == 'play'){
            ecEditor.dispatchEvent("pickrandomword",$scope.pickRandomWord,true);
        }else{
            ecEditor.dispatchEvent("explorepickrandomword",$scope.pickRandomWord,true);
        }
        
    }
    $scope.downloadContent = function() {
        ecEditor.dispatchEvent("download:content");
    };

    $scope.onNodeEvent = function(event, data) {
        $scope.disableSaveBtn = false;
        $scope.$safeApply();
    };

    $scope.telemetry = function(data) {
        org.ekstep.services.telemetryService.interact({ "type": 'click', "subtype": data.subtype, "target": data.target, "pluginid": plugin.id, "pluginver": plugin.ver, "objectid": ecEditor.getCurrentStage().id, "stage": ecEditor.getCurrentStage().id });
    };

    $scope.internetStatusFn = function(event) {
        $scope.$safeApply(function() {
            $scope.internetStatusObj.status = navigator.onLine;
        });
    };

    $scope.closeCollectionEdtr = function() {
        // Condition for portal. If editor opens in iframe
        if (window.self !== window.top) {
            if (!$scope.disableSaveBtn) {
                var cf = confirm("Changes that you made may not be saved.");
                if (cf == true) {
                    window.onbeforeunload = null;
                    window.parent.editor.izimodalRef.iziModal("close");
                }
            }
            else {
                window.parent.editor.izimodalRef.iziModal("close");
            }
        }
        else window.location.reload(); // Can remove this condition.
    };

    // Condition for portal. If editor opens in iframe
    var context = window.context || window.parent.context;
    $scope.reportIssueLink = ((context && context.reportIssueLink) ? context.reportIssueLink : "");

    // For show/hide help button
    var config = window.config || window.parent.config;
    $scope.showHelp = function(){
        ecEditor.jQuery('.ui.modal')
            .modal('show');
    }
    window.onbeforeunload = function(e) {
        if (!$scope.disableSaveBtn) return "You have unsaved changes";
        e.preventDefault();
    }
    function updateScore(event){
        $scope.score = $scope.score + (event.target.correct - event.target.incorrectScore);
    }

    function getlanguages() {
        //org.ekstep.services.languageService.getLanguages(function(err,res){
        playServices.getLanguages(function(err,res) {
            if(err){
                var error = (typeof err == 'string') ? err : 'Get language Api throwing error'
               headermessgae(error);
               // console.log('Error: ',err);
                return;
            }
          $scope.languages = res.data.result.languages;
          var config = ecEditor.getAllConfig();
          $scope.selectedLanguage = config.defaultLanguage;
          $scope.$safeApply();
        });
    }
    function headermessgae(message){
         $.uiAlert({
                    textHead: message, // header
                    text: '', // Text
                    bgcolor: '#55a9ee', // background-color
                    textcolor: '#fff', // color
                    position: 'top-right',// position . top And bottom ||  left / center / right
                    icon: 'info circle', // icon in semantic-UI
                    time: 5, // time
                })
    }
    getlanguages();

    ecEditor.addEventListener("updatescore", updateScore,false);
    window.addEventListener('online', $scope.internetStatusFn, false);
    window.addEventListener('offline', $scope.internetStatusFn, false);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:added", $scope.onNodeEvent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:modified", $scope.onNodeEvent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:removed", $scope.onNodeEvent, $scope);
    ecEditor.addEventListener("org.ekstep.collectioneditor:node:reorder", $scope.onNodeEvent, $scope);
}]);
//# sourceURL=wordconnectheader.js