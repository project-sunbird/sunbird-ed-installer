Plugin.extend({
    _type: 'org.ekstep.plugin.test.manoj.4218',
    _render: true,
    _isContainer: true,
    _stageId: 0,
    initPlugin: function(data) {
        this._data = data;
        var dims = this.relativeDims();
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;
        var instance = this;



        var groupObj = {
            "x": 0,
            "y": data.y,
            "w": 100,
            "h": 100,
            "shape": [],
            "text": {}
        }
        var shapeW = data.w / data.questions;


        /* For loop to create multiple objects with data to create shape */
        for (var i = 0; i < data.questions; i++) {
            var shapeData = {
                id: "shape" + i,
                x: i * shapeW,
                y: 0,
                h: 100,
                w: shapeW,
                stroke: data.progressbarStroke,
                fill: "#ddd"
            }
            groupObj.shape.push(shapeData);

        }

        var assessData = [];

        /*Loop to get the latest OE_ASSESS telemetery
            data for each question*/



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


        function getOEAssessData() {
            EventBus.addEventListener("telemetryEvent", function(telemetryData) {

                var teleObj = JSON.parse(telemetryData.target);
                if (teleObj.eid == "OE_ASSESS") {
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
                        // assessData.push(TelemetryService._data[i]);
                        for (var n = 0; n < assessData.length; n++) {
                            if (assessData[n].edata.eks.qid == teleObj.edata.eks.qid) {
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
                        instance._theme.setParam("progressbarObj", progressbarObject);
                    }
                }



            })

            /*Sorting OE_ASSESS arrary based on createdtime and
                checking answer to show the progressbar*/
            if (assessData.length > 0) {
                _.sortBy(assessData, 'createdTime');
                for (var i = 0; i < assessData.length; i++) {
                    if (assessData[i].edata.eks.pass == "Yes") {
                        groupObj.shape[i].fill = data.progressbarSuccess;
                    } else if (assessData[i].edata.eks.pass == "No") {
                        groupObj.shape[i].fill = data.progressbarFailure;
                    }
                }
            }
            var attemptedQuestions = assessData.length;
            var itemText = {};

            var fontsize = String(data.fontSize / 16 + "em");

            itemText.id = _.unique("itemTextId");
            itemText.align = "left";
            itemText.valign = "center";
            itemText.color = "#4c4c4c";
            itemText.fontsize = fontsize;
            itemText.$t = attemptedQuestions + "/" + data.questions;
            itemText.w = 100 - data.w;
            itemText.x = data.w + 1;
            itemText.y = 0;
            itemText.h = 100;
            groupObj.text = itemText;

            PluginManager.invoke('g', groupObj, instance, instance._stage, instance._theme);
            Renderer.update = true;

        }
        setTimeout(function() {
            getOEAssessData();

        }, 500);



    }
});
//# sourceURL=progressbarRendererPlugin.js
