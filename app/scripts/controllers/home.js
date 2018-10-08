(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $state, $stateParams, $http, $window, $interval, PrincipalService, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller

        $rootScope.userBlockVisible = false; //By default, hide the user block on the sidebar (collapse it)

        _this.logout = function() {
            PrincipalService.authenticate(null);
            $state.go('root.login').then(function () {
                $window.location.reload();
            });
        };

        _this.tick = function() {
            _this.clock = Date.now();
        }
        _this.tick();
        $interval(_this.tick, 1000);

        _this.toggleUserBlock = function() {
            $rootScope.userBlockVisible = !$rootScope.userBlockVisible;
        };
    }; // End var Ctrl

    app.controller('HomeController', ['$rootScope', '$state', '$stateParams', '$http',  '$window', '$interval', 'PrincipalService', 'CommonService', Ctrl]);
}());
