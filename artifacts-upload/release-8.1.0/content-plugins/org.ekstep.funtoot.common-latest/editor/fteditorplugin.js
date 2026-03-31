//@ sourceURL=funtoot-common-plugin.js
/**
 * Editor plugin for the funtoot Common template
 * @extends org.ekstep.contenteditor.basePlugin
 * @author Sandhya M <sandhya.m@funtoot.com>
 */
org.ekstep.contenteditor.basePlugin.extend({

    type: "org.ekstep.funtoot.common.editorBasePlugin",
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
        instance.percentToPixel(instance.attributes);
        instance.drawFabricObjects();
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
        org.ekstep.contenteditor.api.render();
    },
    /**
     * Resolves the fabric image path
     *  @memberof funtoot-common
     */
    getFabricImagePath: function () {
        return ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, this.manifest.editor.assets.fabricImgPath);
    },
    /**
     * loads the image depending on the question configuration and adds to the fabric object
     *  @memberof funtoot-common
     */
    loadFabricImage: function (fabImgPath) {
        var instance = this;
        var fabricImg = this.getFabricImagePath();
        fabric.Image.fromURL(fabricImg, function (img) {
            console.log(img.width + 'x' + img.height + '(' + img.x + ',' + img.y + ')');
            instance.editorObj.addWithUpdate(img);
            org.ekstep.contenteditor.api.render();
        }, instance.convertToFabric(instance.attributes));
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
        assessmentModel.i18n = questions.i18nData;
        assessmentModel.selectedConfig = config.selectedConfig;
        //assessmentModel.items[itemSet.id].push(questions.items);
        config = Object.assign(config, {
            "type": "items",
            "var": "item"
        });
        instance.setConfig(config);
        instance.setData(assessmentModel);

        // reset the media and add media for the selected language
        instance.media = {};
        var mediaSrc = ecEditor.resolvePluginResource(instance.manifest.id,
            instance.manifest.ver, '/editor/assets/i18n/' + config.locales.contentLocale + '.json')
        instance.addMedia({
            id: 'i18ndata',
            src: mediaSrc,
            type: 'js',
            preload: true
        });

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
            ecEditor.dispatchEvent(instance.manifest.id + ':create', _assessmentData);
        } else
            instance.drawFabricObjects();
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
        fabricGroup = new fabric.Group([txtTitle, txtCount]);
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
     * The questions are repeated as many times the value of the count here.
     * @memberof funtoot-common
     * @returns {object} the data for the renderer plugin to be include in the ECML
     */
    getData: function () {
        var instance = this;
        console.log('getData called!');
        var data = this._super();
        if (data) {
            if (data.selectedConfig.areVariablesStatic) {
                if (!data.selectedConfig.varProccessed) {
                    var dataArray = {};
                    dataArray[data.item_sets[0].id] = [];
                    for (var idx = 0; idx < instance.config.count; idx++) {
                        var item = data.selectedConfig.isVarPreProcessed ? data.items[data.item_sets[0].id][idx] : data.items[data.item_sets[0].id][0];
                        // initialize the 'identifier' property here
                        var newItem = ecEditor._.cloneDeep(item);
                        if (!data.selectedConfig.isVarPreProcessed)
                            new org.ekstep.generators().processVariables(newItem.model.variables);
                        newItem.model.variablesProcessed = true;
                        newItem.identifier = instance.manifest.id + "-g" + newItem.grade + "-l" + newItem.level + "-sl" + newItem.sublevel + "-q" + idx + "-rand" + Math.random().toString().replace('0.', '');
                        dataArray[data.item_sets[0].id].push(newItem);
                    }
                    data.items[data.item_sets[0].id] = [];
                    data.items = dataArray;
                    data.selectedConfig["varProccessed"] = true;
                }
            } else {
                var item = data.items[data.item_sets[0].id][0];
                data.items[data.item_sets[0].id] = [];
                for (var idx = 0; idx < instance.config.count; idx++) {
                    // initialize the 'identifier' property here
                    var newItem = ecEditor._.cloneDeep(item);
                    newItem.identifier = instance.manifest.id + "-g" + newItem.grade + "-l" + newItem.level + "-sl" + newItem.sublevel + "-q" + idx + "-rand" + Math.random().toString().replace('0.', '');
                    data.items[data.item_sets[0].id].push(newItem);
                }
            }
            data.total_items = instance.config.count;
        }
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
    selected: function (instance) {},

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
    controllerCallback: function (items, config, i18nData) {
        var instance = this;
        var questionSet = {
            items: items,
            config: config,
            i18nData: i18nData
        };
        ecEditor.dispatchEvent(instance.manifest.id + ':renderFabricContent', questionSet, instance);
    }
});