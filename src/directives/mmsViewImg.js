'use strict';

angular.module('mms.directives')
.directive('mmsViewImg', [mmsViewImg]);

function mmsViewImg() {
    var template = '<figure><mms-transclude-img mms-eid="{{image.sysmlId}}"></mms-transclude-img><figcaption>{{image.title}}</figcaption></figure>';
    return {
        restrict: 'E',
        template: template,
        scope: {
            image: '<mmsImage'
        },
        link: function(scope, element, attrs) {
        }
    };
}