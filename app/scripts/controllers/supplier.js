(function() {

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function($rootScope, $scope, $state, $stateParams, $http, $translate, $uibModal, $filter, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        var trueValue = $rootScope.APPCONSTANT.GLOBAL.TRUE;
        var falseValue = $rootScope.APPCONSTANT.GLOBAL.FALSE;
        _this.isSaving = false; //Default to false
        var tenantId = $rootScope.userIdentity.tenantId;

		_this.accountCode = '';
		_this.isPreferredSupplier = false;

		//Hide the global supplier listing button if the tenant is not allowed to view the listing
		if ($state.current.name == "root.main.preferredSupplier") {
            var menuArray = $state.current.data.menu;
            for (var m in menuArray) {
                if (menuArray[m].state == "root.main.supplierListing") {
                    menuArray[m].hide = $rootScope.hideGlobalSupplierList;
                }
            }
        }

        //Pagination Parameters
        _this.recordsPerPage = $rootScope.recordsPerPage; //Default to the setting in constant
        _this.currentPageNo = 1; //Default to first page
        _this.recordsToSkip = (_this.currentPageNo - 1) * _this.recordsPerPage;
        //Smart table filter
        _this.tableFilterColumns = [
            {"company": {"attribute" : "company", "operator": "like", "model": "supplier", "isChild": false } },
            {"companyCode": {"attribute" : "companyCode", "operator": "like", "model": "supplier", "isChild": false } },
            {"address1": {"attribute" : "address1", "operator": "like", "model": "supplier", "isChild": false } },
            {"address2": {"attribute" : "address2", "operator": "like", "model": "supplier", "isChild": false } },
            {"address3": {"attribute" : "address3", "operator": "like", "model": "supplier", "isChild": false } },
            {"postcode": {"attribute" : "postcode", "operator": "like", "model": "supplier", "isChild": false } },
            {"cityId": {"attribute" : "cityId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"stateId": {"attribute" : "stateId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"countryId": {"attribute" : "countryId", "operator": "equal", "model": "supplier", "isChild": false } },
            {"active": {"attribute" : "active", "operator": "equal", "model": "supplier", "isChild": false } },
            {"categoryId": {"attribute" : "categoryId", "operator": "equal", "model": "supplierCategories", "isChild": true } },
        ];
        //Smart table filter for preferred supplier listing
        _this.psTableFilterColumns = [
            {"company": {"attribute" : "company", "operator": "like", "model": "supplier", "isChild": true } },
            {"address1": {"attribute" : "address1", "operator": "like", "model": "supplier", "isChild": true } },
            {"address2": {"attribute" : "address2", "operator": "like", "model": "supplier", "isChild": true } },
            {"address3": {"attribute" : "address3", "operator": "like", "model": "supplier", "isChild": true } },
            {"postcode": {"attribute" : "postcode", "operator": "like", "model": "supplier", "isChild": true } },
            {"cityId": {"attribute" : "cityId", "operator": "equal", "model": "supplier", "isChild": true } },
            {"stateId": {"attribute" : "stateId", "operator": "equal", "model": "supplier", "isChild": true } },
            {"countryId": {"attribute" : "countryId", "operator": "equal", "model": "supplier", "isChild": true } },
            {"active": {"attribute" : "active", "operator": "equal", "model": "supplier", "isChild": true } },
            {"categoryId": {"attribute" : "categoryId", "operator": "equal", "model": "supplierCategories", "isChild": true } }
        ];

        _this.cityFilters = [{ id: "", name: "All" }]; //declare city array
        _this.cityOptions = []; //declare city options array
        _this.stateFilters = [{ id: "", name: "All" } ]; //declare state array
        _this.stateOptions = []; //declare state options array
        _this.countryFilters = [{ id: "", name: "All" }]; //declare country array
        _this.countryOptions = []; //declare country options array
        _this.activeFilters = [{ id: "", name: "All" }, { id: trueValue, name: "Yes" }, { id: falseValue, name: "No" }];
        _this.activeOptions = [{ id: trueValue, "name": "Yes" }, { id: falseValue, "name": "No" }];
        _this.categoryOptions = []; //declare category options array
        _this.selectedRemoveSupplier = false;
        _this.documentTypeOptions = [
            {"id":$rootScope.APPCONSTANT.DOCUMENT.TYPE.HALAL_CERT, "name":"supplier.label.halalCert"},
            {"id":$rootScope.APPCONSTANT.DOCUMENT.TYPE.MOF_CERT, "name":"supplier.label.mofCert"},
            {"id":$rootScope.APPCONSTANT.DOCUMENT.TYPE.COMPANY_REG_DOCS, "name":"supplier.label.companyRegDocs"},
            {"id":$rootScope.APPCONSTANT.DOCUMENT.TYPE.TERMS_AND_CONDITIONS, "name":"supplier.label.tnc"},
            {"id":$rootScope.APPCONSTANT.DOCUMENT.TYPE.MISC, "name":"supplier.label.misc"},
        ];

        _this.viewSupplier = function(supplierId) {
            $state.go("root.main.supplierView", { "id": supplierId });
        };

        _this.refreshSubcategories = function(categoryId) {
            _this.supplier.subcategory = null;
            CommonService.getSubcategories(categoryId).then(function(result) {
                _this.subcategoryOptions = result;
            });
        };

        //bind in preferred_supplier.html
        _this.updateSelectedRemoveSupplier = function() {
            _this.selectedRemoveSupplier = false;
            for (var i in _this.supplierArray) {
                if (_this.supplierArray[i].checked) {
                    _this.selectedRemoveSupplier = true;
                    break;
                }
            }
        };
		_this.isAccountCodeExists = function (formElement, value) {
            if (value == undefined || value.length <= 2) {
                return;
            } else {
				var regexAllowPattern = /^[a-zA-Z0-9._-]+$/;

				if( regexAllowPattern.test(value) ){
					formElement.$setValidity('pattern', true);
					$http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/tenant/is-supplier-account-code-exists", { params: {supplierId: _this.supplier.id, supplierCode: value} })
						.then(function (response) {
							formElement.$setValidity('unique', (response.data > 0 ? false : true));
						}, function (response) {
							CommonService.SweetAlert({
                                title: "Failed",
                                text: "Failed to check account code.",
                                type: "warning"
							});
						});
				}else{
					formElement.$setValidity('pattern', false);
				}
			}
        };

        _this.downloadFile = function(documentId,fileType) {
            _this.isSaving = true;

            CommonService.downloadDocument(documentId,fileType)
                .then(function(response) {
                    _this.isSaving = false;
                });
        };

        //To retrieve the listing of suppliers
        //Bind in supplier_listing.html
        _this.supplierListing = function supplierListing(tableState) {
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
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/supplier?expand=categoriesText", {
                params: dataJsonParams
            }).then(function(response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.suppliers = response.data.items;
                _this.tableData = _this.suppliers;

                //change status from boolean to text
                angular.forEach(_this.tableData, function(value, key) {
                    if (value.active == true) {
                        value.active = "Yes";
                    } else if (value.active == false) {
                        value.active = "No";
                    }

                });

                pagination.numberOfPages = Math.ceil(pagination.totalItemCount / _this.recordsPerPage);
                _this.isLoading = false;
            }, function(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve supplier listing.",
                    type: "error",
                });
                _this.isLoading = false;
            });
        };

        //To retrieve the listing of preferred suppliers
        //Bind in preferred_supplier.html
        _this.preferredSupplier = function (tableState) {
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
            dataJsonParams["preferredSupplierOnly"] = $rootScope.APPCONSTANT.GLOBAL.TRUE;

            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/supplier?expand=categoriesText", {
                params: dataJsonParams
            }).then(function(response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.suppliers = response.data.items;
                _this.tableData = _this.suppliers;

                _this.supplierArray = _this.suppliers;

                //change status from boolean to text
                angular.forEach(_this.tableData, function(value, key) {
                    if (value.active == true) {
                        value.active = "Yes";
                    } else if (value.active == false) {
                        value.active = "No";
                    }
                });

                pagination.numberOfPages = Math.ceil(pagination.totalItemCount / _this.recordsPerPage);
                _this.isLoading = false;
            }, function(response) {
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

        //Function to top up credit
        //bind in supplier_view.html
        _this.topUp = function() {
            CommonService.SweetAlert({
                title: "Top Up Supplier\n"+_this.supplier.company,
                text: "Please enter the amount.",
                input: "number",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm"
            }).then(function(credit){
                if (credit.value) {
                    _this.saveObj = {
                        "supplierId" : _this.supplier.id,
                        "credit" : credit.value
                    };
                    $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/supplier/top-up", _this.saveObj).then(function (response) {
                        //Success Callback
                        var successMessage = credit.value+" topped up for "+_this.supplier.company;
                        CommonService.handleSuccessResponse(successMessage,"root.main.supplierView",{"id":_this.supplier.id});
                        _this.isSaving = false;
                    }, function (response) {
                        //Error Callback
                        var failMessage = "Failed to top up "+remarks.value+" for "+_this.supplier.company;
                        CommonService.handleErrorResponse(failMessage, response);
                        _this.isSaving = false;
                    });
                }
            });
        };

        //Function to add supplier only (not allowed to remove existing ones)
        //bind in preferred_supplier.html
        _this.addSupplier = function() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/supplier_modal.html',
                controller: 'SupplierModalController',
                controllerAs: 'sm',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedItem: function () {
                        return _this.supplierArray;
                    },
                    mode : 2 //Only allowed to add suppliers
                }
            });
            var existingSuppliersLength = _this.supplierArray.length;

            modalInstance.result.then(function (selectedSupplier) {
                var newSuppliersLength = selectedSupplier.length;
                if (newSuppliersLength > existingSuppliersLength) { //New suppliers added
                    var addedSuppliersLength = newSuppliersLength - existingSuppliersLength;
                    CommonService.SweetAlert({
                        title: "Are you sure?",
                        text: "System will proceed to add the selected supplier(s) as preferred supplier(s).",
                        type: "info",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Confirm"
                    }).then(function (isConfirm) {
                        if (isConfirm.value) {
                            CommonService.clearAlertMessage();
                            _this.isSaving = true;

                            _this.saveObj = {
                                "supplierArray" : selectedSupplier
                            };

                            $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/tenant/add-preferred-supplier", _this.saveObj).then(function (response) {
                                //Success Callback
                                var successMessage = addedSuppliersLength+" preferred supplier(s) added.";
                                CommonService.handleSuccessResponse(successMessage,"root.main.preferredSupplier",null);
                                _this.isSaving = false;
                            }, function (response) {
                                //Error Callback
                                var failMessage = "Failed to add "+addedSuppliersLength+" preferred supplier(s),";
                                CommonService.handleErrorResponse(failMessage, response);
                                _this.isSaving = false;
                            });
                        }
                    });
                }
            }, function () {
                //Modal Cancelled
                //Hence do nothing
            });
        };

        //Function to remove supplier from preferred supplier listing
        //bind in preferred_supplier.html
        _this.removeSupplier = function() {
            CommonService.SweetAlert({
                title: "Are you sure?",
                text: "System will proceed to remove the selected supplier(s) from preferred supplier listing.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm"
            }).then(function (isConfirm) {
                if (isConfirm.value) {
                    _this.toBeRemoveSupplierIdArray = [];
                    for (var i in _this.supplierArray) {
                        if (_this.supplierArray[i].checked) {
                            _this.toBeRemoveSupplierIdArray.push(_this.supplierArray[i].id);
                        }
                    }

                    CommonService.clearAlertMessage();
                    _this.isSaving = true;

                    _this.saveObj = {
                        "toBeRemoveSupplierIdArray" : _this.toBeRemoveSupplierIdArray
                    };

                    $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/tenant/remove-preferred-supplier", _this.saveObj).then(function (response) {
                        //Success Callback
                        var successMessage = _this.toBeRemoveSupplierIdArray.length+" preferred supplier(s) removed.";
                        CommonService.handleSuccessResponse(successMessage,"root.main.preferredSupplier",null);
                        _this.isSaving = false;
                    }, function (response) {
                        //Error Callback
                        var failMessage = "Failed to remove "+_this.toBeRemoveSupplierIdArray.length+" preferred supplier(s),";
                        CommonService.handleErrorResponse(failMessage, response);
                        _this.isSaving = false;
                    });
                }
            });
        };

		_this.updateSupplier = function(isValid){
			if( isValid ){
				CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.saveObj = {
                    accountCode : _this.accountCode,
					supplierId: _this.supplier.id
                };

                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/tenant/update-preferred-supplier", _this.saveObj)
					.then(function (response) {
                    //Success Callback
                    var successMessage = "Supplier " + _this.supplier.company + " updated.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.supplierView",{"id":response.data.supplierId});
                    _this.isSaving = false;
                }, function (response) {
                    //Error Callback
                    var failMessage = "Failed to update supplier "+_this.supplier.company;
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
			}
		}
        if (stateName == "root.main.supplierView" || stateName == "root.main.supplierEdit") {
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/supplier/" + $stateParams.id +"?expand=users,documents").then(function(response) {
                _this.supplier = response.data;

                for (var o in _this.activeOptions) {
                    if (_this.supplier.active == _this.activeOptions[o].id) {
                        _this.supplier.active = _this.activeOptions[o];
                    }
                }

                // 20180122 - allow add account code
                $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/tenant/is-preferred-supplier", { params: {supplierId: _this.supplier.id} })
                    .then(function (response) {
                        if( response.data != '' ){
                            _this.accountCode = response.data.accountCode;
                            _this.isPreferredSupplier = true ;
                        }else{
                            _this.isPreferredSupplier = false;
                        }
                    }, function (response) {
                        CommonService.SweetAlert({
                            title: "Failed",
                            text: "Failed to check preferred supplier.",
                            type: "warning"
                        });
                    });

                $rootScope.pageTitle += " - " + _this.supplier.name;
                $rootScope.bcText = _this.supplier.company;
            }, function(response) {
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve supplier details.",
                    type: "error"
                });
            });
        } else if (stateName == "root.main.supplierListing" || stateName == "root.main.preferredSupplier") {
            CommonService.getCities().then(function(result) {
                _this.cityOptions = result;
                angular.forEach(result, function(value, key) {
                    _this.cityFilters.push({ "id": value.id, "name": value.name });
                });
            });

            CommonService.getCountries().then(function(result) {
                _this.countryOptions = result;
                angular.forEach(result, function(value, key) {
                    _this.countryFilters.push({ "id": value.id, "name": value.name });
                });
            });

            CommonService.getStates().then(function(result) {
                _this.stateOptions = result;
                angular.forEach(result, function(value, key) {
                    _this.stateFilters.push({ "id": value.id, "name": value.name });
                });
            });

            CommonService.getCategories().then(function (result) {
                _this.categoryOptions = result;
            });
        }
    }; // End var Ctrl

    app.controller('SupplierController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$uibModal', '$filter', 'CommonService', Ctrl]);
}());
