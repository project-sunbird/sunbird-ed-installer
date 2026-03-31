// Renderer plugin can't be tested as of now
// Please move the logic to other classes and test them independently
// Let the plugin class delegate functionality to these classes
Plugin.10oct2017 = {};

/* istanbul ignore next */
Plugin.10oct2017.RendererPlugin = Plugin.extend({
    _type: 'org.manojl.tests.plugin.10oct2017',
    _isContainer: false,
    _render: true,
    initPlugin: function() {

    }
});
