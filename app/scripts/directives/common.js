/**
 * Common Directives written by Dbix
 */

'use strict';

var app = angular.module('fdPortal');

app.directive('confirmClick', function() {
    return {
        link: function (scope, element, attrs) {
            // setup a confirmation action on the scope
            scope.confirmClick = function(msg) {
                // msg can be passed directly to confirmClick('are you sure?') in ng-click
                // or through the confirm-click attribute on the <a confirm-click="Are you sure?"></a>
                msg = msg || attrs.confirmClick || 'Are you sure?';
                // return true/false to continue/stop the ng-click
                return confirm(msg);
            };
        }
    };
});

//Directives defined in Angle framework
//Used by akoenig.deckgrid
app.directive('imageloaded', imageloaded);
// Add class to img element when source is loaded
function imageloaded () {
    // Copyright(c) 2013 André König <akoenig@posteo.de>
    // MIT Licensed
    var directive = {
        link: link,
        restrict: 'A'
    };
    return directive;

    function link(scope, element, attrs) {
        var cssClass = attrs.loadedclass;

        element.bind('load', function () {
            angular.element(element).addClass(cssClass);
        });
    }
}

app.directive('stDateInput', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        require: '^stTable',
        scope: {
            value: '='
        },
        templateUrl: 'views/common/st_dateinput.html',

        link: function (scope, element, attr, table) {

            var predicateName = attr.predicate;
            var inputs = element.find('input');
            var input = angular.element(inputs[0]);

            scope.open = function open($event) {
                scope.isOpen = true;
            };

            scope.change = function change() {
                var query = {};

                if (scope.value) {
                    query[predicateName] = scope.value;
                } else {
                    query[predicateName] = null;
                }

                table.search(query[predicateName], predicateName);
            }
        }
    }
}]);

/*app.directive('stDateRange', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        require: '^stTable',
        scope: {
            before: '=',
            after: '='
        },
        templateUrl: 'views/common/st_daterange.html',

        link: function (scope, element, attr, table) {

            var inputs = element.find('input');
            var inputBefore = ng.element(inputs[0]);
            var inputAfter = ng.element(inputs[1]);
            var predicateName = attr.predicate;


            [inputBefore, inputAfter].forEach(function (input) {

                input.bind('blur', function () {


                    var query = {};

                    if (!scope.isBeforeOpen && !scope.isAfterOpen) {

                        if (scope.before) {
                            query.before = scope.before;
                        }

                        if (scope.after) {
                            query.after = scope.after;
                        }

                        scope.$apply(function () {
                            table.search(query, predicateName);
                        })
                    }
                });
            });

            function open(before) {
              console.log('wqeqwe');
                return function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    if (before) {
                        scope.isBeforeOpen = true;
                    } else {
                        scope.isAfterOpen = true;
                    }
                }
            }

            scope.openBefore = open(true);
            scope.openAfter = open();
        }
    }
}]);*/

app.directive('stUiSelect', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        require: '^stTable',
        scope: {
            selectData: '=',
            value: '='
        },
        templateUrl: 'views/common/st_uiselect.html',

        link: function (scope, element, attr, table) {

            var predicateName = attr.predicate;
            var inputs = element.find('input');
            var input = angular.element(inputs[0]);

            scope.valueObj = {};

            scope.change = function change($item,$model) {
                var query = {};

                if (scope.valueObj.id) {
                    scope.value = $item.name;
                    query[predicateName] = $item.id;
                } else {
                    scope.value = null;
                    query[predicateName] = null;
                }
                table.search(query[predicateName], predicateName);
            }
        }
    }
}]);

app.directive('convertToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(val) {
                //saves integer to model null as null
                return val == null ? null : parseInt(val, 10);
            });
            ngModel.$formatters.push(function(val) {
                //return string for formatter and null as null
                return val == null ? null : '' + val ;
            });
        }
    };
});

app.directive('menuButtonDiv', function() {
    return {
        restrict: "E",
        replace: true,
        template:
        '<div id="menuButtonDiv" class="row">' +
            '<div class="col-lg-12"> ' +
                '<div class="btn-toolbar">' +
                    '<button class="mb-sm btn btn-outline" type="button" ng-repeat="menuObj in $state.current.data.menu" ' +
                    'ng-class="[menuObj.class, {active: menuObj.active}]" ui-sref="{{menuObj.state}}" ng-hide="menuObj.hide">' +
                        '{{menuObj.translate | translate}} ' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>'
    };
});

app.directive('alertMessageDiv', function() {
    return {
        restrict: "E",
        replace: true,
        template:
        '<div uib-alert ng-repeat="alertObj in $root.alertMessages" ng-class="&quot;alert-&quot;+alertObj.type"  close="$root.closeAlertMessage($index)">' +
            '{{alertObj.message}}'+
        '</div>'
    };
});

app.directive('loaderDiv', function() {
    return {
        restrict: "E",
        replace: true,
        template:
        '<div class="ball-scale-ripple-multiple">' +
            '<div></div>'+
            '<div></div>'+
            '<div></div>'+
        '</div>'
    };
});

app.directive('commonGetText', ['CommonService', function(CommonService) {
    return {
        restrict: 'E',
        //replace: true,
        transclude: true,
        template: '<div>{{result}}</div>',
        scope: {
            value: '=',
            object: '='
        },
        link: function(scope, element, attrs) {
            var result = null;
            if (scope.value != null && scope.object != null) {
                CommonService.getText(scope.value, scope.object).then(function (response) {
                    result = response;
                    scope.result = result;
                });
            }
        }
    };
}]);

app.directive("refreshSmartTable", function(){
    return {
        require:'stTable',
        restrict: "A",
        link:function(scope,elem,attr,table){
            scope.$on("refreshStItems", function() {
                table.pipe(table.tableState());
            });
        }
    }
});

app.filter('dateToISO', function() {
    return function(input) {
        return new Date(input).toISOString();
    };
});

app.filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if(keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});

app.filter('ifEmpty', function() {
    return function(input, defaultValue) {
        if (angular.isUndefined(input) || input === null || input === '') {
            return defaultValue;
        }

        return input;
    }
});

app.filter('trusted', ['$sce', function($sce) {
    return function(url){
        return $sce.trustAsResourceUrl(url);
    };
}]);


