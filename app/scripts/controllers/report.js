(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ( $rootScope, $anchorScroll, $location, $state, $stateParams, $http, $translate, $filter, $window, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false

        //Datepicker options
        _this.datepicker = {};
        _this.datepicker.format = 'dd-MMM-yyyy';
        _this.datepicker.startDate = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };
        _this.datepicker.endDate = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };

        _this.openDatepicker = function(which) {
            if (which == 1) {
                _this.datepicker.startDate.opened = true;
            } else if (which == 2) {
                if (_this.startDate) {
                    _this.datepicker.endDate.dateOptions.minDate = _this.startDate;
                }
                _this.datepicker.endDate.opened = true;
            }
        };

        _this.getReport = function(fileTemplateId) {
            _this.isSaving = true;
            var reportParams = {};

            reportParams.fileTemplateId = fileTemplateId;
            reportParams.extraParams = {
                "startDate": moment(_this.startDate).format(),
                "endDate": moment(_this.endDate).format()
            };

            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/report/get-report",{
                params:reportParams
            }).then(function (response) {
                // this callback will be called asynchronously
                // when the response is available
                _this.reportData = response.data;
                console.log(_this.reportData);

                _this.isSaving = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve report details.",
                    type: "error"
                });

                _this.isSaving = false;
            });
        };

    }; // End var Ctrl

    app.controller('ReportController', ['$rootScope', '$anchorScroll', '$location', '$state', '$stateParams', '$http', '$translate', '$filter', '$window', 'CommonService', Ctrl]);
}());