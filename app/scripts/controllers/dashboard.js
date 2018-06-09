(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $state, $stateParams, $http, PrincipalService, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller

        if (stateName == "root.main.home") {
            //Get pending approval processes (PR, PO, Acknowledge Tender, Approve Tender)
            CommonService.getPendingApprovalProcesses(null,1).then(function (result) {
                _this.pendingApprovalPRArray = result;
            });

            CommonService.getPendingApprovalProcesses(null,2).then(function (result) {
                _this.pendingApprovalPOArray = result;
            });

            CommonService.getPendingApprovalProcesses(null,3).then(function (result) {
                _this.pendingAcknowledgementTenderArray = result;
            });

            CommonService.getPendingApprovalProcesses(null,4).then(function (result) {
                _this.pendingApprovalTenderArray = result;
            });
        }
    }; // End var Ctrl

    app.controller('DashboardController', ['$rootScope', '$state', '$stateParams', '$http', 'PrincipalService', 'CommonService', Ctrl]);
}());
