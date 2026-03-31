//@ sourceURL=funtoot-editor-preview.js
/**
 * Editor plugin Which creates preview inside generic and custom plugins
 * @author Sivashanmugam K <sivashanmugam.kannan@funtoot.com>
 */

function funtootCommonPluginPreview(e, t, r, i) {
    var previewData;
    var previewSetTimeOutHandle;
    sendDataToPreview.call(org.ekstep.pluginframework.pluginManager, e, t, r, i);

    function sendDataToPreview(e, t, r, i) {
        var a = this,
            n = void 0,
            o = this.plugins[e];
        if (o) {
            var s = i ? o.p.extend(i) : o.p,
                c = o.m;
            try {
                Array.isArray(t) ? t.forEach(function (e) {
                    n = new s(c, e, r),
                        a.addPluginInstance(n),
                        n.initPlugin(),
                        org.ekstep.pluginframework.eventManager.dispatchEvent("plugin:add", {
                            plugin: c.id,
                            version: c.ver,
                            instanceId: n.id
                        }),
                        org.ekstep.pluginframework.eventManager.dispatchEvent(c.id + ":add")
                }) : (n = new s(c, t, r),
                    a.addPluginInstance(n),
                    n.fromECML(n.editorData),
                    previewData = n
                );
            } catch (err) {
                console.log('error inside sendDataToPreview');
                console.log(err);
            }
        }
    }

    previewData.media = {};
    previewData.config.media = {};
    _.each(previewData.data.item_sets, function (set) {
        _.each(previewData.data.items[set.id], function (question, questionIndex) {
            if (question.media) {
                question.media = JSON.parse(question.media);
                _.each(question.media, function (media, mediaIndex) {
                    previewData.media[media.id] = media;
                    previewData.config.media[media.id] = media;
                })
            }
        })
    })

    frameOnload(previewData);

    function frameOnload(previewData) {

        var itemIframe = org.ekstep.contenteditor.jQuery('#funtootCommonPreviewFrame')[0];
        if (itemIframe.src == "") {
            itemIframe.src = "/content/preview/preview.html?webview=true";
        }
        var dataOfUser = {};
        var configuration = {};
        dataOfUser.etags = ecEditor.getContext('etags') || [];
        configuration.context = {
            'mode': 'edit',
            'contentId': ecEditor.getContext('contentId'),
            'sid': ecEditor.getContext('sid'),
            'uid': ecEditor.getContext('uid'),
            'channel': ecEditor.getContext('channel') || "in.ekstep",
            'pdata': ecEditor.getContext('pdata') || {
                id: "in.ekstep",
                pid: "",
                ver: "1.0"
            },
            'app': dataOfUser.etags.app || [],
            'dims': dataOfUser.etags.dims || [],
            'partner': dataOfUser.etags.partner || []
        };
        configuration.config = {
            title: '<!!fix me!!>',
            count: 0
        };
        //handling multiple
        if (previewSetTimeOutHandle) {
            window.clearTimeout(previewSetTimeOutHandle);
        }
        configuration.data = getEditorPreviewData(previewData);
        previewSetTimeOutHandle = setTimeout(() => {
            itemIframe.contentDocument.location.reload(true);
            jQuery(itemIframe).on('load', function () {
                if (itemIframe.contentWindow.initializePreview) {
                    itemIframe.contentWindow.initializePreview(configuration);
                }
            });
        }, 500);
    }

    function getEditorPreviewData(previewData) {
        var content = toECML.call(org.ekstep.contenteditor.stageManager, previewData);
        var currentStageID = ecEditor.getCurrentStage().id;
        var currentStageIndex;
        for (var i = 0; i < content.theme.stage.length; i++) {
            if (content.theme.stage[i].id == currentStageID) {
                currentStageIndex = i;
            }
        }
        content.theme.stage[currentStageIndex].param = [];
        content.theme.stage = content.theme.stage[currentStageIndex];
        return content;
    }


    function toECML(previewData) {
        var pseudoStage = _.cloneDeep(this.currentStage);
        pseudoStage.children = [];
        pseudoStage.children.push(previewData)
        var o = this,
            r = {
                theme: {
                    id: "theme",
                    version: "1.0",
                    startStage: this.stages[0].id,
                    stage: [],
                    manifest: {
                        media: []
                    },
                    "plugin-manifest": {
                        plugin: []
                    }
                }
            };
        this.setNavigationalParams();
        var s = {};
        var allStages = [pseudoStage];
        return o.summary = [],
            _.forEach(allStages, function (e, t) {
                o.thumbnails[e.id] = e.thumbnail;
                var a = e.toECML();
                a.manifest = {
                    media: []
                };
                var n = [];
                _.forEach(e.children, function (e) {
                        var t = e.getManifestId();
                        _.isUndefined(a[t]) && (a[t] = []),
                            a[t].push(e.toECML());
                        var r = e.getSummary();
                        r && o.summary.push(r);
                        var i = e.getMedia();
                        o.addMediaToMediaMap(s, i, e.manifest),
                            n = _.concat(n, _.keys(i))
                    }),
                    a.manifest.media = _.map(_.uniq(n), function (e) {
                        return {
                            assetId: e
                        }
                    }),
                    r.theme.stage.push(a)
            }),
            o.manifestGenerator(r),
            _.isEmpty(org.ekstep.contenteditor.mediaManager.migratedMediaMap) || (o.mergeMediaMap(s),
                r.theme["migration-media"] = {},
                r.theme["migration-media"].media = _.values(org.ekstep.contenteditor.mediaManager.migratedMediaMap)),
            r.theme.manifest.media = _.uniqBy(_.concat(r.theme.manifest.media, _.values(s)), "id"),
            _.cloneDeep(r)
    }

}