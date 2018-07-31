(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService, $q) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false
        _this.canCreate = false;
        _this.today = moment();
        _this.dayOptions =
            [
                {"id":1,"name":"text.monday"},
                {"id":2,"name":"text.tuesday"},
                {"id":3,"name":"text.wednesday"},
                {"id":4,"name":"text.thursday"},
                {"id":5,"name":"text.friday"},
                {"id":6,"name":"text.saturday"},
                {"id":7,"name":"text.sunday"}
            ];

        CommonService.getCompanies().then(function (result) {
            _this.companyOptions = result;
        });

        //Datepicker options
        _this.datepicker = {};
        _this.datepicker.format = 'dd-MMM-yyyy';
        _this.datepicker.startDate = {
            "opened": false,
            "dateOptions": {
                "minDate": new Date(),
                "showWeeks": false
            }
        };
        _this.datepicker.endDate = {
            "opened": false,
            "dateOptions": {
                "minDate": new Date(),
                "showWeeks": false
            }
        };

        _this.getCorrectDatesBetweenDates = function(startDate, endDate, dayArray) {
            var dates = [];

            var currDate = moment(startDate).startOf('day');
            var lastDate = moment(endDate).startOf('day');

            var day = currDate.format('E');
            for (var i in dayArray) {
                if (dayArray[i] == day) {
                    dates.push(currDate.clone().format());
                    break;
                }
            }

            while(currDate.add(1, 'days').isSameOrBefore(lastDate)) {
                day = currDate.format('E');
                for (var i in dayArray) {
                    if (dayArray[i] == day) {
                        dates.push(currDate.clone().format());
                        break;
                    }
                }
            }

            return dates;
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

        _this.populateDraw = function() {
            if (_this.mode == 1) { //Days
                var days = _this.getCorrectDatesBetweenDates(_this.startDate,_this.endDate, _this.dayArray);
                if (days.length > 0) {
                    _this.canCreate = true;
                } else {
                    _this.canCreate = false;
                }
                for (var c in _this.companyArray) {
                    _this.companyArray[c].days = days;
                }
            } else { //Dates
                var days = [];
                for (var s in _this.selectedDateArray) {
                    days.push(_this.selectedDateArray[s].format());
                }
                for (var c in _this.companyArray) {
                    _this.companyArray[c].days = days
                }
            }
        };

        _this.createCompanyDraw = function (isValid){
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.saveObj = {
                    "companyArray" : _this.companyArray
                };

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/company-draw",_this.saveObj).
                then (function(response){
                    var successMessage = "Company draw(s) created.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.companyDrawListing",null);
                    _this.isSaving = false;
                }, function(response){
                    var failMessage = "Failed to create company draw(s).";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                })
            }
        };

        //To retrieve the listing of company draws
        //Bind in company_draw_listing.html
        _this.companyDrawListing = function(tableState) {
            var pagination = tableState.pagination;
            var search = tableState.search;
            var sort = tableState.sort;

            _this.isLoading = true;

            //pagination.start || 0;    // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            //pagination.number || 10;  // Number of entries showed per page.

            _this.recordsPerPage = pagination.number || $rootScope.recordsPerPage;
            _this.recordsToSkip = pagination.start || 0;
            _this.currentPageNo = Math.floor(pagination.start / pagination.number) + 1;

            var dataJsonParams = CommonService.getRequestParamsObj(null, search, sort, _this.tableFilterColumns, _this.currentPageNo, _this.recordsPerPage);

            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/company-draw", {
                params: dataJsonParams
            }).then(function (response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.companyDraws = response.data.items;
                _this.tableData = _this.companyDraws;

                pagination.numberOfPages = Math.ceil(pagination.totalItemCount / _this.recordsPerPage);
                _this.isLoading = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve company draw listing.",
                    type: "error"
                });
                _this.isLoading = false;
            });
        };

    }; // End var Ctrl

    app.controller('CompanyController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', '$q', Ctrl]);
}());
