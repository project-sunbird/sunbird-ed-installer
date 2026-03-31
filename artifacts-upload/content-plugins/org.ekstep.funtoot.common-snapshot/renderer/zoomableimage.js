//@ sourceURL=zoomableimage.js
/**
 * @description if a image needs to be zoomable image instead directly invoking 
 *              image Plugin need to invoke zoomableImage Plugin
 *              This adds corner lined squre and shows popUpwindow onclick for the Imageobject 
 * 
 * @extends ImagePlugin
 * @author Sivashanmugam Kannan<sivashanmugam.kannan@funtoot.com>
 */
ImagePlugin.extend({
    _type: 'org.ekstep.funtoot.zoomableImage',
    _isContainer: false,
    _render: true,
    initPlugin: function (data) {

        //reducing the image size so that it does't overlap on the zoomFrame
        data.w = data.w - 10; data.h = data.h - 10;
        this._super(data);

        var inst = this;
        var helper = PluginManager.getPluginObject('plugin_helper');
        var ImagePluginObj = this._parent;
        //Id of the image which shows in the pop up, Making sure it is unique by adding a random number as suffix
        var imageId = 'zoomableImage-enlarged-in-popup-' + Math.floor(1000 + Math.random() * 9000);
        //rendered image dimentions 
        var renderedImageData = this._dimensions;
        //rendered image parent  
        var parentDimention = this._parent._dimensions;

        //upon zooming the only higher ration among width or height will be changed, This insures the image does't not strech
        var animateCSSProperty = 'width';
        
        addingZoomFrame();
        enablingPopup();
        
        function addingZoomFrame(){
            //zoomFrame
            var zoomFrameObj = {
                iconDataObj:{
                    x: 0, y: 0, asset: 'zoom-in'
                },
                fillColor : "#679898",
                strokeColor : "#679898",
                wBoldness : 2 * (parentDimention.h / parentDimention.w), //by multiplying the ratio btwn W & H the boldness of the border width would be same for all lines
                hBoldness: 2,
                wLength: 0, //based and startX & endX derived
                hLength:  0, //based and startY & endY derived
                /*The start [X, Y]and end [X, Y] determines the frame lines starting point and end point, 
                * These points are generated from the rendered image dimention and container dimention
                * The -4, -3, +1, +2 ensures there is bit of gap between the image and frame lines
                startX => ImageStartPoint - 4 * ( ratio to make sure startX and StartY points should to be  in same distance from rendered Image corner) */
                startX :((renderedImageData.x / parentDimention.w) * 100 ) - ( 4 * (parentDimention.h / parentDimention.w)),
                startY :((renderedImageData.y / parentDimention.h) * 100 ) - 3 ,
                endX: (((renderedImageData.x + renderedImageData.w) / parentDimention.w) * 100 ) + (1  * (parentDimention.h / parentDimention.w )),
                endY: (((renderedImageData.y + renderedImageData.h) / parentDimention.h) * 100 ) + 2
            }
            //length of the frame line width and height wise
            zoomFrameObj.wLength = ( zoomFrameObj.endX - zoomFrameObj.startX ) / 3 ;
            zoomFrameObj.hLength = ( zoomFrameObj.endY - zoomFrameObj.startY ) / 3 ;

            //The below condition statements ensure the zoomIcon which overlays on the image rendered at appropriate size
            //2X of W smaller than 1X of H, The zoom icon height should be 20% of the height of the image,
            if(2 * (renderedImageData.w) < renderedImageData.h){
                zoomFrameObj.iconDataObj.h = ((renderedImageData.h / parentDimention.h) * 100) * (20/100) 
            }else if(2 * (renderedImageData.h) < renderedImageData.w){
                zoomFrameObj.iconDataObj.h = ((renderedImageData.h / parentDimention.h) * 100) * (45/100) 
            }else{
                zoomFrameObj.iconDataObj.h = ((renderedImageData.h / parentDimention.h) * 100) * (35/100) 
            }

            //To correctly position from X and Y points of zoomIcon 
            //icon X point => Frame's end X (right most in frame squre) - size of the Image (in terms of 100)
            zoomFrameObj.iconDataObj.x = zoomFrameObj.endX - (zoomFrameObj.iconDataObj.h * (parentDimention.h / parentDimention.w)) - 1;
            zoomFrameObj.iconDataObj.y = zoomFrameObj.startY + 3;

           //A small dealy makes sure zoomIcon render on top of image
            setTimeout(function(){
                PluginManager.invoke('image', zoomFrameObj.iconDataObj, ImagePluginObj, inst._stage, inst._theme);                      
            }, 500)

            //If the image to be zoomed is transparent (except color part the background part is transparent) in that case onclick event does't work on the trasparent part of the image
            PluginManager.invoke('image',{h : zoomFrameObj.endY - zoomFrameObj.startY, w :zoomFrameObj.endX - zoomFrameObj.startX,
                x: zoomFrameObj.startX,
                y : zoomFrameObj.startY,
                asset : 'semitrans',
                }, ImagePluginObj, inst._stage, inst._theme);            
            var zoomFrameDrawPositions = [
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wLength, h: zoomFrameObj.hBoldness, x: zoomFrameObj.startX, y: zoomFrameObj.startY ,type: "rect"},
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wBoldness, h: zoomFrameObj.hLength, x:zoomFrameObj.startX, y: zoomFrameObj.startY,type: "rect"},
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wBoldness, h: zoomFrameObj.hLength, x: zoomFrameObj.startX, y: zoomFrameObj.endY-zoomFrameObj.hLength ,type: "rect"},
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wLength, h: zoomFrameObj.hBoldness, x: zoomFrameObj.startX, y: zoomFrameObj.endY ,type: "rect"},
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wLength, h: zoomFrameObj.hBoldness, x: zoomFrameObj.endX-zoomFrameObj.wLength, y: zoomFrameObj.startY ,type: "rect"},
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wBoldness, h: zoomFrameObj.hLength, x: zoomFrameObj.endX, y: zoomFrameObj.startY ,type: "rect"},
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wBoldness, h: zoomFrameObj.hLength, x: zoomFrameObj.endX, y: zoomFrameObj.endY-zoomFrameObj.hLength ,type: "rect"},
                { fill: zoomFrameObj.fillColor, stroke: zoomFrameObj.strokeColor, w: zoomFrameObj.wLength, h: zoomFrameObj.hBoldness, x: zoomFrameObj.endX-zoomFrameObj.wLength, y: zoomFrameObj.endY ,type: "rect"},
            ];

            //adds 8 corner lines to add a frame for the zoomable image
            _.each(zoomFrameDrawPositions, function(zoomFrameDrawPosition){
                PluginManager.invoke('shape', zoomFrameDrawPosition, ImagePluginObj, inst._stage, inst._theme);
            });
        }

        function enablingPopup(){
            //preloading these images because to fetch all the image sources to be ready when a plugin launched instead of loading them on the fly
            var preLoadImages = [ inst._theme.getAsset('plus-white'), inst._theme.getAsset('minus-white'), inst._theme.getMedia(data.asset).src]
            _.each(preLoadImages, function(imageSrc){
                var image = new Image();
                image.src = imageSrc;
            })
            
            ImagePluginObj._self.on('click', function (e) {
                var ImageSource = preLoadImages[2];        
                var popUpData = {
                    title: '',
                    content: "<div id='image-enlarger-container'><div class='image-container'> <img id='"+imageId+"' src='"+ImageSource+"' /></div></div>",
                    type:'html'
                }
                helper.showPopup(popUpData)    
                var imageElement = document.getElementById(imageId);
                var imageContainerElement = document.getElementById('image-enlarger-container');
                //This is to make sure the image loaded should fit in pop up window irrespective of the image's width & height ratio
                imageElement.onload = function() { 
                    //The image container is not in squre, only under this if condition width should be 96%
                    if(imageElement.naturalWidth > ( 2 * imageElement.naturalHeight)){
                        imageElement.style.width = "96%";
                    }
                    else if(imageElement.naturalWidth > imageElement.naturalHeight){
                        imageElement.style.height = "96%";
                        animateCSSProperty = 'height'; 
                    }else{
                        imageElement.style.height = "96%";   
                        animateCSSProperty = 'height'; 
                    }
                    //adding zoom Button after the image got rendered in pop up window
                    jQuery('#image-enlarger-container').append(addingZoomButton());
                }
            });

            function addingZoomButton(){ 
                var zoomObj = {
                    percentage : 15,
                    time: 500,
                    InFunction: '', 
                    OutFunction: '',
                    Function:''
                }
                zoomObj.InFunction = "jQuery('#"+ imageId +"').animate({"+ animateCSSProperty +":'+=" + zoomObj.percentage +"%'},"+ zoomObj.time +",'swing')"
                zoomObj.OutFunction = "if(100<(jQuery('#"+ imageId +"')."+ animateCSSProperty +"()/jQuery('#"+ imageId +"').parent()."+ animateCSSProperty +"()*100)+" + zoomObj.percentage + "){jQuery('#"+ imageId +"').animate({"+ animateCSSProperty +":'-=" + zoomObj.percentage +"%'},"+ zoomObj.time +",'swing')} "
                zoomObj.Function  = "<div class='button-container'><div class='button-image-container left'><img  class='zoom' src='"+ preLoadImages[0] +"'  onClick="+ zoomObj.InFunction +" /></div><div class='button-image-container'><img  onClick="+ zoomObj.OutFunction +" class='zoom' src='"+ preLoadImages[1] +"' /></div></div>"
                return zoomObj.Function
            }
        }
    }
});

