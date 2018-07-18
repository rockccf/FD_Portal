(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $state, $stateParams, $http, PrincipalService, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller

        if (stateName == "root.main.home") {

        }
    }; // End var Ctrl

    app.controller('DashboardController', ['$rootScope', '$state', '$stateParams', '$http', 'PrincipalService', 'CommonService', Ctrl]);
}());
