//@ sourceURL= wscomposer-editorPlugin.js
/**
 *
 * plugin to get assessments (Questions) from learning platform
 * @class wscomposer
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Amulya Kali
 * @fires assessment:addassessment to stage
 * @listens org.ekstep.wscomposer:show
 */

org.ekstep.contenteditor.basePlugin.extend({
    /**
     * This expains the type of the plugin
     * @member {String} type
     * @memberof assessment
     */
    type: "org.ekstep.plugins.funtoot.wscomposer",
    /**
     * Preview URL is used to append src to iframe
     * @member {string} previewURL
     * @memberof assessment
     */
    previewURL: 'preview/preview.html?webview=true',
    /**
     * initializes a new instance of the plugin
     * @memberof funtoot-common
     * @returns {void} nothing
     */
    newInstance: function () {
        var instance = this;
        delete instance.configManifest;
        instance.attributes.w = 80;
        instance.attributes.h = 80;
        instance.attributes.x = 10;
        instance.attributes.y = 10;
        instance.addMediaFromConfig();
        instance.percentToPixel(instance.attributes);
        if (_.isUndefined(this.config.media)) {
            instance.hasTemplateMedia = false;
            instance.getItems(instance.data.items, "media").forEach(function (element) {
                instance.addMediatoManifest(element);
            });
        }
        instance.drawFabricObjects();
    },
    getItems: function (items, type) {
        // it returns the Unique templateId || media of the questions || length of the question
        var questions = [],
            media = [];
        for (var key in items) {
            questions = items[key];
        }
        if (type === "templateId") {
            return _.uniq(_.filter(_.map(questions, "template_id"), Boolean));
        } else if (type === 'media') {
            questions.forEach(function (element) {
                if (typeof element.media == 'string') {
                    element.media = JSON.parse(element.media);
                    if (_.isArray(element.media)) {
                        _.each(element.media, function (m) {
                            media.push(m);
                        });
                    } else {
                        media.push(element.media);
                    }
                }
            });
            return media;
        } else {
            return questions.length;
        }
    },
    addMediatoManifest: function (media) {
        /*it will add the all media to the manifest*/
        var instance = this;
        if (!_.isUndefined(media)) {
            if (_.isArray(media)) {
                media.forEach(function (ele, index) {
                    if (!_.isNull(media[index].id) && !_.isNull(media[index].src)) {
                        // Adding the preload property to the media
                        media[index].preload = "true";
                        instance.addMedia(media[index]);
                        instance.addMediaToConfig(media[index]);
                    }
                });
            } else {
                media.preload = "true";
                instance.addMedia(media);
                instance.addMediaToConfig(media);
            }
        }
    },
    addMediaFromConfig: function () {
        var instance = this;
        if (!_.isUndefined(this.config.media)) {
            _.forIn(this.config.media, function (value) {
                instance.addMedia(value);
            });
        }
    },
    mediaObj: {},
    addMediaToConfig: function (media) {
        if (media.src) {
            org.ekstep.contenteditor.mediaManager.getMediaOriginURL(media.src);
            this.mediaObj[media.id] = media;
            this.addConfig("media", this.mediaObj);
        }
    },
    /**
     * overrides org.ekstep.contenteditor.basePlugin.getAttributes for construction of ECML
     * !!Our plugins always need 100% of width and height on the Genie canvas!!
     * @memberof funtoot-common
     * @returns {object} the attributes of the plugin for rendering on canvas
     */
    getAttributes: function () {
        var attr = {
            w: 100,
            h: 100,
            x: 0,
            y: 0
        };
        this.percentToPixel(attr);
        return attr;
    },
    /**
     * renders the fabric object on the canvas
     * @memberof funtoot-common
     * @returns {void} nothing
     */
    drawFabricObjects: function () {
        var instance = this;
        if (!instance.editorObj) {
            var coords = instance.convertToFabric(instance.attributes);
            var fabricObjects = [];
            var container = new fabric.Rect(Object.assign({
                fill: "#FAFAFA"
            }, coords));
            fabricObjects.push(container);
            var fabricText = instance.getPropsForEditor(instance.config.title, instance.config.count);
            fabricObjects.push(fabricText);
            instance.editorObj = new fabric.Group(fabricObjects, coords);
            instance.loadFabricImage();
        } else {
            instance.editorObj._objects[1]._objects[0].setText(instance.config.title);
            instance.editorObj._objects[1]._objects[1].setText(instance.config.count + "  Questions");
        }
    },
    getPropsForEditor: function (qTitle, qCount) {
        // Display all the properties (title,count) on the editor
        var txtTitle = new fabric.Text(qTitle, {
            fontSize: 15,
            fill: 'black',
            textAlign: 'center',
            top: 70,
            left: 270
        });
        var txtCount = new fabric.Text(qCount + "  Questions", {
            fontSize: 12,
            fill: 'black',
            top: 42,
            left: 500
        });
        var fabricGroup = new fabric.Group([txtTitle, txtCount]);
        return fabricGroup;
    },
    /**
     * loads the image depending on the question configuration and adds to the fabric object
     * @memberof skip-counting
     */
    loadFabricImage: function () {
        var id = this.manifest.id;
        var version = this.manifest.ver;
        var instance = this;
        var fabricImg = ecEditor.resolvePluginResource(id, version, "/editor/assets/wp-fabric.png");
        fabric.Image.fromURL(fabricImg, function (img) {
            img.crossOrigin = "Anonymous";
            instance.editorObj.addWithUpdate(img);
            org.ekstep.contenteditor.api.render();
        }, instance.convertToFabric(instance.attributes));
    },

    /**
     *   @memberof callback {Funtion} callback
     *   @memberof wscomposer
     *   @param {Object} items  items
     */
    callback: function (items) {
        // This function will do construction of the question Object
        // config is the configrations of the controller(title, question count etc.,)
        var instance = this;
        var assessmentModel = {
            total_items: 0,
            item_sets: [],
            items: {},
            i18n: {}
        };
        var itemSet = {
            id: _.uniqueId('set'),
            count: items.length
        };
        assessmentModel.item_sets.push(itemSet);
        assessmentModel.items[itemSet.id] = [];
        _.each(items, function (item) {
            item["numericLangId"] = "en";
            item["langId"] = "en";
            item["title"] = "Word Problems";
            assessmentModel.items[itemSet.id].push(item);
        });
        assessmentModel.total_items = items.length;
        //  assessmentModel.i18n = items.i18nData;
        // assessmentModel.selectedConfig = config.selectedConfig;
        //assessmentModel.items[itemSet.id].push(items.items);
        items["title"] = "Word Problems";
        //instance.title = items.title;
        var config = Object.assign({}, {
            "type": "items",
            "var": "item",
            "title": items.title,
            "count": (typeof (itemSet.count) == "string") ? parseInt(itemSet.count) : itemSet.count,
            "selectedConfig": {
                "enableNextButton": true,
                "contentType": "Practice",
                "areMicrohintsEnabled": true,
                "enableFeedback": true,
                "enableSolution": true,
                "enableHint": true,
                "areVariablesStatic": false,
                "retainAnswers": false,
                "maxNoOfAtt": 2
            }
        });
        // config["title"] = "Word Problems"
        instance.setConfig(config);
        instance.setData(assessmentModel);

        // reset the media and add media for the selected language
        /*  instance.media = {};
          var mediaSrc = ecEditor.resolvePluginResource(instance.manifest.id,
              instance.manifest.ver, '/editor/assets/i18n/' + config.locales.contentLocale + '.json')
          instance.addMedia({
              id: 'i18ndata',
              src: mediaSrc,
              type: 'js',
              preload: true
          }); */

        // create data for sending as part of the create event
        if (!instance.editorObj) {
            var _assessmentData = {
                data: {
                    __cdata: JSON.stringify(assessmentModel)
                },
                config: {
                    __cdata: JSON.stringify(config)
                }
            };
            fabric.util.addListener(fabric.document, 'dblclick', this.dblClickHandler);
            ecEditor.dispatchEvent(instance.manifest.id + ':create', _assessmentData);
        } else
            instance.drawFabricObjects();

        /* var _assessmentData = {
             data: { __cdata: JSON.stringify(items) },
             config: { __cdata: JSON.stringify(activityOptions) }
         };
         ecEditor.dispatchEvent(this.manifest.id + ':create', _assessmentData);*/
    },
    /**
     *   registers events
     *   @memberof wscomposer
     *
     */
    initialize: function () {
        var instance = this;
        ecEditor.addEventListener(this.manifest.id + ":show", this.showAssessmentBrowser, this);
        ecEditor.addEventListener(this.manifest.id + ":renderFabricContent", this.renderFabricContent, this);
        setTimeout(function () {
            var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/wscomposer.html");
            var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/wscomposer.js");
            ecEditor.getService('popup').loadNgModules(templatePath, controllerPath);
        }, 1000);

    },
    /**
     *   invokes popup service to show the popup window
     *   @param {Function} callback  callback to be fired when data is available.
     *   @memberof wscomposer
     */
    showAssessmentBrowser: function () {
        var instance = this;
        //   this.callback = this.controllerCallback;
        //   this.data = '';
        ecEditor.getService('popup').open({
            template: 'wscomposer',
            controller: 'wscomposerController',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function () {
                    return instance;
                },
            },
            width: 900,
            showClose: false,
            className: 'ngdialog-theme-plain'
        });

    },
    /**
     * handles double click event on the fabric object
     * @returns {void} nothing
     */
    dblClickHandler: function () {
        var instance = org.ekstep.contenteditor.api.getCurrentObject();
        if (instance) {
            instance["qCodes"] = [];
            _.each(instance.data.items[instance.data.item_sets[0].id], function (item) {
                instance["qCodes"].push(item.code);
            });
            instance.showAssessmentBrowser();
        }
    }
});