(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ( $rootScope, $anchorScroll, $location, $state, $stateParams, $http, $translate, $filter, $window, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false

        _this.big = null;
        _this.small = null;
        _this["3a"] = null;
        _this["3b"] = null;
        _this["3c"] = null;
        _this["3d"] = null;
        _this["3e"] = null;
        _this["3f"] = null;
        _this["3abc"] = null;
        _this["4a"] = null;
        _this["4b"] = null;
        _this["4c"] = null;
        _this["4d"] = null;
        _this["4e"] = null;
        _this["5d"] = null;
        _this["6d"] = null;

        //Datepicker options
        _this.datepicker = {};
        _this.datepicker.format = 'dd-MMM-yyyy';
        _this.datepicker.drawDateStart = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };
        _this.datepicker.drawDateEnd = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };
        _this.datepicker.drawDate = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };

        _this.openDatepicker = function(which) {
            if (which == 1) {
                _this.datepicker.drawDateStart.opened = true;
            } else if (which == 2) {
                if (_this.drawDateStart) {
                    _this.datepicker.drawDateEnd.dateOptions.minDate = _this.drawDateStart;
                }
                _this.datepicker.drawDateEnd.opened = true;
            } else if (which == 3) {
                _this.datepicker.drawDate.opened = true;
            }
        };

        _this.getReport = function(fileTemplateId) {
            _this.isSaving = true;
            var reportParams = {};

            reportParams.fileTemplateId = fileTemplateId;
            reportParams.extraParams = {
                "drawDateStart": moment(_this.drawDateStart).format(),
                "drawDateEnd": moment(_this.drawDateEnd).format(),
                "drawDate": moment(_this.drawDate).format(),
            };

            _this.big ? reportParams.extraParams["big"] = _this.big : null;
            _this.small ? reportParams.extraParams["small"] = _this.small : null;
            _this["3a"] ? reportParams.extraParams["3a"] = _this["3a"] : null;
            _this["3b"] ? reportParams.extraParams["3b"] = _this["3b"] : null;
            _this["3c"] ? reportParams.extraParams["3c"] = _this["3c"] : null;
            _this["3d"] ? reportParams.extraParams["3d"] = _this["3d"] : null;
            _this["3e"] ? reportParams.extraParams["3e"] = _this["3e"] : null;
            _this["3f"] ? reportParams.extraParams["3f"] = _this["3f"] : null;
            _this["3abc"] ? reportParams.extraParams["3abc"] = _this["3abc"] : null;
            _this["4a"] ? reportParams.extraParams["4a"] = _this["4a"] : null;
            _this["4b"] ? reportParams.extraParams["4b"] = _this["4b"] : null;
            _this["4c"] ? reportParams.extraParams["4c"] = _this["4c"] : null;
            _this["4d"] ? reportParams.extraParams["4d"] = _this["4d"] : null;
            _this["4e"] ? reportParams.extraParams["4e"] = _this["4e"] : null;
            _this["5d"] ? reportParams.extraParams["5d"] = _this["5d"] : null;
            _this["6d"] ? reportParams.extraParams["6d"] = _this["6d"] : null;

            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/report/get-report",{
                params:reportParams
            }).then(function (response) {
                // this callback will be called asynchronously
                // when the response is available
                _this.reportData = response.data;

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
