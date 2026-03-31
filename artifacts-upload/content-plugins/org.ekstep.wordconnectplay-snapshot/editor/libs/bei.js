	var gDrawingLinkMoved=false;
	var gObjectMoved = false;
	var gImageGroupMouseClicked = false;
	// var selectedlink,selectedgroup;
	var gPlayIconContainer = [];
	var gEnlargePlayIconOnMouseOverFactor = 1.2;
	var gPlayTrigguredNode;
	var gLinkDetached = false;
	var gDetachedLinkTarget;
	var gMouseDown = false;
	var gEventHandler = true;
	var gControlDown = false;
	var gObMod=false;
	var gTextScaling = false;
	var gTextScaledOnce = false;
   /**
    * we use linkSourceObjectClicked method to detect mouse over on linkSource
	* @param {object} target - target for selected object.
	* @param {object} pointer - pointer for mouse pointer object.	
	*/
	function updateLinkSourceColor(target,pointer) {
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
	function getPoint(target,pointer) {
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
	function executeMouseMoveActions(target,pointer) {
		/*if(target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic'){*/
		if(target.type=='line' || target.type=='linearrow' || target.type=='quadratic'){	
			canvas.hoverCursor='pointer';
		}
		var point = getPoint(target, pointer);
		if((target._objects && target._objects[4] && target._objects[4].containsPoint(point)) || (target._objects && target.grouptype == 'keyGroup' && target._objects[3] && target._objects[3].containsPoint(point))){
			 if($.browser.platform != "ipad" && $.browser.platform != "android") {
				target.set({selectable:false});
				enlargePlayIcon(target,point);
				canvas.renderAll();
			 }
		}else{
			if(canvas.selection && target.type != 'quadratic' && target.type != 'line' && target.type != 'linearrow' && target.type != 'text') {
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
	function executeMouseDownActions(target,pointer) {

		/*if(target && (target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic')){*/
		if(target && (target.type=='line' || target.type=='linearrow' || target.type=='quadratic')){
			var tempTarget = target;
			/*if(target.type == 'quadratic') {
				quadraticController.setVisible(true);
				quadraticController.attachObject(tempTarget);
				quadraticController.setPosition(tempTarget.path[1][1], tempTarget.path[1][2]);
				canvas.bringToFront(tempTarget.head);
				canvas.bringToFront(tempTarget.tail);
				canvas.bringToFront(quadraticController.getObject());

			}*/
		    canvas.setActiveObject(target.label);
		  //  _gaq.push(['_trackEvent', 'Arrow Selector button usage','Click']);

			//onObjectSelected();
		}
		// before creating new objects checking is there any thing to push or not
		if(target && gNodePropertyChanged) {
			pustoToChangePropertiesPresentState(target);
		}
	}

   /**
    * This function used set the target object.
	* @param {object} target - target for selected object.	
	*/
	function setTargetNodeObject(target) {
		if(target.node){
			target.node = target._objects[2];
			target.setCoords();
		}
	}

	/**
	 * This function used to play the video
	 * @param {object} target - target for selected object.
	 * @param {object} pointer - pointer for mouse pointer object.	 
	 */
	function playVideoOnMouseUp(target,pointer) {		 
		var point = getPoint(target,pointer);
		if(target.grouptype=='imageGroup'){
			if(target._objects[4] && target._objects[4].containsPoint(point) && target._objects[4].visible==true){
				if(gPlayTrigguredNode != target.objid){
					//window.top.ga('send', 'event', 'ConceptMap', 'NodePlayback','Play');
					videoSetTime(target);
				}else{
					//window.top.ga('send', 'event', 'ConceptMap', 'NodePlayback','Pause');
					var objectVideoURL = getObjectVideoURL(target);
				//	sendDataToServer(dataInteractionScopes.node,dataInteractionEvents.stop,{objid:target.objid,videoURL:objectVideoURL});
				}
				replacePlayPauseIcon(target)
				if($(".enlarge-minimize").hasClass("minimize")){
					//enlargeForVideoNode();
					if(gPlayTrigguredNode == target.objid ){
						playMovieAllFormat();
					}
					else{
						pauseMovieAllFormat();
					}
				}
			}
		}else{
			if(target._objects[3] && target._objects[3].containsPoint(point)){
				if(gPlayTrigguredNode != target.objid){
					//window.top.ga('send', 'event', 'ConceptMap', 'NodePlayback','Play');
					videoSetTime(target);
				}else{
					//window.top.ga('send', 'event', 'ConceptMap', 'NodePlayback','Pause');
					var objectVideoURL = getObjectVideoURL(target);
				//	sendDataToServer(dataInteractionScopes.node,dataInteractionEvents.stop,{objid:target.objid,videoURL:objectVideoURL});
				}
				replacePlayPauseIcon(target)
				if($(".enlarge-minimize").hasClass("minimize")){
					//enlargeForVideoNode();
					if(gPlayTrigguredNode == target.objid ){
						playMovieAllFormat();
					}
					else{
						pauseMovieAllFormat();
					}
				}
			}
		}
	}


	/**
	 * replace play/pause icon
	 * @param {object} target - target for selected object.	
	 */
	function replacePlayPauseIcon(target){
		var prevTargetIndex;
		var preseTargetIndex;
		var prevtarget;
		if(target.grouptype == "keyGroup"){
			preseTargetIndex = 3;
		}else{
			preseTargetIndex = 4;
		}

		if(gPlayTrigguredNode || gPlayTrigguredNode===0){

			prevtarget = getObjet(gPlayTrigguredNode);
			if(prevtarget.grouptype == "keyGroup"){
				prevTargetIndex = 3;
			}else{
				prevTargetIndex = 4;
			}

			if(gPlayTrigguredNode == target.objid){
				tochangePauseToPlay(prevTargetIndex,prevtarget);
				pauseMovieAllFormat();
				gPlayTrigguredNode=null;
			}else{
				tochangePauseToPlay(prevTargetIndex,prevtarget);
				tochangePlayToPause(preseTargetIndex,target);
				gPlayTrigguredNode = target.objid;

			}

		}else{
			tochangePlayToPause(preseTargetIndex,target);
			gPlayTrigguredNode = target.objid;
		}

	}


   /**
	* change pause icon to play icon
	* @param {number} index - index for to get play icon in the group object.
	* @param {object} prevtarget - prevtarget for change the previous pause icon to play icon.	
	*/
	function tochangePauseToPlay(index,prevtarget){
		if(index && prevtarget && prevtarget._objects && prevtarget._objects[index]){
			var imgex=new Image();
			imgex.src='img/mediumplay.png';
			imgex.width = gKeyGroupPlayIconWidth;
			imgex.height = gKeyGroupPlayIconWidth;
			// object.imageSrc = preview;
			//object._objects[3].setElement(img);
			imgex.onload=function(){
			    prevtarget._objects[index].setElement(imgex);
				canvas.renderAll();
			}
		}
	}

   /**
    * change play icon to pause icon
	* @param {number} index - index for to get play icon in the group node.
	* @parameter {object} target - target for change the icon for clicked node.	
	*/
	function tochangePlayToPause(index,target){
		if(index && target && target._objects && target._objects[index]){
			var img=new Image();
				img.src='img/mediumstop.png';
				img.width = gKeyGroupPlayIconWidth;
				img.height = gKeyGroupPlayIconWidth;
				// object.imageSrc = preview;
				//object._objects[3].setElement(img);
				img.onload=function(){
				    target._objects[index].setElement(img);
					canvas.renderAll();
				}
		}
	}



	/**
	 * This function used to create a link
	 * @param {object} target - target for selected object.
	 * @param {object} ponter -  pointer for mouse pointer object.	 
	 */
	function createLinkOnMouseDown(target,pointer) {
		if(target && (link==null || link=='')){
			gObjectMoved = false;
			if(gLinkSource && gLinkSource.isLinkSourceObjectClicked(pointer)) {
				if(gNodePropertyChanged){
					objectModified();
					$('#changetext,#imgtext,#labeltext').hide();
					gNodePropertyChanged = false;
				}
				text = new fabric.Text('',{fontSize:18,lockMovementX:true,lockMovementY:true,opacity:0,scaleX:gCanvasScale,scaleY:gCanvasScale,objid:gUniqObjId,fontFamily: gNodeFontFamily,backgroundColor:'#ffffff',visible:false});
				gUniqObjId++;
				text.hasControls = false;
				var stroke = 3 * gCanvasScale;
				link = new fabric.Linearrow([0, 0, 0, 0], {stroke:'#00C000', fill:'#00C000', strokeWidth:stroke,lockMovementX:true,lockMovementY:true,head:'',tail:'',headid:'',tailid:'',objid:gUniqObjId,linkarrow:"end"});
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
				mapTemplate.currentNode && canvas.sendToBackWithoutRender(mapTemplate.currentNode);	
			}
		}

	}

	/**
	 * This function used to update Link position
	 * @param {object} pointer - pointer for mouse pointer object.	 
	 */
	function updateLinkPositionOnMouseMove(pointer) {
		if(gDrawingLink){
			if(!link.head.visible){
				gDrawingLink = false;
			  	canvas.remove(link.label);
				removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
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
			link.label.set({opacity:1});
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
	function updateLinkObject(options,pointer) {
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
			        	  		if((grp2.links[i].type == 'line' || grp2.links[i].type == 'quadratic') && grp2.links[i].linkArrowDirection == LINK_NO_ARROW_DIRECTION){
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
					}else{
						createShape = "rect";
					}
					grp2 = putShapes(pointer.x,pointer.y,createShape);
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
				var coords = getClosestCPCoordinates(grp2, {x:link.x1, y:link.y1});
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
			    	  	objectAdded(null,link);
			    }else{
					if(!gUndoRedoCheck){
						objectAdded(grp2,link);
					}
				}

				canvas.renderAll();
				gDrawingLinkMoved = false;
				if(link && link.headid == link.tailid){
					createNewLink = true;
					gMapHistory.pop();
				}
				if(createNewLink){
			  	 	createNewLink = false;
			  	 	canvas.remove(link.label);
					canvas.remove(link);
					// link.head && link.head.links && link.head.links.pop() && link.tail.links && link.tail.links.pop();
					removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
					gLinkSource.moveToTarget(canvas.getActiveObject());
					/**
			       	*This condition was for single doublearrow link
			        */
					/*var activeobj = canvas.getActiveObject().links;
					var linkobj = getObjet(activeobj);
					if(typeof activeobj == "number" && linkobj.linkArrowDirection == LINK_DOUBLE_ARROW_DIRECTION){
						$('#labeltext').show();
					}*/
					
			  	}else{
				  	setLinkCoordinates(grp2);
						link.createdTime = (new Date).getTime();
						link && canvas.bringToFront(link);
				  	link.label && canvas.setActiveObject(link.label);
				  	link.label && updateLabelTextCursorPosition();
				  	canvas.renderAll();
			  	}
			  }else{
			  	if(link){
			  		createNewLink = false;
			  	 	canvas.remove(link.label);
					removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
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
			removeLinksFromHeadTailNodes(link.head,null,link.objid);

		}

	}

	/**
	 * This function used to check the selected object is node or other target.
	 * @param {object} target - target is selected object.	 
	 */
	function isLinkSelectionPoints(target) {
		if(target && target.grouptype && (target.grouptype == 'startPoint' || target.grouptype == 'endPoint' || target.grouptype == 'quadraticController' || target.grouptype == "arrowhead") ) {
			writeToConsole("inside linkSelectionPoint");
			return true;
		} else{
			return false;
		}
	}

	/**
	 * This function used to update the detached link from the node.
	 * @param {object} pointer - pointer for mouse pointer object.	 
	 */
	function updateDetachedLinkPoints(pointer){
		if(gDetachedLinkTarget.grouptype == "startPoint"){
			// console.log(gDetachedLinkTarget);
			if(gDetachedLinkTarget.link.type=="quadratic"){
				gDetachedLinkTarget.link.path[0][1] = pointer.x;
    			gDetachedLinkTarget.link.path[0][2] = pointer.y;
    			gDetachedLinkTarget.link.set({stroke:"#00C000"});
    			gDetachedLinkTarget.link.arrowTail && gDetachedLinkTarget.link.arrowTail.set({fill:"#00C000"});
					gDetachedLinkTarget.link.arrowHead && gDetachedLinkTarget.link.arrowHead.set({fill:"#00C000"});
					var linkStartPoint = {x:pointer.x,y:pointer.y};
    			updateArrowHeadAngle(gDetachedLinkTarget.link,null,linkStartPoint);
				/*if(gDetachedLinkTarget.link.subtype){
					setStrokeDashArrayForCurve(gDetachedLinkTarget.link);
				}*/
			}else{
				var tailPoints = findPointForMovingTail(gDetachedLinkTarget.link,{x:pointer.x,y:pointer.y});
				if(tailPoints){
					gDetachedLinkTarget.link.set({x1:pointer.x,y1:pointer.y,x2:tailPoints[0],y2:tailPoints[1]});
					gDetachedLinkTarget.link.set({fill:"#00C000",stroke:"#00C000"});
					gLinkSelectionPoints.endPoint.set({left:tailPoints[0],top:tailPoints[1]});
				}
			}
		}else if(gDetachedLinkTarget.grouptype == "endPoint"){
			if(gDetachedLinkTarget.link.type=="quadratic"){
				gDetachedLinkTarget.link.path[1][3] = pointer.x;
    			gDetachedLinkTarget.link.path[1][4] = pointer.y;
    			gDetachedLinkTarget.link.set({stroke:"#00C000"});
    			gDetachedLinkTarget.link.arrowTail && gDetachedLinkTarget.link.arrowTail.set({fill:"#00C000"});
					gDetachedLinkTarget.link.arrowHead && gDetachedLinkTarget.link.arrowHead.set({fill:"#00C000"});
    			var linkEndPoint = {x:pointer.x,y:pointer.y};
    			updateArrowHeadAngle(gDetachedLinkTarget.link,linkEndPoint);
				/*if(gDetachedLinkTarget.link.subtype){
					setStrokeDashArrayForCurve(gDetachedLinkTarget.link);
				}*/

			}else{
				var headPoints = findPointForMovingHead(gDetachedLinkTarget.link,{x:pointer.x,y:pointer.y});
				if(headPoints){
					gDetachedLinkTarget.link.set({x1:headPoints[0],y1:headPoints[1],x2:pointer.x,y2:pointer.y});
					gDetachedLinkTarget.link.set({fill:"#00C000",stroke:"#00C000"});
					gLinkSelectionPoints.startPoint.set({left:headPoints[0],top:headPoints[1]});
				}
			}
		}
		updateLinkLabelPositionWhileMoving(gDetachedLinkTarget.link);
	}

	/**
	 * This function used to update position of the label connected by link.
	 * @param {object} link - link for detached link object.	 
	 */
	function updateLinkLabelPositionWhileMoving(link){
		if(link.type=='quadratic'){
			updateQuadraticCurveLabelPosition(link);
		}else{
			var elementPos = link.head.getTop()-link.tail.getTop();
			/*if(link.type=='linkarrow' || link.type == 'link'){
				if(elementPos > 1)
					link.label.set({left:(1-0.5)*link.x2+(0.5*link.x1),top:((1-0.5)*link.y2+(0.5*link.y1))-link.height/4});
				else
					link.label.set({left:(1-0.5)*link.x2+(0.5*link.x1),top:((1-0.5)*link.y2+(0.5*link.y1))+link.height/4});
			}else{
				link.label.set({left:link.x2+(link.x1-link.x2)/2,top:link.y1+(link.y2-link.y1)/2});
			}*/
			link.label.set({left:link.x2+(link.x1-link.x2)/2,top:link.y1+(link.y2-link.y1)/2});
		}
	}

	/**
	 * This is a call back function of mouse move from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	canvas.on('mouse:move', function(options){
		var pointer = this.getPointer(options.e);
		var target = options.target;
		canvas.isDragSelection && multipleSelection.updateDrawingPath(options);
		var activeGroup = canvas.getActiveGroup();
		if(activeGroup){
			return false;
		}
		var isObjectActive = activeGroup || canvas.getActiveObject();
		//When user does drag/band selection then following condition will be true.
		if(!isObjectActive && gControlDown){
			multipleSelection.isDragSelection = true;
		}else{
			multipleSelection.isDragSelection = false;
		}
		if(target && (target.grouptype=="endPoint" || target.grouptype=="startPoint")){
			$('.upper-canvas').css({'cursor':'url("img/grab.cur"), move'});
		}else if(gLinkDetached){
			$('.upper-canvas').css({'cursor':'url("img/grab.cur"), move'});
		}
		if(gLinkDetached){
			updateDetachedLinkPoints(pointer);
		}
		if(isLinkSelectionPoints(target)) {
			return;
		}
		if (gPlayIconContainer.length == 1) {
			updateObjectSize(gPlayIconContainer[0], 1/gEnlargePlayIconOnMouseOverFactor);
			gPlayIconContainer = [];
			canvas.renderAll();
		}

		if(target){
			setTargetNodeObject(target);
			executeMouseMoveActions(target,pointer);
		}
		updateLinkSourceColor(target,pointer);

		updateLinkPositionOnMouseMove(pointer);		
	});

	/**
	 * This is a call back function of mouse move from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	canvas.on('mouse:down', function(options){
		multipleSelection.canvasSelected = true;
		canvas.isDragSelection && multipleSelection.updateDrawingPath(options);
		if(options.target && options.target.grouptype && options.target.grouptype == "template"){
			return;
		}
		if(options.e.shiftKey && !canvas.getActiveGroup() && !canvas.selection){
			multipleSelection.enableMultipleSelection();
		}

		canvas.selection && gLinkSource.setVisible(false);								
		multipleSelection.multipleSelectionGroupManipulation(options);
				
		if(window.gControlDown && options.target && options.target.type != "group" ){ // Putting the previous node of Multiple Selection Group.
			canvas.setActiveObject(multipleSelection.multipleSelectionGroupFirstNode);
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
			if(gDetachedLinkTarget.link.type=="quadratic"){
				canvas.sendToBack(gDetachedLinkTarget.link.arrowTail);
				if(gDetachedLinkTarget.link.arrowHead)
					canvas.sendToBack(gDetachedLinkTarget.link.arrowHead);
			}
			mapTemplate.currentNode && canvas.sendToBackWithoutRender(mapTemplate.currentNode);
			gLinkSelectionPoints.setVisible(false);
			return;
		}
		if(isLinkSelectionPoints(target)) {
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

		executeMouseDownActions(target,pointer);

		if(link && link.headid && !link.tailid && target && target.type && target.type!='linearrow'){
	  	 	canvas.remove(link.label);
			canvas.remove(link);
			removeLinksFromHeadTailNodes(link.head,link.tail,link.objid);
			link='';
		}

		createLinkOnMouseDown(target,pointer);


		if(options.target && (options.target.grouptype=='imageGroup' || options.target.grouptype=='keyGroup') && !gObjectMoved){
			target = options.target;
			playVideoOnMouseUp(target,pointer);
			gObjectMoved = false;
			gImageGroupMouseClicked = true;
		}


	});
	
	/**
	 * This function is used to connect the detached links from node.
	 * @param {object} options for which will contain mouse pointer and target object.	 
	 */
	function connectLinkToTargetNode(pointer,target){
		var objects = canvas._objects;
		var point = new fabric.Point(pointer.x, pointer.y);
		var parentObj;
		var nonLinkedGrpType = ['arrowhead', 'startPoint', 'endPoint',
			'quadraticController', 'template'];
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
			        	  		if((endpoint.links[i].type == 'line' || endpoint.links[i].type == 'quadratic') && endpoint.links[i].linkArrowDirection == LINK_NO_ARROW_DIRECTION){
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
			        	  		if((endpoint.links[i].type == 'line' || endpoint.links[i].type == 'quadratic') && endpoint.links[i].linkArrowDirection == LINK_NO_ARROW_DIRECTION){
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
					updateLinkHead(target.link,parentObj);
				//	sendDataToServer(dataInteractionScopes.link,dataInteractionEvents.move,{objid:target.link.objid,linkStartNodeId:parentObj.objid, linkEndNodeId:target.link.tailid});
				}else if(target.grouptype=='endPoint'){
					obj = {objIds: target.link.objid, 'linkPositionChanged':true, 'oldObjecIds' : [target.link.headid,target.link.tailid], 'newObjecIds': [target.link.headid,parentObj.objid]}
					updateLinkTail(target.link,parentObj);
				//	sendDataToServer(dataInteractionScopes.link,dataInteractionEvents.move,{objid:target.link.objid,linkStartNodeId:target.link.headid, linkEndNodeId:parentObj.objid});
				}
				updatingMapHistory([obj]);
				canvas.setActiveObject(target.link.label);

	        }else{
		        if(target.grouptype=='startPoint'){
					setLinkCoordinates(target.link.head);
				}else{
					setLinkCoordinates(target.link.tail);
				}
				canvas.setActiveObject(target.link.label);
	        }
		}else{
			setLinkCoordinates(target.link.head);
			canvas.setActiveObject(target.link.label);
		}
		// if(target.link.type=="quadratic"){
		// 	target.link.set({stroke:"#000000"});
		// 	target.link.arrowHead && target.link.arrowHead.set({stroke:"#000000",fill:"#000000"});
		// }else{
		// 	target.link.set({fill:"#000000",stroke:"#000000"});
		// }

	}

	/**
	 * This function is used to update the link in head object.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	function updateLinkHead(targetLink,targetNode){
		removeLinksFromHeadTailNodes(targetLink.head,null,targetLink.objid);
		if(!targetNode.links)
            targetNode.links = [targetLink];
        else
            targetNode.links.push(targetLink);
		targetLink.head = targetNode;
		targetLink.headid = targetNode.objid;
		setLinkCoordinates(targetNode);
	}

	/**
	 * This function is used to update the link in tail object.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	function updateLinkTail(targetLink,targetNode){
		removeLinksFromHeadTailNodes(null,targetLink.tail,targetLink.objid);
		if(!targetNode.links)
            targetNode.links = [targetLink];
        else
            targetNode.links.push(targetLink);
		targetLink.tail = targetNode;
		targetLink.tailid = targetNode.objid;
		setLinkCoordinates(targetNode);
	}

	/**
	 * This function is used to select the quadratic link object.
	 * @param {object} target - target is an selected object.	 
	 */
	function updateActiveObjectOnQuadraticControllerMouseUp(target) {
	   if(target && target.grouptype && target.grouptype == 'quadraticController' ) {
		   if(gChnagedProperties.length==1 && gNodePropertyChanged){
				//Taking the object from canvas and pushing to change properties array
				// if objeect has been same and modified:
				var modObj = getObjet(gChnagedProperties[0].objid);
				pustoToChangePropertiesPresentState(modObj);
		   }
			canvas.setActiveObject(target.attachedTo.label);
	   }
	}

	/**
	 * This is a call back function of mouse up from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	canvas.on('mouse:up', function(options){
		// In below condition we are wheather canvas is in drawing mode or not. If it is 
		// then dissable the the drawing mode and call MultipleSlection.lassoSelectController()
		// to create the lasso multiple selection.
		if(canvas.isDrawingMode){
			$("#lasso-select").removeClass('select-active');
			canvas.isDrawingMode = !canvas.isDrawingMode;  
			multipleSelection.updateDrawingPath(options);
			multipleSelection.lassoSelectController();
			return false;
		}		
		gMouseDown = false;
		var pointer = this.getPointer(options.e);
		if(gLinkDetached) {
			connectLinkToTargetNode(pointer,gDetachedLinkTarget);
			gLinkDetached = false;
			gDetachedLinkTarget = "";
			gEventHandler = true;
			return;
		}
		if(isLinkSelectionPoints(options.target)) {
			gEventHandler = true;
			updateActiveObjectOnQuadraticControllerMouseUp(options.target);
			return;
		}
		if(link){
			updateLinkObject(options,pointer);
			gEventHandler = true;
			return;
		}
		var activeObject = canvas.getActiveObject();
			
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
				pushToChangeProperties(options.target);
			}else if(gChnagedProperties.length==1 && gNodePropertyChanged){
				var modObj = getObjet(gChnagedProperties[0].objid);
				pustoToChangePropertiesPresentState(modObj);
				pushToChangeProperties(options.target);
			} else if (gChnagedProperties.length==1 && !gNodePropertyChanged) {
				var modObj = getObjet(gChnagedProperties[0].objid);
				if (!modObj || modObj.objid != options.target.objid) {
					gChnagedProperties = [];
					pushToChangeProperties(options.target);
				}
			}
		}
		if($.browser.platform == "ipad" || $.browser.platform == "android") {
			discardActiveObject(options,pointer);
		}
		if(options.target && options.target.type && options.target.type =='group' && options.target.grouptype !='startPoint' && options.target.grouptype !='endPoint' && options.target.grouptype != "multipleSelectionGroup" && options.target.grouptype != "equationNode") {
			writeToConsole("option target is "+ options.target.type)
			if(isObjectTextClicked(pointer)) {
				showTextArea(options.target);
			} else {
				$('#changetext,#imgtext').hide();
				var object = canvas.getActiveObject();
				if(object && object._objects[1] && object._objects[1].getText().trim().length == 0) {
					showTextArea(object);
					if(object.grouptype == gPictureGroup && gLinkSource.getObject().angle == 180){
						$("#imgtext").hide();						
						setTimeout(function(){ $("#imgtext").show(); }, 10);
					}
				}
			}
		}
		if(gObMod && canvas.stateful == false){
			canvasObjectPositionChanged(options);
			gObMod=false;
		}else if(gNodePropertyChanged){
			canvasObjectPositionChanged(options);
		}
		gEventHandler = true;
	});

	/**
	 * This is a call back function of object moving from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	canvas.on('object:moving', function(options){
		var target = options.target;
		removeMovedNodeInImageArray(target.objid);
		if(target){
			gObjectMoved = true;
			if(canvas.stateful == false)
				gObMod=true;
		}
        if(target.currentHeight > target.canvas.height || 100 > target.canvas.width){
        	writeToConsole('in scaled object')
          //  return;
        }
          
        if(gSelectedDrawingNode && target && target.grouptype=='drawingGroup'){
        	repalceDrawingImage(gSelectedDrawingNode);
        	gSelectedDrawingNode = null;
        	$('#drawing_container').css({'top':-drawingCanvas.height+'px','display':'none'});
        }
        
        updateObjectPosition(target);
        if(target && target.grouptype && target.grouptype == 'quadraticController') {
        	target.attachedTo.path[1][1] = target.left;
        	target.attachedTo.path[1][2] = target.top;
        	target.attachedTo._originalLeft = target.left;
        	target.attachedTo._originalTop = target.top;
        	updateQuadraticCurveLabelPosition(target.attachedTo);
        	gLinkSelectionPoints.moveToSelectedLink(target.attachedTo);
        	updateArrowHeadAngle(target.attachedTo);
			/*if(target.attachedTo.subtype){
				setStrokeDashArrayForCurve(target.attachedTo);
			}*/
			updateCurveDimensions(target.attachedTo);
        	hideInput();
        } else {
      //   	var pointer = this.getPointer(options.e);
    		// var currentTransform = canvas._currentTransform;
    		// target._originalLeft = target.left;
    		// target._originalTop = target.top;
    		// var dx = options.target.getCenterPoint().x - canvas._currentTransform.original.left;
    		// var dy = options.target.getCenterPoint().y - canvas._currentTransform.original.top;

    		// var coords = options.target.oCoords;

    		var listOfObjects = ['rect','rectanglerc','keyGroup', 'ellipse','drawingGroup','imageGroup','equationNode',gPictureGroup];
    		if(target && target.grouptype && target.grouptype == 'multipleSelectionGroup') {
    			

   			    target && target.getObjects() && target.getObjects().forEach(function(k,v){
   			    	if(k && k.grouptype && ($.inArray(k.grouptype, gListOfNodes) > -1)) {
   			    		setLinkCoordinates(k,null,'multiSelectModeMove');
   			    		canvas.renderAll();
   			    	}
     			 });
    		} else if($.inArray(target.grouptype, gListOfNodes) > -1) {
       			setLinkCoordinates(options.target);
    			hideInput();
    		}
        }

	    if(target && gLinkSource.getObject().visible && gLinkSource.getObject().attachedTo == target) {
			// linkSource.updatePosition(target);
			gLinkSource.setVisible(false);
		}

		//Nodepropertychanged value should not be true for text node because
		// empty value should not go to mapHistory arrary if text node is dragged
		if(!(target && ((target.type && target.type=='text')))) {
			gNodePropertyChanged = true;
		}
		
			// if object is too big ignore


	});

	/**
	 * This is a call back function when object is rotating from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */	
	canvas.on('object:rotating', function(options){
		writeToConsole(options);

		var pointer = this.getPointer(options.e);
		var currentTransform = canvas._currentTransform;

		var dx = options.target.getCenterPoint().x - canvas._currentTransform.original.left;
		var dy = options.target.getCenterPoint().y - canvas._currentTransform.original.top;

		var coords = options.target.setCoords();

		setLinkCoordinates(options.target);
	});

	/**
	 * This is a call back function when object is scaling from fabric.
	 * @param {object} options - options for which will contain mouse pointer and target object.	 
	 */
	canvas.on('object:scaling', function(options){
		t = this._currentTransform;
		gNodePropertyChanged = true;
		var object = canvas.getActiveObject();
		var target = options.target;	

		if(object && gLinkSource.getObject().attachedTo == object) {
			gLinkSource.updatePosition(object);
		}
		setLinkCoordinates(options.target);
		if(drawingCanvas._objects && drawingCanvas._objects.length>=2){
			repalceDrawingImage(options.target);
		}
		target && updateObjectPosition(target);
		if(target.grouptype == gPictureGroup || target.grouptype == 'imageGroup'){
			//if(target._objects[1].visible === true){
				handelTextScaling(target);
				updateNodePosition(getActiveObject());
				var textAreaDetails = getTextAreaDetails(getActiveObject());
				textareaTop = textAreaDetails.top;
				textareaHeight = textAreaDetails.height;
				$('#imgtext').css({'height':textareaHeight});
				$('#imgtext').css({'top':textareaTop+'px'}); 
				canvas.renderAll();
			//}
		}
		if(target.grouptype == 'imageGroup'){
			excludePlayIconWhileResizeSnapshot(target);
		}
	});
	
	function handelTextScaling(target){
		if(target.scaleX>=1){
			target._objects[1].fontSize = gNodeFontSize/target.scaleX;
		}else{
			target._objects[1].fontSize = gNodeFontSize*target.scaleX;
		}
		if(target._objects[1].fontSize<10){
			target._objects[1].fontSize = 10;
		}
		target._objects[1].setCoords();
		target.height = target._objects[1].height + target._objects[3].height + gTxtPadding*2 + gImgObjPadding*2 + (gTxtBorder*2);
		target._objects[0].height = target.height;
		var textBeforeUpdate = target._objects[1].text;
  		updateImageNodeSize(target,target._objects[1].text,target._objects[1].height);
  		if(target._objects[1].visible === false){
  			target.height = target._objects[3].height+2;
        	target._objects[0].height = target.height;
        	updateImageNodeComponentPositions(target);
        	gLinkSource.moveToTarget(target);
			canvas.renderAll();
  		}
		var textAfterUpdate = target._objects[1].text;
		if(gTextScaledOnce==false){
			gTextScaledOnce = true;
			if(gChnagedProperties.length==0){
				pushToChangeProperties(target);
			}else if(gChnagedProperties.length==1 && gNodePropertyChanged){
				var modObj = getObjet(gChnagedProperties[0].objid);
				pustoToChangePropertiesPresentState(modObj);
				pushToChangeProperties(target);
			} else if (gChnagedProperties.length==1 && !gNodePropertyChanged) {
				var modObj = getObjet(gChnagedProperties[0].objid);
				if (!modObj || modObj.objid != target.objid) {
					gChnagedProperties = [];
					pushToChangeProperties(target);
				}
			}
		}
		if(textBeforeUpdate != textAfterUpdate){
			gTextScaling = true;
		}
		
	}

	function excludePlayIconWhileResizeSnapshot(target){
		if(target.grouptype == 'imageGroup'){
			if(target.scaleX > 1 || target.scaleY > 1){
				target._objects[4].height = gImageGroupPlayIconWidth/target.scaleY;
				target._objects[4].width = gImageGroupPlayIconWidth/target.scaleX;
			}else{
				target._objects[4].height = gImageGroupPlayIconWidth;
				target._objects[4].width = gImageGroupPlayIconWidth;
			}
			updateImageNodeComponentPositions(target);
			canvas.renderAll();
		}
	}

	/**
	 * we are not using this function.
	 */
	/*function getBCControlPoints(p1, p2){
		dx = p2.x-p1.x;
		dy = p2.y-p1.y;
		return[{x:p1.x+dx/4, y:p1.y+dy/4}, {x:p1.x+3*dx/4, y:p1.y+3*dy/4}]
	}*/

	/**
	 * To get closest controle points to of the target object and 
	 * @param {object} target - target selected object.
	 * @param {object} farEnd - farEnd tail object.	 
	 */
	function getClosestCPCoordinates(target, farEnd){
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
	 * we are not using this function.
	 */
	/*function getClosestCPs(target1, target2){
		target1.setCoords();
		target2.setCoords();
		var c1 = target1.getCenterPoint();
		var c2 = target2.getCenterPoint();

		var w1 = target1.width;
		var h1 = target1.height;
		var w2 = target2.width;
		var h2 = target2.height;

		if(t && t.ScaleX && t.target == target1){
			w1 = w1*t.ScaleX;
			h1 = h1*t.ScaleX;

			if(target2.scaleX){
				w2 = w2 * target2.scaleX;
				h2 = h2 * target2.scaleX;
			}

		}else if(t && t.ScaleX && t.target == target2){
			w2 = w2*t.ScaleX;
			h2 = h2*t.ScaleX;


			if(target1.scaleX){
				w1 = w1 * target1.scaleX;
				h1 = h1 * target1.scaleX;
			}
		}else{
			if(target1.scaleX){
				w1 = w1 * target1.scaleX;
				h1 = h1 * target1.scaleX;
			}

			if(target2.scaleX){
				w2 = w2 * target2.scaleX;
				h2 = h2 * target2.scaleX;
			}

		}

		mbmbD = Math.sqrt(Math.pow((c1.x-c2.x), 2) + Math.pow((c1.y+h1/2)-(c2.y+h2/2), 2));
		mbmrD = Math.sqrt(Math.pow((c1.x-(c2.x+w2/2)), 2) + Math.pow((c1.y+h1/2)-(c2.y), 2));
		mbmtD = Math.sqrt(Math.pow((c1.x-c2.x), 2) + Math.pow((c1.y+h1/2)-(c2.y-h2/2), 2));
		mbmlD = Math.sqrt(Math.pow((c1.x-(c2.x-w2/2)), 2) + Math.pow((c1.y+h1/2)-(c2.y), 2));

		mrmbD = Math.sqrt(Math.pow((c1.x+w1/2-c2.x), 2) + Math.pow((c1.y)-(c2.y+h2/2), 2)) ;
		mrmrD = Math.sqrt(Math.pow((c1.x+w1/2-(c2.x+w2/2)), 2) + Math.pow(c1.y-c2.y, 2));
		mrmtD = Math.sqrt(Math.pow((c1.x+w1/2-c2.x), 2) + Math.pow((c1.y)-(c2.y-h2/2), 2));
		mrmlD = Math.sqrt(Math.pow((c1.x+w1/2-(c2.x-w2/2)), 2) + Math.pow(c1.y-c2.y, 2));

		mtmbD = Math.sqrt(Math.pow((c1.x-c2.x), 2) + Math.pow((c1.y-h1/2)-(c2.y+h2/2), 2));
		mtmrD = Math.sqrt(Math.pow((c1.x-(c2.x+w2/2)), 2) + Math.pow((c1.y-h1/2)-(c2.y), 2));
		mtmtD = Math.sqrt(Math.pow((c1.x-c2.x), 2) + Math.pow((c1.y-h1/2)-(c2.y-h2/2), 2));
		mtmlD = Math.sqrt(Math.pow((c1.x-(c2.x-w2/2)), 2) + Math.pow((c1.y-h1/2)-(c2.y), 2));

		mlmbD = Math.sqrt(Math.pow((c1.x-w1/2-c2.x), 2) + Math.pow((c1.y)-(c2.y+h2/2), 2));
		mlmrD = Math.sqrt(Math.pow((c1.x-w1/2-(c2.x+w2/2)), 2) + Math.pow(c1.y-c2.y, 2));
		mlmtD = Math.sqrt(Math.pow((c1.x-w1/2-c2.x), 2) + Math.pow((c1.y)-(c2.y-h2/2), 2));
		mlmlD = Math.sqrt(Math.pow((c1.x-w1/2-(c2.x-w2/2)), 2) + Math.pow(c1.y-c2.y, 2));

		var closestD = mbmbD;
		var closest = ['mb', 'mb'];
		var coords = [{x:c1.x, y:c1.y+h1/2}, {x:c2.x, y:c2.y+h2/2}];

		// to avoid arrow passing through the node
		if(mbmrD < closestD) {
			closestD = mbmrD;
			closest = ['mb', 'mr'];
			// coords = [{x:c1.x, y:c1.y+h1/2}, {x:c2.x+w2/2, y:c2.y}];
			coords = [{x:c1.x, y:c1.y+h1/2}, {x:c2.x, y:c2.y-h2/2}];
		};

		if(mbmtD < closestD) {
			closestD = mbmtD;
			closest = ['mb', 'mt'];
			coords = [{x:c1.x, y:c1.y+h1/2}, {x:c2.x, y:c2.y-h2/2}];
		};

		// to avoid arrow passing through the node
		if(mbmlD < closestD) {
			closestD = mbmlD;
			closest = ['mb', 'ml'];
			// coords = [{x:c1.x, y:c1.y+h1/2}, {x:c2.x-w2/2, y:c2.y}];
			coords = [{x:c1.x, y:c1.y+h1/2}, {x:c2.x, y:c2.y-h2/2}];
		};




		if(mrmbD < closestD) {
			closestD = mrmbD;
			closest = ['mr', 'mb']
			coords = [{x:c1.x+w1/2, y:c1.y}, {x:c2.x, y:c2.y+h2/2}];
		};

		if(mrmrD < closestD) {
			closestD = mrmrD;
			closest = ['mr', 'mr'];
			coords = [{x:c1.x+w1/2, y:c1.y}, {x:c2.x+w2/2, y:c2.y}];
		};

		if(mrmtD < closestD) {
			closestD = mrmtD;
			closest = ['mr', 'mt'];
			coords = [{x:c1.x+w1/2, y:c1.y}, {x:c2.x, y:c2.y-h2/2}];
		};

		if(mrmlD < closestD) {
			closestD = mrmlD;
			closest = ['mr', 'ml']
			coords = [{x:c1.x+w1/2, y:c1.y}, {x:c2.x-w2/2, y:c2.y}];
		};



		if(mtmbD < closestD) {
			closestD = mtmbD;
			closest = ['mt', 'mb'];
			coords = [{x:c1.x, y:c1.y-h1/2}, {x:c2.x, y:c2.y+h2/2}];
		};

		// to avoid arrow passing through the node
		if(mtmrD < closestD) {
			closestD = mtmrD;
			closest = ['mt', 'mr'];
			// coords = [{x:c1.x, y:c1.y-h1/2}, {x:c2.x+w2/2, y:c2.y}];
			coords = [{x:c1.x, y:c1.y-h1/2}, {x:c2.x, y:c2.y+h2/2}];
		};

		if(mtmtD < closestD) {
			closestD = mtmtD;
			closest = ['mt', 'mt'];
			coords = [{x:c1.x, y:c1.y-h1/2}, {x:c2.x, y:c2.y-h2/2}];
		};

		// to avoid arrow passing through the node
		if(mtmlD < closestD) {
			closestD = mtmlD;
		 	closest = ['mt', 'ml'];
		 	// coords = [{x:c1.x, y:c1.y-h1/2}, {x:c2.x-w2/2, y:c2.y}];
		 	coords = [{x:c1.x, y:c1.y-h1/2}, {x:c2.x, y:c2.y+h2/2}];
		 };



		if(mlmbD < closestD) {
			closestD = mlmbD;
			closest = ['ml', 'mb'];
			coords = [{x:c1.x-w1/2, y:c1.y}, {x:c2.x, y:c2.y+h2/2}];
		};

		if(mlmrD < closestD) {
			closestD = mlmrD;
			closest = ['ml', 'mr'];
			coords = [{x:c1.x-w1/2, y:c1.y}, {x:c2.x+w2/2, y:c2.y}];
		};

		if(mlmtD < closestD) {
			closestD = mlmtD;
			closest = ['ml', 'mt'];
			coords = [{x:c1.x-w1/2, y:c1.y}, {x:target2.oCoords.mt.x, y:target2.oCoords.mt.y}];
		};

		return [coords,closest];

	}
*/
   /**
	* This function will return the controle point between the head and tail nodes.
	* @param {object} head- head is head node of link.
	* @param {object} tail- tail is tail node of link.
	*/
	function getControlPoint(head,tail) {
		var maxXValue = head.getLeft() > tail.getLeft() ? head.getLeft() : tail.getLeft();
		var minXValue = head.getLeft() < tail.getLeft() ? head.getLeft() : tail.getLeft();
		var maxYValue = head.getTop() > tail.getTop() ? head.getTop() : tail.getTop();
		var minYValue = head.getTop() < tail.getTop() ? head.getTop() : tail.getTop();
		var xValue = maxXValue  - minXValue;
		var yValue = maxYValue - minYValue;
		var maxValue = xValue > yValue ? xValue : yValue;
		var minValue =  xValue < yValue ? xValue : yValue;
		var maxDiff = maxValue - minValue;
		var cp = {};
		//console.log(" maxXValue "+ maxXValue + " minXValue "+ minXValue + " maxYValue " + maxYValue + " minYValue "+ minYValue )
		//console.log(" xValue "+ xValue + " yValue "+ yValue + " maxValue " + maxValue + " minValue "+ minValue )
		cp.x = maxXValue - maxDiff/ 2;
		cp.y = minYValue+maxDiff /2;
		cp.y = (cp.y+_originalViewportPosition.top)>(CANVAS_ORIGINAL_HEIGHT*gCanvasScale) ? head.getTop()+(gQuadraticController.getObject().radius*gCanvasScale): cp.y;
		cp.x = (cp.x+_originalViewportPosition.left)<0 ? head.getLeft()-(gQuadraticController.getObject().radius*gCanvasScale) : cp.x;
		return cp;

	}

   /**
	* This function will update the coodinates of  start/end/control point of qudratic curve.
	* @param {object} link - here link is quadratic link object.
	* @param {object} head - head is head node of link.
	* @param {object} tail - tail is tail node of link.
	* @param {string} drawElementsInHiddenCanvas -  drawElementsInHiddenCanvas is containing string the string. 
	* @param {string} multiSelectModeMove - multiSelectModeMove will contain string if multipleselection object is moving.
	*/
	function updateQuadraticCoOrds(link,head,tail,canvasObject,multiSelectModeMove) {
		canvasObject || (canvasObject = canvas);
		var xPositionBeforeChange = link.path[0][1];
		var yPositionBeforeChange = link.path[0][2];

		var point = getObjectCoordinates(head);
		link.path[0][1] = point.x;
		link.path[0][2] = point.y;

		var xPositionAfterChange = link.path[0][1];
		var yPositionAfterChange = link.path[0][2];
		
		if(link.path[1][1] == 0 && link.path[1][2] == 0) {
			var cp = getControlPoint(head,tail)
			link.path[1][1] = cp.x;
			link.path[1][2] = cp.y;
		}

		/*
		After checking the following condition we will update the control point of quadratic curve.
		If multiple selection object is moving then only we are updating the control point from 
		here other that control point is getting updated in updateObjectTopLeftPositions function.
		*/
		if(canvas.selection && gSelectedGroupObject && multiSelectModeMove) {			
			link.path[1][1] += xPositionAfterChange - xPositionBeforeChange;
			link.path[1][2] += yPositionAfterChange - yPositionBeforeChange;
		}

		point = getObjectCoordinates(tail);
		link.path[1][3] = point.x;
		link.path[1][4] = point.y;
		updateQuadraticCurveLabelPosition(link);
		updateArrowHeadAngle(link);
		if(!($.browser.msie && ($.browser.version === "10.0" ||  $.browser.version === "9.0"))){
			/*if(link.subtype){
				setStrokeDashArrayForCurve(link);
			}*/
		}
		updateCurveDimensions(link);
        //!zoom.isZooming && canvasObject.sendToBack(link);
		
	}

   /**
	* This function will update the quadratic line label position.
	* @param {object} link - here link is quadratic link object.
	*/
	function updateQuadraticCurveLabelPosition(link) {
		var point = getQuadraticCurvePoint(link.path[0][1],link.path[0][2],link.path[1][1],link.path[1][2],link.path[1][3],link.path[1][4],0.5)
		link.label.set({left:point.x,top:point.y});
	}

   /**
	* This function will set the link to proper places.
	* @param {object} object - object is node object.
	* @param {string} drawElementsInHiddenCanvas - drawElementsInHiddenCanvas is containing string the string 
	* based on the that we are doing activity on main/hidden canvas.
	* @param {string} multiSelectModeMove - multiSelectModeMove will contain string if multipleselection object is moving.
	*/
	function setLinkCoordinates(object,canvasObject,multiSelectModeMove){
		canvasObject || (canvasObject = canvas);
		var links = object.links;
		if(links && links.length && links.length>0){
		links && links.forEach(function(link, index, links){
		if(link.head != "" && link.tail != ""){
			var farEndTarget = link.tail;
			if(link.head != object){
				farEndTarget = link.head;
			}
			if(link.type == "quadratic") {
				updateQuadraticCoOrds(link,link.head,link.tail,canvasObject,multiSelectModeMove);
			} else {
				var elementPos = link.head.getTop()-link.tail.getTop();

				var closestpoints = getNewClosestPoints(link);

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
			}
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
	function removeLinksFromHeadTailNodes(headnode,tailnode,linkobjid){
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
		$('#labeltext').hide();
	}

   /**
	* This method is used to remove the id from the array of images used for staggering.
	* @param {number} objectid - head linkobjid of the link object id
	*/
	function removeMovedNodeInImageArray(objectid){
		for(var i=0;i<=gCreatedImageNode.length;i++){
			if(gCreatedImageNode[i] && gCreatedImageNode[i].id==objectid){
				// delete gCreatedImageNode[i];
				gCreatedImageNode.splice(i, 1);
				break;
			}
		}
	}

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
	if(target && (target.type=='line' || target.type=='linearrow' || target.type=='quadratic')){
		var obj = canvas.getActiveObject();
		if(obj && obj.type=='text'){
			var selectedline = getObjet(obj.links);
			if(selectedline && selectedline.objid != target.objid){
				if(target.type=='quadratic'){
					target.set({stroke:"#000000"});
					target.arrowTail.set({fill:"#000000"});
					if(target.arrowHead){
					target.arrowHead.set({fill:"#000000"});
					}
				}else{
					target.set({stroke:"#000000",fill:"#000000"});
				}
			}
		}else{
			if(target.type=='quadratic'){
				target.set({stroke:"#000000"});
				target.arrowTail.set({fill:"#000000"});
				if(target.arrowHead){
				target.arrowHead.set({fill:"#000000"});
			}
			}else{
				target.set({stroke:"#000000",fill:"#000000"});
			}
		}
	}
	canvas.hoverCursor='url("img/grab.cur"), move';
	canvas.renderAll();
});

/**
 * This is a call back function of mouse over on any objects from fabric.
 */
canvas.on('mouse:over', function(e) {
	// Disabling the green color of links in multiSelectMode.
	if(canvas.selection){ 
		return false;
	}
	var target = e.target ;
	/*if(target && (target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic')){*/
	if(target && (target.type=='line' || target.type=='linearrow' || target.type=='quadratic')){
		if(target.type=='quadratic'){
			target.set({stroke:"#00C000"});
			target.arrowTail.set({fill:"#00C000"});
			if(target.arrowHead){
			target.arrowHead.set({fill:"#00C000"});
			}
		}else{
			target.set({stroke:"#00C000",fill:"#00C000"});
		}
	}
	if(target && target.node && gDrawingLink && link.head.objid != target.objid){
		target._objects[0].set({borderColor: 'red',active:true});
	}

	if(gLinkDetached && target && target._objects && target.grouptype && target.grouptype != 'template'){
		target._objects[0].set({borderColor: 'red',active:true});
	}
	/*if(target.type=='link' || target.type=='line' || target.type=='linkarrow' || target.type=='linearrow' || target.type=='quadratic'){*/
	if(target.type=='line' || target.type=='linearrow' || target.type=='quadratic'){
		canvas.hoverCursor='pointer';
	}else{
		canvas.hoverCursor='url("img/grab.cur"), move';
	}
	// selectedgroup = grp2;
	canvas.renderAll();
});

/**
 * This is a call back function of mouse up from fabric.
 * @param {object} object - object selected object.
 * @param {number} scaleFactor - scaleFactor scale factor for the icon. 
 */
function updateObjectSize(object,scaleFactor) {
	object.setHeight(object.getHeight() * scaleFactor);
	object.setWidth(object.getWidth() * scaleFactor);
}

/**
 * This is a call back function of mouse up from fabric.
 * @param {object} target - target selected object.
 * @param {object} point - point mouse point. 
 */
function enlargePlayIcon(target,point) {
	if(target.grouptype) {
		var objectContainsPlayIcon = $.inArray(target.grouptype, gPlayIconGroupObjects);
		 if(objectContainsPlayIcon > -1 ) {
			if(gPlayIconContainer.length == 0) {
				if(target.grouptype == 'imageGroup' && target._objects[4].containsPoint(point)) {
					updateObjectSize(target._objects[4],gEnlargePlayIconOnMouseOverFactor);
					gPlayIconContainer.push(target._objects[4]);
				} else if(target.grouptype == 'keyGroup' && target._objects[3].containsPoint(point)) {
					updateObjectSize(target._objects[3],gEnlargePlayIconOnMouseOverFactor);
					gPlayIconContainer.push(target._objects[3]);
				}
			}
		}
	}
}

/** 
 * This function used to discard the selected object.
 * @param {object} options - options selected object.
 * @param {object} point - point mouse point. 
 */
function discardActiveObject(options,pointer) {
	if(options.target && options.target.grouptype && (options.target.grouptype == 'imageGroup' || options.target.grouptype == 'keyGroup')){
		if(playerIconClicked(pointer)) {
			canvas.discardActiveObject();
		}
	}
}

/**
 * This function will return true/false for play icon cliked or not.
 * @param {object} pointer - pointer mouse point.
 */
function playerIconClicked(pointer) {
	if(pointer) {
		var target = canvas.getActiveObject();
		if(target) {
			var point = getPoint(target,pointer);
			if((target._objects && target._objects[4] && target._objects[4].containsPoint(point)) || (target._objects && target.grouptype == 'keyGroup' && target._objects[3] && target._objects[3].containsPoint(point))){
				return true;
			}
		}
		writeToConsole("result of playIclonClicked " + true);
		return false;
	}
}

/**
 * This function will change object position while moving.
 * @param {object} target - target is selected object.
 */ 
function updateObjectPosition(target){
	var halfw = target.getWidth()/2;
    var halfh = target.getHeight()/2;
    var bounds = {	tl: { y: target.top - halfh, x:target.left - halfw },
            		br: { y: target.top + halfh, x:target.left + halfw }
        		  };
    var virtualCanvasWidth = CANVAS_ORIGINAL_WIDTH*gCanvasScale;
    var virtualCanvasHeight = CANVAS_ORIGINAL_HEIGHT*gCanvasScale;
    var objectActualTopLeftXCoordinate = _originalViewportPosition.left+bounds.tl.x;
    var objectActualBottomRightXCoordinate = _originalViewportPosition.left+bounds.br.x;
    var objectActualTopLeftYCoordinate = _originalViewportPosition.top+bounds.tl.y;
    var objectActualBottomRightYCoordinate =  _originalViewportPosition.top+bounds.br.y;	 	
		
	if( ( objectActualTopLeftXCoordinate < 0 || objectActualTopLeftXCoordinate > virtualCanvasWidth ) ) {			
		if(objectActualTopLeftXCoordinate < 0){				
			target.left = halfw - _originalViewportPosition.left;				
		}else{				
			target.left = (virtualCanvasWidth - halfw) - _originalViewportPosition.left;
		}	       
    }else {
	    if( ( objectActualBottomRightXCoordinate < 0 || objectActualBottomRightXCoordinate > virtualCanvasWidth ) ) {				
			if(objectActualBottomRightXCoordinate < 0){					
				target.left = halfw - _originalViewportPosition.left;
			}else{					
				target.left = (virtualCanvasWidth - halfw) - _originalViewportPosition.left;
			}				       
	    }
    } 

    if( ( objectActualTopLeftYCoordinate < 0 || objectActualTopLeftYCoordinate > virtualCanvasHeight ) ) {			
		if(objectActualTopLeftYCoordinate < 0){				
			target.top = halfh - _originalViewportPosition.top;
		}else{								
			target.top = (virtualCanvasHeight - halfh) - _originalViewportPosition.top;
		}			       
    }else {
		if( ( objectActualBottomRightYCoordinate < 0 || objectActualBottomRightYCoordinate > virtualCanvasHeight ) ) {				
			if(objectActualBottomRightYCoordinate < 0){					
				target.top = halfh - _originalViewportPosition.top;
			}else{					
					target.top = (virtualCanvasHeight - halfh) - _originalViewportPosition.top;
			}	       
	    } 
    }       		    	
}

/**
 * This function will return the both head and tail closest points of the selected 
 * link and there head and tail objects.
 * @param {object} target - target is selected link object. 
 */ 
function getNewClosestPoints(target){
  var tail = findTargetIntersectionPoints(target,target.tail);
  var head = findTargetIntersectionPoints(target,target.head);
  return {tail:tail,head:head};
}

/**
 * This function will return the closest points of the selected link and 
 * there head/tail objects.
 * @param {object} link - link is selected line object.
 * @param {object} target - target it will contain head or tail object. 
 */ 
function getInterSectionPointsForStraightLine(link,target) {
	var lineStartPoint = getObjectCoordinates(link.head);
	var lineEndPoint = getObjectCoordinates(link.tail);
	var targetCenterPoint = getObjectCoordinates(target);
	if(target && target.grouptype && target.grouptype == 'ellipse') {
		return Intersection.intersectEllipseLine(new Point2D(targetCenterPoint.x,targetCenterPoint.y), target.getObjects()[0].rx*target.scaleX,target.getObjects()[0].ry*target.scaleX, new Point2D(lineStartPoint.x,lineStartPoint.y), new Point2D(lineEndPoint.x,lineEndPoint.y));
	}else {
		var rectangle
		var targetTopLeft = targetCenterPoint.x - target.getWidth()/2;
		var targetTopTop = targetCenterPoint.y - target.getHeight()/2;
		var targetrightBottomLeft = targetCenterPoint.x + target.getWidth()/2;
		var targetRightBottomTop = targetCenterPoint.y + target.getHeight()/2;
		return Intersection.intersectLineRectangle(new Point2D(lineStartPoint.x,lineStartPoint.y), new Point2D(lineEndPoint.x,lineEndPoint.y),new Point2D(targetTopLeft,targetTopTop),new Point2D(targetrightBottomLeft,targetRightBottomTop));
	}
}

/**
 * This function will return the intersection point of the moving straight line.
 * @param {object} link - link is selected line object.
 * @param {object} target - target it will contain head or tail object.
 * @param {object} pointer - pointer for point of the mouse. 
 */ 
function getInterSectionPointsForMovingTailStraightLine(link,target,pointer) {
	if(target && target.grouptype && target.grouptype == 'ellipse') {
		return Intersection.intersectEllipseLine(new Point2D(target.getLeft(),target.getTop()), target.getObjects()[0].rx*target.scaleX,target.getObjects()[0].ry*target.scaleX, new Point2D(pointer.x,pointer.y), new Point2D(link.tail.getLeft(),link.tail.getTop()));
	}else {
		return Intersection.intersectLineRectangle(new Point2D(pointer.x,pointer.y), new Point2D(link.tail.getLeft(),link.tail.getTop()),new Point2D(target.getLeft()-target.getWidth()/2,target.getTop()-target.getHeight()/2),new Point2D(target.getLeft()+target.getWidth()/2,target.getTop()+target.getHeight()/2));
	}
}

/**
 * This function will return the intersection point of the moving straight line.
 * @param {object} link - link is selected line object.
 * @param {object} target - target it will contain head or tail object.
 * @param {object} pointer - pointer for point of the mouse. 
 */ 
function getInterSectionPointsForMovingHeadStraightLine(link,target,pointer) {
	if(target && target.grouptype && target.grouptype == 'ellipse') {
		return Intersection.intersectEllipseLine(new Point2D(target.getLeft(),target.getTop()), target.getObjects()[0].rx*target.scaleX,target.getObjects()[0].ry*target.scaleX, new Point2D(link.head.getLeft(),link.head.getTop()), new Point2D(pointer.x,pointer.y));
	}else {
		return Intersection.intersectLineRectangle(new Point2D(link.head.getLeft(),link.head.getTop()), new Point2D(pointer.x,pointer.y),new Point2D(target.getLeft()-target.getWidth()/2,target.getTop()-target.getHeight()/2),new Point2D(target.getLeft()+target.getWidth()/2,target.getTop()+target.getHeight()/2));
	}
}

/**
 * This function will return the intersection point of the moving straight line.
 * @param {object} link - link is selected line object.
 * @param {object} target - target it will contain head or tail object.
 * @param {object} pointer - pointer for point of the mouse. 
 */ 
function findPointForMovingTail(target,pointer){
	var intersectionPoints = getInterSectionPointsForMovingTailStraightLine(target,target.tail,pointer);
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
function findPointForMovingHead(target,pointer){
	var intersectionPoints = getInterSectionPointsForMovingHeadStraightLine(target,target.head,pointer);
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
function findTargetIntersectionPoints(link,target){
	var intersectopnPoints = getInterSectionPointsForStraightLine(link,target)
	if(intersectopnPoints.points.length > 0) {
		return [intersectopnPoints.points[0].x,intersectopnPoints.points[0].y];
	}
}

/*function findPointForHead(target){
	var intersectopnPoints = getInterSectionPointsForStraightLine(target,target.head).points[0];
	return [intersectopnPoints.x,intersectopnPoints.y];
}*/

// we are using setControlDown and setControlUp for toggling controlDown varibale on keyup/down for multiple selection.
var setControlDown = function(event){
    if(event.keyCode === 16 || event.charCode === 16){
        window.gControlDown = true;
    }else if(event.keyCode === 13 || event.charCode === 13){
		if(canvas._activeObject && canvas._activeObject.type == "text"){
        	$('#labelformat').hide();
			$('.map-menu').removeClass('mapMenuShow');
		}
    }
};

var setControlUp = function(event){
    if(event.keyCode === 16 || event.charCode === 16){
        window.gControlDown = false;
    }
};

window.addEventListener? document.addEventListener('keydown', setControlDown) : document.attachEvent('keydown', setControlDown);
window.addEventListener? document.addEventListener('keyup', setControlUp) : document.attachEvent('keyup', setControlUp);

/**
*This function creates single doubleArrow link if we try to draw two links in opposite directions between objects
*@param {object} oldlink - The oldlink that needs to be replaced
*/
function createDoubleArrowLink(oldlink){

	var head = getObjet(oldlink.headid);
    var tail = getObjet(oldlink.tailid);
    var label =  getObjet(oldlink.label.objid);

    text = new fabric.Text('label',{fontSize:12,lockMovementX:true,lockMovementY:true,opacity:0,scaleX:gCanvasScale,scaleY:gCanvasScale,objid:gUniqObjId,fontFamily: gNodeFontFamily});
    gUniqObjId++;
    text.hasControls = false;

    var newlink = new fabric.Linearrow([0, 0, 0, 0], {stroke:'#000000', fill:'#000000', strokeWidth:3,lockMovementX:true,lockMovementY:true,head:'',tail:'',headid:'',tailid:'',objid:gUniqObjId,hasCircle:false,linkarrow:"end"});
	newlink.strokeDashArray = oldlink.strokeDashArray;
    newlink.linkArrowDirection = LINK_DOUBLE_ARROW_DIRECTION;

	replaceLinks(label,null,oldlink,head,tail,text,newlink);	
}
