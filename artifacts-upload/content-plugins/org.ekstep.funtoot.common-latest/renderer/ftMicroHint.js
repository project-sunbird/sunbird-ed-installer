//@ sourceURL=ftMicroHint.js
/**
 * Common plugin used by funtoot template renderer plugins to display micro hint icon on error
 * @extends Plugin
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
    _type: 'ftMicroHint',
    initPlugin: function (data) {
        var mhIcon = Object.create(null);
        mhIcon.id = data.id + '-mhicon';
        mhIcon.stretch = "false";
        mhIcon.asset = "micro-hint";
        mhIcon.w = 5; // specify only h (or w) to get undistored image
        // Make all micro-hints as child of contentcontainer
        //@TODO: Fix the hard-coding of "__ft_content_container__" id
        var contentContainer = PluginManager.getPluginObject("__ft_content_container__");
        var mhHostObj = PluginManager.getPluginObject(data.attachTo);
        var helper = PluginManager.getPluginObject('plugin_helper');
        var dims = helper.getRelativeDimension(mhHostObj, contentContainer);
        //@TODO: Right now the micro-hint will always be attached to the top-left of the control
        // Need to fix it so it can be attached to any 4 corners
        //if (!data.mhPos || data.mhPos == 'top-left') {
        mhIcon.x = dims.x - (mhIcon.w / 2);
        mhIcon.y = dims.y - (16 / 9) * (mhIcon.w / 2);
        //}
        /*else if (data.mhPos == 'top-right') {
            mhIcon.x = dims.x + dims.w + (mhIcon.w / 2);
            mhIcon.y = dims.y - (16 / 9) * (mhIcon.w / 2);
        }*/
        mhIcon.visible = !1;

        PluginManager.invoke('image', mhIcon, contentContainer, this._stage, this._theme);

        var mhObj = PluginManager.getPluginObject(mhIcon.id);
        mhObj._self.on("click", function () {
            var mhData = mhHostObj.onMicroHint();
            var helper = PluginManager.getPluginObject('plugin_helper');
            helper.showPopup(mhData);
        }, mhHostObj);
    }
});
