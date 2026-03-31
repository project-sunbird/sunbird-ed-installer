Plugin.extend({
    _type: 'org.ekstep.progressbar',
    _render: true,
    _isContainer: true,
    initPlugin: function(data) {
        this._data = data;
        var dims = this.relativeDims();
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;

        var groupObj = {
            "x": data.x,
            "y": data.y,
            "w": 100,
            "h": 100,
            "shape": [],
            "text": {}
        }
        var shapeW = data.w / data.questions;

        //PluginManager.invoke('text', itemText1, this, this._stage, this._theme);


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

        for (var i = 0; i < TelemetryService._data.length; i++) {
            if (!angular.isUndefined(TelemetryService._data[i])) {
                if (TelemetryService._data[i].name == "OE_ASSESS") {
                    var count = 0;
                    if (assessData.length == 0) {
                        assessData.push(TelemetryService._data[i]);
                    } else {
                        // assessData.push(TelemetryService._data[i]);
                        for (var j = 0; j < assessData.length; j++) {
                            if (assessData[j].event.edata.eks.qid == TelemetryService._data[i].event.edata.eks.qid) {
                                assessData[j] = TelemetryService._data[i];
                                count++;
                            }
                        }
                        if (count == 0) {
                            assessData.push(TelemetryService._data[i]);
                        }
                    }
                }
            }
        }
        /*Sorting OE_ASSESS arrary based on createdtime and 
        checking answer to show the progressbar*/
        if (assessData.length > 0) {
            _.sortBy(assessData, 'createdTime');
            for (var i = 0; i < assessData.length; i++) {
                if (assessData[i].event.edata.eks.pass == "Yes") {
                    groupObj.shape[i].fill = data.progressbarSuccess;
                } else if (assessData[i].event.edata.eks.pass == "No") {
                    groupObj.shape[i].fill = data.progressbarFailure;
                }
            }
        }
        var attemptedQuestions = assessData.length;
        var itemText1 = {};

        itemText1.id = _.unique("itemText1Id");
        itemText1.align = "center";
        itemText1.color = "#4c4c4c";
        itemText1.fontsize = "5vw";
        itemText1.$t = attemptedQuestions + "/" + data.questions;
        itemText1.w = 100 - data.w;
        itemText1.x = data.w;
        itemText1.y = 0;
        itemText1.h = 100;
        groupObj.text = itemText1;

        PluginManager.invoke('g', groupObj, this, this._stage, this._theme);
    }
});
