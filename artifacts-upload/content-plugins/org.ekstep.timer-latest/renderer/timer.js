Plugin.extend({
    _type: 'timer',
    _isContainer: true,
    _render: true,
    _name: undefined,
    _timeText: undefined,

    /**
    *   When timer attributes are modified, look through the content and find timer instances with the 
    *   same name and update their attributes as well. 
    *   @param data {Object} data for initializing the plugin. 
    *   @memberof timer
    */
    initPlugin: function(data) {

        var instance = this;
        this._self = new createjs.Container();

        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;

        instance._name = data.name;
        
        //Check if transitioning from another instance of the same timer (timer with same 'name'). 
        var deadline = instance._theme.getParam(instance._name + "timerEndTime");
        var startTime = instance._theme.getParam(instance._name + "timerStartTime")
        var alertTime = instance._theme.getParam(instance._name + "alertTime");
        var shouldCountDown = instance._theme.getParam(instance._name + "shouldCountDown");
        var timeInMills = instance._theme.getParam(instance._name + "timeInMills");
        var shouldBlink = instance._theme.getParam(instance._name + "shouldBlink");

        var blinkTween = undefined;
        var timeTween = undefined;
        
        //If first instance of timer. Set the values for any future instances of the timer. 
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

        //Get the time to display
        var t = instance.getTimeRemaining(startTime, deadline, shouldCountDown);

        //If crossed the alert threshold, call instance.blink() 
        if (shouldBlink) {
            blinkTween = createjs.Tween.get(instance, {
                    loop: true
                })
                .to({}, 100)
                .call(instance.blink);
        }

        //If time remaining
        if ((t.total > 0 && shouldCountDown) || (t.total < timeInMills && !shouldCountDown)) {

            //Create the timer text
            instance._timeText = instance.createTimerUI(data.color, data.fontfamily, data.fontSize, t);

            //and start the tick function
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

                //When the timer runs out of time
                if ((t.total <= 0 && shouldCountDown) || ((t.total) >= timeInMills && !shouldCountDown)) {

                    //Stop the blinking tween and turn on the text visibility  
                    createjs.Tween.removeTweens(instance);
                    instance._timeText._self.visible = true;
                    Renderer.update = true;
                    instance._theme.setParam(instance._name + "shouldBlink", 0);
                    
                    //Get the stage ID to transition to
                    var to = JSON.parse(data.config.__cdata);
                    var toId = to.toStageId;
                    
                    //Do the transition
                    if(instance._stage._id == instance._theme._currentStage){
                        if(toId == "default"){
                            OverlayManager.moveToEndPage();
                        }else{
                            OverlayManager.defaultNavigation("skip",toId);
                        }
                    }
                    
                    return;
                }
            }

        } else {
            //If stage was opend after the timer has run out of time, just show 00:00
            instance._timeText = instance.createTimerUI(data.color, data.fontfamily, data.fontSize, t);
        }

    },
    transitionTo:function(id){
        OverlayManager.defaultNavigation("next",id);
    },
    /**
    *   Creates text plugin for the timer
    *   @param textCol {string} Hex color value for the text
    *   @param fontFamily {string} Fontfamily for the text
    *   @param fontSize {int} Fontsize for the text
    *   @param time {string} Initial time to be displayed 
    *   @memberof timer
    */
    createTimerUI: function(textCol, fontFamily, fontsize, time) {
        var instance = this;
        var textData = {};
        textData.x = 0;
        textData.y = 0;
        textData.w = 100;
        textData.h = 100;
        textData.id = "timer";
        textData.fontsize = (fontsize/16).toString()+"em";
        textData.font = fontFamily;
        textData.__text = time.minutes + ":" + time.seconds;
        textData.align = "center";
        textData.valign = "middle";
        textData.color = textCol;
        var timeText = PluginManager.invoke('text', textData, instance, instance._stage, instance._theme);

        return timeText;

    },
    
    /**
    *   Called inside the tick function for timer. Responsible for blinking the timer 
    *   by alternating the visiblity.
    *   @memberof timer
    */
    blink: function() {
        var instance = this;
        if (instance._timeText) {
            instance._timeText._self.color = "#FF0000";
            instance._timeText._self.visible = !instance._timeText._self.visible;
            Renderer.update = true;
        }
    },

    /**
    *   Calculates and returns the time to be displayed in the timer
    *   @param startTime {Date} start time for the time calculation
    *   @param endTime {Date} end time for time calculatino
    *   @param countdown {bool} should count down or up. 
    *   @memberof timer
    */
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