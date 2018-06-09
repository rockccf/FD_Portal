(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ( $rootScope, $scope, $state, $stateParams, $http, $translate, $filter,
                          $uibModal, $uibModalInstance, selectedItem, CommonService, mode) {
        var _this = this; //Declare local variable _this to refer to "this" controller
        var tenantId = $rootScope.userIdentity.tenantId;
        _this.selectedItem = angular.copy(selectedItem);
        _this.preferredSupplierOnly = true; //Default to true

        if (_this.selectedItem == null) {
            _this.selectedItem = [];
        }
        //mode : 1 - Add/Delete ; 2 = Add Only (allowed to add supplier(s) only)
        if (!mode) {
            mode = 1; //Default the mode to add/delete
        }

        _this.isLoading = false;

        //Smart table filter
        _this.tableFilterColumns = [
            {"company": {"attribute" : "company", "operator": "like", "model": "supplier", "isChild": false } },
            {"postcode": {"attribute" : "postcode", "operator": "like", "model": "supplier", "isChild": false } },
            {"city": {"attribute" : "name", "operator": "equal", "model": "city", "isChild": true } },
            {"state": {"attribute" : "name", "operator": "equal", "model": "state", "isChild": true } },
            {"country": {"attribute" : "name", "operator": "equal", "model": "country", "isChild": true } },
            {"currency": {"attribute" : "code", "operator": "equal", "model": "currency", "isChild": true } },
            {"industry": {"attribute" : "name", "operator": "equal", "model": "industry", "isChild": true } },
            {"cityId": {"attribute" : "cityId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"stateId": {"attribute" : "stateId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"countryId": {"attribute" : "countryId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"currencyId": {"attribute" : "currencyId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"industryId": {"attribute" : "industryId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"categoryId": {"attribute" : "categoryId", "operator": "equal", "model": "supplierCategories", "isChild": true } }
        ];

        _this.cityOptions = []; //declare city options array
        _this.stateOptions = []; //declare state options array
        _this.countryOptions = []; //declare country options array
        _this.currencyOptions = []; //declare currency options array
        _this.industryOptions = []; //declare industry options array
        _this.categoryOptions = []; //declare category options array

        CommonService.getCities().then(function(result) {
            _this.cityOptions = result;
        });

        CommonService.getStates().then(function(result) {
            _this.stateOptions = result;
        });

        CommonService.getCountries().then(function(result) {
            _this.countryOptions = result;
        });

        CommonService.getCurrencies().then(function(result) {
            _this.currencyOptions = result;
        });

        CommonService.getIndustries().then(function(result) {
            _this.industryOptions = result;
        });

        CommonService.getCategories().then(function (result) {
            _this.categoryOptions = result;
        });

        _this.refreshSmartTable = function() {
            $scope.$broadcast('refreshStItems');
        };

        _this.supplierListing = function (tableState) {
            var pagination = tableState.pagination;
            var search = tableState.search;
            var sort = tableState.sort;

            _this.isLoading = true;

            _this.recordsPerPage = pagination.number || $rootScope.recordsPerPage;
            _this.recordsToSkip = pagination.start || 0;
            _this.currentPageNo = Math.floor(pagination.start / pagination.number) + 1;

            var dataJsonParams = CommonService.getRequestParamsObj({"active":true}, search, sort, _this.tableFilterColumns, _this.currentPageNo, _this.recordsPerPage);;
            if (_this.preferredSupplierOnly) {
                dataJsonParams["preferredSupplierOnly"] = _this.preferredSupplierOnly;
            }
            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/supplier?expand=categoriesText", {
                params: dataJsonParams
            }).then(function (response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.items = response.data.items;
                _this.tableData = _this.items;

                //change status from boolean to text
                angular.forEach(_this.tableData, function (value, key) {
                    if (value.active == true) {
                        value.activeText = "Yes";
                    } else if (value.active == false) {
                        value.activeText = "No";
                    }

                    for (var i in _this.selectedItem) {
                        if (_this.selectedItem[i].id == value.id) {
                            value.isSelected = true;
                            if (mode == 2) {
                                value.disabled = true; //Disabled the existing items, so they cannot un-select them.
                            }
                            break;
                        }
                    }
                });

                pagination.numberOfPages = Math.ceil(pagination.totalItemCount / _this.recordsPerPage);
                _this.isLoading = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve supplier listing.",
                    type: "error"
                });
                _this.isLoading = false;
            });
        };

        _this.selectItem = function selectItem(itemObj) {
            if (itemObj.isSelected) {
                _this.selectedItem.push(itemObj)
            } else {
                for (var i in _this.selectedItem) {
                    if (_this.selectedItem[i].id == itemObj.id) {
                        _this.selectedItem.splice(i,1);
                        break;
                    }
                }
            }
        };

        _this.ok = function ok() {
            $uibModalInstance.close(_this.selectedItem);
        };

        _this.cancel = function cancel() {
            $uibModalInstance.dismiss('cancel');
        };
    }; // End var Ctrl

    app.controller('SupplierModalController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate',
        '$filter', '$uibModal', '$uibModalInstance', 'selectedItem', 'CommonService', 'mode', Ctrl]);
}());
