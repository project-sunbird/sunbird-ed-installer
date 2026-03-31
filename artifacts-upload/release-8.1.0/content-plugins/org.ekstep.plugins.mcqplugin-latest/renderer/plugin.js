// Renderer plugin can't be tested as of now
// Please move the logic to other classes and test them independently
// Let the plugin class delegate functionality to these classes
Plugin.mcqplugin = {};

/* istanbul ignore next */
Plugin.mcqplugin.RendererPlugin = Plugin.extend({
    _type: 'mcqplugin',
    _isContainer: false,
    _render: true,
    _templatePath: undefined,
    _render: true,
    _pluginData: undefined,
    _selectedAnswere: undefined,
    initPlugin: function(data) {
        console.info('MCQ template plugin Renderer init')
        EkstepRendererAPI.dispatchEvent('renderer:overlay:show');
        EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
        _pluginData = JSON.parse(data.config.__cdata);
        this.initContent();

    },
    initContent: function(event, data) {
        jQuery('#gameCanvas').remove();
        jQuery('#gameArea').css({ left: '10%', top: '-10px', width: "80%", height: "90%", margin: "5% 0 0 0" });
        this.createLayout();
    },
    createLayout: function() {
        this.headerSection();
        this.optionforAnswere();
        this.handleOptionUi();
        this.hideDefaultNavigation();
        this.showCustomNavigation();
        this.addClickEvent();
    },
    headerSection: function() {

        var $headerDiv = jQuery('<h5>', { id: 'header', text: _pluginData.question.text }).addClass("headerSection");
        jQuery('#gameArea').append($headerDiv);
    },
    optionforAnswere: function() {
        instance = this;
        optionText = _pluginData.answers;
        $("#optionContainer").remove();
        var optionContainer = $("<div id='optionContainer'/>").css({
            width: '100%',
            'margin-top': '23%',
            display: 'flex',
            "flex-wrap": "wrap"
        });
        $('#gameArea').append(optionContainer);
        $.each(optionText, function(index, value) {
            Promise.resolve(instance.renderOption(index, value)).then(function() {
                instance.addClickEvent();
            });
        });
    },
    renderOption: function(index, value) {
        $('<div />', {
            id: index,
            text: value.text,
        }).css({
            "background-image": "url('" + value.image + "')",
            "background-size": "100% auto",
            "background-repeat": "no-repeat",
            border: "2px solid #9b9b9b",
            padding: "10px",
            "text-align": "center",
            display: "inline-block",
            margin: "10px 0 0 10px",
            "flex-grow": 1,
            height: "auto",
            "min-height": "84px",
            width: "calc(100% * (1/4) - 10px - 1px)"
        }).appendTo('#optionContainer');
        if (value.audio) {
            let imageSrc = EkstepRendererAPI.resolvePluginResource("org.ekstep.plugins.mcqplugin", "1.0", "renderer/assets/audio.png");
            let img = $('<img />', { src: imageSrc, id: "auido-icon-top" });
            img.appendTo("#" + index);
        }
    },
    addClickEvent: function() {
        var instance = this;
        $("#" + optionContainer.id + "> div").click(function(event) {
            $(this).addClass("option-selected").siblings().removeClass("option-selected");
            instance.getTargetPropertise(event);
        });
    },
    getTargetPropertise: function(event) {
        instance = this;
        _selectedAnswere = instance.getallProperties(event.target.id);
        if (_selectedAnswere.audio != null) {
            var audio = new Audio(_selectedAnswere.audio);
            audio.play();
        }
    },
    getallProperties: function(id) {
        return _pluginData.answers[+id];

    },
    handleOptionUi: function() {
        //if option less than four then set space randomly
        if ($("#optionContainer > div").length <= 4) $("#optionContainer").addClass("option-space");
    },
    checkAnswere: function() {
        instance = this;
        if (typeof _selectedAnswere == "undefined" || _selectedAnswere.isAnswerCorrect == false) {
            renderValue = '<div id="Error-popup-model"><div class="white-popup"><div class="font-lato assess-popup assess-tryagain-popup"><div class="wrong-answer" style=" text-align: center;">' +
                '<div class="banner"><img ng-src="assets/icons/banner2.png" height="100%" width="100%" src="assets/icons/banner2.png"></div>' +
                '<div class="sign-board"><img ng-src="assets/icons/incorrect.png" width="40%" id="incorrectButton" src="assets/icons/incorrect.png"></div></div><div id="popup-buttons-container"><div class="left button" id="next-stage">Next</div>' +
                '<div class="right primary button" id="tryagain">Try Again</div></div></div></div></div>';
            instance.showModelPopup(renderValue);

        } else {
            renderValue = '<div id="success-model-popup"><div class="white-popup"><div class="font-lato assess-popup assess-goodjob-popup"><div class="correct-answer" style=" text-align: center;"><div class="banner"> <img src="assets/icons/banner3.png" height="100%" width="100%" src="assets/icons/banner3.png"> </div><div class="sign-board"> <img src="assets/icons/check.png" id="correctButton" width="40%" src="assets/icons/check.png"> </div></div><div id="popup-buttons-container"><div class="primary center button" id="next-stage">Next</div></div></div></div></div>';
         instance.showModelPopup(renderValue);
        }
    },
    showModelPopup: function(renderValue) {
        instance = this;
        $.magnificPopup.open({
            items: {
                src: renderValue,
                type: 'inline'
            },
            callbacks: {
                open: function() {
                    $('#tryagain').on('click', function(event) {
                        event.preventDefault();
                        $.magnificPopup.close();
                    });
                    $('#next-stage').on('click', function(event) {
                        $.magnificPopup.close();
                        event.preventDefault();
                        EkstepRendererAPI.dispatchEvent('renderer:content:end');
                    });
                }
            },
            showCloseBtn: false
        });
    },
    hideDefaultNavigation: function() {
        jQuery("#overlay .nav-next").css('display', 'none');
    },
    showCustomNavigation: function() {
        instance = this;
        let imageSrc = $('.nav-next').find('img').attr("src"); //take default image path
        let img = $('<img />', { src: imageSrc, id: "show-custom-navigation", class: "" });
        img.on("click", function() {
            instance.checkAnswere();
        });
        img.appendTo('#gameArea');
    },
    drawBorder: function() {}
});
//#sourceURL=mcqpluginRendererPlugin.js