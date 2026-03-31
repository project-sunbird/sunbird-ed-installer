/**
 * @class  org.ekstep.plugins.ExtractWords.EditorContent
 */
org.ekstep.plugins.ExtractWords.EditorContent = Class.extend({

    /**
     * @memberOf org.ekstep.plugins.ExtractWords.EditorContent#
     * @return {Array<String>} unique words in all stages of content
     */
    getTextWordsFromAllStages: function() {
        var textPlugins = ecEditor.getPluginInstances(["org.ekstep.text"]);
        var texts = _.compact(_.map(_.map(textPlugins, 'editorObj.text'), $.trim));
        var textWords = _.uniq(_.flatten(_.map(texts, function(text) {
            return text.split(/\s+/);
        })));
        return textWords;
    }
});
