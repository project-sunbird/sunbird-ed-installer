 /**
  * plugin is used to create the result summarizer
  * @extends org.ekstep.contenteditor.basePlugin
  * @author Shirisha K <shirisha.reddy@tarento.com>
  */

 org.ekstep.contenteditor.basePlugin.extend({
     /**
      * This expains the type of the plugin
      */
     type: "org.ekstep.summarizer",
     currentInstance: undefined,
     /**
      * registers events
      */
     initialize: function() {
         ecEditor.addEventListener("org.ekstep.summarizer:showpopup", this.loadHtml, this);
         var instance = this;
         setTimeout(function() {
             var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/summarizer.html');
             var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/resultsummarize.js');
             ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);
         }, 1000);

     },
     /**
      * This method is used to create the  fabric object and assigns it to editor of the instance
      * convertToFabric is used to convert attributes to fabric properties 
      */
     newInstance: function() {
         delete this.configManifest;
         var instance = this;
         var _parent = this.parent;
         this.parent = undefined;
         this.addAllMedia();
         currentInstance = this;
         if (!this.attributes.x) {
             this.attributes.x = 13;
             this.attributes.y = 5;
             this.attributes.w = 75;
             this.attributes.h = 40;
             this.percentToPixel(this.attributes);
         }
         // 
         var props = this.convertToFabric(this.attributes);
         delete props.width;
         delete props.height;
         var imageURL = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "assets/sample.png");
         fabric.Image.fromURL(imageURL, function(img) {
             instance.editorObj = img;
             instance.parent = _parent;
             instance.editorObj.scaleToWidth(props.w);
             instance.postInit();
         }, props);

         currentInstance = this;

     },
     /**        
      *   load html template into the popup
      */
     loadHtml: function() {
         currentInstance = this;
         ecEditor.getService(ServiceConstants.POPUP_SERVICE).open({
             template: 'summarizer',
             controller: 'resultsummarizer',
             controllerAs: '$ctrl',
             resolve: {
                 'instance': function() {
                     return currentInstance;
                 }
             },
             width: 900,
             showClose: false,
             className: 'ngdialog-theme-plain'
         }, function() {
             if (!ecEditor._.isUndefined(currentInstance.editorObj)) {
                 //currentInstance.editorObj.remove();
                 ecEditor.render();
             }
         });

     },
     /**
      * This method overridden from org.ekstep.contenteditor.basePlugin and here we double click event is added
      */
     selected: function(instance) {
         currentInstance = ecEditor.getCurrentObject();
         fabric.util.addListener(fabric.document, 'dblclick', this.dblClickHandler);
     },
     /**
      * This method overridden from org.ekstep.contenteditor.basePlugin and here we double click event is removed
      */
     deselected: function(instance, options, event) {
         fabric.util.removeListener(fabric.document, 'dblclick', this.dblClickHandler);
     },
     /**
      * This method is called when the object:unselected event is fired
      * It will remove the double click event for the canvas
      */
     objectUnselected: function(event, data) {
         fabric.util.removeListener(fabric.document, 'dblclick', this.dblClickHandler);
     },
     /**
      * This method is callback for double click event which will call the textEditor to show the ediotor to add or modify text.
      */
     dblClickHandler: function(event) {
         var leftSt = ecEditor.jQuery("#canvas").offset().left + ecEditor.getCurrentObject().editorObj.left;
         var leftEnd = leftSt + ecEditor.getCurrentObject().editorObj.width;
         var topSt = ecEditor.jQuery("#canvas").offset().top + ecEditor.getCurrentObject().editorObj.top;
         var topEnd = topSt + ecEditor.getCurrentObject().editorObj.height;
         if (event.clientX > leftSt && event.clientX < leftEnd && event.clientY > topSt && event.clientY < topEnd) {
             currentInstance.loadHtml();
         }
     },
     /**
      * This method is used to add the images from asesets folder 
      */
     addAllMedia: function() {
         var data = this.config;
         var defaultMediaAssests = [{
             id: "viewDetails",
             src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/view.png'),
             assetId: "viewDetails",
             type: "image",
             preload: true
         }, {
             id: "nextButton",
             src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/next.png'),
             assetId: "nextButton",
             type: "image",
             preload: true
         }, {
             id: "previousButton",
             src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/previous.png'),
             assetId: "previousButton",
             type: "image",
             preload: true
         }, {
             id: "closeButton",
             src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/close.png'),
             assetId: "closeButton",
             type: "image",
             preload: true
         }, {
             id: "background",
             src: ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'assets/background.png'),
             assetId: "background",
             type: "image",
             preload: true
         }];
         ecEditor._.each(data.levelArray, function(obj) {
             var audioMedia = {
                 id: obj.audioReward,
                 src: obj.audioRewardSrc,
                 assetId: obj.audioReward,
                 type: "sound",
                 preload: true
             }

             var imageMedia = {
                 id: obj.imageReward,
                 src: obj.imageRewardSrc,
                 assetId: obj.imageReward,
                 type: "image",
                 preload: true
             }
             defaultMediaAssests.push(audioMedia);
             defaultMediaAssests.push(imageMedia);
         });


         var ins = this;
         ecEditor._.forEach(defaultMediaAssests, function(defaultMedia) {
             ins.addMedia(defaultMedia);
         });
     }
 });

 //# sourceURL=summarizerEditorplugin.js
