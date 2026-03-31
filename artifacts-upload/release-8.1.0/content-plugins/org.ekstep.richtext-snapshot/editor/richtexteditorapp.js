'use strict';

angular.module('richtexteditorapp', [])
    .controller('richtexteditorcontroller', ['$scope', '$injector', 'instance', function($scope, $injector, instance) {
        var ctrl = this;
        ctrl.text = '';
        $scope.$on('ngDialog.opened', function (e, $dialog) {
            CKEDITOR.basePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, "editor/libs/");
            CKEDITOR.replace( 'editor1', {
                customConfig: CKEDITOR.basePath + "/config.js",
                skin: 'moono-lisa,'+CKEDITOR.basePath + "/skins/moono-lisa/",
                contentsCss: CKEDITOR.basePath + "/contents.js",
            } );
        });
        ctrl.addText = function() {
            ecEditor.dispatchEvent('org.ekstep.richtext:create', {
                "__text":  CKEDITOR.instances.editor1.getData(),
                "x": 10,
                "y": 20,
                "fontFamily": "NotoSans",
                "fontSize": 18,
                "minWidth": 20,
                "w": 35,
                "maxWidth": 500,
                "fill": "#000000",
                "fontStyle": "normal",
                "fontWeight": "normal",
                "stroke": "rgba(255, 255, 255, 0)",
                "strokeWidth": 1,
                "opacity": 1,
                "editable": false,
                "lineHeight": 1.3
            });
            $scope.closeThisDialog();
        }
    }]);
