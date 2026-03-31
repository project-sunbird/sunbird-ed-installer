/**
 *
 * plugin to search words from wordnet
 * @class WordPickerPlugin
 * @extends EkstepEditor.basePlugin
 * @author Swati Singh <swati.singh@tarento.com>
 */
org.ekstep.plugins.WordPicker.EditorPlugin = org.ekstep.contenteditor.basePlugin.extend({
    initialize: function() {
        var ins = this;
        var $ocLazyLoad = angular.element(org.ekstep.contenteditor.api.getCanvas().lowerCanvasEl).injector().get('$ocLazyLoad');
        var templatePath = ecEditor.resolvePluginResource(ins.manifest.id, ins.manifest.ver, 'editor/word-picker-config.html');
        $ocLazyLoad.load([{
            type: 'html',
            path: templatePath
        }]);
    }
});
//# sourceURL= WordPickerPlugin.js
