'use strict';

angular.module('textpopupapp', [])
    .controller('textpopupcontroller', ['$scope', '$injector', 'instance', function($scope, $injector, instance) {
        var media, ctrl = this;
        ctrl.popupText = '';
        ctrl.bgColor;
        ctrl.fontSize;
        ctrl.fontColor;
        if (!ecEditor._.isUndefined(instance.editorObj)) {
            ctrl.popupText = instance.attributes.__text;
            ctrl.bgColor = instance.attributes.bgcolor;
            ctrl.fontSize = instance.attributes.fontSize;
            ctrl.fontColor = instance.attributes.color;
            $scope.$safeApply();
        }

        ctrl.addTextPopup = function() {
            if (!ecEditor._.isUndefined(instance.editorObj)) {
                var pText = instance.attributes.__text = ctrl.popupText;
                pText = pText.substring(0, 20) + ".....";
                instance.editorObj._objects[1].setText(pText);
                instance.attributes.bgcolor = ctrl.bgColor;
                instance.attributes.image = "toggle_image";
                instance.attributes.fontSize = ctrl.fontSize;
                instance.attributes.color = ctrl.fontColor;
                ecEditor.render();
            } else {
                if (ctrl.popupText) {
                    ecEditor.dispatchEvent("org.ekstep.textpopup:create", {
                        "__text": ctrl.popupText,
                        "x": 10,
                        "y": 10,
                        "fontFamily": "Sans-serif",
                        "fontSize": 18,
                        "minWidth": 20,
                        "w": 80,
                        "h": 80,
                        "maxWidth": 500,
                        "color": "#000000",
                        "fontStyle": "normal",
                        "fontWeight": "normal",
                        "stroke": "rgba(255, 255, 255, 0)",
                        "strokeWidth": 1,
                        "opacity": 1,
                        "editable": false,
                        "bgcolor": "#dddddd"
                    });
                    ecEditor.render();
                }
            }
            $scope.closeThisDialog();
        };

        ctrl.cancel = function() {
            $scope.closeThisDialog();
        };
    }]);
