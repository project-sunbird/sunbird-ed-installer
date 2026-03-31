/**
 * 
 * Simple plugin to create flashcards
 * @class flashcard
 * @extends EkstepEditor.basePlugin
 *
 * @author Daipayan Roy<roy.d@goodworklabs.com>
 * 
 */
EkstepEditor.basePlugin.extend({
    type: "org.ekstep.flashcard",
    imageId: "",
    audioId: "",
    questionFontSize: 35,
    stage: undefined,
    word: "",
    stageArray: [],
    wordInfo: {},
    initialize: function() {

        EkstepEditorAPI.addEventListener("org.ekstep.flashcard:showpopup", this.loadHtml, this);
        setTimeout(function() {
            var templatePath = EkstepEditor.config.pluginRepo + '/org.ekstep.flashcard-1.0/editor/flashcardEditorConfig.html';
            var controllerPath = EkstepEditor.config.pluginRepo + '/org.ekstep.flashcard-1.0/editor/flashcardeditorapp.js';
            EkstepEditorAPI.getService('popup').loadNgModules(templatePath, controllerPath);
        }, 1000);

    },

    /**
     *
     *   invoked by framework when instantiating plugin instance.
     *
     */
    newInstance: function() {

        //    this.loadMedia();
        wordInfo = {};
        imageId = "";
        word = "";
        audioId = "";

        questionFontSize = 35;

        var instance = this;
        var _parent = this.parent;
        this.parent = undefined;
        console.log("attributes in fc plugin ",this.attributes);
        var props = this.convertToFabric(this.attributes);
        delete this.configManifest; //Add this line to remove extra config items from box.

        wordInfo = props;
        console.log("THis is the value of wordInfo : ", wordInfo);
        //this.editorObj = new fabric.Rect(props)

        /*Check if word has required data. If not give some default data.*/
       if (wordInfo.pronunciations != undefined) {
           var tempAudURL = wordInfo.pronunciations[0].split("/");
           audioId = tempAudURL[tempAudURL.length - 1];
           console.log(audioId);
       } else {
           console.log("Audio not available");
       }

       if (wordInfo.meaning == undefined) {
           wordInfo.meaning = "Meaning not available.Click to add.";
       } else {}
       console.log(wordInfo.meaning);

       if (wordInfo.exampleSentences != undefined) {
           if (wordInfo.exampleSentences.length < 2) {
               wordInfo.exampleSentences[1] = "Example not available.Click to add";
           }
       } else if (wordInfo.exampleSentences == undefined) {
           wordInfo.exampleSentences = [];
           wordInfo.exampleSentences[0] = "Example not available.Click to add.";
           wordInfo.exampleSentences[1] = "Example not available.Click to add.";
       }
       console.log("This is example : ", wordInfo.exampleSentences);

       if (wordInfo.pictures != undefined) {
           var tempURL = wordInfo.pictures[0].split("/");
           imageId = tempURL[tempURL.length - 1];
       } else {
           wordInfo.pictures = [];
           wordInfo.pictures[0] = EkstepEditor.config.absURL + instance.relativeURL("assets/No_Image_Available.png");
           var tempURL = wordInfo.pictures[0].split("/");
           imageId = tempURL[tempURL.length - 1];
       }
       console.log("this is image details :", wordInfo.pictures, imageId);
        
        instance.displayReceivedData(wordInfo); //display the data
        



        if (this.editorObj) this.editorObj.setFill(props.fill);
        
    },
    
    /**
     *
     *   update editorObj properties on config change
     *   @member of shape
     *   
     *
     */
    loadHtml: function(parentInstance, attrs) {
        var instance = this;

        EkstepEditorAPI.getService('popup').open({
            template: 'flashcard',
            controller: 'flashcardEditorController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function() {
                    return instance;
                },
                'attrs': function() {
                    return attrs;
                }
            },
            width: 900,
            showClose: false,
        });


    },

    onConfigChange: function(key, value) { //value has the inputted value(key is the field name(first number etc); value is the entered number)
        console.log("this is the key : ", key, ">>", "this is the value", value); //any change in the values in the config box can be accessed from here
        var instance = this;

        EkstepEditorAPI.render();
        EkstepEditorAPI.dispatchEvent('object:modified', { target: EkstepEditorAPI.getEditorObject() });
    },

    displayReceivedData: function(wordDetails) { //this is the new function

        console.log("This is running", wordDetails);
        var instance = this;

        /* Set config details for each plugin to display word data*/

        var textConfig = {
            "__text": wordDetails.lemma,
            "x": 10,
            "y": 40,
            "fontFamily": "Verdana",
            "fontSize": 25,
            "minWidth": 20,
            "w": 45,
            "maxWidth": 500,
            "fill": "#000000",
            "fontStyle": "normal",
            "fontWeight": "normal",
            "stroke": "rgba(255, 255, 255, 0)",
            "strokeWidth": 1,
            "opacity": 1,
            "editable": false,
        };

        var descriptionConfig = {
            "__text": wordDetails.meaning,
            "x": 10,
            "y": 50,
            "fontFamily": "Verdana",
            "fontSize": 20,
            "minWidth": 100,
            "w": 35,
            "maxWidth": 500,
            "fill": "#000000",
            "fontStyle": "normal",
            "fontWeight": "normal",
            "stroke": "rgba(255, 255, 255, 0)",
            "strokeWidth": 1,
            "opacity": 1,
            "editable": false
        };

        var bgShapeConfig = {
            "x": 47,
            "y": 1,
            "fill": "#ffe6cb",
            "w": 43,
            "h": 98,
            "stroke": "rgba(255, 255, 255, 0)",
            "strokeWidth": 1,
            "opacity": 0.5,
            "type": "roundrect"
        };

        var exampleOneConfig = {
            "__text": "Example1: " + '\n' + wordDetails.exampleSentences[0] + '\n' + '\n' + "Example2: " + '\n' + wordDetails.exampleSentences[1],
            "x": 50,
            "y": 55,
            "fontFamily": "Verdana",
            "fontSize": 20,
            "minWidth": 20,
            "w": 40,
            "maxWidth": 500,
            "fill": "#000000",
            "fontStyle": "normal",
            "fontWeight": "normal",
            "stroke": "rgba(255, 255, 255, 0)",
            "strokeWidth": 1,
            "opacity": 1,
            "editable": false,
        };

        var imageConfig = {
            "x": 56.5,
            "y": 8,
            "w": 20,
            "h": 38,
            "stretch": false,
            "asset": imageId,
            "assetMedia": {
                "id": imageId,
                "src": wordDetails.pictures[0], //EkstepEditor.config.absURL + instance.relativeURL("assets/submitbutton.png"),
                "type": "image"
            }
        };
        if (wordDetails.pronunciations != undefined) {
            var audioConfig = {
                "x": 54,
                "y": 10,
                "w": 30,
                "h": 30,
                "autoplay":true,
                "asset": audioId,
                "assetMedia": {
                    "id": audioId,
                    "src": wordDetails.pronunciations[0],
                    "type": "audio"
                }
            };
            var audioprops = this.convertToFabric(audioConfig);
            EkstepEditorAPI.instantiatePlugin("org.ekstep.audio", audioprops, EkstepEditorAPI.getCurrentStage());
        }

        console.log("This is audio config : ", audioConfig);

        var textprops = this.convertToFabric(textConfig);
        var descriptionprops = this.convertToFabric(descriptionConfig);
        var bgshapeprops = this.convertToFabric(bgShapeConfig);
        var exampleoneprops = this.convertToFabric(exampleOneConfig);
        var imageprops = this.convertToFabric(imageConfig);

        /*Instantiate plugins*/
        EkstepEditorAPI.instantiatePlugin('org.ekstep.text', textprops, EkstepEditorAPI.getCurrentStage());
        EkstepEditorAPI.instantiatePlugin('org.ekstep.text', descriptionprops, EkstepEditorAPI.getCurrentStage());
        EkstepEditorAPI.instantiatePlugin('org.ekstep.shape', bgshapeprops, EkstepEditorAPI.getCurrentStage());
        EkstepEditorAPI.instantiatePlugin('org.ekstep.text', exampleoneprops, EkstepEditorAPI.getCurrentStage());
        EkstepEditorAPI.instantiatePlugin('org.ekstep.image', imageprops, EkstepEditorAPI.getCurrentStage());
    },

    /**
     *
     *   get config data plugin instance
     *   @returns {Object}
     *   config object
     *   @memberof shape
     */
    getConfig: function() {
        var config = this._super();

        return config;
    }


});
//# sourceURL=flashcard.js
