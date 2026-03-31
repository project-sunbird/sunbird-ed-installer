Plugin.extend({
    _type: 'org.ekstep.summarizer',
    _summerizerData: undefined,
    _isContainer: true,
    _render: true,
    _obtainedPercentage: 0,
    _Questions: undefined,
    _QuestionsItemController: undefined,
    _startIndex: 0,
    _endIndex: 5,
    _noOfRows: undefined,
    _telemetryQuestion: undefined,
    _attemptedarray: undefined,

    initPlugin: function(data) {
        this._pluginData = data;
        this._Questions = [];
        this._QuestionsItemController = [];
        this._attemptedarray = [];
        var attemptId = [];
        this._data.x = data.x;
        this._data.y = data.y;
        this._data.w = data.w;
        this._data.h = data.h;
        this._data.id = "summerPlugin";
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        /*Accessing table header details from editor*/
        var model1 = data.config.__cdata;
        var model = JSON.parse(model1);
        this._summerizerData = model;
        var controllerkeys = _.keys(this._theme._controllerMap);
        var contMap = this._theme._controllerMap;
        var itemControlles = [];
        this._telemetryQuestion = [];
        var ins = this;
        var obtainedScore = 0;
        var totalScore = 0;
        var questionIndex = 1;
        /*This loop is to get the item controller which has the information regarding each question*/
        _.each(controllerkeys, function(str) {
            if (contMap[str]._type == "items") {
                itemControlles.push(contMap[str]);
            }
        });
        _.each(itemControlles, function(obj) {
            _.each(obj._model, function(q) {
                ins._QuestionsItemController.push(q);
            });
        });

        /*this loop is get the telemetry data*/
        for (var i = 0; i < TelemetryService._data.length; i++) {
            if (!angular.isUndefined(TelemetryService._data[i])) {
                /*Telemetry data with name OE_ASSESS*/
                if (TelemetryService._data[i].name == "OE_ASSESS") {
                    var id4 = TelemetryService._data[i].event.edata.eks.qid;
                    /*check if this data is already present*/
                    ins._telemetryQuestion = _.reject(ins._telemetryQuestion, function(num) {
                        var id3 = num.event.edata.eks.qid;
                        if (id4 == id3) {
                            return true;
                        }
                    });
                    this._telemetryQuestion.push(TelemetryService._data[i]);
                }
                /*Telemetry data with name OE_ITEM_RESPONSE*/
                if (TelemetryService._data[i].name == "OE_ITEM_RESPONSE") {
                    this._attemptedarray.push(TelemetryService._data[i]);
                }
            }
        }
        /*get the id of OE_ITEM_RESPONSE to check if question is attempted or not*/
        _.each(ins._attemptedarray, function(o) {
            var id2 = o.event.edata.eks.qid;
            attemptId.push(id2);
        });
        /*prepare an array, where each object has required details of each question*/
        _.each(ins._telemetryQuestion, function(obj) {
            var quesObj = {};
            var questionIdFromTelemetry = obj.event.edata.eks.qid;
            var questionObjectFromItemController = _.findWhere(ins._QuestionsItemController, { identifier: questionIdFromTelemetry });
            var value;
            var ansEntered = obj.event.edata.eks.resvalues[0];
            if (!ansEntered || (ansEntered == undefined)) {
                value = "-";
            } else {
                for (var num in ansEntered) {
                    value = ansEntered[num];
                }
            }
            quesObj.ansEntered = value;
            quesObj.qindex = questionIndex++;
            //prioritize question description, if empty display question title
            if (obj.event.edata.eks.qdesc) {
                quesObj.qtitle = obj.event.edata.eks.qdesc;
            } else {
                quesObj.qtitle = obj.event.edata.eks.qtitle;
            }
            quesObj.pass = obj.event.edata.eks.pass;
            if (quesObj.pass == "Yes") {
                obtainedScore++;
            }
            quesObj.score = obj.event.edata.eks.score;
            quesObj.timeTaken = obj.event.edata.eks.length;
            /*get the actual correct answer for the question from item controller*/
            var correctAnswerObject = _.findWhere(questionObjectFromItemController.options, { answer: true });
            if (!correctAnswerObject || (correctAnswerObject.value.text == undefined) || (correctAnswerObject.value.text == null)) {
                quesObj.correctAns = "-";
            } else {
                quesObj.correctAns = correctAnswerObject.value.text;
            }
            /*check if the question is attempted or not*/
            var attemptVal = _.contains(attemptId, questionIdFromTelemetry);
            if (attemptVal == true) {
                quesObj.attempt = "Yes";
            } else {
                quesObj.attempt = "No";
            }
            ins._Questions.push(quesObj);
        });
        /*prepare array for skipped questions after timer expires*/
        var totalQuestions = this._QuestionsItemController.length;
        var skippedQuestions = totalQuestions - this._Questions.length;
        for (var i = 0; i < skippedQuestions; i++) {
            var quesObj = {};
            quesObj.qindex = questionIndex++;
            quesObj.qtitle = "NOT ATTEMPTED";
            quesObj.pass = "";
            quesObj.score = "";
            quesObj.ansEntered = "";
            quesObj.timeTaken = "";
            quesObj.correctAns = "";
            quesObj.attempt = "";
            ins._Questions.push(quesObj);
        }
        /*Calculate the percentage of test*/
        this._obtainedPercentage = Math.round((obtainedScore / totalQuestions) * 100);
        /*Background the summarizer*/
        var backgroundImage = {
            "id": "backgroundPage",
            "x": -23,
            "y": -9,
            "w": 145,
            "h": 137,
            "image": {
                "asset": "background",
                "x": 0,
                "y": 0,
                "w": 100,
                "align": "center"
            }
        }
        PluginManager.invoke('g', backgroundImage, this, this._stage, this._theme);

        this.getRewardDetails(obtainedScore, totalQuestions);
    },
    /*Funtion to display the reward object of the test(text reward, image reward, audio reward) based on the percentage*/
    getRewardDetails: function(obtainedScore, totalQuestions) {
        var insObtainedPercentage = this._obtainedPercentage;
        /*Get the reward object to be displayed based on the percentage*/
        var rewardObject = _.find(this._summerizerData.levelArray, function(num) {
            return ((insObtainedPercentage <= num.maxLevel) && (insObtainedPercentage >= num.minLevel));
        });
        /*Invoke the image reward*/
        if (rewardObject.imageReward) {
            var imageBlock = {
                "id": "imgView",
                "x": 0,
                "y": 30,
                "w": 100,
                "h": 57,
                "image": [{
                    "asset": rewardObject.imageReward,
                    "x": 0,
                    "y": 0,
                    "w": 100,
                    "align": "center",
                    "z-index": 10
                }]
            }
            PluginManager.invoke('g', imageBlock, this, this._stage, this._theme);
        }
        /*Invoke the audio reward*/
        summarizerManager.getAudiManager().play({ asset: rewardObject.audioReward, stageId: this._stage._id });
        /*Invoke the percentage obtained*/
        var h1 = "You Scored : ";
        var h2 = "/";
        var obtTxt = (h1 + String(obtainedScore) + h2 + String(totalQuestions));
        var obtPercentage = {};
        obtPercentage.x = 0;
        obtPercentage.y = 93;
        obtPercentage.w = 100;
        obtPercentage.align = "center";
        obtPercentage.fontsize = '3vw';
        obtPercentage.weight = 'bold';
        obtPercentage.color = '#fff';
        obtPercentage.$t = obtTxt;
        PluginManager.invoke('text', obtPercentage, this, this._stage, this._theme);
        /*Invoke the level name*/
        var txt = {};
        txt.x = 0;
        txt.y = 0;
        txt.w = 100;
        txt.align = "center";
        txt.fontsize = '3vw';
        txt.weight = 'bold';
        txt.color = '#383838';
        txt.$t = rewardObject.levelName;
        PluginManager.invoke('text', txt, this, this._stage, this._theme);
        /*Invoke the text reward*/
        var tReward = {};
        tReward.x = 0;
        tReward.y = 10;
        tReward.w = 100;
        tReward.align = "center";
        tReward.fontsize = '4vw';
        tReward.weight = 'bold';
        tReward.color = '#2691d0';
        tReward.$t = rewardObject.textReward;
        PluginManager.invoke('text', tReward, this, this._stage, this._theme);
        /*Invoke the view details button*/
        var viewImageBlock = {
            "id": "blockPage",
            "x": 16,
            "y": 109,
            "w": 100,
            "h": 15,
            "image": [{
                "asset": "viewDetails",
                "x": 0,
                "y": 0,
                "w": 100,
                "align": "right"
            }]
        }
        PluginManager.invoke('g', viewImageBlock, this, this._stage, this._theme);
        /*Click event for View details button
         *on clicking the button result table to displayed*/
        var tableObj = PluginManager.getPluginObject("viewDetails");
        var ins = this;
        tableObj._self.on('click', function(event) {
            ins._self.removeAllChildren();
            ins._childIds = [];
            ins.getTable();
        });
    },
    /*Funtion to display table which contains details of each question*/
    getTable: function() {
        var ins = this;
        /*Close button*/
        var closeBlock = {
            "id": "closeImg",
            "x": 0,
            "y": 3,
            "w": 99,
            "h": 12.5,
            "image": [{
                "asset": "closeButton",
                "x": 0,
                "y": 0,
                "w": 100,
                "align": "right"
            }]
        }
        PluginManager.invoke('g', closeBlock, this._stage, this._stage, this._theme);
        var closeObj = PluginManager.getPluginObject("closeButton");
        closeObj._self.on('click', function(event) {
            var a = {};
            a.type = "command";
            a.command = "reload";
            a.asset = "theme";
            a.value = "homeScreen";
            ins._stage.reload(a);
        });

        /*invoke the table section*/
        //creating the parent div for table

        var pElement = document.createElement('p');
        pElement.id = "ResultsHeaderPara";
        pElement.innerHTML = "Results";

        var divElement = document.createElement('div');
        divElement.id = "summarizerBlock";

        //creating table element
        var tableElement = document.createElement('table');
        tableElement.id = "summarizerTable";

        var sectionElement = document.createElement('section');

        //preparing header tag data
        var tableHeaderLength = this._summerizerData.tableHeader.length;
        var headerData = "<thead><tr>";
        var headerLength = 0;
        var headerName;
        _.each(ins._summerizerData.tableHeader, function(header) {
            switch (header) {
                case "qindex":
                    headerTextName = "";
                    break;
                case "qtitle":
                    headerTextName = "Question";
                    break;
                case "pass":
                    headerTextName = "Pass";
                    break;
                case "score":
                    headerTextName = "Score";
                    break;
                case "ansEntered":
                    headerTextName = "Response";
                    break;
                case "correctAns":
                    headerTextName = "Answer";
                    break;
                case "attempt":
                    headerTextName = "Attempted";
                    break;
                case "timeTaken":
                    headerTextName = "Time(s)";
                    break;
            }
            headerLength++;
            headerName = "header" + headerLength;
            headerData += "<th>" + headerTextName + "<div id='" + headerName + "'>" + headerTextName + "</div></th>";
        });
        headerData += "</tr></thead>";


        //preparing table row data 
        var rowData = "";
        _.each(ins._Questions, function(questionDetails) {
            rowData += "<tr>";
            _.each(ins._summerizerData.tableHeader, function(header) {
                var tableRowText = questionDetails[header];
                if (header != "qtitle") {
                    rowData += "<td>" + tableRowText + "</td>";
                } else {
                    rowData += "<td>" + tableRowText + "</td>";
                }
            });
            rowData += "</tr>";
        });

        //concatinate header and row data to get entire table data
        var tableData = headerData + rowData;
        tableElement.innerHTML = tableData;

        //append tabel element to div element and dic element to section
        divElement.appendChild(tableElement);
        sectionElement.appendChild(divElement);

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.appendChild(pElement);
        parentDiv.appendChild(sectionElement);

        if(tableHeaderLength == 3){
            document.getElementById("header3").style.padding = "9px 137px";
        }
        else if(tableHeaderLength == 4){
            document.getElementById("header3").style.padding = "9px 68px";
            document.getElementById("header4").style.padding = "9px 68px";
        }
        else if(tableHeaderLength == 5){
            document.getElementById("header3").style.padding = "9px 45px";
            document.getElementById("header4").style.padding = "9px 45px";
            document.getElementById("header5").style.padding = "9px 45px";
        }
        Renderer.update = true;
    }
});

//# sourceURL=summarizerRendererPlugin.js
