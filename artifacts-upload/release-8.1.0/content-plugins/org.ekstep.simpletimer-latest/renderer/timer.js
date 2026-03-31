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
        instance.createTimerDiv();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;
        instance._name = data.name;
       
        if (instance._self){
            instance._self.removeAllEventListeners();
        }
        createjs.Tween.removeAllTweens();

        //Check if transitioning from another instance of the same timer (timer with same 'name'). 
        var deadline = instance._theme.getParam(instance._name + "timerEndTime");
        var startTime = instance._theme.getParam(instance._name + "timerStartTime")
        var alertTime = instance._theme.getParam(instance._name + "alertTime");
        var shouldCountDown = instance._theme.getParam(instance._name + "shouldCountDown");
        var timeInMills = instance._theme.getParam(instance._name + "timeInMills");
        var shouldBlink = instance._theme.getParam(instance._name + "shouldBlink");
        var blinkTween = undefined;
        
        //If first instance of timer. Set the values for any future instances of the timer. 
        if (deadline == undefined) {
            if(data.unit == "Hours"){
                timeInMills = (data.time * 60 * 60 * 1000);
                alertTime =  data.alertTime * 60 * 60;
            }
            else if (data.unit == "Minutes") {
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
            blinkTween = createjs.Tween.get(instance)
                .to({}, 1000)
                .call(instance.blinkText);
        }

        //If time remaining
        if ((t.total > 0 && shouldCountDown) || (t.total < timeInMills && !shouldCountDown)) {

            //Create the timer text
            //instance._timeText = instance.createTimerUI(data.color, data.fontfamily, data.fontSize, t);

            //and start the tick function
            timeTween = createjs.Tween.get(instance, {
                    loop: true
                })
                .to({}, 100)
                .call(tick)

            function tick() {
                var t = instance.getTimeRemaining(startTime, deadline, shouldCountDown);
               // instance._timeText._self.text = t.minutes + ":" + t.seconds;

                if (((t.total / 1000) <= alertTime && shouldCountDown && !blinkTween) ||
                    ((t.total / 1000) >= alertTime && !shouldCountDown && !blinkTween)) {

                    blinkTween = createjs.Tween.get(instance, {
                            loop: true
                        })
                        .to({}, 200)
                        .call(instance.blinkText);
                    instance._theme.setParam(instance._name + "shouldBlink", 1);
                }

                Renderer.update = true;

                //When the timer runs out of time
                if ((t.total <= 0 && shouldCountDown) || ((t.total) >= timeInMills && !shouldCountDown)) {
                    //Stop the blinking tween and turn on the text visibility  
                    instance._self.removeAllEventListeners();
                    createjs.Tween.removeTweens(instance);
                    
                   // instance._timeText._self.visible = true;
                    instance._theme.setParam(instance._name + "shouldBlink", 0);
                    Renderer.update = true;
                    
                    //Get the stage ID to transition to
                    var to = JSON.parse(data.config.__cdata);
                    var toId = to.toStageId;
                    
                    //Do the transition
                    if(instance._stage._id == instance._theme._currentStage){
                        if(toId == "default"){
                            OverlayManager.navigateNext();
                        }else{
                            OverlayManager.navigateNext();
                            if(!_.isUndefined(to.behaviour)){
                                to.behaviour == "Next-Slide" ? EventBus.dispatch("renderer:navigation:deregister:timeout") : EventBus.dispatch("renderer:content:end")
                            }
                            else {
                                EventBus.dispatch("renderer:navigation:deregister:timeout")
                            }
                    }
                }
                    
                    return;
                }
            }

        }

    },
    transitionTo:function(id){
        OverlayManager.defaultNavigation("next",id);
    },
    createTimerDiv:function(){
        var instance=this;
        var div = document.getElementById(instance._data.id);
        if (div) {
            jQuery("#" + instance._data.id).remove();
        }
        div = document.createElement('div');
        div.id = instance._data.id;
        div.style.width = instance._data.w +9+ '%';
        div.style.height = instance._data.h + '%';
        div.style.position = 'absolute';
        div.style.fontSize = "1.5em";
        div.style.fontFamily = instance._data.fontfamily
        div.style.fontWeight = "bold:normal";
        div.style.fontStyle =  "italic: normal";
        div.style["float"]="right";
        div.style.top=instance._data.y+"%";
        div.style.left=instance._data.x+"%";
        div.style["z-index"]="1000";
        
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);
        jQuery("#" + instance._data.id).show();
    },
    /**
    *   Called inside the tick function for blinkText. Responsible for blinking the blinkText 
    *   by alternating the visiblity.
    *   @memberof blinkText
    */
    blinkText:function(){
        var instance = this;
        if (instance._data.id) {
            $("#"+instance._data.id).fadeOut(500).fadeIn(500);
            $("#"+instance._data.id).css("color", "red","important");
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

        // To stop audio when timer ends
        if(t == 0){
            EkstepRendererAPI.dispatchEvent('renderer:content:stopAudioOnTimerEnd');
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
        jQuery("#" + instance._data.id).html(hours.toString() + ":" + minutes.toString() + ":" + seconds.toString());
        

        return {
            'total': t,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

});
//# sourceURL=timer.js
