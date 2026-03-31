Plugin.extend({
    _type: 'org.ekstep.progressbar',
    _render: true,
    _isContainer: true,
    _stageId: 0,
    _socreInstance: {},
    initPlugin: function(data) {
        var instance = this;
        var assessData = '';
        this._data = data; 
        EventBus.listeners.questionsetEvent = [];
        EventBus.addEventListener("questionsetEvent", this.getOEAssessData,this);
        var progressbarObject = this._theme.getParam("progressbarObj");
        var currentStageid = this._theme._currentStage;

        if (_.isUndefined(progressbarObject)) {
            var obj = {};
            obj[currentStageid] = [];
            this._theme.setParam("progressbarObj", obj);
        } else {
            if (_.isUndefined(progressbarObject[currentStageid])) {
                progressbarObject[currentStageid] = [];
            } else {
                assessData = progressbarObject[currentStageid];
            }
        }
        // to update DOM for old content pass assessData
        instance.showProgressBarTemplate(data,assessData);
        instance.updateProgressBar();
    },
    showProgressBarTemplate: function(data, assessData){
        var instance = this;
        var progressBarTemplate = '<div class="container" style="width:100%; display:flex;">';
        var barWidth = data.w / data.questions;
        for (var i = 0; i < data.questions; i++) {
            progressBarTemplate = progressBarTemplate + '<div class="col'+ i +'" style="background-color:white;height: 35px;padding: 1%;border: 1px solid black;width:'+barWidth+'%;"></div>';
        }
        progressBarTemplate = progressBarTemplate + '<p id="q-count" style="font-size: xx-large;">'+assessData.length +'/'+data.questions+'</p></div>';
        var div = document.getElementById(instance._data.id);
        if (div) {
            jQuery("#" + instance._data.id).remove();
        }
        div = document.createElement('div');
        div.id = instance._data.id;
        div.style.width = instance._data.w + '%';
        div.style.height = instance._data.h + '%';
        div.style.top=instance._data.y+"%";
        div.style.left=instance._data.x+"%";
        div.style.position= "absolute";
        div.style["z-index"]="1000";
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);
        jQuery("#" + instance._data.id).append(progressBarTemplate);
    },
    getOEAssessData:function(telemetryData) {
        var instance = this;
        var teleObj = _.isString(telemetryData.target) ? JSON.parse(telemetryData.target) : telemetryData.target;
        if (teleObj.eid == "ASSESS") {
            progressbarObject = instance._theme.getParam("progressbarObj");
            currentStageid = instance._theme._currentStage;
            if (_.isUndefined(progressbarObject)) {
                var obj = {};
                obj[currentStageid] = [];
                instance._theme.setParam("progressbarObj", obj);
            } else {
                if (_.isUndefined(progressbarObject[currentStageid])) {
                    progressbarObject[currentStageid] = [];
                } else {
                    assessData = progressbarObject[currentStageid];
                }
            }
            var count = 0;
            if (assessData.length == 0) {
                assessData.push(teleObj);
            } else {
                for (var n = 0; n < assessData.length; n++) {
                    if (assessData[n].edata.item.id == teleObj.edata.item.id) {
                        assessData[n] = teleObj;
                        count++;
                    }
                }
                if (count == 0) {
                    assessData.push(teleObj);
                }
            }
            if (!_.isUndefined(progressbarObject)) {
                progressbarObject[currentStageid] = assessData;
                var progressObj = JSON.parse(JSON.stringify(progressbarObject));
                instance._theme.setParam("progressbarObj", progressObj);
            }

            var attemptedQuestions;
            var attemptedQuestions = assessData.length;
            // to update DOM for new content
            instance._attemptedQ = attemptedQuestions + "/" + instance._data.questions;
            $("#q-count").text(instance._attemptedQ);
            instance.updateProgressBar(instance);
        }     
    },
    updateProgressBar: function() {
        var instance = this;
        var progressData = instance._theme.getParam("progressbarObj");
        var stageProgData = progressData && progressData[instance._theme._currentStage];
        if (stageProgData && (stageProgData.length > 0)) {
            /*Sorting OE_ASSESS/ASSESS arrary based on createdtime and checking answer to show the progressbar*/
            _.sortBy(stageProgData, 'createdTime');
            for (var i = 0; i < stageProgData.length; i++) {
                if (stageProgData[i].edata.pass == "Yes") {
                    $(".col"+i).css("background-color",instance._data.progressbarSuccess);
                } else if (assessData[i].edata.pass == "No") {
                    $(".col"+i).css("background-color",instance._data.progressbarFailure);
                }
            }
        }
    }
});
//# sourceURL=progressbarRendererPlugin.js
