angular.module('org.ekstep.wordconnectexplore:app', ["Scope.safeApply"]).controller('exploreController', ['$scope', '$location', function($scope, $location) {
    var plugin = { id: "org.ekstep.wordconnectexplore", ver: "1.0" };
    $scope.exploreimage = ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/noimagefound.png");
    $scope.exploretitle = "";
    $scope.exploremeaning = "";
    $scope.exploreimage = "";
    $scope.exploreaudio = "";
    $scope.explorepos = "";
    $scope.exploreExampleSentences = [];
    var explorelanguage = "";
    var searchWord = "";
    var newNode = {
        name:"",
        group:0,
        expanded:false,
        shape:'',
        synonyms:false
    };
    var newlink = {
        source:0,
        target:0,
        value:1
    };
    var seletedNode = {};
    var wordlist = {
        centerword:"World",
        list : ["Flour","Brinjal","Coffee","Umbrella","Sweet","Jaggery","Vessel","शक्कर"]
    }

    var nodeShape="circle"; //"ellipse"; //"rect"; //"circle";
    var nodeShapeWidth=120;
    var nodeShapeHeight=30;
    var ellipseRadiusX=60;
    var ellipseRadiusY=15;
    var circleRadius=50;

    var infoXPos=0;
    var infoYPos=0;
    var expandCollapseXPos=0;
    var expandCollapseYPos=0;
    var focusXPos=0;
    var focusYPos=0;
    var contextMenuIconWidth=24;
    var contextMenuIconHeight=24;
    var noOfLevelToExpand=4;

    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
   
    $scope.main = function(object) {
      
        this.hideAllContextualMenu = function(){
            ecEditor.jQuery('#infoIcon').addClass('hide');
            ecEditor.jQuery('#deleteIcon').addClass('hide');
        }

        this.togglesidebar = function(seletedNode){
            var object = seletedNode;
            /*if(!object){
                object = canvas.getActiveObject();
            }*/
            org.ekstep.services.playServices.getWordDetails(object.objid,object.languageid,function(err,res){ 
              //  console.log(res);
                if(err) {
                    var error = (typeof err == 'string') ? err : 'Get word details Api throwing error'
                    exploremessage(error);
                    // console.log('Error: ',err);
                    return;
                }
                $scope.exploretitle = "";
                $scope.exploremeaning = "";
                $scope.exploreimage = ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/noimagefound.png");
                $scope.exploreaudio = "";
                $scope.explorepos = "";
                $scope.exploreExampleSentences = [];
                if(res.data && res.data.result){
                    $scope.exploretitle = res.data.result.Word.lemma;
                    $scope.exploremeaning = res.data.result.Word.meaning;
                    $scope.exploreimage = (res.data.result.Word.pictures) ? 
                                        res.data.result.Word.pictures[0] : ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/noimagefound.png");
                    $scope.exploreaudio = (res.data.result.Word.pronunciations) ? 
                                            res.data.result.Word.pronunciations[0] : "" ;
                    $scope.explorepos = (res.data.result.Word.pos) ? 
                                            res.data.result.Word.pos[0] : "";
                    if(res.data.result.Word.synsets && res.data.result.Word.synsets[0].exampleSentences && res.data.result.Word.synsets[0].exampleSentences.length != 0){
                        $scope.exploreExampleSentences = res.data.result.Word.synsets[0].exampleSentences;
                    }
                    if ($scope.exploreaudio === "") {
                        ecEditor.jQuery('.announcement').addClass('hide');
                    } else {
                        ecEditor.jQuery('.announcement').removeClass('hide');
                    }
                    ecEditor.jQuery('.explorecardinfo').removeClass('hide');
                    $scope.$safeApply();
                }
            });
            
        }

        this.expandLevels = function(node) {
            force.stop();
            if (!node.expanded) {
                if(node.group <= noOfLevelToExpand) {
                    expandNodeLevels(node,function() {
                        createNodesAndLinks();
                    })
                }else {
                    createNodesAndLinks();
                }
            }else {
                collapseNodeLevels(node, true);
               // createNodesAndLinks();
            }
        }

        this.makearootnode = function(node) {
            var event = {
                target : node.name
            };
            searchfromheader(event);
        }
    } //main function end
    
    //Initialize the main function
    var wordconnect = new $scope.main();
    $scope.togglesidebar = wordconnect.togglesidebar;
    window.wordconnect = wordconnect;
    $scope.closeinfo = function() {
        ecEditor.jQuery('.explorecardinfo').addClass('hide');
    }

    var width = ecEditor.jQuery('#expandMode').width();//1200;//ecEditor.jQuery('#contents-pane').width();
    height = ecEditor.jQuery('#expandMode').height();//600;//ecEditor.jQuery('#contents-pane').height();

    var nodeSelected=false;
    var stopForce = false;

    var zoom = d3.behavior.zoom()
        .translate([0,0])
        .scale(1).scaleExtent([0.5, 1.75])
        .on("zoom", zoomfun);

    var svg = d3.select("#expandMode").append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("click", svgContainerClicked)
        .call(zoom);

    function svgContainerClicked() {
        if (nodeSelected) {
            nodeSelected=false;
            hideContextualMenu(seletedNode);
        }
        force.start();
    }

    var globalG = svg.append("g");
        
    function zoomfun() {
        //if (d3.event.scale <= 1.0 || d3.event.scale >= 1.50) return;
        //svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        globalG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var force = d3.layout.force()
        .gravity(0.005)
        .distance(50)
        .charge(-800)
        .theta(0.9)
        .alpha(0.3)
        .linkStrength(0.175)
        .size([width, height]);

    var nodes = [];
    var links = [];

    var color = d3.scale.category20();    
    
    function createNodesAndLinks() {
        var g = globalG.selectAll('g');
        g.remove();

        var line = globalG.selectAll('line');
        line.remove();
        var link = globalG.selectAll(".link")
            .data(links)    

        //  link.exit().remove();
        link.enter().append("line")
            .attr("class", "link")
            .attr("stroke-width", 0.5);

        var node = globalG.selectAll(".node")
            .data(nodes)

        node.enter().append("g")
            .attr("class", "node")
            .call(force.drag)

        //Context menu position settings
        if ("ellipse" === nodeShape) {
            infoXPos=50;
            infoYPos=-22;
            expandCollapseXPos=60;
            expandCollapseYPos=-7;
            focusXPos=50;
            focusYPos=7;
        } else if ("rect" === nodeShape) {
            infoXPos=110;
            infoYPos=-5;
            expandCollapseXPos=120;
            expandCollapseYPos=8;
            focusXPos=110;
            focusYPos=23;
        } else if ("circle" === nodeShape) {
            infoXPos=-7;
            infoYPos=-73;
            expandCollapseXPos=15;
            expandCollapseYPos=-67;
            focusXPos=33;
            focusYPos=-53;
        }

        node.append("image") //Info Icon
            .attr("class",'infoIcon')
            .attr("xlink:href", ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/info.png"))
            .attr("x", infoXPos) // Contextual menu position, Set the node width
            .attr("y", infoYPos) // Contextual menu position, Set the 0 is equal to the node right top postion
            .attr("width", contextMenuIconWidth)
            .attr("height", contextMenuIconHeight)
            .style({"visibility": "hidden"})
            .on("click",function(data,index) {
               // d3.event; // => Original DOM Event
                wordconnect.togglesidebar(data);
            });

        node.append("image") //ExpandCollapse Icon
            .attr("class",'expandCollapseIcon')
            .attr("xlink:href", function(d){
                if(d.group <= noOfLevelToExpand){
                    if(d.expanded){
                        return ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/collapse.png");
                    }else{
                        return ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/expand.png");
                    }
                }else{
                    return "";
                }
            })
            .attr("x", expandCollapseXPos) // Contextual menu position, Set the node width
            .attr("y", expandCollapseYPos)
            .attr("width", contextMenuIconWidth)
            .attr("height", contextMenuIconHeight)
            .style({"visibility": "hidden",'background':'#C0C0C0'})
            .on("click", function(data,index) {
                wordconnect.expandLevels(data);
            });

        node.append("image") //Focus Icon
            .attr("class",'focusIcon')
            .attr("xlink:href", ecEditor.resolvePluginResource(plugin.id, plugin.ver, "editor/libs/images/focus.png"))
            .attr("x", focusXPos) // Contextual menu position, Set the node width
            .attr("y", focusYPos)
            .attr("width", contextMenuIconWidth)
            .attr("height", contextMenuIconHeight)
            .style({"visibility": "hidden",'background':'#C0C0C0'})
            .on("click",function(data,index){
                wordconnect.makearootnode(data);
            });
            
        if ("ellipse" === nodeShape) {
            createEllipseNode(node);
            createEllipseText(node);
        } else if ("rect" === nodeShape) {
            createRectNode(node);
            createRectangleText(node);
        } else if ("circle" === nodeShape) {
            createCircleNode(node);
            createCircleText(node);
        }
        
        force.on("tick", function() {
            link.attr("x1", function(d) {
                 if(d.source.shape == 'ellipse' || d.source.shape == 'circle')
                        return d.source.x; 
                    else 
                        return d.source.x+65;
                })
                .attr("y1", function(d) { 
                     if(d.source.shape == 'ellipse' || d.source.shape == 'circle')
                        return d.source.y; 
                    else 
                        return d.source.y+20;
                })
                .attr("x2", function(d) { 
                    if(d.target.shape == 'ellipse' || d.source.shape == 'circle')
                        return d.target.x; 
                    else 
                        return d.target.x+65;
                })
                .attr("y2", function(d) { 
                     if(d.target.shape == 'ellipse' || d.source.shape == 'circle')
                        return d.target.y; 
                    else 
                        return d.target.y+20;
            });

        node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

        node.on('mousedown', function() { 
            d3.event.stopPropagation();
        });

        node.on('mouseover', function(d) {
            d3.select(this).moveToFront();
        });

        //test code - test center of canvas.
        // svg.append("line")
        //     .attr("x1",0)
        //     .attr("y1",height/2)
        //     .attr("x2",width)
        //     .attr("y2",height/2)
        //     .attr("style","stroke:rgb(255,0,0);stroke-width:2");

        // svg.append("line")
        //     .attr("x1",width/2)
        //     .attr("y1",0)
        //     .attr("x2",width/2)
        //     .attr("y2",height)
        //     .attr("style","stroke:rgb(255,0,0);stroke-width:2");
        force.start();
    }

    function createCircleNode(node) {
        node.append(nodeShape)
            .attr("r", function(d) {
                if(seletedNode && seletedNode.objid == d.objid){
                    d.fixed = true;
                }else{
                    if(nodes[0].objid != d.objid){
                        d.fixed = false;
                    }
                }
                if(d.expanded == true) {
                    return circleRadius;//or return 15
                } else {
                    return circleRadius;
                }
                
            })
            .attr("id",function(d){
                return d.objid;
            })
            .on('click', selectNode);
        setNodeColorStyle(node);
    }

    function createRectNode(node) {
        node.append(nodeShape)
            .attr("width", function(d) {
                  //  if(d.shape == 'rect')
                return nodeShapeWidth;//or return 15
            })
            .attr("height", function(d) {
                   // if(d.shape == 'rect')
                return nodeShapeHeight;//or return 15
            })
            .attr("rx", function(d) {
                if(d.expanded == true) {
                    return ellipseRadiusX;//or return 15
                } else {
                    return ellipseRadiusX;
                }
            })
            .attr("ry", function(d) {
                if(d.expanded == true) {
                    return ellipseRadiusY;//or return 15
                } else {
                    return ellipseRadiusY;
                }
            })
            .on('click', selectNode);
        setNodeColorStyle(node);
    }

    function createEllipseNode(node) {
        node.append("ellipse")
            .attr("rx", function(d) {
                //if(d.shape == 'ellipse')
                return ellipseRadiusX;//or return 4.5
            })
            .attr("ry", function(d) {
                //if(d.shape == 'ellipse')
                return ellipseRadiusY;//or return 4.5
            })
            .on('click', selectNode);
        setNodeColorStyle(node);
    }

    function createRectangleText(node) {
        node.append("text")
            .style("text-anchor", "middle")
            .attr("dy",(30/2)+3)
            .attr("dx",120/2)
            .style("fill", "#373a3c")
            .text(function(d) { 
                return d.name 
            }
        );
    }

    function createEllipseText(node) {
        node.append("text")
            .style("text-anchor", "middle")
            .attr("dy",4)
            .attr("dx",0)
            .style("fill", "#373a3c")
            .text(function(d) { 
                return d.name 
            }
        );
    }

    function createCircleText(node) {
        node.append("text")
            .style("text-anchor", "middle")
            .attr("dy",4)
            .attr("dx",0)
            .style("fill", "#373a3c")
            .text(function(d) { 
                return d.name 
            }
        );        
    }

    function setNodeColorStyle(node) {
        node.style("fill", function(d) {
            if(d.colorCode) {
                return d.colorCode;
            } else {
                return'#A1CBDF';
            }
        });
    }

    function hideContextualMenu(node) {
        createNodesAndLinks();
        // var info = d3.selectAll('.infoIcon');
        // info = info[0];
        // var selectedinfo = info[node.index];
        // selectedinfo.style.visibility = 'hidden';
        
        // var focus = d3.selectAll('.focusIcon');
        // focus = focus[0];
        // var selectedfocus = focus[node.index];
        // selectedfocus.style.visibility = 'hidden';

        // var explore = d3.selectAll('.expandCollapseIcon');
        // explore = explore[0];
        // var selectedexplore = explore[node.index];
        // selectedexplore.style.visibility = 'hidden';
    }

    function showContextualMenu(node) {
        createNodesAndLinks();
        // ecEditor.jQuery('#contextMenu').css({'top':node.x,'left':node.y,'visibility':'visible'});
        var info = d3.selectAll('.infoIcon');
        info = info[0];
        var selectedinfo = info[node.index];
        selectedinfo.style.visibility = 'visible';
        var focus = d3.selectAll('.focusIcon');
        focus = focus[0];
        var selectedfocus = focus[node.index];
        selectedfocus.style.visibility = 'visible';
        var explore = d3.selectAll('.expandCollapseIcon');
        explore = explore[0];
        var selectedexplore = explore[node.index];
        selectedexplore.style.visibility = 'visible';
    }

    function collapseNodeLevels(node, refresh) {
        removeChildNodes(node);
        createNodesAndLinks();
    }

    function removeChildNodes(node) {
        var childNodes=[];
        node.expanded = false;
        removeChildLinks(node);
        nodes=nodes.filter(function(obj) {
            if (obj.expanded == true && node.parentid != obj.objid && obj.group > node.group) {
                childNodes.push(obj);
            }
            return node.objid != obj.parentid;
        });
        for(var i=0;i<childNodes.length;i++) {
            removeChildNodes(childNodes[i]);
        }
    }

    function removeChildLinks(node) {
        links = links.filter(function(obj){
            return node.index != obj.target.index;
        });
    }

    function expandNodeLevels(node,callback){
        var selectedNode = node;
        //org.ekstep.services.playServices.getSimilarWordList({"request":{"filters":{"lemma":node.name,"language_id":[explorelanguage],"objectType":["Word"]}}},explorelanguage,function(err,res){
            org.ekstep.services.playServices.getRelatedWords({"request":{"filters":{"lemma":node.name,"language_id":[explorelanguage],"objectType":["Word"]}}},explorelanguage,function(err,res){
            if (err) {
                var error = (typeof err == 'string') ? err : 'Get similar word Api throwing error'
                exploremessage(error);
                force.start();
                loadingContent(false); // Start Loading screen
                return;
            }
            setNodeColors(res);

            var data = [];
            data = data.concat(res.synonyms, res.antonyms, res.entailments, res.hypernyms, res.hyponyms, res.meronyms, res.troponyms, res.holonyms, res.translations);

            var nodeFound=false;
            var newNodeCount=0;
            for(var i in data) {
                nodeFound=false;
                for(var j in nodes) {
                    if ( nodes[j].name.toLowerCase() === data[i].name.toLowerCase() ) {
                        nodeFound=true;
                        //Parent node and Selected to be excluded
                        if ( (data[i].name.toLowerCase() !== selectedNode.name.toLowerCase()) 
                            && (selectNode.parentid != nodes[j].index) ) {
                            var link = JSON.parse(JSON.stringify(newlink));
                            link.source = nodes[j].index;
                            link.target = selectedNode.index;
                            link.value = 1;
                            links.push(link);
                        }
                        break;
                    }
                }
                if (nodeFound === false) {
                    var node = JSON.parse(JSON.stringify(newNode));
                    node.name = data[i].name;
                    node.group = selectedNode.group+1;
                    node.expanded = false;
                    node.shape = nodeShape;
                    node.parentid = selectedNode.objid;
                    node.objid = data[i].identifier;
                    node.colorCode = data[i].colorCode;
                    node.languageid = (data[i].language_id)?data[i].languageid:explorelanguage;
                    nodes.push(node);

                    var link = JSON.parse(JSON.stringify(newlink));
                        link.source = nodes.length-1;
                        link.target = selectedNode.index;
                        link.value = 1;
                    links.push(link);
                    newNodeCount++;
                }
            }
            if (newNodeCount == 0) { //Display Message.
                exploremessage("Related words not available");
                force.start();
            } else {
                selectedNode.expanded = true;
                force.nodes(nodes)
                    .links(links)
                    .start();
                callback && callback();
            }            
        });
    }

    /**
      * Fuction to set the color code for different category of related words.
      * @param {object} Object - Object with arrays of different categories of words.
      */
    function setNodeColors(res) {
        var synonymColorCode="#A1CBDF";
        var antonymColorCode="#F39C12";
        var entailmentColorCode="#D7FE89";
        var hypernymColorCode="#FED684";
        var hyponymColorCode="#CDA8E0";
        var meronymColorCode="#92FDD9";
        var troponymColorCode="#E1B0B0";
        var holonymColorCode="#FFFBD2";
        var translationColorCode="#FFA500";

        for(var k in res.synonyms) {  // Synonyms
            res.synonyms[k].colorCode=synonymColorCode;
        }
        for(var k in res.antonyms) { // Antonyms
            res.antonyms[k].colorCode=antonymColorCode;
        }
        for(var k in res.entailments) { // Entailments
            res.entailments[k].colorCode=entailmentColorCode;
        }
        for(var k in res.hypernyms) { // Hypernyms
            res.hypernyms[k].colorCode=hypernymColorCode;
        }
        for(var k in res.hyponyms) { // Hyponyms
            res.hyponyms[k].colorCode=hyponymColorCode;
        }
        for(var k in res.meronyms) { // Meronyms
            res.meronyms[k].colorCode=meronymColorCode;
        }
        for(var k in res.troponyms) { // Troponyms
            res.troponyms[k].colorCode=troponymColorCode;
        }
        for(var k in res.holonyms) { // Holonyms
            res.holonyms[k].colorCode=holonymColorCode;
        }
        for(var k in res.translations) { //translations
            res.translations[k].colorCode=translationColorCode;
        }
    }

    function checkDuplicateNodes(nodes, name) {
        var nodeFound=true;
        for(var j in nodes) {
            if ( nodes[j].name.toLowerCase() === name.toLowerCase() ) {
                nodeFound=false;
                break;
            }
        }
        return nodeFound;
    }

    function selectNode(node) {
        force.stop();
        nodeSelected=true;
        ecEditor.jQuery('.explorecardinfo').addClass('hide');
        seletedNode = node;
        if(Object.keys(seletedNode).length != 0) {
            showContextualMenu(seletedNode);
        }
        d3.event.stopPropagation();
    }

    function getRandomWord(event) {
        seletedNode = {};
        org.ekstep.services.playServices.getRandomWord({"request":{"filters":{"language_id":[explorelanguage],"objectType":["Word"]}}},function(err,res){
            if(err) {
                var error = (typeof err == 'string') ? err : 'Get random word Api throwing error'
                exploremessage(error);
                ecEditor.jQuery('.pickarandomword_link').removeClass('custom-disabled');
                return;
            }
            wordlist.centerword.name = res.lemma;
            wordlist.centerword.identifier = res.identifier;
            runexploremode(res.lemma);
            ecEditor.jQuery('.pickarandomword_link').removeClass('custom-disabled');
        });
    }

    function searchfromheader(event) {
        seletedNode = {};
        var word = event.target;
        //org.ekstep.services.languageService.getWords({"request":{"filters":{"lemma":word,"language_id":[explorelanguage],"objectType":["Word"]}}},function(err,res){
        playServices.getWords({"request":{"filters":{"lemma":word,"language_id":[explorelanguage],"objectType":["Word"]}}}, function(err,res) {
            if(err){
                var error = (typeof err == 'string') ? err : 'Get words Api throwing error';
                exploremessage(error);
                //console.log('Error: ',err);
                return;
            }
            if(res && res.data.result.count != undefined && res.data.result.count != 0) {
             wordlist.centerword.name = res.data.result.words[0].lemma;
             wordlist.centerword.identifier = res.data.result.words[0].identifier;
             runexploremode(wordlist.centerword.name);
            } else {
                exploremessage('Word not found. Search another word!');
            }
        });
    }

    function exploremessage(message) {
        $.uiAlert({
            textHead: message, // header
            text: '', // Text
            bgcolor: '#55a9ee', // background-color
            textcolor: '#fff', // color
            position: 'top-right',// position . top And bottom ||  left / center / right
            icon: 'info circle', // icon in semantic-UI
            time: 500, // time
        });
    }
    
    function loadingContent(value) {
        if(value) {
            ecEditor.jQuery('.loading-content').addClass('loading');
        } else {
            ecEditor.jQuery('.loading-content').removeClass('loading');
        }
    }

    function runexploremode(word) {
        loadingContent(true); // Start Loading screen
        ecEditor.jQuery('.explorecardinfo').addClass('hide');
        //org.ekstep.services.playServices.getSimilarWordList({"request":{"filters":{"lemma":word,"language_id":[explorelanguage],"objectType":["Word"]}}},explorelanguage,function(err,res){
        org.ekstep.services.playServices.getRelatedWords({"request":{"filters":{"lemma":word,"language_id":[explorelanguage],"objectType":["Word"]}}},explorelanguage,function(err,res){
          // console.log(res);
            if(err) {
                var error = (typeof err == 'string') ? err : 'Get similar word Api throughing error';
                exploremessage(error);
                loadingContent(false); // Stop Loading screen
                return;
            }

            setNodeColors(res);

            var data = [];
            data = data.concat(res.synonyms, res.antonyms, res.entailments, res.hypernyms, res.hyponyms, res.meronyms, res.troponyms, res.holonyms, res.translations);
          
            wordlist.list = data;
          
            nodes = [];
            nodes.push({"name":wordlist.centerword.name,objid:wordlist.centerword.identifier,"group":1,"expanded":true,'shape':nodeShape,"parentid":-1,"centerword":true,"colorCode":"#FF8080",languageid:explorelanguage});
            for(var i in wordlist.list) {
                nodes.push({"name":wordlist.list[i].name,objid:wordlist.list[i].identifier,"group":2,"expanded":false,'shape':nodeShape,"parentid":nodes[0].objid,"colorCode":wordlist.list[i].colorCode,languageid:(wordlist.list[i].languageid)?wordlist.list[i].languageid:explorelanguage});
            }
           
            //Calculate center node position.
            nodes[0].fixed = true;
            if ('ellipse' === nodeShape) {
                nodes[0].x = (width/2)-(ellipseRadiusX/2);
                nodes[0].y = (height/2)-(ellipseRadiusY/2);
            } else if ('rect' === nodeShape) {
                nodes[0].x = (width/2)-(nodeShapeWidth/2);
                nodes[0].y = (height/2)-(nodeShapeHeight/2);
            } else if ('circle' === nodeShape) {
                nodes[0].x = (width/2);
                nodes[0].y = (height/2);
            }
            
            links = [];
            if(nodes.length > 1){
                for(var i=1;i<nodes.length;i++){
                    var link = JSON.parse(JSON.stringify(newlink));
                    link.source = i;
                    link.target = 0;
                    link.value = 1;
                    links.push(link);
                }
            }
            force.nodes(nodes)
                .links(links)
                .start();

            createNodesAndLinks();
            loadingContent(false); // Stop Loading screen 
        })
    }

    function exploreswitchlanguage(event) {
        explorelanguage = event.target;
    }

    function setExploreSearchWord(event) {
        searchWord = event.target;
    }

    $scope.loadContent = function() {
        var config = ecEditor.getAllConfig();
        explorelanguage = config.defaultLanguage;
        wordlist.centerword = config.centerword;
        ecEditor.addEventListener("loadexplore", loadExploreMode);
        ecEditor.addEventListener("changelanguage", exploreswitchlanguage);
        ecEditor.addEventListener("exploresearchword", searchfromheader);
        ecEditor.addEventListener("explorepickrandomword", getRandomWord);
        ecEditor.addEventListener("setExploreSearchWord", setExploreSearchWord);
    };

    function loadExploreMode(event) {
        if ("" != searchWord) {
            runexploremode(searchWord);
        }
        $scope.$safeApply();
    }
    
    /*
    $scope.telemetry = function(data) {
        org.ekstep.services.telemetryService.interact({ "type": 'click', "subtype": data.subtype, "target": data.target, "pluginid": "org.ekstep.collectioneditor", "pluginver": "1.0", "objectid": ecEditor.getCurrentStage().id, "stage": ecEditor.getCurrentStage().id });
    };*/
    org.ekstep.collectioneditor.api.initEditor(ecEditor.getConfig('editorConfig'), function() {
        $scope.loadContent();
    });
    // ecEditor.addEventListener('org.ekstep.collectioneditor:node:selected', $scope.setSelectedNode, $scope);
}]);
//# sourceURL=wordconnectexplore.js