//@ sourceURL=timeclockintro-renderer.js
/* global PluginManager */
/**
 * This plugin is used to generate measurement problems
 * @extends ftFibBasePlugin
 * @fires table, grid
 * @author Amit (amit.dawar@funtoot.com)
 */
org.ekstep.funtoot.common.extend({
    _type: 'org.ekstep.plugins.funtoot.timeclockintro',
    _isContainer: false,
    _render: true,
    initPlugin: function (data) {
        this._super(data);
        //var instance = this;
        // initialize the item controller
        var item = this._stage.getController("item");
        if (item)
            this._item = item;
        if (this._pluginItem)
            this._item = Object.assign(this._item, this._pluginItem);

        var can = document.createElement("canvas");
        can.id = "canv";
        can.width = "200";
        can.height = "200";
        can.style = "margin-left:70px;margin-top:70px;";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(can);

        //var i18n = PluginManager.getPluginObject('i18n_helper');
        //var langId = i18n.config.numericLangId
        //var nums = i18n.getNumbers(langId);

        var stage = new createjs.Stage("canv");
        createjs.Ticker.addEventListener("tick", tick);
        var image = new Image();
        var image2 = new Image();
        image.src = "http://paulrhayes.com/experiments/clock/images/minuteHand.png"
        image2.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Analogue_clock_face.svg/1024px-Analogue_clock_face.svg.png"
        image.onload = Clock;

        function Clock() {
            var clockContainer = new createjs.Container();
            var clockBack = new createjs.Bitmap(image2);
            var clockHand = new createjs.Bitmap(image);
            clockBack.x = 0;
            clockBack.y = 0;
            clockHand.x = 0;
            clockHand.y = 0;
            clockHand.regX = clockHand.regY = 189;
            clockBack.scaleX = clockBack.scaleY = 0.30;
            clockBack.scaleX = clockBack.scaleY = 0.30;

            clockContainer.addChild(clockBack, clockHand);
            stage.addChild(clockContainer)
            createjs.Tween.get(clockHand, {
                loop: false
            }).to({
                rotation: 360
            }, 5000);
        }

        function tick() {
            stage.update();
        }

    }
});