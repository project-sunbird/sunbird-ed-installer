//@ sourceURL=activitybase-editor-plugin.js
/**
 * Editor plugin for the funtoot Common template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Amulya K <amulya.k@funtoot.com>
 */
org.ekstep.contenteditor.basePlugin.extend({
    type: "org.ekstep.plugins.funtoot.activitybase.editorplugin",
    /**
     * initializes a new instance of the plugin
     * @memberof funtoot-common
     * @returns {void} nothing
     */
    initialize: function () {
        var id = 'org.ekstep.plugins.funtoot.activitybase';
        var version = '1.0';
        ecEditor.addEventListener(this.manifest.id + ":showpopup", this.showDialog, this);
        ecEditor.addEventListener(this.manifest.id + ":renderFabricContent", this.renderFabricContent, this);
        setTimeout(function () {
            var templatePath = ecEditor.resolvePluginResource(id, version, 'editor/activitybase.html');
            var controllerPath = ecEditor.resolvePluginResource(id, version, 'editor/activitybase.js');
            ecEditor.getService('popup').loadNgModules(templatePath, controllerPath);
        }, 1000);

    },
    /**
     *   shows the dialog for editing the questions
     */
    showDialog: function () {
        var instance = this;
        instance.callback = this.controllerCallback;
        var filtersPath = ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, this.manifest.editor.wizard.filter);
        ecEditor.getService('popup').open({
            template: 'activityBase',
            controller: 'activityBaseCtrl',
            controllerAs: '$ctrl',
            resolve: {
                'instance': function () {
                    return instance;
                },
                'filters': function () {
                    return filtersPath;
                }
            },
            width: 900,
            showClose: false,
            className: 'ngdialog-theme-plain'
        });
    },
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
            var canvas = org.ekstep.contenteditor.api.getCanvas();
            fabric.util.addListener(canvas.upperCanvasEl, 'dblclick', this.dblClickHandler);
        } else {
            instance.editorObj._objects[1]._objects[0].setText(instance.config.title);
            instance.editorObj._objects[1]._objects[1].setText(instance.config.count + "  Questions");
        }
    },

    /**
     * callback for the event <plugin-id>::renderFabricContent
     * @param {object} event the event that triggered this call
     * @param {object} questionSet The questions selected
     * @memberof funtoot-common
     * @returns {void} nothing
     */
    renderFabricContent: function (event, questionSet) {
        event.target.setQuestionData(questionSet);
    },

    /**
     * initializes the plugin data and config with data from the dialog
     * and sends the <plugin-id>:create event to instantiate the plugin object
     * @param {object[]} questions questions data from the dialog
     * @memberof funtoot-common
     * @returns {void} nothing
     */
    setQuestionData: function (questions) {
        // This function will do construction of the question Object
        // config is the configrations of the controller(title, question count etc.,)

        var instance = this;

        var itemObj = this.getItemDataAndConfig(questions);

        instance.setConfig(itemObj.config);
        instance.setData(itemObj.data);
        // create data for sending as part of the create event
        if (!instance.editorObj) {
            var _assessmentData = {
                data: {
                    __cdata: JSON.stringify(itemObj.data)
                },
                config: {
                    __cdata: JSON.stringify(itemObj.config)
                },
            };
            ecEditor.dispatchEvent(instance.manifest.id + ':create', _assessmentData);
        } else {
            instance.drawFabricObjects();
        }
    },
    /**
     *
     * and sends the <plugin-id>:create event to instantiate the plugin object
     * @param {object[]} questions questions data from the dialog
     * @memberof funtoot-common
     * @returns {void} nothing
     */
    getItemDataAndConfig: function (questions) {
        var assessmentModel = {
            total_items: 0,
            item_sets: [],
            items: {},
            i18n: {}
        };
        var config = questions.config;
        var itemSet = {
            id: _.uniqueId('set'),
            count: config.count
        };
        assessmentModel.item_sets.push(itemSet);
        assessmentModel.items[itemSet.id] = [];
        _.each(questions.items, function (item) {
            assessmentModel.items[itemSet.id].push(item);
        });
        assessmentModel.total_items = config.count;
        // assessmentModel.i18n = questions.i18nData;
        assessmentModel.selectedConfig = config.selectedConfig;
        //assessmentModel.items[itemSet.id].push(questions.items);
        config = Object.assign(config, {
            "type": "items",
            "var": "item"
        });
        return {
            config: config,
            data: assessmentModel
        }
    },
    /**
     * constructs the fabric.Text objects for the title and count config values
     * @param {string} qTitle the question title
     * @param {number} qCount the number of times the questions to be repeated
     * @returns {object} the fabric group object created for rendering on the canvas
     * @memberof funtoot-common
     */
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
     * overriding org.ekstep.contenteditor.basePlugin.onConfigChange
     * @memberof funtoot-common
     * @param {string} key the key of the configuration property that got changed
     * @param {object} value the value of the changed configuration
     * @returns {void} nothing
     */
    onConfigChange: function (key, value) {
        var instance = this;
        if (!_.isUndefined(value)) {
            switch (key) {
                case 'title':
                    this.config.title = value;
                    _.each(this.data.items, function (v) {
                        v.title = value;
                    });
                    this.editorObj._objects[1]._objects[0].setText(value);
                    break;
                case 'count':
                    instance.config.count = value;
                    instance.data.item_sets[0].count = value;
                    instance.editorObj._objects[1]._objects[1].setText(value + "  Questions");
                    break;
            }
        }
        ecEditor.render();
        ecEditor.dispatchEvent('object:modified', {
            target: ecEditor.getEditorObject()
        });
    },
    /**
     * overrides org.ekstep.contenteditor.basePlugin.getConfig for construction of ECML
     * @memberof funtoot-common
     * @returns {object} the configuration to be included in the ECML
     */
    getConfig: function () {
        var instance = this;
        var config = this._super();
        config.title = instance.config.title;
        config.count = (typeof (instance.config.count) == "string") ? parseInt(instance.config.count) : instance.config.count;
        return config;
    },
    /**
     * overrides org.ekstep.contenteditor.basePlugin.getData for construction of ECML
     * @memberof funtoot-common
     * @returns {object} the data for the renderer plugin to be include in the ECML
     */
    getData: function () {
        var data = this._super();
        return data;
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
     * overrides org.ekstep.contenteditor.basePlugin.selected. Registers for double click event
     * on the fabric object
     * @param {object} instance the instance of this plugins
     * @returns {void} nothing
     */
    selected: function () {},

    /**
     * handles double click event on the fabric object
     * @returns {void} nothing
     */
    dblClickHandler: function () {
        var instance = org.ekstep.contenteditor.api.getCurrentObject();
        if (instance)
            instance.showDialog();
    },

    /**
     * serves as the callback when the dialog is closed by the user
     * @param {object[]} items the items array as configured from the dialog
     * @param {object} config the config as selected by the user
     * @param {object} i18nData the i18n data that contains translatable strings
     * @returns {void} nothing
     */
    controllerCallback: function (items, config) {
        var instance = this;
        var questionSet = {
            items: items,
            config: config
        };
        ecEditor.dispatchEvent('org.ekstep.plugins.funtoot.activitybase' + ':renderFabricContent', questionSet, instance);
    },
    /**
     * loads the image depending on the question configuration and adds to the fabric object
     *  @memberof orderingNumbers
     */
    loadFabricImage: function () {
        var version = '1.0';
        var instance = this;
        var fabricImg = ecEditor.resolvePluginResource(this.manifest.id, version, this.manifest.editor.assets.fabricImgPath);
        fabric.Image.fromURL(fabricImg, function (img) {
            instance.editorObj.addWithUpdate(img);
            org.ekstep.contenteditor.api.render();
        }, instance.convertToFabric(instance.attributes));
    }
});