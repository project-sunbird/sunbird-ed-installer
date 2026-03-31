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
    type: "org.ekstep.flashcarddev",
    imageId: "",
    audioId: "",
    wordInfo: {},

    initialize: function() {
        EkstepEditorAPI.addEventListener("org.ekstep.flashcarddev:showpopup", this.loadHtml, this);
        setTimeout(function() {
            var templatePath = EkstepEditor.config.pluginRepo + '/org.ekstep.flashcarddev-1.0/editor/flashcardEditorConfig.html';
            var controllerPath = EkstepEditor.config.pluginRepo + '/org.ekstep.flashcarddev-1.0/editor/flashcardeditorapp.js';
            EkstepEditorAPI.getService('popup').loadNgModules(templatePath, controllerPath);
        }, 1000);

    },
    /**
     * New instance of flashcard. Process the word data and display everything as individual elements on the stage. 
     */
    newInstance: function() {

        wordInfo = {};
        imageId = "";
        audioId = "";

        var instance = this;
        
        //don't need a parent
        this.parent = undefined;

        var props = this.convertToFabric(this.attributes);
        delete this.configManifest; 

        wordInfo = props; 
        
        //Get the audio for the word if available. 
        if (wordInfo.pronunciations != undefined) { 
            var tempAudURL = wordInfo.pronunciations[0].split("/");
            audioId = tempAudURL[tempAudURL.length - 1];
           
        }

        //Meaning
        if (wordInfo.meaning == undefined) { //meaning
            wordInfo.meaning = "Meaning not available.Click to add.";
        } 
        
        //Example sentences
        if (wordInfo.exampleSentences != undefined) { 
            if (wordInfo.exampleSentences.length < 2) { 
                wordInfo.exampleSentences[1] = "Example not available.Click to add";
            }
        } else if (wordInfo.exampleSentences == undefined) {
            wordInfo.exampleSentences = [];
            wordInfo.exampleSentences[0] = "Example not available.Click to add.";
            wordInfo.exampleSentences[1] = "Example not available.Click to add.";
        }
        
        //Image
        if (wordInfo.pictures != undefined) { 
            var tempURL = wordInfo.pictures[0].split("/");
            imageId = tempURL[tempURL.length - 1];
        } else {
            wordInfo.pictures = [];
            wordInfo.pictures[0] = EkstepEditor.config.absURL + instance.relativeURL("assets/No_Image_Available.png");
            var tempURL = wordInfo.pictures[0].split("/");
            imageId = tempURL[tempURL.length - 1];
        }

        instance.displayReceivedData(wordInfo); 
        
    },

    /**
     *   Show browser to search for words. 
     *   @member of flashcard
     */
    loadHtml: function(parentInstance, attrs) {
        var instance = this;
        EkstepEditorAPI.getService('popup').open({
            template: 'flashcarddev',
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

    onConfigChange: function(key, value) {
        var instance = this;

        EkstepEditorAPI.render();
        EkstepEditorAPI.dispatchEvent('object:modified', { target: EkstepEditorAPI.getEditorObject() });
    },

    /**
     *   Function to build the data and invoke Text and Image plugins to put the word data on stage
     *   @member of flashcard
     */
    displayReceivedData: function(wordDetails) { 

        var instance = this;

        //The main word
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

        //Word meaning
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

        //BG shape
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

        //Example senteces 
        var exampleOneConfig = { 
            "__text": "Example1: " + '\n' + wordDetails.exampleSentences[0] + '\n' + '\n' + "Example2: " + '\n' + wordDetails.exampleSentences[1],
            "x": 50,
            "y": 55,
            "fontFamily": "Verdana",
            "fontSize": 18,
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

        //Image for the word
        var imageConfig = { 
            "x": 56.5,
            "y": 8,
            "w": 20,
            "h": 38,
            "stretch": false,
            "asset": imageId,
            "assetMedia": {
                "id": imageId,
                "src": wordDetails.pictures[0], 
                "type": "image"
            }
        };

        if (wordDetails.pronunciations != undefined) {
            var audioConfig = { //audio. To be executed only if audio is available.
                "x": 54,
                "y": 10,
                "w": 30,
                "h": 30,
                "autoplay": true,
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
     *   @memberof flashcard
     */
    getConfig: function() {
        var config = this._super();

        return config;
    }


});
//# sourceURL=flashcard.js
