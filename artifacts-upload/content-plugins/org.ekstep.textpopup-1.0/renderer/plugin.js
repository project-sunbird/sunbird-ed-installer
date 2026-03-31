/**
 * This plugins renders the org.ekstep.textpopup and creates popup with text and an overlay
 * @class popuptext
 * @extends Plugin
 * @author Devendra Singh <devendra.singh@tarento.com>
 */
Plugin.extend({
    _type: 'org.ekstep.textpopup',
    _isContainer: false,
    _render: false,
    _pagesText:{},
    initPlugin: function(data) {
        this._render= true;
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        var instance= this;
        var popupBoxObj= this.getPopupBoxObj();  //popup box with text 
        var popupBoxOverlayObj = this.getPopupBoxOverlayObj(); // popup box overlay                
        PluginManager.invoke("div",popupBoxObj,this, this._stage, this._theme);
        PluginManager.invoke("div",popupBoxOverlayObj,this._stage, this._stage, this._theme);
          var divBox = document.getElementById("divpopupbox"); 
          var divOverlayBox = document.getElementById("divpopupboxoverlay");
          //Applying style on popup box and its overlay
          divBox.style.color= this._data.color;
          divBox.style.backgroundColor= this._data.bgcolor;
          divBox.style.padding= "10px";
          divBox.style.overflowY= "auto";
          divBox.style.fontSize= this._data.fontSize + "px";
          divBox.style.lineHeight= "normal";
          divBox.style.zIndex= 10000;
          divOverlayBox.style.zIndex= 9000;
          divOverlayBox.style.backgroundColor= "#000000";
          divOverlayBox.style.opacity= 0.5;
          instance.addToggleEvent();
          instance.addDefaultBtn();
    },

    /**
     * This method attach toggle events to the toggle button
     * @memberof org.ekstep.textpopup
     */

    addToggleEvent: function(){
      var instance= this;
      setTimeout(function(){
        var toggleBtn= PluginManager.getPluginObject(instance._data.image);
          toggleBtn._self.visible= true;
          console.log("inside else");
          toggleBtn._self.cursor= "pointer";
          toggleBtn._self.on("click",function(){
            instance.togglePopupBox();

          });
          Renderer.update= true;

      },1000);
    },

    /**
     * This method added a defult toggle btn on top right corner in case if user has deleted the icon
     * @memberof org.ekstep.textpopup
     */
    addDefaultBtn:function(){
      var imgObject= {
              "asset": this._data.image,
              "x": "93",
              "y": "5",
              "w": "5",
              "visible": false
            }
      PluginManager.invoke("image",imgObject,this._stage, this._stage, this._theme);
    },
    /**
     * This method hanndles the toggle event to show and hide the popup box along with overlay
     * @memberof org.ekstep.textpopup
     */
    togglePopupBox: function(){
      var divpopupbox= PluginManager.getPluginObject("divpopupbox");
      divpopupbox.toggleShow({
                    "type": "command",
                    "command": "toggleShow",
                    "asset": "divpopupbox"
                  });
      var divpopupboxoverlay= PluginManager.getPluginObject("divpopupboxoverlay");
       divpopupboxoverlay.toggleShow({
                    "type": "command",
                    "command": "toggleShow",
                    "asset": "divpopupboxoverlay"
      });
    },

    /**
     * This method creates object of popbox with text within it
     * @memberof org.ekstep.textpopup
     * @return {object} popbox object with text and paginations if text is long
     */
    getPopupBoxObj: function(){
      var textBoxDiv={
                  "id":"divpopupbox",
                  "__text": this._data.__text,
                  "__cdata": this._data.__text,
                  "x": 0,
                  "y": 0,
                  "w": 100,
                  "h": 100,
                  "visible": false,
                  "style": {}
      }
      return textBoxDiv;
    },

    /**
     * This method creates object of popup overlay along with event to disable popup 
     * @memberof org.ekstep.textpopup
     * @return {object} popbox overlay
     */
    getPopupBoxOverlayObj: function(){
      var overlayDiv={
                  "id":"divpopupboxoverlay",
                  "x": 0,
                  "y": 0,
                  "w": 100,
                  "h": 100,
                  "visible": false,
                  "style": {},
                  "event": {
                    "type": "click",
                    "action": [
                      {
                        "type": "command",
                        "command": "toggleShow",
                        "asset": "divpopupbox"
                      },
                      {
                        "type": "command",
                        "command": "toggleShow",
                        "asset": "divpopupboxoverlay"
                      }
                    ]
                  }

        }
        return overlayDiv;
      
    }
   
});

