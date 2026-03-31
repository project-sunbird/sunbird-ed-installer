//@ sourceURL=ftbdropdownprocessor.js
/**
 *Multiple Drop Down processor
 * @extends Plugin
 * @author @author Sivashanmugam Kannan<sivashanmugam.kannan@funtoot.com>
 */
Plugin.extend({
    _type: 'ftbdropdownprocessor',
    _isContainer: false,
    _render: true,
    //_input:"",
    initPlugin: function (data) {
        var inst = this;
        var mhImg = inst._theme.getAsset("micro-hint-mdd");
        var dropDownImg = inst._theme.getAsset("drop-down");
        var helper = PluginManager.getPluginObject('plugin_helper');
        var questionDiv = document.getElementById(data.identifier);
        var dropDownList = questionDiv.innerText.match(/__.*?__/g);
        var MQ = MathQuill.getInterface(2);
        _.each(dropDownList, function (dDExpr) {
            var selectBoxIndex = dDExpr.replace(new RegExp("__", 'g'), "");
            var selectId = "mdd-" + selectBoxIndex;
            var selectDiv;
            if (data.isSolution) {
                _.each(data.dropDowns, function (dD) {
                    //check the select box index is matching with identifier
                    if (dD.identifier == selectBoxIndex) {
                        optionObj = dD;
                    }
                })
                _.each(optionObj.options, function (option) {
                    if (option.answer) {
                        //removing [``]  to match up with MathQuil parameter mathc( ``\)
                        //check whether [``] there, if true add a span around it with calling it mathquil text option, then replace later that class with the name
                        var mathTextArray = _.uniq(option.text.match(/``.*?``/g));
                        _.each(mathTextArray, function (mathText) {
                            option.text = option.text.split(mathText).join("<span class='mathtext-container-in-solution-dropdown'>" + mathText + "</span>")
                        })
                        selectDiv = "<div class='drop_down_container_answer' ><span>" + option.text.replace(new RegExp("``", 'g'), "") + "</span></div>"
                    }
                })
            } else {
                selectDiv = "<div class='drop_down_mh_parent'><img data-mhmsg='' class='micro_hint' onclick='ftbdropdownprocessor_microHintClickHandler(this)' id='mhImg-" + selectBoxIndex + "' src='" + mhImg + "' ><div data-selected='' onclick='ftbdropdownprocessor_dropDownClickHandler(this)' data-selectboxid='" + selectBoxIndex + "' id='" + selectId + "' class='drop_down_container' ><span>" + data.selectText + "</span><img src='" + dropDownImg + "' /></div></div>"
            }
            questionDiv.innerHTML = questionDiv.innerHTML.replace(dDExpr, selectDiv);
            //mathtext rendering in solution window
            _.each(document.getElementsByClassName('mathtext-container-in-solution-dropdown'), function (mathQuilSpan) {
                MQ.StaticMath(mathQuilSpan);
                //removing class because if the qText contains more than one drop down with mathText multiple times mathQuil processing will happen
                jQuery(mathQuilSpan).removeClass('mathtext-container-in-solution-dropdown').addClass('mathtext-container-in-solution-dropdown-aftermathquil-processing');
            })

        })
        questionDiv.innerHTML = questionDiv.innerHTML;

        /*event handler for dropdown click */
        ftbdropdownprocessor_dropDownClickHandler = function (selectElement) {
            var clickedSelectBoxId = selectElement.dataset.selectboxid;
            var optionObj = {};
            _.each(data.dropDowns, function (dD) {
                if (dD.identifier == clickedSelectBoxId) {
                    optionObj = dD;
                }
            })

            var optionArray = [];
            _.each(optionObj.options, function (option, index) {
                var margin_bottom;
                if (optionObj.options.length == 2) {
                    margin_top = 6;
                } else if (optionObj.options.length == 3) {
                    margin_top = 2;
                } else {
                    margin_top = 0;
                }
                if (selectElement.dataset.selected == index + 1) {
                    optionArray.push("<li  data-optionindex='" + (index + 1) + "'  data-optionbelongtoselectbox=" + clickedSelectBoxId + " onclick='ftbdropdownprocessor_optionClickHandler(this)' id='mdd-" + clickedSelectBoxId + "-option-" + (index + 1) + "'    ><div class='option_outer_circle'><div style='background:grey' class='option_inner_circle'></div></div><div class='option_text' >" + option.text + "</div></li>")
                } else {
                    optionArray.push("<li  data-optionindex='" + (index + 1) + "'  data-optionbelongtoselectbox=" + clickedSelectBoxId + " onclick='ftbdropdownprocessor_optionClickHandler(this)' id='mdd-" + clickedSelectBoxId + "-option-" + (index + 1) + "'    ><div class='option_outer_circle'><div style='background:white' class='option_inner_circle'></div></div><div class='option_text' >" + option.text + "</div></li>");
                }
            })
            var optionsContent = "<ul class='option_list' " + " style='margin-top:" + margin_top + "%' >";
            optionsContent = optionsContent + optionArray.join("") + "</ul>"
            var popUpData = {
                title: '',
                content: optionsContent,
                type: 'html'
            }
            helper.showPopup(popUpData)
        }

        /*event handler for option click */
        ftbdropdownprocessor_optionClickHandler = function (clickedOption) {

            var selectBoxId = clickedOption.dataset.optionbelongtoselectbox;
            var optionIndex = clickedOption.dataset.optionindex;
            var dropDownsData = data.dropDowns;
            var optionText, optionTextForSelectBox;
            _.each(dropDownsData, function (dD, index) {
                if (dD.identifier == selectBoxId) {
                    optionTextForSelectBox = optionText = dD.options[optionIndex - 1].text;
                    optionText = optionText.replace(new RegExp("``", 'g'), "")
                    document.getElementById('mdd-' + selectBoxId).dataset.selected = optionIndex;
                }
            })

            var selectBox = clickedOption.parentElement;
            var allOptions = selectBox.children;
            _.each(allOptions, function (option) {
                if (option === clickedOption) {
                    option.getElementsByClassName('option_outer_circle')[0].getElementsByClassName('option_inner_circle')[0].style.background = 'grey';
                } else {
                    option.getElementsByClassName('option_outer_circle')[0].getElementsByClassName('option_inner_circle')[0].style.background = 'white';
                }
            })
            //mathquil process need to be applied even for options
            var MQ = MathQuill.getInterface(2);
            var selectBoxTextElement = document.getElementById('mdd-' + selectBoxId).getElementsByTagName('span')[0];

            var mathTextArray = _.uniq(optionTextForSelectBox.match(/``.*?``/g));
            _.each(mathTextArray, function (mathText) {
                optionTextForSelectBox = optionTextForSelectBox.split(mathText).join("<span class='option-text-container-in-dropdown'>" + mathText + "</span>")
            })

            selectBoxTextElement.innerHTML = optionTextForSelectBox;
            selectBoxTextElement.innerHTML = selectBoxTextElement.innerHTML.replace("<br>", "");

            _.each(selectBoxTextElement.getElementsByClassName('option-text-container-in-dropdown'), function (mathQuilSpan) {
                mathQuilSpan.innerText = mathQuilSpan.innerText.replace(new RegExp("``", 'g'), "")
                MQ.StaticMath(mathQuilSpan);
            })
            //closing the option window after showing the UI change (check box color change)
            setTimeout(function () {
                hidePopup(__ft_popup_container__html);
            }, 500);
        }

        /*event handler for microhint click */
        ftbdropdownprocessor_microHintClickHandler = function (clickedMicriHint) {
            var microHintMsg = clickedMicriHint.dataset.mhmsg;
            var helper = PluginManager.getPluginObject('plugin_helper');
            var popUpData = {
                title: '',
                content: "<p>" + microHintMsg + "</p>",
                type: 'mh',
                mmc: clickedMicriHint.dataset.mmc
            }
            helper.showPopup(popUpData);
        }

    },

});