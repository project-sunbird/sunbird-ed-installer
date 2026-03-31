//@ sourceURL=ftAttempts.js
/**
 * Common plugin used by funtoot template renderer to creates the status buttons for display of attempts
 * @author Ram Jayaraman (ram.j@funtoot.com)
 */
Plugin.extend({
    _type: 'ftAttempts',
    _ftSuperContentContainerId: "__ft_super_content_container__",
    _ftStatusPanelId: "__ft_status_panel__",
    initPlugin: function (data) {
        this._maxAttempts = data.maxAttempts;
        var superContentContainer = PluginManager.getPluginObject(this._ftSuperContentContainerId);
        var helper = PluginManager.getPluginObject('plugin_helper');
        var dim = helper.toPercent({ w: 4, h: 4 }, superContentContainer);
        var pad = (dim.w / 4);
        var statusData = {
            id: this._ftStatusPanelId,
            x: 100 - (this._maxAttempts * dim.w) - (this._maxAttempts - 1) * pad,
            y: dim.h,
            w: (dim.w * this._maxAttempts) + (this._maxAttempts - 1) * pad,
            h: dim.h
        };
        PluginManager.invoke('g', statusData, superContentContainer, this._stage, this._theme);
        var sg = PluginManager.getPluginObject(statusData.id);
        // PluginManager.invoke('shape', { type: 'roundrect', x: 0, y: 0, w: 100, h: 100, fill: "#666666" }, sg, this._stage, this._theme);
        var w = 100 / this._maxAttempts / 2, r = 0.8 * w;
        for (i = 0; i < this._maxAttempts; i++) {
            var attemptData = {
                id: 'attempt-status-' + (i + 1),
                fill: data.attemptBgColor || "#666666",
                type: "circle",
                w: r, x: (i * 2 * w) + w, y: 50, visible: true
            };
            PluginManager.invoke('shape', attemptData, sg, this._stage, this._theme);
            var wrongAttemptData = {
                id: 'wrong-attempt-' + (i + 1),
                fill: data.unsolvedAttemptColor || "#c1bfbe",
                type: "circle",
                w: r, x: (i * 2 * w) + w, y: 50,
                visible: false
            };
            PluginManager.invoke('shape', wrongAttemptData, sg, this._stage, this._theme);
        }
    },
    /**
     * Update the status of current attempt depending on user input
     */
    updateStatus: function (isSolved, currentAttempt) {
        if (!isSolved) {
            attemptStatus = 'attempt-status-' + currentAttempt;
            var updateCurrentAttempt = PluginManager.getPluginObject('wrong-attempt-' + currentAttempt);
            updateCurrentAttempt._self.visible = true;
            Renderer.update = true;
        }
    }
});
