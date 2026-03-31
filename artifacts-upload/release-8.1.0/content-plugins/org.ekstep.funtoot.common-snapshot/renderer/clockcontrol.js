//@ sourceURL=clockcontrol.js
/* global PluginManager */
/**
 * Clock Controller
 * Plugin to create a clock on a container
 * @extends Plugin
 * @author Amit <amit.dawar@funtoot.com>
 */
Plugin.extend({
    _type: 'clockcontrol',
    initPlugin: function (data) {
        //Get the clock container
        var clockContainer = PluginManager.getPluginObject(data.id);
        var i18n = PluginManager.getPluginObject('i18n_helper');
        var nLangId = data.nlangid;
        if (!nLangId)
            nLangId = "en"
        var stage, cont;
        var cur = 0;

        if (data.clicked)
            //If clock exists and update on time is required
            tick()
        else
            //Initialising the clock
            init();

        function init() {
            stage = new createjs.Stage("clock");
            cont = stage.addChild(new createjs.Container());
            var clockSize;
            var fontSize;
            var radius;
            //Setting size accordingly
            if (data.isSolution) {
                clockSize = 70
                fontSize = 11
                radius = 1.5
            } else {
                clockSize = 84
                fontSize = 13
                radius = 3
            }
            cont.x = cont.y = clockSize;
            clockContainer.addChild(stage)
            var clockRadius = clockSize;
            //The center circle of the clock
            var center = new createjs.Shape();
            center.graphics
                .beginFill("black")
                .drawCircle(0, 0, 5);

            for (deg = 0; deg <= 360; deg += 1) {
                //Create the clock circle/face
                var s1 = new createjs.Shape();
                s1.graphics
                    .beginFill("blue")
                    .drawCircle(clockRadius, 0, radius);
                s1.rotation = deg;

                //Create markers for seconds
                if (deg % 6 == 0) {
                    var s2 = new createjs.Shape();
                    s2.graphics
                        .beginFill("black")
                        .drawRect(clockRadius - 8, -0.5, 4, 1);
                    s2.rotation = deg
                }

                //Create markers for hours
                if (deg % 30 == 0) {
                    var s3 = new createjs.Shape();
                    s3.graphics
                        .beginFill("black")
                        .drawRect(clockRadius - 11, -0.5, 7, 1);
                    s3.rotation = deg
                }

                //Create numbers
                var contNum = new createjs.Container();
                contNum.y = -6
                contNum.x = -5
                contNum.rotation = deg;

                var nums = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
                for (var i = 0; i < nums.length; i++)
                    nums[i] = i18n.translateNumber(nums[i], nLangId).displayValue

                if (deg % 30 == 0) {
                    var text = new createjs.Text();

                    text.text = nums[cur++];
                    text.font = fontSize + "px Arial"
                    text.color = "black";
                    text.x = clockRadius - 18
                    text.rotation = -1 * 30 * (deg / 30)

                    contNum.addChild(text);
                }

                //Add to container
                cont.addChild(s1);
                cont.addChild(s2);
                cont.addChild(s3);

                cont.addChild(contNum);
            }

            // the hour hand
            this.hr = new createjs.Shape();
            this.hr.graphics
                .beginFill("blue").drawRect(0, -2.5, clockRadius - 35, 5);
            cont.addChild(this.hr);

            // the minute hand
            this.min = new createjs.Shape();
            this.min.graphics
                .beginFill("orange").drawRect(0, -1.5, clockRadius - 25, 3);

            cont.addChild(this.min);

            // the second hand
            if (data.seconds >= 0) {
                this.sec = new createjs.Shape();
                this.sec.graphics
                    .beginFill("green").drawRect(0, -0.5, clockRadius - 10, 1);
                cont.addChild(this.sec);
            }

            cont.addChild(center);
            tick();
        }

        //Function to manage rotation of hands
        function tick() {
            var addRelativeDegrees;
            var addSecondsOffset;
            if (data.seconds >= 0) {
                this.sec.rotation = data.seconds * 6 - 90
                addRelative = this.sec.rotation
                addSecondsOffset = 1.5
            } else {
                addRelative = 0
                addSecondsOffset = 0
            }
            this.min.rotation = (data.min * 6 - 90) + (addRelative * (6 / 360)) + addSecondsOffset
            this.hr.rotation = (data.hours * 30 - 90) + (this.min.rotation * (30 / 360)) + 7.5
            clockContainer.update()
        }
    }
})