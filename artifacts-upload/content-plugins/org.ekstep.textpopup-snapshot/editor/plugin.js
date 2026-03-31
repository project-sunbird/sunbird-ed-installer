    /**
     * plugin is used to create or modifiy the textpopup with toggle button in editor
     * @class textpopup
     * @extends org.ekstep.contenteditor.basePlugin
     * @author Devendra Singh <devendra.singh@tarento.com>
     */

    org.ekstep.contenteditor.basePlugin.extend({
        /**
         * This expains the type of the plugin 
         * @member {String} type
         * @memberof textpopup
         */
        type: "org.ekstep.textpopup",
        /**
         * @member currentInstance
         * @memberof textpopup
         *
         **/
        currentInstance: undefined,
        _popupText: undefined,
        _bgBox: undefined,
        /**
         * registers events
         * @memberof textpopup
         */
        initialize: function() {
            var instance = this;
            ecEditor.addEventListener("object:unselected", this.objectUnselected, this);
            ecEditor.addEventListener("org.ekstep.textpopup:showpopup", this.loadHtml, this);
            setTimeout(function() {
                var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/textpopup.html");
                var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/textpopupapp.js");
                ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);
            }, 1000);

        },
        /**
         * This method used to create the group(having text and toggle button) fabric object and assigns it to editor of the instance
         * convertToFabric is used to convert attributes to fabric properties 
         * @memberof textpopup
         */
        newInstance: function() {
            var instance = this;
            var props = this.convertToFabric(this.attributes);
            var gContent = this.createPopupText(props);
            this.editorObj = new fabric.Group(gContent, {
                "left": props.left,
                "top": props.top,
                "width": props.width,
                "height": props.height
            });
            currentInstance = this;
        },

        /**
         * Overridden from org.ekstep.contenteditor.basePlugin - this method adds toggle image as a child of text popup 
         * @param {object} instance, it is textpopup plugin object
         * @memberof textpopup
         */
        added: function(instance) {
            var ins = this;
            var imageConfig = { //Image  object  with default property
                "x": 90,
                "y": 2,
                "w": 4.5,
                "h": 8,
                "stretch": false,
                "asset": "toggle_image",
                "assetMedia": {
                    "id": "toggle_image",
                    "src": ecEditor.resolvePluginResource(ins.manifest.id, ins.manifest.ver, "assets/poptogglebtn.png"),
                    "type": "image",
                    "preload": true
                }
            };
            if (!ecEditor._.isUndefined(ins.data)) { //update image object during reload (reding property from ecml data)
                imageConfig.x = ins.data.x;
                imageConfig.y = ins.data.y;
                imageConfig.w = ins.data.w;
                imageConfig.h = ins.data.h;
            }

            var imageprops = this.convertToFabric(imageConfig);
            if (instance.children.length === 0) {
                this.image = ecEditor.instantiatePlugin('org.ekstep.image', ecEditor._.cloneDeep(imageprops), instance, {
                    getConfigManifest: function() { // Overriding getConfigManifest
                        var config = {};
                        return config;
                    }

                });
            }

        },

        /**
         * Overridden from org.ekstep.contenteditor.basePlugin - this method adds children of the textpoup on  canvas 
         * @param {object} plugin, it is a plugin object
         * @memberof textpopup
         */
        addChild: function(plugin) {
            this._super(plugin);
            this.parent.canvas.add(plugin.editorObj);
        },
        /**
         * Overridden from org.ekstep.contenteditor.basePlugin - this method returns the data for textpoup  
         * @return {object} data, it is the object having toggle btn details 
         * @memberof textpopup
         */
        getData: function() {
            if (this.children.length > 0) {
                var data = ecEditor._.cloneDeep(this.children[0].attributes);
                this.pixelToPercent(data);
                return data;
            } else {
                return { "x": 90, "y": 2, "w": 4.5, "h": 8, "asset": "toggle_image" };
            }
        },

        /**
         * Overridden from org.ekstep.contenteditor.basePlugin -this method Renders the plugin to canvas.
         * Here this method renders textpoup plugin as well as it's children
         * @memberof textpopup
         */
        render: function() {
            this.added(this);
            var canvas = this.parent.canvas;
            canvas.add(this.editorObj);
            if (this.children.length > 0)
                canvas.add(this.children[0].editorObj);
        },
        /**
         * Returns the media manifest of this plugin. You can add media such as images, audios, or even
         * other runtime dependencies such as JS, CSS and other plugin files. If you don't declare a
         * media, it will not be included in the content download archive.
         * @memberof textpopup
         */
        getMedia: function() {
            return this.children[0].getMedia();
        },
        /**        
         *   load html template into the popup
         *   @memberof textpopup
         */
        loadHtml: function() {
            currentInstance = this;
            ecEditor.getService(ServiceConstants.POPUP_SERVICE).open({
                template: 'textpopup',
                controller: 'textpopupcontroller',
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
                    // currentInstance.editorObj.remove();
                    ecEditor.render();
                }
            });

        },
        /**
         * This method overridden from org.ekstep.contenteditor.basePlugin and here double click event is added
         * @memberof textpopup
         */
        selected: function(instance) {
            currentInstance = ecEditor.getCurrentObject();
            fabric.util.addListener(fabric.document, 'dblclick', this.dblClickHandler);
        },
        /**
         * This method overridden from org.ekstep.contenteditor.basePlugin and here double click event is removed
         * @memberof textpopup
         */
        deselected: function(instance, options, event) {
            fabric.util.removeListener(fabric.document, 'dblclick', this.dblClickHandler);
        },
        /**
         * This method is called when the object:unselected event is fired
         * It will remove the double click event for the canvas
         * @memberof textpopup
         */
        objectUnselected: function(event, data) {
            fabric.util.removeListener(fabric.document, 'dblclick', this.dblClickHandler);
        },
        /**
         * This method is callback for double click event which will call the textEditor to show the ediotor to add or modify text.
         * @param event {Object} event
         * @memberof textpopup
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
         * This method overridden from org.ekstep.contenteditor.basePlugin and it will be called on change of configuration of plugin,
         * <br/>It will update the fontweight, fontstyle, fontfamily,fontsize and color of the plugin
         * @memberof Text
         */
        onConfigChange: function(key, value) {
            switch (key) {
                case "bgcolor":
                    this.attributes.bgcolor = value;
                    this.editorObj._objects[0].setFill(value);
                    break;
                case "fontsize":
                    this.editorObj._objects[1].setFontSize(value);
                    this.attributes.fontSize = value;
                    break;
                case "color":
                    this.editorObj._objects[1].setFill(value);
                    this.attributes.color = value;
                    break;
            }
            ecEditor.render();
            ecEditor.dispatchEvent('object:modified', { target: ecEditor.getEditorObject() });
        },

        /**
         * This method overridden from org.ekstep.contenteditor.basePlugin and it will provide the config of this plugin
         * @memberof poptext
         */
        getConfig: function() {
            var config = {};
            config.bgcolor = this.attributes.bgcolor;
            config.color = this.attributes.color || this.attributes.fill;
            config.fontsize = this.attributes.fontSize;
            return config;
        },

        /**
         * This method overridden from org.ekstep.contenteditor.basePlugin and it will update the configuration properties given in the plugin manifest
         * @memberof poptext
         */
        getConfigManifest: function() {
            var config = this._super();
            ecEditor._.remove(config, function(c) {
                return c.propertyName === 'stroke';
            })
            ecEditor._.remove(config, function(c) {
                return c.propertyName === 'autoplay';
            })
            ecEditor._.remove(config, function(c) {
                return c.propertyName === 'visible';
            })
            return config;
        },

        /**
         * This method is used to create fabric text and pop box object
         * @memberof textpopup
         * @return {array} array containg popbox and text object
         */
        createPopupText: function() {
            var props = this.convertToFabric(this.attributes);
            var instance = this;
            var pText = instance.attributes.__text;
            pText = pText.substring(0, 15) + ".....";
            this._popupText = new fabric.Text(pText, { "left": props.left, "top": props.top, "width": props.width, "fontSize": props.fontSize });
            this._popupText.setColor(props.fill);
            this._bgBox = new fabric.Rect({
                "left": props.left,
                "top": props.top,
                "fill": props.bgcolor,
                "width": props.w,
                "height": props.h,
                "opacity": 0.5
            });

            var gContent = [];
            gContent.push(instance._bgBox);
            gContent.push(instance._popupText);
            return gContent;

        }

    });
    //# sourceURL=textpopup.js
