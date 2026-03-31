angular.module('org.ekstep.wordconnectplay', ["Scope.safeApply"]).controller('mainController', ['$scope', '$location', function($scope, $location) {
    var plugin = { id: "org.ekstep.wordconnectplay", ver: "1.0" };
    $scope.playimage = ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/noimagefound.png");
    $scope.playmode = true;
    $scope.showsubmit = false;
    $scope.showplaynote = false;
    $scope.title = "";
    $scope.meaning = "";
    $scope.audio = "";
    $scope.pos = "";
    $scope.exampleSentences = [];
    var playlanguage = "";
    var seletedNode = {};
    var userData = [];
    var systemData = [];
    var isConnectedWords = {};
    var wordlist = {
        centerword:"World",
        list : ["Flour","Brinjal","Coffee","Umbrella","Sweet","Jaggery","Vessel","शक्कर"]
    }
   
    var config = ecEditor.getAllConfig();
    var nodeShape="circle";
    var circleRadius=75;
    var gLinkCircleRedius = 10;
    var gNodeFontFamily = "Arial";
    var gNodeFontSize = 16;
    var gUniqObjId = 2;
    var gNodePropertyChanged = false;
    var gGroupMaxScaleFactor = 1.5;
    var gGroupMinScaleFactor = 0.5;
    var gColorScheme={"border":"#3498db","fill":"#3498db","fillCenterNode":"#A1CBDF"}; 
    // Canvas property settings
    var CANVAS_HEIGHT = $('#contents-pane').height()<500?500:$('#contents-pane').height()-50;
    var CANVAS_WIDTH = $('#contents-pane').width()<480?480:$('#contents-pane').width();
   
    var gDrawingLink = false;
   
    //var t;
// Configuration data copied  from Bei js
    var gDrawingLinkMoved=false;
	var gObjectMoved = false;
	// var selectedlink,selectedgroup;


	var gLinkDetached = false;
	var gDetachedLinkTarget;
	var gMouseDown = false;
	var gEventHandler = true;
	var gControlDown = false;
	var gObMod=false;
	var gTextScaling = false;
	var gTextScaledOnce = false;
    // rect.links = [];
    var link = null; 

    // Default shape sizes

    //new variables

    var gChnagedProperties=[];

    var gRectDefaultSize = 40, gRectDefaultWidthSize = 150;
    var gCircleDefaultRadius = 50; 
    var gEllipseDefaultWidthSize = 90, gEllipseDefaultHeightSize = 25; // Ellipse width(rx) and height(ry)

    var objects = [];

    // Map scale variables
    var gCanvasScale = 1;
   // var links =[];
    var gLinkSourcePathLength = 20;
    var gLinkSource;

    //var IPAD_MAX_ZOOM_VALUE =1.3;
    var gLinkSourceTriangeHeight = 30;
    var gLinkSourceTriangleWidth = 35;
    var gTxtPadding = 7;
    var gObjPadding = 10;

    var gLinkSelectionPoints;
    //This variable is used to solve javascript floating point issue.
   
    var gListOfNodes = ['rect','ellipse','circle'];
    var LINK_RIGHT_ARROW_DIRECTION = "linkRightArrowDirection";
    var LINK_LEFT_ARROW_DIRECTION = "linkLeftArrowDirection";
    var LINK_DOUBLE_ARROW_DIRECTION = "linkDoubleArrowDirection";
    var LINK_NO_ARROW_DIRECTION = "linkNoArrowDirection";

   
     // Updating default fabric Originleft and Origintop of all objects
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    var canvas = new fabric.Canvas('canvas',{
        backgroundColor : "#fff",
        selection:false
    });
    canvas.setHeight(CANVAS_HEIGHT-10);
    canvas.setWidth(CANVAS_WIDTH-10);
    canvas.hoverCursor=' move';
    canvas.moveCursor=' move';
    canvas.renderOnAddRemove = false;
    canvas.stateful = false;
    window.canvas = canvas;

    // Create Link node object
    
   
    $scope.main = function(object) {
       
         /* This function will update position of the link selection points.
         * @param {object} link - link contains link object.
         * @return {object} linkSelectionPointsPosition - linkSelectionPointsPosition contains 
         * coordinates.
         */
        this.updateLinkSelectionPointsPosition = function(link) {
            var linkSelectionPointsPosition = {};
            var intersectionHeadPoint = wordconnect.getInterSectionPoints(link,link.head);
            var intersectionTailPoint = wordconnect.getInterSectionPoints(link,link.tail);
            if(intersectionHeadPoint.points.length > 0) {
                linkSelectionPointsPosition.x1 = intersectionHeadPoint.points[0].x;
                linkSelectionPointsPosition.y1 = intersectionHeadPoint.points[0].y;
            }
            if(intersectionTailPoint.points.length > 0) {
                linkSelectionPointsPosition.x2 = intersectionTailPoint.points[0].x;
                linkSelectionPointsPosition.y2 = intersectionTailPoint.points[0].y;
            }

            return linkSelectionPointsPosition;

        }

        /**
         * This function will give the object top left coordintes.
         * @param {object} target - target contains nodes.
         * @return {object} point - point contains coordinates(top left).
         */
        this.getObjectCoordinates = function(target) {
            var point = {};
            point.x = target.getLeft();
            point.y = target.getTop();
            return point;
        }
        /**
         * This function will give the inersection point of node and links.
         * @param {object} link - link contains link object.
         * @param {object} target - target contains node object.
         * @return {object} point - point contains coordinates.
         */
        this.getInterSectionPoints = function(link,target) {
            var targetCenterPoint = wordconnect.getObjectCoordinates(target);
            if(target && target.grouptype && target.grouptype == 'ellipse') {
                return Intersection.intersectBezier2Ellipse(new Point2D(link.path[0][1], link.path[0][2]), new Point2D(link.path[1][1], link.path[1][2]),
                        new Point2D(link.path[1][3], link.path[1][4]), new Point2D(targetCenterPoint.x,targetCenterPoint.y), target.getObjects()[0].rx* target.scaleX,target.getObjects()[0].ry* target.scaleX);
            } else if(target && target.grouptype && target.grouptype == 'rect'){
                var targetTopLeft = targetCenterPoint.x - target.getWidth()/2;
                var targetTopTop = targetCenterPoint.y - target.getHeight()/2;
                var targetrightBottomLeft = targetCenterPoint.x + target.getWidth()/2;
                var targetRightBottomTop = targetCenterPoint.y + target.getHeight()/2;
                return Intersection.intersectBezier2Rectangle(new Point2D(link.path[0][1], link.path[0][2]), new Point2D(link.path[1][1], link.path[1][2]),
                        new Point2D(link.path[1][3], link.path[1][4]), new Point2D(targetTopLeft, targetTopTop),
                        new Point2D(targetrightBottomLeft, targetRightBottomTop));
            }else {  // Circle
                return Intersection.intersectBezier2Circle(new Point2D(link.path[0][1], link.path[0][2]), new Point2D(link.path[1][1], link.path[1][2]),
                        new Point2D(link.path[1][3], link.path[1][4]), new Point2D(targetCenterPoint.x,targetCenterPoint.y), target.getObjects()[0].radius* target.scaleX);
            }
        }
        /**
         * This function will initialize the link source object.
         */
        this.createLinkSource = function() {
            gLinkSource = new linkSourceObject();
            gLinkSource.setVisible(false);
            window.gLinkSource = gLinkSource;
        }
        /**
         * This function will initialize the linkSelectionPointsObject.
         */
        this.createLinkSelectionPoints = function() {
            gLinkSelectionPoints = new linkSelectionPointsObject();
            gLinkSelectionPoints.setVisible(false);
        }
        this.createTextField = function(text,l,t,angle){
            var comicSansText = new fabric.Text(text, {
                fontFamily: gNodeFontFamily,
                fontSize: gNodeFontSize,
                centeredScaling: false,
                left:l,
                top:t,
                fill:'#373a3c',
                textAlign:"center",
                grouptype:'label'
            });
            return comicSansText;
        }
        this.createRec = function(word,w,h,l,t,angle,url,rx,ry,grouptype){
            var rect = new fabric.Rect();
            rect.set({
                fill: gColorScheme.fill,
                stroke:gColorScheme.border,
                width:w,
                height:h,
                angle:angle,
                strokeWidth:2,
                textAlign:"center",
                rx:rx,
                ry:ry,
                padding:2
            });

            var comicSansText = wordconnect.createTextField(word.name,null,null,angle);
            var circle = new fabric.Circle({radius:gLinkCircleRedius, left:0, top:(rect.getHeight()/2)-gLinkCircleRedius, fill:'#babbbf'});
            var group = new fabric.Group([ rect, comicSansText, circle ], {
                left: l,
                top: t,
                height:h,
                width:w,
                cornersize:8,
                fontSize: gNodeFontSize,
                //fill: gColorScheme.fill,
                angle:angle,
                stroke:gColorScheme.border,
                strokeWidth:2,
                url:url,
                links:'',
                lockUniScaling:true,
                objid:word.identifier,
                lockMovementX:true,
                lockMovementY:true,
                lockScalingX:true,
                lockScalingY:true,
                maxScaleFactor:gGroupMaxScaleFactor,
                minScaleFactor:gGroupMinScaleFactor,
                grouptype:grouptype
            });
            gUniqObjId++;
            group.createdTime = (new Date).getTime();
            group.node = circle;
            return group;
        }
        /**
         * This function will create ellipse.
         * @param {number} rx - rx radius in x direction.
         * @param {number} ry - ry radius in y direction.
         * @param {number} w - w is width value.
         * @param {number} h - h is width value.
         * @param {number} l - l is left value.
         * @param {number} t - t is top value.
         * @param {string} url - url contains movie url.
         * @return {string} group - group for identifying fabric group.
         */
        this.createEllipse = function(word,rx,ry,w,h,l,t,url){
            //window.top.ga('send', 'event', 'ConceptMap', 'Ellipse Node', 'Create');
            var color = gColorScheme.fillCenterNode;
            if(word.identifier == config.centerword.identifier)
                color = '#3498db';
            var ellipse = new fabric.Ellipse({
                fill: color,
                stroke: color,
                rx: rx,
                ry:ry,
                strokeWidth:2,
                padding:2
            });

            var comicSansText = wordconnect.createTextField(word.name,null,null,null);
            var group = new fabric.Group([ ellipse, comicSansText ], {
                //fill: gColorScheme.fill,
                stroke:color,
                left: l,
                top: t,
                height:h,
                width:w,
                fontSize: gNodeFontSize,
                strokeWidth:2,
                objid:word.identifier,
                maxScaleFactor:gGroupMaxScaleFactor,
                minScaleFactor:gGroupMinScaleFactor,
                lockMovementX:true,
                lockMovementY:true,
                lockScalingX:true,
                lockScalingY:true,
                grouptype:'ellipse',
                url:url
            });
            gUniqObjId++
            group.lockUniScaling = true;
            group.createdTime = (new Date).getTime();
            group.node = Circle;
            return group;
        }
        this.createCircle = function(word,ra,w,h,l,t,url,languageid){
            //window.top.ga('send', 'event', 'ConceptMap', 'Ellipse Node', 'Create');
            var color = gColorScheme.fillCenterNode;
            if(word.identifier == config.centerword.identifier)
                color = '#FF8080';
             var circle = new fabric.Circle({
                            radius: ra,
                            fill: color,
                            stroke: color,
                            /*left: l,
                            top: t,*/
                            strokeWidth:2,
                            padding:2
                        });

            var comicSansText = wordconnect.createTextField(word.name,null,null,null);
            var group = new fabric.Group([ circle, comicSansText ], {
                //fill: gColorScheme.fill,
                stroke:color,
                left: l,
                top: t,
                height:h,
                width:w,
                fontSize: gNodeFontSize,
                strokeWidth:2,
                objid:word.identifier,
                maxScaleFactor:gGroupMaxScaleFactor,
                minScaleFactor:gGroupMinScaleFactor,
                lockMovementX:true,
                lockMovementY:true,
                lockScalingX:true,
                lockScalingY:true,
                grouptype:'circle',
                url:url,
                languageid:languageid
            });
            gUniqObjId++
            group.lockUniScaling = true;
            group.createdTime = (new Date).getTime();
            group.node = Circle;
            return group;
        }
        /**
        * This function is wrapper of creating the nodes and add to the canvas.
        * @param {number} left - left is left value of node.
        * @param {number} top - top is top value of node.
        * @param {string} selectedShape - selectedShape contains shape type of nodes.
        * @return {string} shape - shape for identifying fabric group.
        */
        this.putShapes = function(word,left,top,selectedShape,callback, languageid) {
            var url;
            if(selectedShape == "rect"){
                shape  = wordconnect.createRec(word,gRectDefaultWidthSize,gRectDefaultSize,left,top,0,url,10,10,'rect');
                canvas.add(shape);
            }else if(selectedShape == "ellipse"){
                shape = wordconnect.createEllipse(word,gEllipseDefaultWidthSize,gEllipseDefaultHeightSize,gEllipseDefaultWidthSize*2,gEllipseDefaultHeightSize*2,left,top,url);
                canvas.add(shape);
            }else { // Circle
                shape = wordconnect.createCircle(word,gCircleDefaultRadius,gCircleDefaultRadius*2,gCircleDefaultRadius*2,left,top,url,languageid);
                canvas.add(shape);
            }
           
            shape.set({
                lockRotation:true,
                hasRotatingPoint:false
            });
           
            canvas.renderAll();
            //gUniqObjId++;
            if(callback && typeof callback == 'function'){
                callback(shape);
            }else{
                return shape;
            }
        }
        this.getShapes = function(group){
             group.set({selectable:true});
 
            objectAdded(group);
            canvas.setActiveObject(group);
           // showTextArea(group);
            group.setCoords();
            canvas.renderAll();
        }
        this.objectAdded = function(object,link){
            var obj = [];
            var objectids = [];
            if(link) {
                object && objectids.push(object.objid);
                link && objectids.push(link.objid);
                //pushing text id also
                link && link.label && link.label.objid && objectids.push(link.label.objid);
            }

            if(!link && object){
                objectids.push(object.objid);
                object._originalLeft = object.left;
                object._originalTop = object.top;
            }
        }
         /**
         * This method add the object to change properties
         * It checks what is the type of object before adding to change properties.
         * @param {object} modObj - modObj contains canvas object.
         */
        this.pushToChangeProperties = function(modObj) {
             if(modObj && modObj.type && modObj.type=='text'){
                var line = wordconnect.getObjet(modObj.links);
                    if(line) {
                        var linkObject = {'objid':modObj.objid,"backgroundcolor":modObj.backgroundColor,'textcolor':modObj.getFill(),'Text':modObj.getText() ,'link':{'strokeDashArray':line.strokeDashArray,'stroke':line.stroke,'objid':line.objid,'fill':line.fill}}
                        gChnagedProperties.push(linkObject);
                    }
                }
        }
        /**
         * This checks for object property change.If property change then add the object to change 
         * properties
         * @param {number} left - left is left value of node.
         * @param {number} top - top is top value of node.
         * @param {string} selectedShape - selectedShape contains shape type of nodes.
         */
        this.pustoToChangePropertiesPresentState = function(currentObject) {
            if(gChnagedProperties && gChnagedProperties.length== 1 && gNodePropertyChanged) {
                var oldObject = wordconnect.getObjet(gChnagedProperties[0].objid);
                if (oldObject && oldObject.objid == currentObject.objid) {
                    if(currentObject.grouptype == 'rect' (currentObject._objects && currentObject._objects[0] && (currentObject._objects[0].type == 'ellipse' || currentObject._objects[0].type == 'circle'))){
                        // onBeforeSelectionCleared(currentObject._objects[1].getText().trim(),currentObject,true);
                        currentObject._objects[1].setText(currentObject._objects[1].getText().trim());
                    }
                    wordconnect.pushToChangeProperties(currentObject);
                    objectModified();
                    gNodePropertyChanged = false;
                } else{
                    gNodePropertyChanged = false;
                    gChnagedProperties = [];
                    //alert("object mismatch found");
                }
            } else if (gChnagedProperties && gChnagedProperties.length== 1 && !gNodePropertyChanged) {
                gChnagedProperties = [];
            }
        }
        /**
         * This function will be called if object changed(like move).
         * @param {object} e - e is event object.
         */
        this.canvasObjectPositionChanged =function(e){
            selectionObjPres = e.target;
            if(selectionObjPres && gNodePropertyChanged){
                wordconnect.pustoToChangePropertiesPresentState(selectionObjPres);
            } else if (selectionObjPres && gChnagedProperties.length == 1 && !gNodePropertyChanged) {
                gChnagedProperties = [];
            }
            wordconnect.pushToChangeProperties(selectionObjPres);
        }
        /**
         * This function will show/hide linkSource, linkSelectionPoints & quadraticController.
         * @param {boolean} enable - 
         */
        this.enableCanvasSupportingObjects = function(enable) {
            gLinkSource.setVisible(enable);
            gLinkSelectionPoints && gLinkSelectionPoints.setVisible(enable);
        }
        /**
         * This function will be called when object selection is getting cleared.
         * @param {object} e - e is target object and event object.
         */
        this.objectSelectionCleared = function(e){
            var target = e.target;
            wordconnect.enableCanvasSupportingObjects(false);
            selectionObjPres = target;

            if(selectionObjPres && gNodePropertyChanged && selectionObjPres._objects){
                wordconnect.pustoToChangePropertiesPresentState(selectionObjPres);
            }else if(selectionObjPres.type && gNodePropertyChanged && selectionObjPres.type=='text'){
                wordconnect.pustoToChangePropertiesPresentState(selectionObjPres);
            }else{
                gChnagedProperties = [];
            }
        }
       
        this.onObjectSelected = function(objectMoved){
            var object = canvas.getActiveObject();
            
            if(object){
                //Resetting border color and padding. If Multiple Selection is not enable.
                
                object.set({borderColor:'#ADDFFF',padding: 0});
                if(object.type && object.type == 'text'){ // Link text border
                   object.set({borderColor:'#000000',padding: 0});
                }
                if(( object.grouptype && gListOfNodes.indexOf(object.grouptype) !== -1 ) || (object.type && object.type=='text')){
                canvas.bringToFront(object);        
                }
            }

            
            var activeGroupObject = canvas.getActiveGroup();
            if(activeGroupObject) {
                // This condition will be true when we will get multiple selection group. 		
                object = activeGroupObject;
                object.set({ 		
                //	hasBorders : false,
                    hasControls: false,
                    padding: 5
                });		
            }


            if(gLinkSource == null ) {
                wordconnect.createLinkSource();
            }
            gLinkSource.moveToTarget(object);

            if(object.type && object.type !='text') {
                if(gLinkSelectionPoints) {
                    gLinkSelectionPoints.setVisible(false);
                }
            }

            //if no object present in change properties
            if(gChnagedProperties.length==0){
                wordconnect.pushToChangeProperties(object);
            }else if(gChnagedProperties.length==1 && gNodePropertyChanged){
                //Taking the object from canvas and pushing to change properties array
                // if objeect has been same and modified:
                var modObj = wordconnect.getObjet(gChnagedProperties[0].objid);
                wordconnect.pustoToChangePropertiesPresentState(modObj);
                //adding current object to changed properties
                //
                wordconnect.pushToChangeProperties(object);
            } else if (gChnagedProperties.length==1 && !gNodePropertyChanged) {
                var modObj = wordconnect.getObjet(gChnagedProperties[0].objid);
                //Present object is different from stored objec and un modified
                //No need to store present object in the changedproperties
                if (!modObj || modObj.objid != object.objid) {
                    gChnagedProperties = [];
                    wordconnect.pushToChangeProperties(object);
                }

            }
            if(object && object.type=='text'){
                var line = wordconnect.getObjet(object.links);

                if(gLinkSelectionPoints && line) {
                        gLinkSelectionPoints.moveToSelectedLink(line);
                }
                ojectSize = wordconnect.changeSizeOfEle(object.getText(),object.fontSize,object.fontFamily);
                if(ojectSize[1]<18){
                    ojectSize[1]=18;
                }
                if(ojectSize[0]<20){
                    ojectSize[0]=20;
                }
               
            }
                
            if(!(jQuery.browser.name == 'msie' && (jQuery.browser.version == '9.0' || jQuery.browser.version == '10.0'))){
                document.activeElement.blur();
            }			
           
        }
        
        /**
         * This function will return the height and width of the text.
         * @param {string} text - text contains text value.
         * @param {number} size - size contains text font size.
         * @param {string} fontFamily - fontFamily contains text font-family.
         * @return {object} - return the value of textWidth,textHeight.
         */
        this.changeSizeOfEle = function(text,size,fontFamily){
            var tmp = document.createElement("div");
            tmp.style.display = "inline";
            tmp.style.fontFamily = fontFamily;
            tmp.style.fontSize = size+"px";
            tmp.style.lineHeight = '1.3';
            tmp.innerHTML = text;
            document.body.appendChild(tmp);
            // var theWidth = tmp.scrollWidth;
            var textWidth = tmp.offsetWidth;
            var textHeight = tmp.offsetHeight;
            document.body.removeChild(tmp);
            return [textWidth,textHeight];
        }
        /**
         * This function set Rx Ry values to ellipse.
         * @param {object} object - parentObj contains node.
         * @param {number} width - width contains width of node.
         * @param {number} height - height contains height of node.
         */
        /**
        * we use linkSourceObjectClicked method to detect mouse over on linkSource
        * @param {object} target - target for selected object.
        * @param {object} pointer - pointer for mouse pointer object.	
        */
        this.updateLinkSourceColor = function(target,pointer) {
            if(gLinkSource) {
                // if($.browser.platform != "ipad" && $.browser.platform != "android") {
                    gLinkSource.updateColorOnMouseOver(target,pointer);
                // }
            }
        }
        /**
        * This function is used to get the canvas point
        * It takes target and mouse pointer as argument
        * @param {object} target - target for selected object.
        * @param {object} pointer - pointer for mouse pointer object.	
        */
        this.getPoint = function(target,pointer) {
            var targetCenterPoint = target.getCenterPoint();
            var point = new fabric.Point(pointer.x-targetCenterPoint.x, pointer.y-targetCenterPoint.y);

            if(target.scaleX)
                point = new fabric.Point(pointer.x/target.scaleX-targetCenterPoint.x/target.scaleX, pointer.y/target.scaleX-targetCenterPoint.y/target.scaleX);

            return point;
        }
        /**
         * This function used to enlarget play icon on mouse over and
         * update the target selection on mouse over.
         * @param {object} target - target for selected object.
         * @param {object} pointer - pointer for mouse pointer object.	
         */
        this.executeMouseMoveActions = function(target,pointer) {
            /*if(target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic'){*/
            if(target.type=='line' || target.type=='linearrow'){	
                canvas.hoverCursor='pointer';
            }
            var point = wordconnect.getPoint(target, pointer);
            if((target._objects && target._objects[4] && target._objects[4].containsPoint(point))){
                if($.browser.platform != "ipad" && $.browser.platform != "android") {
                    target.set({selectable:false});
                    enlargePlayIcon(target,point);
                    canvas.renderAll();
                }
            }else{
                if(canvas.selection && target.type != 'line' && target.type != 'linearrow' && target.type != 'text') {
                    target.set({selectable:true});
                } else if (!canvas.selection){
                    target.set({selectable:true});
                }
                if(target && target.grouptype && (target.grouptype == 'linkSource')) {
                    target.set({selectable:false});
                }
                // canvas.renderAll();
            }
        }
        /**
        * This method execute mouse down actions
        * This method update undo stack object if object had been modified
        * @param {object} target - target for selected object.
        * @param {object} pointer - pointer for mouse pointer object.	
        */
        this.executeMouseDownActions = function(target,pointer) {
            if(target && (target.type=='line' || target.type=='linearrow' || target.type=='quadratic')){
                canvas.setActiveObject(target.label);
                //onObjectSelected();
            }
            // before creating new objects checking is there any thing to push or not
            if(target && gNodePropertyChanged) {
                wordconnect.pustoToChangePropertiesPresentState(target);
            }
        }
      
        /**
         * This function used to create a link
         * @param {object} target - target for selected object.
         * @param {object} ponter -  pointer for mouse pointer object.	 
         */
        this.createLinkOnMouseDown = function(target,pointer) {
            if(target && (link==null || link=='')){
                gObjectMoved = false;
                if(gLinkSource && gLinkSource.isLinkSourceObjectClicked(pointer)) {
                    if(gNodePropertyChanged){
                        objectModified();
                        gNodePropertyChanged = false;
                    }
                    text = new fabric.Text('',{fontSize:0,lockMovementX:true,lockMovementY:true,opacity:0,scaleX:0,scaleY:0,objid:gUniqObjId,fontFamily: gNodeFontFamily,backgroundColor:'#ffffff',visible:false});
                    gUniqObjId++;
                    text.hasControls = false;
                    var stroke = 3 * gCanvasScale;
                    /* Greem color link hexa code for stroke and fill #00C000*/
                    link = new fabric.Linearrow([0, 0, 0, 0], {stroke:'#000000', fill:'#000000', strokeWidth:stroke,lockMovementX:true,lockMovementY:true,head:'',tail:'',headid:'',tailid:'',objid:gUniqObjId,linkarrow:"end"});
                    gUniqObjId++;
                    link.perPixelTargetFind = true;
                    link.hasControls = false;
                    link.linkArrowDirection = LINK_RIGHT_ARROW_DIRECTION;
                    // link.hasBorders = false;
                    link.head = target;
                    link.label = text;
                    link.headid = target.objid;
                    text.links = link.objid;
                    canvas.add(link,text);
                    if(!target.links)
                        target.links = [link];
                    else
                        target.links.push(link);
                    gDrawingLink = true;
                    link.host = target;
                    canvas.sendToBack(link.label);
                    canvas.sendToBack(link);	
                }
            }

        }
        /**
         * This function used to update Link position
         * @param {object} pointer - pointer for mouse pointer object.	 
         */
        this.updateLinkPositionOnMouseMove = function(pointer) {
            if(gDrawingLink){
                if(!link.head.visible){
                    gDrawingLink = false;
                    canvas.remove(link.label);
                    wordconnect.removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
                    canvas.remove(link);
                }
                // var closestCPCoord = getClosestCPCoordinates(link.head, pointer);
                link.set({x1:link.head.left, y1:link.head.top});
                link.set({x2: pointer.x, y2:pointer.y});
                // link._objects[1].set({left:pointer.x-link.head.left,top:pointer.y-link.head.top});
                elementPos = link.head.getTop()-pointer.y;
                /*if(link.type=='linkarrow' || link.type == 'link'){
                    if(elementPos > 1)
                        link.label.set({left:(1-0.5)*pointer.x+(0.5*link.head.left),top:((1-0.5)*pointer.y+(0.5*link.head.top))+link.height/8});
                    else
                        link.label.set({left:(1-0.5)*pointer.x+(0.5*link.head.left),top:((1-0.5)*pointer.y+(0.5*link.head.top))-link.height/8});
                }else{
                    link.label.set({left:link.head.left+(pointer.x-link.head.left)/2,top:link.head.top+(pointer.y-link.head.top)/2});
                }*/
                link.label.set({left:link.head.left+(pointer.x-link.head.left)/2,top:link.head.top+(pointer.y-link.head.top)/2});
                gLinkSource.setVisible(false);
                link.label.set({opacity:0});
                link.label.setCoords();
                canvas.calcOffset();
                canvas.renderAll();
                gDrawingLinkMoved = true;
                gImageGroupMouseClicked = false;
            }

        }
        /**
         * This function is used to update link object head and tail
         * @param {object} options - options for which will contain mouse pointer and target object.
         * @param {object} pointer - pointer for mouse pointer object.	 
         */
        this.updateLinkObject = function(options,pointer) {
            if(gDrawingLink && gDrawingLinkMoved){
                var newTailNode = false;
                gDrawingLink = false;

                var halfw = 100/2;
                var halfh = 100/2;
                var bounds = {tl: {x: halfw, y:halfh},
                    br: {x:canvas.width-halfw, y: canvas.height-halfh}
                };
                // top-left  corner
                if(pointer.y < bounds.tl.y || pointer.x < bounds.tl.x){
                    peakTop = Math.max( pointer.y, bounds.tl.y);
                    peakLeft = Math.max(pointer.x, bounds.tl.x);
                }

                createNewLink = false;
                var grp2;
                if(options.target && options.target.type=='group' && (options.target.grouptype && options.target.grouptype !== 'linkSource')){
                    grp2 = options.target;
                    templinkids = [grp2.objid,link.headid];
                    /** 
                    *grp2 is the target for the link 
                    *createNewLink flag is set to true if there is already one link present from head to tail or vice-versa
                    *If flag is true don't create a new link otherwise create a new link
                    */
                    if(grp2.links){
                        for(var i in grp2.links){
                            if(grp2.links[i].visible == true && grp2.links[i].headid == link.headid && grp2.links[i].tailid == grp2.objid){
                                createNewLink = true;
                            }
                        }
                        for(var i in grp2.links){
                            if(grp2.links[i].visible == true && grp2.links[i].tailid == link.headid && grp2.links[i].headid == grp2.objid && grp2.links[i].linkArrowDirection == LINK_DOUBLE_ARROW_DIRECTION){
                                createNewLink = true;
                            }
                        }
                        /** check if link type is line or quadratic and direction is none, set createNewLink flag true */
                        if(createNewLink == false){
                            for(var i in grp2.links){
                                if(grp2.links[i].visible == true && grp2.links[i].headid == grp2.objid && grp2.links[i].tailid == link.headid){
                                    /**
                                    *This condition was for single doublearrow link
                                    */
                                    /*if(grp2.links[i].type == 'linearrow' && (grp2.links[i].linkArrowDirection == LINK_RIGHT_ARROW_DIRECTION || grp2.links[i].linkArrowDirection == LINK_LEFT_ARROW_DIRECTION)){
                                        createDoubleArrowLink(grp2.links[i]);
                                        createNewLink = true;
                                    }*/
                                    if((grp2.links[i].type == 'line') && grp2.links[i].linkArrowDirection == LINK_NO_ARROW_DIRECTION){
                                        createNewLink = true;
                                    }
                                }
                            }
                        }
                    }
                }else{
                    if(link){
                        var createShape;
                        if(link.head && link.head.grouptype == "ellipse"){
                            createShape = "ellipse";
                        }else if(link.head && link.head.grouptype == "rect"){
                            createShape = "rect";
                        }else{
                            createShape = "circle";
                        }
                        grp2 = wordconnect.putShapes(pointer.x,pointer.y,createShape);
                        newTailNode = true;
                    }	
                }
                if(grp2){
                    if(newTailNode){
                        var heightValue = Math.ceil(grp2.height/2);
                        var widthValue = Math.ceil(grp2.width/2);
                        if(grp2.getTop()< heightValue*gCanvasScale){
                            grp2.setTop(heightValue*gCanvasScale);
                        }
                        if(grp2.getLeft()< widthValue*gCanvasScale){
                            grp2.setLeft(widthValue*gCanvasScale);
                        }
                        if(grp2.getTop() > canvas.height-heightValue*gCanvasScale){
                            grp2.setTop(canvas.height-heightValue*gCanvasScale);
                        }
                        if(grp2.getLeft()> canvas.width-widthValue*gCanvasScale){
                            grp2.setLeft(canvas.width-widthValue*gCanvasScale);
                        }
                        grp2.setCoords();
                    }
                    var coords = wordconnect.getClosestCPCoordinates(grp2, {x:link.x1, y:link.y1});
                    link.set({x2:coords.x, y2:coords.y});
                    link.tail = grp2;
                    link.tailid = grp2.objid;
                    link.stroke = "#000000";
                    link.fill = "#000000";
                    if(!grp2.links)
                        grp2.links = [link];
                    else
                        grp2.links.push(link);

                    // grp2.links = [link];
                    objects.push(grp2);
                    link.tailCoords = pointer;
                    if(!options.target)
                        inheritParentProperties(link.head,grp2);
                    canvas.calcOffset();
                    if(options.target && options.target.type=='group'){
                        if(!createNewLink)	
                            wordconnect.objectAdded(null,link);
                    }

                    canvas.renderAll();
                    gDrawingLinkMoved = false;
                    if(link && link.headid == link.tailid){
                        createNewLink = true;
                        //gMapHistory.pop();
                    }
                    if(createNewLink){
                        createNewLink = false;
                        canvas.remove(link.label);
                        canvas.remove(link);
                        // link.head && link.head.links && link.head.links.pop() && link.tail.links && link.tail.links.pop();
                        wordconnect.removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
                        gLinkSource.moveToTarget(canvas.getActiveObject());
                       
                    }else{
                        wordconnect.setLinkCoordinates(grp2);
                            link.createdTime = (new Date).getTime();
                            link && canvas.bringToFront(link);
                        link.label && canvas.setActiveObject(link.label);
                      //  link.label && updateLabelTextCursorPosition();
                        canvas.renderAll();
                    }
                }else{
                    if(link){
                        createNewLink = false;
                        canvas.remove(link.label);
                        wordconnect.removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
                        canvas.remove(link);
                        canvas.renderAll();
                    }
                    gLinkSource.moveToTarget(canvas.getActiveObject());
                }
                link.set({hasCircle:false});
                link='';
                // canvas.toJSON(['head', 'tail']);
            }
            if(!gDrawingLinkMoved && link){
                gDrawingLink = false;
                canvas.remove(link.label);
                canvas.remove(link);
                canvas.renderAll();
                // link.head && link.head.links && link.head.links.pop();
                wordconnect.removeLinksFromHeadTailNodes(link.head,null,link.objid);

            }
            
        }
        /**
         * This function used to check the selected object is node or other target.
         * @param {object} target - target is selected object.	 
         */
        this.isLinkSelectionPoints = function(target) {
            if(target && target.grouptype && (target.grouptype == 'startPoint' || target.grouptype == 'endPoint' || target.grouptype == "arrowhead") ) {
               // wordconnect.writeToConsole("inside linkSelectionPoint");
                return true;
            } else{
                return false;
            }
        }
        this.writeToConsole = function(data){
           // console.log(data);
        }
        /**
         * This function used to update the detached link from the node.
         * @param {object} pointer - pointer for mouse pointer object.	 
         */
        this.updateDetachedLinkPoints = function(pointer){
            if(gDetachedLinkTarget.grouptype == "startPoint"){
                var tailPoints = wordconnect.findPointForMovingTail(gDetachedLinkTarget.link,{x:pointer.x,y:pointer.y});
                if(tailPoints){
                    gDetachedLinkTarget.link.set({x1:pointer.x,y1:pointer.y,x2:tailPoints[0],y2:tailPoints[1]});
                    /* Greem color link hexa code for stroke and fill #00C000*/
                    gDetachedLinkTarget.link.set({fill:"#000000",stroke:"#000000"});
                    gLinkSelectionPoints.endPoint.set({left:tailPoints[0],top:tailPoints[1]});
                }
            }else if(gDetachedLinkTarget.grouptype == "endPoint"){
                if(gDetachedLinkTarget.link.type=="quadratic"){
                    gDetachedLinkTarget.link.path[1][3] = pointer.x;
                    gDetachedLinkTarget.link.path[1][4] = pointer.y;
                    /* Greem color link hexa code for stroke and fill #00C000*/
                    gDetachedLinkTarget.link.set({stroke:"#000000"});
                    gDetachedLinkTarget.link.arrowTail && gDetachedLinkTarget.link.arrowTail.set({fill:"#000000"});
                        gDetachedLinkTarget.link.arrowHead && gDetachedLinkTarget.link.arrowHead.set({fill:"#000000"});
                    var linkEndPoint = {x:pointer.x,y:pointer.y};
                    updateArrowHeadAngle(gDetachedLinkTarget.link,linkEndPoint);
                    /*if(gDetachedLinkTarget.link.subtype){
                        setStrokeDashArrayForCurve(gDetachedLinkTarget.link);
                    }*/

                }else{
                    var headPoints = wordconnect.findPointForMovingHead(gDetachedLinkTarget.link,{x:pointer.x,y:pointer.y});
                    if(headPoints){
                        gDetachedLinkTarget.link.set({x1:headPoints[0],y1:headPoints[1],x2:pointer.x,y2:pointer.y});
                        /* Greem color link hexa code for stroke and fill #00C000*/
                        gDetachedLinkTarget.link.set({fill:"#000000",stroke:"#000000"});
                        gLinkSelectionPoints.startPoint.set({left:headPoints[0],top:headPoints[1]});
                    }
                }
            }
           //updateLinkLabelPositionWhileMoving(gDetachedLinkTarget.link);
        }
        /**
         * This function is used to connect the detached links from node.
         * @param {object} options for which will contain mouse pointer and target object.	 
         */
        this.connectLinkToTargetNode = function(pointer,target){
            var objects = canvas._objects;
            var point = new fabric.Point(pointer.x, pointer.y);
            var parentObj;
            var nonLinkedGrpType = ['arrowhead', 'startPoint', 'endPoint'];
            for(i in objects){
                if (objects[i].type == 'group' && nonLinkedGrpType.indexOf(objects[i].grouptype) == -1
                    && objects[i].getVisible() == true && objects[i].containsPoint(point)) {
                    parentObj = objects[i];
                    // break;
                }
            }
            if(parentObj){
                var linkfound=false;
                var endpoint = parentObj;
                var targetedpoint;
                if(target.grouptype=='startPoint'){
                    targetedpoint = target.link.tailid;
                }else{
                    targetedpoint = target.link.headid;
                }
                templinkids = [endpoint.objid,targetedpoint];
                if(target.link.tailid == endpoint.objid || target.link.headid == endpoint.objid){
                    linkfound = true;
                }
                /**
                *endpoint is the new target for link
                *linkfound flag is set to true if there is already one link present from head to tail between Nodes
                */
                if(endpoint.links){
                    /**
                    *This if condition is to check the cases when link is detached from Tail
                    */
                    if(target.grouptype=='endPoint'){
                        /** check if already a link is there from head to tail*/
                        for(var i in endpoint.links){
                            if(endpoint.links[i].visible == true && (endpoint.links[i].headid == target.link.headid && endpoint.links[i].tailid == endpoint.objid)){
                                linkfound = true;
                                break;
                            }
                        }
                        /** check when a link is deatached and try to connect nodes which already have double arrow link */ 
                        for(var i in endpoint.links){
                            if(endpoint.links[i].visible == true && (endpoint.links[i].headid == endpoint.objid  && endpoint.links[i].tailid == target.link.headid && endpoint.links[i].linkArrowDirection == LINK_DOUBLE_ARROW_DIRECTION)){
                                linkfound = true;
                                break;
                            }
                        }
                        /** check when double arrow/no arrow link is detached*/
                        for(var i in endpoint.links){
                            if(endpoint.links[i].visible == true && (endpoint.links[i].headid == endpoint.objid  && endpoint.links[i].tailid == target.link.headid && (target.link.linkArrowDirection == LINK_DOUBLE_ARROW_DIRECTION || target.link.linkArrowDirection == LINK_NO_ARROW_DIRECTION))){
                                linkfound = true;
                                break;
                            }
                        }
                        /** check if link type is line or quadratic and direction is none, set linkfound flag true */
                        if(linkfound == false){
                            for(var i in endpoint.links){
                                if(endpoint.links[i].visible == true && endpoint.links[i].headid == endpoint.objid && endpoint.links[i].tailid == target.link.headid){
                                    /**
                                    *This condition was for single doublearrow link
                                    */
                                    /*if(endpoint.links[i].type == 'linearrow' && target.link.type != 'quadratic' && (endpoint.links[i].linkArrowDirection == LINK_RIGHT_ARROW_DIRECTION || endpoint.links[i].linkArrowDirection == LINK_LEFT_ARROW_DIRECTION)){
                                        canvas.remove(target.link.label);
                                        canvas.remove(target.link);
                                        removeLinksFromHeadTailNodes(target.link.head,target.link.tail,target.link.objid);
                                        createDoubleArrowLink(endpoint.links[i]);
                                        linkfound = true;
                                    }*/
                                    if((endpoint.links[i].type == 'line') && endpoint.links[i].linkArrowDirection == LINK_NO_ARROW_DIRECTION){
                                    linkfound = true;
                                    }
                                }
                            }
                        }
                    }
                    /**
                    *This if condition is to check the cases when link is detached from Head 
                    */
                    if(target.grouptype=='startPoint'){
                        /** check if already a link is there from head to tail */
                        for(var i in endpoint.links){
                            if(endpoint.links[i].visible == true && (endpoint.links[i].headid == endpoint.objid && endpoint.links[i].tailid == target.link.tailid)){
                                linkfound = true;
                                break;
                            }
                        }
                        /** check when a link is deatached and try to connect nodes which already have double arrow link */ 
                        for(var i in endpoint.links){
                            if(endpoint.links[i].visible == true && (endpoint.links[i].headid == target.link.tailid  && endpoint.links[i].tailid == endpoint.objid && endpoint.links[i].linkArrowDirection == LINK_DOUBLE_ARROW_DIRECTION)){
                                linkfound = true;
                                break;
                            }
                        }
                        /** check when double arrow/noarrow link is detached */
                        for(var i in endpoint.links){
                            if(endpoint.links[i].visible == true && (endpoint.links[i].headid == target.link.tailid && endpoint.links[i].tailid == endpoint.objid && (target.link.linkArrowDirection == LINK_DOUBLE_ARROW_DIRECTION || target.link.linkArrowDirection == LINK_NO_ARROW_DIRECTION))){
                                linkfound = true;
                                break;
                            }
                        }
                        /** check if link type is line or quadratic and direction is none, set linkfound flag true */
                        if(linkfound == false){
                            for(var i in endpoint.links){
                                if(endpoint.links[i].visible == true && endpoint.links[i].headid == target.link.tailid && endpoint.links[i].tailid == endpoint.objid){
                                    /**
                                    *This condition was for single doublearrow link
                                    */
                                    /*if(endpoint.links[i].type == 'linearrow' && target.link.type != 'quadratic' && (endpoint.links[i].linkArrowDirection == LINK_RIGHT_ARROW_DIRECTION || endpoint.links[i].linkArrowDirection == LINK_LEFT_ARROW_DIRECTION)){
                                        canvas.remove(target.link.label);
                                        canvas.remove(target.link);
                                        removeLinksFromHeadTailNodes(target.link.head,target.link.tail,target.link.objid);
                                        createDoubleArrowLink(endpoint.links[i]);
                                        linkfound = true;
                                    }*/
                                    if((endpoint.links[i].type == 'line') && endpoint.links[i].linkArrowDirection == LINK_NO_ARROW_DIRECTION){
                                        linkfound = true;
                                    }
                                }
                            }
                        }
                    }
                }
                if(!linkfound){
                    var obj;
                    if(target.grouptype=='startPoint'){
                        obj = {objIds: target.link.objid, 'linkPositionChanged':true, 'oldObjecIds' : [target.link.headid,target.link.tailid], 'newObjecIds': [parentObj.objid,target.link.tailid]}
                        wordconnect.updateLinkHead(target.link,parentObj);
                    //	sendDataToServer(dataInteractionScopes.link,dataInteractionEvents.move,{objid:target.link.objid,linkStartNodeId:parentObj.objid, linkEndNodeId:target.link.tailid});
                    }else if(target.grouptype=='endPoint'){
                        obj = {objIds: target.link.objid, 'linkPositionChanged':true, 'oldObjecIds' : [target.link.headid,target.link.tailid], 'newObjecIds': [target.link.headid,parentObj.objid]}
                        wordconnect.updateLinkTail(target.link,parentObj);
                    //	sendDataToServer(dataInteractionScopes.link,dataInteractionEvents.move,{objid:target.link.objid,linkStartNodeId:target.link.headid, linkEndNodeId:parentObj.objid});
                    }
                    //updatingMapHistory([obj]);
                    canvas.setActiveObject(target.link.label);

                }else{
                    if(target.grouptype=='startPoint'){
                        wordconnect.setLinkCoordinates(target.link.head);
                    }else{
                        wordconnect.setLinkCoordinates(target.link.tail);
                    }
                    canvas.setActiveObject(target.link.label);
                }
            }else{
                canvas.remove(target.link.label);
                canvas.remove(target.link);
                wordconnect.removeLinksFromHeadTailNodes(target.link.head,target.link.tail,target.link.objid);
                link='';
                canvas.renderAll();
               // wordconnect.setLinkCoordinates(target.link.head);
               // canvas.setActiveObject(target.link.label);
            }

        }
        /**
         * This function is used to update the link in head object.
         * @param {object} options - options for which will contain mouse pointer and target object.	 
         */
        this.updateLinkHead = function(targetLink,targetNode){
            wordconnect.removeLinksFromHeadTailNodes(targetLink.head,null,targetLink.objid);
            if(!targetNode.links)
                targetNode.links = [targetLink];
            else
                targetNode.links.push(targetLink);
            targetLink.head = targetNode;
            targetLink.headid = targetNode.objid;
            wordconnect.setLinkCoordinates(targetNode);
        }
        /**
         * This function is used to update the link in tail object.
         * @param {object} options - options for which will contain mouse pointer and target object.	 
         */
        this.updateLinkTail = function(targetLink,targetNode){
            wordconnect.removeLinksFromHeadTailNodes(null,targetLink.tail,targetLink.objid);
            if(!targetNode.links)
                targetNode.links = [targetLink];
            else
                targetNode.links.push(targetLink);
            targetLink.tail = targetNode;
            targetLink.tailid = targetNode.objid;
            wordconnect.setLinkCoordinates(targetNode);
        }
        /**
         * To get closest controle points to of the target object and 
         * @param {object} target - target selected object.
         * @param {object} farEnd - farEnd tail object.	 
         */
        this.getClosestCPCoordinates = function(target, farEnd){
            if(target){
                var currentTransform = canvas._currentTransform;
                var dx = 0; var dy = 0;
                if(canvas._currentTransform && canvas._currentTransform.target == target && canvas._currentTransform && canvas._currentTransform.original){
                    dx = target.getCenterPoint().x - canvas._currentTransform.original.left;
                    dy = target.getCenterPoint().y - canvas._currentTransform.original.top;
                }

                var coords = target.oCoords;
                var mbD = Math.sqrt(Math.pow(farEnd.x-(coords.mb.x+dx), 2) + Math.pow(farEnd.y-(coords.mb.y+dy), 2));
                var mrD = Math.sqrt(Math.pow(farEnd.x-(coords.mr.x+dx), 2) + Math.pow(farEnd.y-(coords.mr.y+dy), 2));
                var mtD = Math.sqrt(Math.pow(farEnd.x-(coords.mt.x+dx), 2) + Math.pow(farEnd.y-(coords.mt.y+dy), 2));
                var mlD = Math.sqrt(Math.pow(farEnd.x-(coords.ml.x+dx), 2) + Math.pow(farEnd.y-(coords.ml.y+dy), 2));

                var closest = 'mb';
                var closestDistance = mbD;
                if(mrD < closestDistance) {closest = 'mr';closestDistance = mrD};
                if(mtD < closestDistance) {closest = 'mt';closestDistance = mtD};
                if(mlD < closestDistance) {closest = 'ml';closestDistance = mlD};

                var ret = {x:coords[closest].x+dx, y:coords[closest].y+dy};
                return ret;
            }
        }
         /**
        * This function will return the controle point between the head and tail nodes.
        * @param {object} head- head is head node of link.
        * @param {object} tail- tail is tail node of link.
        */
        /**
        * This function will set the link to proper places.
        * @param {object} object - object is node object.
        * @param {string} drawElementsInHiddenCanvas - drawElementsInHiddenCanvas is containing string the string 
        * based on the that we are doing activity on main/hidden canvas.
        * @param {string} multiSelectModeMove - multiSelectModeMove will contain string if multipleselection object is moving.
        */
        this.setLinkCoordinates = function(object,canvasObject,multiSelectModeMove){
            canvasObject || (canvasObject = canvas);
            var links = object.links;
            if(links && links.length && links.length>0){
            links && links.forEach(function(link, index, links){
            if(link.head != "" && link.tail != ""){
                var farEndTarget = link.tail;
                if(link.head != object){
                    farEndTarget = link.head;
                }
                var elementPos = link.head.getTop()-link.tail.getTop();

                var closestpoints = wordconnect.getNewClosestPoints(link);

                if (typeof closestpoints.head === "undefined") {
                    return;
                }

                if(closestpoints.head[0] && closestpoints.head[1])
                    link.set({x1:closestpoints.head[0], y1:closestpoints.head[1]});

                if (typeof closestpoints.tail === "undefined") {
                    return;
                }

                if(closestpoints.tail[0] && closestpoints.tail[1])
                    link.set({x2:closestpoints.tail[0], y2:closestpoints.tail[1]});

                    /*if(link.type=='linkarrow' || link.type == 'link'){
                        // this code for beizer curve
                        // if(elementPos > 1)
                        // 	link.label.set({left:(1-0.5)*closestCPForTargets[1].x+(0.5*closestCPForTargets[0].x),top:((1-0.5)*closestCPForTargets[1].y+(0.5*closestpoints.head[1]))+link.height/8});
                        // else
                        // 	link.label.set({left:(1-0.5)*closestCPForTargets[1].x+(0.5*closestCPForTargets[0].x),top:((1-0.5)*closestCPForTargets[1].y+(0.5*closestpoints.head[1]))-link.height/8});
                        if(elementPos > 1)
                            link.label.set({left:(1-0.5)*closestpoints.tail[0]+(0.5*closestpoints.head[0]),top:((1-0.5)*closestpoints.tail[1]+(0.5*closestpoints.head[1]))-link.height/4});
                        else
                            link.label.set({left:(1-0.5)*closestpoints.tail[0]+(0.5*closestpoints.head[0]),top:((1-0.5)*closestpoints.tail[1]+(0.5*closestpoints.head[1]))+link.height/4});
                    }else{
                        link.label.set({left:closestpoints.tail[0]+(closestpoints.head[0]-closestpoints.tail[0])/2,top:closestpoints.head[1]+(closestpoints.tail[1]-closestpoints.head[1])/2});
                    }*/
                link.label.set({left:closestpoints.tail[0]+(closestpoints.head[0]-closestpoints.tail[0])/2,top:closestpoints.head[1]+(closestpoints.tail[1]-closestpoints.head[1])/2});
                
                link.label.setCoords();
                link.setCoords();
            }
            });
            }

        }
        /**
        * This method is used for to remove the link in head and tail nodes.
        * @param {object} headnode - head node of the link
        * @param {object} tailnode - head tail of the link
        * @param {number} linkobjid - head linkobjid of the link object id
        */
        this.removeLinksFromHeadTailNodes = function(headnode,tailnode,linkobjid){
            if(headnode){
                for(var i in headnode.links){
                    if(headnode.links[i].objid==linkobjid){
                        delete headnode.links[i];
                    }
                    if(typeof(headnode.links[i]) === 'undefined'){
                        headnode.links.splice(i,1);
                    }
                }
            }
            if(tailnode){
                for(var i in tailnode.links){
                    if(tailnode.links[i].objid==linkobjid){
                        delete tailnode.links[i];
                    }
                    if(typeof(tailnode.links[i]) === 'undefined'){
                        tailnode.links.splice(i,1);
                    }
                }
            }
           
        }
        /**
         * This is a call back function of mouse up from fabric.
         * @param {object} object - object selected object.
         * @param {number} scaleFactor - scaleFactor scale factor for the icon. 
         */
        this.updateObjectSize = function(object,scaleFactor) {
            object.setHeight(object.getHeight() * scaleFactor);
            object.setWidth(object.getWidth() * scaleFactor);
        }
        /**
         * This function will change object position while moving.
         * @param {object} target - target is selected object.
         */ 
        /**
         * This function will return the both head and tail closest points of the selected 
         * link and there head and tail objects.
         * @param {object} target - target is selected link object. 
         */ 
        this.getNewClosestPoints = function(target){
            var tail = wordconnect.findTargetIntersectionPoints(target,target.tail);
            var head = wordconnect.findTargetIntersectionPoints(target,target.head);
            return {tail:tail,head:head};
        }
        /**
         * This function will return the closest points of the selected link and 
         * there head/tail objects.
         * @param {object} link - link is selected line object.
         * @param {object} target - target it will contain head or tail object. 
         */ 
        this.getInterSectionPointsForStraightLine = function(link,target) {
            var lineStartPoint = wordconnect.getObjectCoordinates(link.head);
            var lineEndPoint = wordconnect.getObjectCoordinates(link.tail);
            var targetCenterPoint = wordconnect.getObjectCoordinates(target);
            if(target && target.grouptype && target.grouptype == 'ellipse') {
                return Intersection.intersectEllipseLine(new Point2D(targetCenterPoint.x,targetCenterPoint.y), target.getObjects()[0].rx*target.scaleX,target.getObjects()[0].ry*target.scaleX, new Point2D(lineStartPoint.x,lineStartPoint.y), new Point2D(lineEndPoint.x,lineEndPoint.y));
            }else if(target && target.grouptype && target.grouptype == 'rect'){
                var rectangle
                var targetTopLeft = targetCenterPoint.x - target.getWidth()/2;
                var targetTopTop = targetCenterPoint.y - target.getHeight()/2;
                var targetrightBottomLeft = targetCenterPoint.x + target.getWidth()/2;
                var targetRightBottomTop = targetCenterPoint.y + target.getHeight()/2;
                return Intersection.intersectLineRectangle(new Point2D(lineStartPoint.x,lineStartPoint.y), new Point2D(lineEndPoint.x,lineEndPoint.y),new Point2D(targetTopLeft,targetTopTop),new Point2D(targetrightBottomLeft,targetRightBottomTop));
            }else{ // Circle
                return Intersection.intersectCircleLine(new Point2D(targetCenterPoint.x,targetCenterPoint.y), target.getObjects()[0].radius*target.scaleX, new Point2D(lineStartPoint.x,lineStartPoint.y), new Point2D(lineEndPoint.x,lineEndPoint.y));
            }
        }
        /**
         * This function will return the intersection point of the moving straight line.
         * @param {object} link - link is selected line object.
         * @param {object} target - target it will contain head or tail object.
         * @param {object} pointer - pointer for point of the mouse. 
         */ 
        this.getInterSectionPointsForMovingTailStraightLine = function(link,target,pointer) {
            if(target && target.grouptype && target.grouptype == 'ellipse') {
                return Intersection.intersectEllipseLine(new Point2D(target.getLeft(),target.getTop()), target.getObjects()[0].rx*target.scaleX,target.getObjects()[0].ry*target.scaleX, new Point2D(pointer.x,pointer.y), new Point2D(link.tail.getLeft(),link.tail.getTop()));
            }else if(target && target.grouptype && target.grouptype == 'rect'){
                return Intersection.intersectLineRectangle(new Point2D(pointer.x,pointer.y), new Point2D(link.tail.getLeft(),link.tail.getTop()),new Point2D(target.getLeft()-target.getWidth()/2,target.getTop()-target.getHeight()/2),new Point2D(target.getLeft()+target.getWidth()/2,target.getTop()+target.getHeight()/2));
            }else{ // Circle
                return Intersection.intersectCircleLine(new Point2D(target.getLeft(),target.getTop()),target.getObjects()[0].radius*target.scaleX, new Point2D(pointer.x,pointer.y), new Point2D(link.tail.getLeft(),link.tail.getTop()));
            }
        }
        /**
         * This function will return the intersection point of the moving straight line.
         * @param {object} link - link is selected line object.
         * @param {object} target - target it will contain head or tail object.
         * @param {object} pointer - pointer for point of the mouse. 
         */ 
        this.getInterSectionPointsForMovingHeadStraightLine = function(link,target,pointer) {
            if(target && target.grouptype && target.grouptype == 'ellipse') {
                return Intersection.intersectEllipseLine(new Point2D(target.getLeft(),target.getTop()), target.getObjects()[0].rx*target.scaleX,target.getObjects()[0].ry*target.scaleX, new Point2D(link.head.getLeft(),link.head.getTop()), new Point2D(pointer.x,pointer.y));
            }else if(target && target.grouptype && target.grouptype == 'rect') {
                return Intersection.intersectLineRectangle(new Point2D(link.head.getLeft(),link.head.getTop()), new Point2D(pointer.x,pointer.y),new Point2D(target.getLeft()-target.getWidth()/2,target.getTop()-target.getHeight()/2),new Point2D(target.getLeft()+target.getWidth()/2,target.getTop()+target.getHeight()/2));
            }else{ // Circle
                return Intersection.intersectCircleLine(new Point2D(target.getLeft(),target.getTop()),target.getObjects()[0].radius*target.scaleX, new Point2D(link.head.getLeft(),link.head.getTop()), new Point2D(pointer.x,pointer.y));
            }
        }
        /**
         * This function will return the intersection point of the moving straight line.
         * @param {object} link - link is selected line object.
         * @param {object} target - target it will contain head or tail object.
         * @param {object} pointer - pointer for point of the mouse. 
         */ 
        this.findPointForMovingTail = function(target,pointer){
            var intersectionPoints = wordconnect.getInterSectionPointsForMovingTailStraightLine(target,target.tail,pointer);
            if(intersectionPoints.points.length>0){
                return [intersectionPoints.points[0].x,intersectionPoints.points[0].y];
            }
        }
        /**
         * This function will return the intersection point of the moving straight line.
         * @param {object} link - link is selected line object.
         * @param {object} target - target it will contain head or tail object.
         * @param {object} pointer - pointer for point of the mouse. 
         */ 
        this.findPointForMovingHead = function(target,pointer){
            var intersectionPoints = wordconnect.getInterSectionPointsForMovingHeadStraightLine(target,target.head,pointer);
            if(intersectionPoints.points.length>0){
                return [intersectionPoints.points[0].x,intersectionPoints.points[0].y];
            }
        }
        /**
         * This function will return the both head and tail closest points of the selected link
         * and there head and tail objects.
         * @param {object} link - link is line object.
         * @param {object} target - target is selected link object. 
         */ 
        this.findTargetIntersectionPoints = function(link,target){
            var intersectopnPoints = wordconnect.getInterSectionPointsForStraightLine(link,target)
            if(intersectopnPoints.points.length > 0) {
                return [intersectopnPoints.points[0].x,intersectopnPoints.points[0].y];
            }
        }
          this.getPointsOnEllipse = function(numberPoints, rx, ry) {

            /*  Uses the parametric equation of an ellipse to determine points on an ellipse
                given the horizontal (a)  and vertical (b) radius of the ellipse and the number 
                of points required to be drawn on the ellipse.

                x = a Cos t (t varies from 0 to 2PI at intervals that depend on numberPoints)
                y = b Sin t

                @param numberPoints - number of points on the circle
                @param rx - horizontal radius of the ellipse
                @param ry - vertical radius of the ellipse

                Returns the coordinates in an array; the first element is considered
                to be the center of the circle at offset (0,0). 

            */

            var a = rx/2;
            var b = ry/2;
            var x = 0;
            var y = 0;
            var coords = new Array();
            var theta = 360/numberPoints;
            var centerX = canvas.width/2;
            var centerY = canvas.height/2;
            coords[0] = {left:centerX,top:centerY};

            for (var i=0; i<numberPoints; i++){
                // Math.cos/sin requires radians as input, so degrees need to be converted to radians
                // We use integer coordinates instead of floating point 
                thetaD = i*theta;

                sinTheta = Math.sin( thetaD*(Math.PI/180) );
                cosTheta = Math.cos( thetaD*(Math.PI/180) );

                x = a * cosTheta;
                y = b * sinTheta;

                coords[i+1] = {left: Math.round(x),
                            top:  Math.round(y)}
                coords[i+1].left += centerX;
                coords[i+1].top += centerY;
            }
            return coords;
        }
        
       /* this.getPointsOnCircle = function(numberPoints, radius) {

            var coords = new Array();
            var theta = 360/numberPoints;
            var centerX = canvas.width/2;
            var centerY = canvas.height/2;
            coords[0] = {left:centerX,top:centerY};
            for (var i=0; i<numberPoints; i++){
                // Math.cos requires radians as input, so degrees need to be converted to radians
                // We use integer coordinates instead of floating point 
                coords[i+1] = {left: Math.round(radius*Math.cos( (i*theta)*(Math.PI/180) )),
                            top:  Math.round(radius*Math.sin( (i*theta)*(Math.PI/180) ))}
                // console.log(i*theta + "");
                coords[i+1].left += centerX;
                coords[i+1].top += centerY;
            }
            return coords;
        }*/
        this.getObjet = function(id,canvasObj){
            canvasObj || (canvasObj = canvas);
            var expObj;
            
            canvasObj._objects.forEach(function(key,val){
                if(key.objid == id){
                expObj = key;
                }
            });
            return expObj;
        }
        this.isObjectTextClicked = function(pointer) {
            if(pointer) {
                var target = canvas.getActiveObject();
                if(target) {
                    var targetCenterPoint = target.getCenterPoint();
                    var point = new fabric.Point(pointer.x-targetCenterPoint.x, pointer.y-targetCenterPoint.y);
                    if(target.scaleX)
                        point = new fabric.Point(pointer.x/target.scaleX-targetCenterPoint.x/target.scaleX, pointer.y/target.scaleX-targetCenterPoint.y/target.scaleX);
                    if(target._objects && target._objects[1] && target._objects[1].containsPoint(point)){
                        return true;
                    }
                }
              //  wordconnect.writeToConsole("result of playIclonClicked " + true);
                return false;
            }
        }
        this.showInfoIcon = function(object){
            wordconnect.hideAllContextualMenu(); // Hide all contextual menu
            var left = object.left+2,
                top = object.top-(object.height/2)+13;
            ecEditor.jQuery('#infoIcon').css({'left':left,'top':top}).removeClass('hide');
        }
       
        this.hideAllContextualMenu = function(){
            ecEditor.jQuery('#infoIcon').addClass('hide');
        }
        this.togglesidebar = function(seletedNode){
            var object = seletedNode;
            if(!object){
                object = canvas.getActiveObject();
            }
            org.ekstep.services.playServices.getWordDetails(object.objid,object.languageid,function(err,res){ 
              //  console.log(res);
              if(err){
                var error = (typeof err == 'string') ? err : 'Get word details Api throwing error'
                playmessage(error);
                //console.log('Error: ',err);
                return;
              }   
              $scope.title = "";
              $scope.meaning = "";
              $scope.playimage = ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/noimagefound.png");
              $scope.audio = "";
              $scope.pos = "";
              $scope.exampleSentences = [];
                if(res.data && res.data.result){
                    $scope.title = res.data.result.Word.lemma;
                    $scope.meaning = res.data.result.Word.meaning;
                    $scope.playimage = (res.data.result.Word.pictures) ? 
                                        res.data.result.Word.pictures[0] : ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/noimagefound.png");
                    $scope.audio = (res.data.result.Word.pronunciations) ? 
                                     res.data.result.Word.pronunciations[0] : "" ;
                    $scope.pos =  (res.data.result.Word.pos) ? 
                                    res.data.result.Word.pos[0] : "";
                    if(res.data.result.Word.synsets && res.data.result.Word.synsets[0].exampleSentences && res.data.result.Word.synsets[0].exampleSentences.length != 0){
                        $scope.exampleSentences = res.data.result.Word.synsets[0].exampleSentences;
                    }
                    if ($scope.audio === "") {
                        ecEditor.jQuery('.announcement').addClass('hide');
                    } else {
                        ecEditor.jQuery('.announcement').removeClass('hide');
                    }
                    ecEditor.jQuery('.playinfocard').removeClass('hide');
                    $scope.$safeApply();
                }
            });
            
        }
        this.deleteLink = function(){
                var label = canvas.getActiveObject();
                var line = wordconnect.getObjet(label.links);
                // label.setVisible(false);
                //line.setVisible(false);
                // hideQuadraticArrowHead(line);
                var uniqueArray = [label.objid,line.objid];
               // var object = prepareUndoRedoStackObjectForDelete(uniqueArray,true);
            
                wordconnect.removeObjectsFromCanvas(uniqueArray);
                //var object = {objIds: [label.objid,line.objid], 'deleted':true};

               // updatingMapHistory([object]);
                if(gLinkSelectionPoints) {
                    gLinkSelectionPoints.setVisible(false);
                }
                gChnagedProperties = [];
                canvas.deactivateAllWithDispatch();
                canvas.renderAll();
                wordconnect.hideAllContextualMenu();
               /* $('#labelformat').hide();
                $('.map-menu').removeClass('mapMenuShow');*/
                // gSavedStatus = false; this flag is already set in updatingMapHistory()
            }
            /**
             * This function removes list of objects from the canvas.
             * @param {object} uniqueArray - uniqueArray is list of objects
             */
            this.removeObjectsFromCanvas = function(uniqueArray) {
                if(uniqueArray) {
                    $.each( uniqueArray, function( index, value ){
                        var object = wordconnect.getObjet(value);
                        wordconnect.removeLinkReferenceFromObjects(object);
                        wordconnect.removeObjectFromCanvas(object);
                    });
                }
            }
            this.removeLinkReferenceFromObjects = function(object) {
                if(object && (object.type == 'line' || object.type == 'linearrow' || object.type == 'quadratic')){
                    wordconnect.updateObjectLinksArray(object.head,object);
                    wordconnect.updateObjectLinksArray(object.tail,object);
                }
            }

            /**
             * This function update links array
             * @param {object} object - target contains node.
             * @return {object} linkObject - 
             */
            this.updateObjectLinksArray = function(object,linkObject) {
                for(var i in object.links){
                        if(object.links[i].objid == linkObject.objid) {
                            object.links.splice(i,1);
                            break;
                        }
                }
            }
            /**
             * This function removes object from the canvas.
             * @param {object} object - object is group object.
             * @param {number} scaleFactor - 
             */
            this.removeObjectFromCanvas = function(object) {
              
                if(object) {
                    canvas.remove(object);
                }
            }

            this.getWordList = function () {
                return wordlist;
            }

            this.getUserData = function(){
                isConnectedWords = {};
                userData = [];
                if(canvas._objects.length != 0){
                    for(var i in canvas._objects){
                        if(canvas._objects[i].type == 'linearrow'){
                            //isConnectedWords[canvas._objects[i].tail.node.group._objects[1].text] = true;
                            isConnectedWords[canvas._objects[i].tail._objects[1].text] = true;
                        }
                    }
                }
                for(var j in wordlist.list){
                    var isConnected = (isConnectedWords[wordlist.list[j].name]) ? true : false;
                    userData.push([wordlist.list[j].name,isConnected,false]);
                }
                return userData;
            }
            this.getSystemData = function(){
                return systemData;
            }
            this.updateScore = function(){
               // console.log('UserData:',wordconnect.getUserData());
                ecEditor.jQuery('#submit_btn').addClass('custom-disabled');
                org.ekstep.services.playServices.scoringService(wordconnect.getUserData(),wordconnect.getSystemData(),function(res){
                     var data = JSON.parse(res);
                     //console.log('output :',data);
                     playmessage('Game over! To play again, search for, or pick a random word.');
                     ecEditor.jQuery('#search').val('');
                     ecEditor.dispatchEvent("updatescore",wordconnect.updateScore,data);
                     updateLinkColors(data.data);
                     createUserMissedLinks(wordconnect.getWordList(),data.data);
                     wordconnect.disableCanvasEvents(true);
                });
               
            }
            this.disableCanvasEvents = function(value){
                ecEditor.jQuery('#contents-pane #hideCanvas').remove();
                if(value){
                    canvas.deactivateAllWithDispatch().renderAll();
                    gLinkSource.setVisible(false);
                    gLinkSelectionPoints.setVisible(false);
                    wordconnect.hideAllContextualMenu();
                    var width = ecEditor.jQuery('#contents-pane').width();
                    var height = ecEditor.jQuery('#contents-pane').height();
                    var tempDiv = ecEditor.jQuery('#contents-pane').append('<div id="hideCanvas"></div>');
                    ecEditor.jQuery('#hideCanvas').addClass('coverCanvas');
                    ecEditor.jQuery('#hideCanvas').css({'height':height,'width':width});
                }
            }
          
    } // main function end
    function updateLinkColors(data){
        canvas.deactivateAllWithDispatch().renderAll();
        var objects = canvas._objects;
        for(var i in objects){
            var object = objects[i];
            if(object.type && object.type == 'linearrow'){
                for(var j in data){
                    if(data[j][0] == object.tail._objects[1].text && data[j][1] == true && data[j][2] == true){
                        object.set('fill', '#00C000');
                        object.set('stroke', '#00C000');
                        object.set({borderColor:'#00C000',padding: 0});
                        break;
                    }else if(data[j][0] == object.tail._objects[1].text && data[j][1] == true && data[j][2] == false){
                        object.set('fill', '#ff0000');
                        object.set('stroke', '#ff0000');
                        object.set({borderColor: '#ff0000',padding:0});
                        break;
                    }
                }
            }
        }
        canvas.renderAll();
    }
    var linkSourceObject = function() {
            //this.circle = new fabric.Circle({radius:gLinkCircleRedius, left:0, top:linkSourcePathLength/2+ gLinkCircleRedius, fill:'#babbbf',  stroke:"#000",strokeWidth:4, selectable:false,hasControls: false});
            this.circle = new fabric.Triangle({width:gLinkSourceTriangleWidth, height:gLinkSourceTriangeHeight, angle:180, left:0, top:gLinkSourcePathLength/2+ gLinkCircleRedius, fill:'#000000',  selectable:false,hasControls: false});
            this.path = new fabric.Line([100,gLinkSourcePathLength,100,gLinkSourcePathLength+gLinkSourcePathLength],{left:0,fill:'#000000', stroke:"#000000",strokeWidth:8, selectable:false,hasControls: false});
            this.group = new fabric.Group([ this.circle, this.path], {
                left: 100,
                top: 100,
                height:gLinkSourcePathLength + (gLinkSourceTriangeHeight),
                grouptype:'linkSource',
                hasControls: false,
                selectable:false

            });
            this.group._objects[1].top = - ( this.group.height /2 -  (this.group._objects[1].height/2));
            //this.group._objects[0].top = this.group._objects[1].top+ (linkSourcePathLength/2) + gLinkCircleRedius;
            this.group._objects[0].top = this.group._objects[1].top + this.group._objects[1].height/2  + gLinkSourceTriangeHeight/2;
            //this.group.setHeight(30);
            this.group.set({
                scaleX:gCanvasScale,
                scaleY:gCanvasScale
            });
            canvas.add(this.group);
            canvas.renderAll();
            this.setVisible = function(value) {
                this.group.setVisible(value);
                canvas.renderAll();
            }
            this.getObject = function() {
                return this.group;
            }

            var setThePosition = function(target,group) {
                var groupTop = target.getTop() + (target.getHeight()/2) + group.getHeight()/2;
                if((groupTop + group.getHeight()/2) > canvas.getHeight()) {
                    group.top = target.getTop() - (target.getHeight()/2) - group.getHeight()/2;
                    group.set('angle',180);
                } else {
                    group.top = groupTop
                    group.set('angle',0);
                }
                group.left = target.getLeft();
                group.set({
                    selectable:false
                });
                canvas.renderAll();
            }

            this.moveToTarget = function(target) {
                this.setVisible(false);
                if(target && target.grouptype && target.getVisible() && ($.inArray(target.grouptype, gListOfNodes) > -1)) {
                    if(config.centerword && config.centerword.identifier 
                            && config.centerword.identifier == target.objid){ // If center node is selected
                        this.setVisible(true);
                        setThePosition(target,this.group);
                        this.group.attachedTo = target;
                        canvas.bringToFront(this.group);
                        this.getObject().setCoords();
                        canvas.renderAll();
                    }
                }
            }
            this.updatePosition = function(target) {
                /*if(target && target.type != 'text' && target.type !='link' && target.type !='line' && target.type !='linkarrow' && target.type!='linearrow') {*/
                if(target && target.type != 'text' && target.type !='line' && target.type!='linearrow') {
                    setThePosition(target,this.group);
                }
            }
            this.isLinkSourceObjectClicked = function(pointer) {
                var returnValue = false;
                var targetCenterPoint = this.group.getCenterPoint();
                var point = new fabric.Point(pointer.x-targetCenterPoint.x, pointer.y-targetCenterPoint.y);

                if(this.group.scaleX)
                    point = new fabric.Point(pointer.x/this.group.scaleX-targetCenterPoint.x/this.group.scaleX, pointer.y/this.group.scaleX-targetCenterPoint.y/this.group.scaleX);

                if(this.group._objects[0].containsPoint(point) || this.group._objects[1].containsPoint(point)) {
                    returnValue = true;
                }
                return returnValue;
            }

            this.updateColorOnMouseOver = function(target,pointer) {
                var targetCenterPoint = this.group.getCenterPoint();
                var point = new fabric.Point(pointer.x-targetCenterPoint.x, pointer.y-targetCenterPoint.y);

                if(this.group.scaleX)
                    point = new fabric.Point(pointer.x/this.group.scaleX-targetCenterPoint.x/this.group.scaleX, pointer.y/this.group.scaleX-targetCenterPoint.y/this.group.scaleX);

                if(this.group._objects[0].containsPoint(point) || this.group._objects[1].containsPoint(point)) {
                   /* Greem color link hexa code for stroke and fill #00C000*/
                    this.group._objects[0].set('fill', '#000000');
                    this.group._objects[1].set('stroke', '#000000');
                    if(target) {
                        if(this.group.visible) {
                            this.group.objectBehindLinkSource = target;
                            this.group.objectBehindLinkSource.set({selectable:false});
                        }
                    }
                    canvas.renderAll();
                } else {
                    this.group._objects[0].set('fill', 'red');
                    this.group._objects[1].set('stroke', 'red');
                    if(this.group.objectBehindLinkSource) {
                        this.group.objectBehindLinkSource.set({selectable:true});
                        this.group.objectBehindLinkSource = null;
                    }
                    canvas.renderAll();
                }

            }

            this.updateAttachedToObject = function() {
                var activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.getVisible()) {
                    this.moveToTarget(activeObject);
                } else {
                    this.setVisible(false);
                }

            }
    }
     /**
        * This will create the points for linkSource object like start or end point.
        */
        var linkSelectionPointsObject = function() {
            this.startPoint = new fabric.Rect();
            this.startPoint.set({
                stroke:'#000000',//#006400
                width:13,
                height:13,
                fill:'transparent',
                strokeWidth:2,
                selectable:false,
                hasControls: false,
                lockMovementX:true,
                lockMovementY:true,
                visible:false

            });
            this.endPoint = new fabric.Rect();
            this.endPoint.set({
                stroke:'#000000',//#006400
                width:13,
                fill:'transparent',
                height:13,
                strokeWidth:2,
                selectable:false,
                hasControls: false,
                lockMovementX:true,
                lockMovementY:true
            });
            this.startPoint.grouptype = 'startPoint';
            this.startPoint.type = 'group';
            this.endPoint.grouptype = 'endPoint';
            this.endPoint.type = 'group';
            canvas.add(this.startPoint);
            canvas.add(this.endPoint);
            canvas.renderAll();
            this.setVisible = function(value) {
               // this.startPoint.setVisible(value);
                this.endPoint.setVisible(value);
                // if(value){
                // 	this.startPoint.link = "";
                // 	this.endPoint.link = "";
                // }
                canvas.renderAll();

                if(this.startPoint.link){
                    var color="#000000";
                    if(value){
                        //color="#00C000";
                        color="#000000";
                    }else{
                        color="#000000";
                    }
                    if(this.startPoint.link.type=='quadratic'){
                        this.startPoint.link.set({stroke:color});
                        this.startPoint.link.arrowTail.set({fill:color});
                        if(this.startPoint.link.arrowHead){
                            this.startPoint.link.arrowHead.set({fill:color});
                        }
                    }else{
                        this.startPoint.link.set({stroke:color,fill:color});
                    }
                }
            }
            this.getObject = function() {
                    return this.startPoint;
            }
            this.moveToSelectedLink = function(target) {
                var tempTarget = target;
                if(target.type =='quadratic') {
                    tempTarget = wordconnect.updateLinkSelectionPointsPosition(target);
                    //quadraticController.setVisible(true);
                    //canvas.bringToFront(quadraticController.getObject());
                } else {
                    tempTarget = target;
                }
                if(this.startPoint.link && (this.startPoint.link.objid != target.objid)){
                    if(this.startPoint.link.type=='quadratic'){
                        this.startPoint.link.set({stroke:"#000000"});
                        this.startPoint.link.arrowTail.set({fill:"#000000"});
                        if(this.startPoint.link.arrowHead){
                            this.startPoint.link.arrowHead.set({fill:"#000000"});
                        }
                    }else{
                        this.startPoint.link.set({stroke:"#000000",fill:"#000000"});
                    }
                }
              
                this.startPoint.link = target;
                this.endPoint.link = target;
                this.startPoint.top = tempTarget.y1;
                this.startPoint.left = tempTarget.x1;
                this.endPoint.top = tempTarget.y2;
                this.endPoint.left = tempTarget.x2;
                this.endPoint.setCoords();
                this.startPoint.setCoords();
                //this.startPoint.set("angle",angleValue);
                this.setVisible(true);
                canvas.bringToFront(this.startPoint);
                canvas.bringToFront(this.endPoint);
                canvas.renderAll();

            }
            
            
        }
    // Initialize the main function
    var wordconnect = new $scope.main();
    $scope.deleteLink = wordconnect.deleteLink;
    $scope.togglesidebar = wordconnect.togglesidebar;
    window.wordconnect = wordconnect;
    wordconnect.createLinkSource();
	wordconnect.createLinkSelectionPoints();
    $scope.updateScore = function(){
        wordconnect.updateScore();
    }
    $scope.closeinfo = function(){
        ecEditor.jQuery('.playinfocard').addClass('hide');
    }
   /**
     * This event declaration of canvas.
     */
    canvas.on({
        'object:selected': wordconnect.onObjectSelected,
        'before:selection:cleared': wordconnect.objectSelectionCleared,
        'object:modified':wordconnect.canvasObjectPositionChanged    
    });
    // Canvas basic functions
    canvas.setActiveObject = function(object, e){
      ecEditor.jQuery('.playinfocard').addClass('hide');
        if(object.grouptype && object.grouptype == 'rect'){
            gLinkSource.setVisible(false);
        }
        this._setActiveObject(object);
        this.renderAll();
        this.fire('object:selected', { target: object, e: e });
        object.fire('selected', { e: e });
        return this;
    }
    canvas._scaleObjectEqually = function(localMouse, target, transform){

        var dist = localMouse.y + localMouse.x;

        var lastDist = (target.height + (target.strokeWidth)) * transform.original.scaleY +
                        (target.width + (target.strokeWidth)) * transform.original.scaleX;

        // We use transform.scaleX/Y instead of target.scaleX/Y
        // because the object may have a min scale and we'll loose the proportions
        transform.newScaleX = transform.original.scaleX * dist / lastDist;
        transform.newScaleY = transform.original.scaleY * dist / lastDist;
        if(target.minScaleFactor <= transform.newScaleX && target.maxScaleFactor >= transform.newScaleX){
            target.set('scaleX', transform.newScaleX);
            target.set('scaleY', transform.newScaleY);
        }
        if(!target.minScaleFactor && !target.maxScaleFactor){
            target.set('scaleX', transform.newScaleX);
            target.set('scaleY', transform.newScaleY);
        }
    }
    	/**
	 * This is a call back function of mouse move from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	canvas.on('mouse:move', function(options){
		var pointer = this.getPointer(options.e);
		var target = options.target;
		//canvas.isDragSelection && multipleSelection.updateDrawingPath(options);
		var activeGroup = canvas.getActiveGroup();
		if(activeGroup){
			return false;
		}
		var isObjectActive = activeGroup || canvas.getActiveObject();
		//When user does drag/band selection then following condition will be true.
		/*if(!isObjectActive && gControlDown){
			multipleSelection.isDragSelection = true;
		}else{
			multipleSelection.isDragSelection = false;
		}*/
		if(target && (target.grouptype=="endPoint" || target.grouptype=="startPoint")){
			$('.upper-canvas').css({'cursor':' move'});
		}else if(gLinkDetached){
			$('.upper-canvas').css({'cursor':' move'});
		}
		if(gLinkDetached){
			wordconnect.updateDetachedLinkPoints(pointer);
		}
		if(wordconnect.isLinkSelectionPoints(target)) {
			return;
		}
	

		if(target){
			//wordconnect.setTargetNodeObject(target);
			wordconnect.executeMouseMoveActions(target,pointer);
		}
		wordconnect.updateLinkSourceColor(target,pointer);

		wordconnect.updateLinkPositionOnMouseMove(pointer);		
	});

	/**
	 * This is a call back function of mouse move from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
   
	canvas.on('mouse:down', function(options){
      
	    canvas.selection && gLinkSource.setVisible(false);								
		if(window.gControlDown && options.target && options.target.type != "group" ){ // Putting the previous node of Multiple Selection Group.
			//canvas.setActiveObject(multipleSelection.multipleSelectionGroupFirstNode);
			return;
		}else if(!window.gControlDown && !options.target && canvas.selection){
			canvas.selection = false;
		}
		
		if(!gEventHandler){
			return;
		}
		gEventHandler = false;
		gMouseDown = true;
		var target = options.target;
		if(target && (target.grouptype == 'startPoint' || target.grouptype == 'endPoint')){
			gLinkDetached = true;
			gDetachedLinkTarget = target;
			canvas.sendToBack(gDetachedLinkTarget.link);
		    gLinkSelectionPoints.setVisible(false);
			return;
		}
		if(wordconnect.isLinkSelectionPoints(target)) {
			return;
		}
		var linkSourceGroup = gLinkSource.getObject();
		var pointer = this.getPointer(options.e);

		// If multiple selection is enable then donot show the linksSourceObject.
		if(gLinkSource && gLinkSource.isLinkSourceObjectClicked(pointer) && !canvas.selection) {
			target = gLinkSource.getObject().attachedTo;
			if(target.getVisible())
				canvas.setActiveObject(target);
		}

		/*
		if(selectedlink){
			selectedlink.set({strokeWidth:canvasScale * 3});
			selectedlink = '';
		}

		if(selectedgroup){
			selectedgroup._objects[0].set({strokeWidth:2});
			selectedgroup = '';
		}*/

		wordconnect.executeMouseDownActions(target,pointer);

		if(link && link.headid && !link.tailid && target && target.type && target.type!='linearrow'){
	  	 	canvas.remove(link.label);
			canvas.remove(link);
			wordconnect.removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
			link='';
		}

		wordconnect.createLinkOnMouseDown(target,pointer);


	});
    /**
	 * This is a call back function of mouse up from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	canvas.on('mouse:up', function(options){
      // In below condition we are wheather canvas is in drawing mode or not. If it is 
		// then dissable the the drawing mode and call MultipleSlection.lassoSelectController()
		// to create the lasso multiple selection.	
		gMouseDown = false;
		var pointer = this.getPointer(options.e);
        
		if(gLinkDetached) {
			wordconnect.connectLinkToTargetNode(pointer,gDetachedLinkTarget);
			gLinkDetached = false;
			gDetachedLinkTarget = "";
			gEventHandler = true;
			return;
		}
		if(wordconnect.isLinkSelectionPoints(options.target)) {
			gEventHandler = true;
			updateActiveObjectOnQuadraticControllerMouseUp(options.target);
			return;
		}
		if(link){
            if(!options.target.grouptype && options.target.grouptype != 'rect'){
                gDrawingLinkMoved = false;
            }
            wordconnect.hideAllContextualMenu();
            wordconnect.updateLinkObject(options,pointer);
            gEventHandler = true;
            return;
			
		}
		var activeObject = canvas.getActiveObject();
        if(!activeObject || (activeObject.type == 'text' || activeObject.type == 'linearow')){
            wordconnect.hideAllContextualMenu(); // Hide all contextual menu
        }
		if(activeObject && (activeObject.grouptype == 'ellipse' || activeObject.grouptype == 'rect' || activeObject.grouptype == 'circle')){
            wordconnect.showInfoIcon(activeObject);
        }
        
		if(activeObject && gLinkSource.getObject().attachedTo == activeObject && !gLinkSource.getObject().getVisible()) {
			gLinkSource.updatePosition(activeObject);
			gLinkSource.setVisible(true);
		}
		if(gTextScaledOnce==true){
			gTextScaledOnce = false;
		}
		if(gTextScaling){
			gTextScaling  = false;
			if(gChnagedProperties.length==0){
				wordconnect.pushToChangeProperties(options.target);
			}else if(gChnagedProperties.length==1 && gNodePropertyChanged){
				var modObj = wordconnect.getObjet(gChnagedProperties[0].objid);
				wordconnect.pustoToChangePropertiesPresentState(modObj);
				wordconnect.pushToChangeProperties(options.target);
			} else if (gChnagedProperties.length==1 && !gNodePropertyChanged) {
				var modObj = wordconnect.getObjet(gChnagedProperties[0].objid);
				if (!modObj || modObj.objid != options.target.objid) {
					gChnagedProperties = [];
					wordconnect.pushToChangeProperties(options.target);
				}
			}
		}
		if($.browser.platform == "ipad" || $.browser.platform == "android") {
			discardActiveObject(options,pointer);
		}
		if(options.target && options.target.type && options.target.type =='group' && options.target.grouptype !='startPoint' && options.target.grouptype !='endPoint') {
			//wordconnect.writeToConsole("option target is "+ options.target.type)
			if(wordconnect.isObjectTextClicked(pointer)) {
				//showTextArea(options.target);
			} else {
				$('#changetext,#imgtext').hide();
				var object = canvas.getActiveObject();
			}
		}
		if(gObMod && canvas.stateful == false){
			wordconnect.canvasObjectPositionChanged(options);
			gObMod=false;
		}else if(gNodePropertyChanged){
			wordconnect.canvasObjectPositionChanged(options);
		}
		gEventHandler = true;
	});
    	/**
         * This is a call back function of mouse up from fabric.
         * @param {object} options - options for which will contain mouse pointer and target object.	 
         */
    canvas.on('mouse:out', function(e) {
         var target = e.target ;
        if(target && target.node){
            target.node.fill='#babbbf';
            target._objects[0].set({borderColor: 'red',active:false});
        }
        /*if(target && (target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic')){*/
        if(target && (target.type=='line' || target.type=='linearrow')){
            var obj = canvas.getActiveObject();
            if(obj && obj.type=='text'){
                var selectedline = wordconnect.getObjet(obj.links);
                if(selectedline && selectedline.objid != target.objid){
                     target.set({stroke:"#000000",fill:"#000000"});
                }
            }else{
                target.set({stroke:"#000000",fill:"#000000"});
            }
        }
        canvas.hoverCursor=' move';
        canvas.renderAll();
    });

    /**
     * This is a call back function of mouse over on any objects from fabric.
     */
    canvas.on('mouse:over', function(e) {
       if(canvas.selection){ 
            return false;
        }
        var target = e.target ;
        /*if(target && (target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic')){*/
        if(target && (target.type=='line' || target.type=='linearrow' || target.type=='quadratic')){
          /* Greem color link hexa code for stroke and fill #00C000*/
           target.set({stroke:"#000000",fill:"#000000"});
        }
        if(target && target.node && gDrawingLink && link.head.objid != target.objid){
            target._objects[0].set({borderColor: 'red',active:true});
        }

        if(gLinkDetached && target && target._objects && target.grouptype && target.grouptype != 'template'){
            target._objects[0].set({borderColor: 'red',active:true});
        }
        /*if(target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic'){*/
        if(target.type=='line' || target.type=='linearrow'){
            canvas.hoverCursor='pointer';
        }else{
            canvas.hoverCursor=' move';
        }
        // selectedgroup = grp2;
        canvas.renderAll();
    });
    //Header scope starts
    $scope.headers = [];

    $scope.addToHeader = function(header) {
        $scope.headers.push(header);
        $scope.$safeApply();
    }

    org.ekstep.contenteditor.headerManager.initialize({ loadNgModules: $scope.loadNgModules, scope: $scope });

    function getRandomWord(){
        org.ekstep.services.playServices.getRandomWord({"request":{"filters":{"language_id":[playlanguage],"objectType":["Word"]}}},function(err,res){
            if (err) {
                var error = (typeof err == 'string') ? err : 'Get random word Api throwing error'
                playmessage(error);
                // console.log('Error: ',err);
                ecEditor.jQuery('.pickarandomword_link').removeClass('custom-disabled');
                return;
            }
            config.centerword.name = res.lemma;
            config.centerword.identifier = res.identifier;
            wordlist.centerword.name = res.lemma;
            wordlist.centerword.identifier = res.identifier;
            runplaymode(res.lemma);
            ecEditor.dispatchEvent("setExploreSearchWord",search,res.lemma);
            ecEditor.jQuery('.pickarandomword_link').removeClass('custom-disabled');
        });
    }
    function searchfromheader(event){
        var word = event.target;
        //org.ekstep.services.languageService.getWords({"request":{"filters":{"lemma":word,"language_id":[playlanguage],"objectType":["Word"]}}},function(err,res){
            playServices.getWords({"request":{"filters":{"lemma":word,"language_id":[playlanguage],"objectType":["Word"]}}}, function(err,res) {
             if(err){
                var error = (typeof err == 'string') ? err : 'Get words Api throwing error'
               playmessage(error);
                //console.log('Error: ',err);
                return;
            }
            if(res && res.data.result.count != undefined && res.data.result.count != 0){
                config.centerword.name = res.data.result.words[0].lemma;
                config.centerword.identifier = res.data.result.words[0].identifier;
                wordlist.centerword.name = res.data.result.words[0].lemma;
                wordlist.centerword.identifier = res.data.result.words[0].identifier;
                runplaymode(wordlist.centerword.name);
            } else {
                playmessage("Word not found. Search another word!");
            }
        })
        
    }
    function playmessage(message){
         $.uiAlert({
                    textHead: message, // header
                    text: '', // Text
                    bgcolor: '#55a9ee', // background-color
                    textcolor: '#fff', // color
                    position: 'top-right',// position . top And bottom ||  left / center / right
                    icon: 'info circle', // icon in semantic-UI
                    time: 5, // time
                })
    }
 
    function removeExistingLinks(){
        var objects = canvas._objects.slice(0);
        i = objects.length;
        while (i--) {
            var object = objects[i];
            if(object.type == 'linearrow' || object.type == 'text'){
                canvas.remove(object.label);
                wordconnect.removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
                canvas.remove(object);
            }else{
                if(object.grouptype != "linkSource" && object.grouptype != "startPoint" && object.grouptype != "endPoint")
                    canvas.remove(object);
            }
        }
        canvas.deactivateAllWithDispatch();
        canvas.renderAll();
    }
    function loadingContent(value){
        if(value){
            ecEditor.jQuery('.loading-content').addClass('loading');
        }else{
            ecEditor.jQuery('.loading-content').removeClass('loading');
        }
        
    }

    function runplaymode(word) {
         loadingContent(true); // Stop Loading screen
         $scope.showsubmit = true;
         $scope.showplaynote = true;
         ecEditor.jQuery('.playinfocard').addClass('hide');
         wordconnect.hideAllContextualMenu();
         wordconnect.disableCanvasEvents(false);
         removeExistingLinks();
         //org.ekstep.services.playServices.getSimilarWordList({"request":{"filters":{"lemma":word,"language_id":[playlanguage],"objectType":["Word"]}}},playlanguage,function(err,res){
        org.ekstep.services.playServices.getRelatedWords({"request":{"filters":{"lemma":word,"language_id":[playlanguage],"objectType":["Word"]}}},playlanguage,function(err,res){
           if (err) {
                var error = (typeof err == 'string') ? err : 'Get similar words Api throwing error'
                playmessage(error);
                //console.log('Error: ',err);
                return;
            }
            var themes = res.themes;

            var data = [];
            data = data.concat(res.synonyms, res.antonyms, res.entailments, res.hypernyms, res.hyponyms, res.meronyms, res.troponyms, res.holonyms);
            shuffle(data);
            systemData = [];
            for(var i in data){
                systemData.push(data[i].name);
            }
            if (0 != res.translations.length) {
                data.splice(3); //3 related words
                data.push(res.translations[0]); // 1 translation
                systemData.push(res.translations[0].name);
            } else {
                data.splice(4);
            }

            wordlist.list = data;
            for(var i=0;i<wordlist.list.length;i++) {
                var temp=wordlist.list[i];
                temp.isRelatedWord=true;
            }

            //org.ekstep.services.playServices.getDisimilarWordList(function(res){
            org.ekstep.services.playServices.getUnRelatedWords(playlanguage, themes, function(res){
                res = shuffle(res);
                for(var i=0;i<res.length;i++) {
                    if (word !== res[i].name) {
                        wordlist.list.push(res[i]);
                    }
                }
                wordlist.list.splice(8);
                wordlist.list = shuffle(wordlist.list);
                var pos = wordconnect.getPointsOnEllipse(8,500,350);
                wordconnect.putShapes(wordlist.centerword,pos[0].left,pos[0].top,nodeShape,wordconnect.getshapes,playlanguage);
                for(var i=0;i<=wordlist.list.length-1;i++){
                    wordconnect.putShapes(wordlist.list[i],pos[i+1].left,pos[i+1].top,nodeShape,wordconnect.getshapes,(wordlist.list[i].languageid)?wordlist.list[i].languageid:playlanguage);
                }
                loadingContent(false); //Stop Loading screen
                ecEditor.jQuery('#submit_btn').removeClass('custom-disabled');
             })
        });
        $scope.$safeApply();
    }
  
    function playswitchlanguage(event){
        playlanguage = event.target;
    }
    
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
        
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        }
        return array;
    }

    $scope.loadContent = function() {
        loadingContent(false);
        playlanguage = config.defaultLanguage;
        wordlist.centerword = config.centerword;
        //runplaymode(wordlist.centerword.name);
        ecEditor.addEventListener("loadplay", loadPlayMode);
        ecEditor.addEventListener("changelanguage", playswitchlanguage);
        ecEditor.addEventListener("searchword", searchfromheader);
        ecEditor.addEventListener("pickrandomword",getRandomWord);
        $scope.$safeApply();
    };

    function loadPlayMode(event) {
        $scope.showsubmit = false;
        $scope.showplaynote = false;
        wordconnect.hideAllContextualMenu();
        wordconnect.disableCanvasEvents(false);
        removeExistingLinks();
    }

    function createLink(head, tail) {
        if ( head && tail ) {
            text = new fabric.Text('',{fontSize:0,lockMovementX:true,lockMovementY:true,opacity:0,scaleX:0,scaleY:0,objid:gUniqObjId,fontFamily: gNodeFontFamily,backgroundColor:'#ffffff',visible:false});
            gUniqObjId++;
            text.hasControls = false;
            var stroke = 3 * gCanvasScale;
            
                /* Greem color link hexa code for stroke and fill #00C000*/
            link = new fabric.Linearrow([0, 0, 0, 0], {stroke:'#000000', fill:'#000000', strokeWidth:stroke,lockMovementX:true,lockMovementY:true,head:'',tail:'',headid:'',tailid:'',objid:gUniqObjId,linkarrow:"end"});
            gUniqObjId++;
            link.perPixelTargetFind = true;
            link.hasControls = false;
            link.linkArrowDirection = LINK_RIGHT_ARROW_DIRECTION;
            
                // link.hasBorders = false;
            link.head = head;
            link.label = text;
            link.headid = head.objid;
            text.links = link.objid;
            link.tail = tail;
            link.tailid = tail.objid;
            link.stroke = "#9b9b9b";//#000000";
            link.fill = "#9b9b9b";//#000000";
            var closestpoints = wordconnect.getNewClosestPoints(link);
            if(closestpoints.head[0] && closestpoints.head[1])
                link.set({x1:closestpoints.head[0], y1:closestpoints.head[1]});

            if(closestpoints.tail[0] && closestpoints.tail[1])
                link.set({x2:closestpoints.tail[0], y2:closestpoints.tail[1]});
           // link.set({x1:link.head.left, y1:link.head.top});
           // var coords = wordconnect.getClosestCPCoordinates(tail, {x:head.left, y:head.top});
           // link.set({x2:coords.x, y2:coords.y});
            link.label.set({opacity:0});
            link.label.setCoords();
            canvas.add(link,text);
           // head.links.push(link);
            link.host = head;
            canvas.sendToBack(link.label);
            canvas.sendToBack(link);
            //var coords = wordconnect.getClosestCPCoordinates(head, tail);
            //link.set({x2:coords.x, y2:coords.y});
            
            canvas.renderAll();
            link = '';
            gEventHandler = true;
        }
    }

    function createUserMissedLinks(wordDetails, data) {
        //Identify center node
        var centerW = wordDetails.centerword;
        var centerNode = undefined;
        for(var j in canvas._objects) {
            var temp1 = canvas._objects[j];
            if ( (temp1.grouptype === 'circle') && ( temp1._objects[1] && temp1._objects[1].text === centerW.name) ) {
                centerNode = temp1;
                break;
            }
        }

        for(var i in data) {
            var temp = data[i];
            if ( temp[1] === false && temp[2] === false && wordDetails.list[i].isRelatedWord) {
                for(var j in canvas._objects) {
                    var temp1 = canvas._objects[j];
                    if ( (temp1.grouptype === 'circle') && ( temp1._objects[1] && temp1._objects[1].text === temp[0]) ) {
                        createLink(centerNode,temp1);
                    }
                }
            }
        }
    }

    org.ekstep.collectioneditor.api.initEditor(ecEditor.getConfig('editorConfig'), function() {
       $scope.loadContent();
    });
}]);
//# sourceURL=wordconnectplay.js