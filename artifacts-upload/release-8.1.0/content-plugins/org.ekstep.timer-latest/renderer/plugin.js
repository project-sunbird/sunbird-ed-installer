Plugin.extend({
    _type: 'Countdown',
    _isContainer: true,
    _render: true,
    _name: undefined,
    _timeText: undefined,

    initPlugin: function(data) {

        var instance = this;

        this._self = new createjs.Container();

        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;

        instance._name = data.name;
        
        var deadline = instance._theme.getParam(instance._name + "timerEndTime");
        var startTime = instance._theme.getParam(instance._name + "timerStartTime")
        var alertTime = instance._theme.getParam(instance._name + "alertTime");
        var shouldCountDown = instance._theme.getParam(instance._name + "shouldCountDown");
        var timeInMills = instance._theme.getParam(instance._name + "timeInMills");
        var shouldBlink = instance._theme.getParam(instance._name + "shouldBlink");

        var blinkTween = undefined;
        var timeTween = undefined;
        
        //If first instance of timer
        if (deadline == undefined) {
            if (data.unit == "Minutes") {

                timeInMills = (data.time * 60 * 1000);
                alertTime = data.alertTime * 60;

            } else if (data.unit == "Seconds") {

                timeInMills = (data.time * 1000);
                alertTime = data.alertTime;

            }
            
            instance._theme.setParam(instance._name + "alertTime", alertTime.toString());
            instance._theme.setParam(instance._name + "timeInMills", timeInMills.toString());


            deadline = new Date(Date.parse(new Date()) + timeInMills);
            startTime = new Date(Date.parse(new Date()));
            instance._theme.setParam(instance._name + "timerEndTime", deadline.toString());
            instance._theme.setParam(instance._name + "timerStartTime", startTime.toString());


            if (data.type == "CountDown") {
                shouldCountDown = 1;
                instance._theme.setParam(instance._name + "shouldCountDown", 1);
            } else {
                shouldCountDown = 0;
                instance._theme.setParam(instance._name + "shouldCountDown", 0);
            }

            instance._theme.setParam(instance._name + "shouldBlink", 0);


        }


        var t = instance.getTimeRemaining(startTime, deadline, shouldCountDown);

        if (shouldBlink) {
            blinkTween = createjs.Tween.get(instance, {
                    loop: true
                })
                .to({}, 100)
                .call(instance.blink);
        }

        if ((t.total > 0 && shouldCountDown) || (t.total < timeInMills && !shouldCountDown)) {

            instance._timeText = instance.createTimerUI(data.textColor, data.bgColor, data.fontfamily, data.fontSize, t);


            timeTween = createjs.Tween.get(instance, {
                    loop: true
                })
                .to({}, 1000)
                .call(tick);

            function tick() {
                var t = instance.getTimeRemaining(startTime, deadline, shouldCountDown);

                instance._timeText._self.text = t.minutes + ":" + t.seconds;

                if (((t.total / 1000) <= alertTime && shouldCountDown && !blinkTween) ||
                    ((t.total / 1000) >= alertTime && !shouldCountDown && !blinkTween)) {

                    blinkTween = createjs.Tween.get(instance, {
                            loop: true
                        })
                        .to({}, 200)
                        .call(instance.blink);
                    instance._theme.setParam(instance._name + "shouldBlink", 1);
                }

                Renderer.update = true;

                if ((t.total <= 0 && shouldCountDown) || ((t.total) >= timeInMills && !shouldCountDown)) {
                    createjs.Tween.removeTweens(instance);
                    instance._timeText._self.visible = true;
                    Renderer.update = true;
                    instance._theme.setParam(instance._name + "shouldBlink", 0);
                    OverlayManager.skipAndNavigateNext();
                    return;
                }
            }

        } else {
            instance._timeText = instance.createTimerUI(data.textColor, data.bgColor, data.fontfamily, data.fontSize, t);
        }

    },
    createTimerUI: function(textCol, bgCol, fontFamily, fontsize, time) {

        var instance = this;
        var textData = {};
        textData.x = 0;
        textData.y = 0;
        textData.w = 100;
        textData.h = 100;
        textData.id = "questionText";
        textData.fontsize = (fontsize/16).toString()+"em";
        //textData.fontsize = "2em";
        textData.font = fontFamily;
        textData.__text = time.minutes + ":" + time.seconds;
        textData.fill = bgCol;
        textData.align = "center";
        textData.valign = "middle";
        //var textBg = PluginManager.invoke('shape', textData, instance, instance._stage, instance._theme);

        textData.color = textCol;
        textData.x = 0;
        textData.y = 0;
        var timeText = PluginManager.invoke('text', textData, instance, instance._stage, instance._theme);

        return timeText;

    },
    blink: function() {
        var instance = this;
        if (instance._timeText) {
            instance._timeText._self.color = "#FF0000";
            instance._timeText._self.visible = !instance._timeText._self.visible;
            Renderer.update = true;
        }
    },
    getTimeRemaining: function(starttime, endtime, countdown = true) {
        var instance = this;
        var t = undefined;
        var timeInMills = instance._theme.getParam(instance._name + "timeInMills");
        if (countdown) {
            t = Date.parse(endtime) - Date.parse(new Date());
        } else {
            t = Date.parse(new Date()) - Date.parse(starttime);
            if (t > timeInMills) {
                t = timeInMills;
            }
        }


        var seconds = Math.floor((t / 1000) % 60);
        seconds < 0 ? seconds = 0 : seconds;
        seconds > 9 ? seconds : seconds = '0' + seconds;

        var minutes = Math.floor((t / 1000 / 60) % 60);
        minutes < 0 ? minutes = 0 : minutes;
        minutes > 9 ? minutes : minutes = '0' + minutes;

        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        hours < 0 ? hours = 0 : hours;
        hours > 9 ? hours : hours = '0' + hours;


        return {
            'total': t,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

});