(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false
        var masterId = $rootScope.userIdentity.masterId;

        //Pagination Parameters
        _this.recordsPerPage = $rootScope.recordsPerPage; //Default to the setting in constant
        _this.currentPageNo = 1; //Default to first page
        _this.recordsToSkip = (_this.currentPageNo - 1) * _this.recordsPerPage;

        _this.tableFilterColumns = [
            {"name": {"attribute" : "description", "operator" : "like", "model" : "package", "isChild" : false}},
            {"description": {"attribute" : "description", "operator" : "like", "model" : "package", "isChild" : false}}
        ];

        _this.package = {};

        /*_this.i244dBigPrize1 = 0;
        _this.i124dBigPrize1 = 0;
        _this.i64dBigPrize1 = 0;
        _this.i44dBigPrize1 = 0;
        _this.i244dBigPrize2 = 0;
        _this.i124dBigPrize2 = 0;
        _this.i64dBigPrize2 = 0;
        _this.i44dBigPrize2 = 0;
        _this.i244dBigPrize3 = 0;
        _this.i124dBigPrize3 = 0;
        _this.i64dBigPrize3 = 0;
        _this.i44dBigPrize3 = 0;
        _this.i244dBigStarters = 0;
        _this.i124dBigStarters = 0;
        _this.i64dBigStarters = 0;
        _this.i44dBigStarters = 0;
        _this.i244dBigConsolation = 0;
        _this.i124dBigConsolation = 0;
        _this.i64dBigConsolation = 0;
        _this.i44dBigConsolation = 0;
        _this.i244dSmallPrize1 = 0;
        _this.i124dSmallPrize1 = 0;
        _this.i64dSmallPrize1 = 0;
        _this.i44dSmallPrize1 = 0;
        _this.i244dSmallPrize2 = 0;
        _this.i124dSmallPrize2 = 0;
        _this.i64dSmallPrize2 = 0;
        _this.i44dSmallPrize2 = 0;
        _this.i244dSmallPrize3 = 0;
        _this.i124dSmallPrize3 = 0;
        _this.i64dSmallPrize3 = 0;
        _this.i44dSmallPrize3 = 0;
        _this.i244d4aPrize = 0;
        _this.i124d4aPrize = 0;
        _this.i64d4aPrize = 0;
        _this.i44d4aPrize = 0;

        _this.i24Gd4dBigPrize1 = 0;
        _this.i12Gd4dBigPrize1 = 0;
        _this.i6Gd4dBigPrize1 = 0;
        _this.i4Gd4dBigPrize1 = 0;
        _this.i24Gd4dBigPrize2 = 0;
        _this.i12Gd4dBigPrize2 = 0;
        _this.i6Gd4dBigPrize2 = 0;
        _this.i4Gd4dBigPrize2 = 0;
        _this.i24Gd4dBigPrize3 = 0;
        _this.i12Gd4dBigPrize3 = 0;
        _this.i6Gd4dBigPrize3 = 0;
        _this.i4Gd4dBigPrize3 = 0;
        _this.i24Gd4dBigStarters = 0;
        _this.i12Gd4dBigStarters = 0;
        _this.i6Gd4dBigStarters = 0;
        _this.i4Gd4dBigStarters = 0;
        _this.i24Gd4dBigConsolation = 0;
        _this.i12Gd4dBigConsolation = 0;
        _this.i6Gd4dBigConsolation = 0;
        _this.i4Gd4dBigConsolation = 0;
        _this.i24Gd4dSmallPrize1 = 0;
        _this.i12Gd4dSmallPrize1 = 0;
        _this.i6Gd4dSmallPrize1 = 0;
        _this.i4Gd4dSmallPrize1 = 0;
        _this.i24Gd4dSmallPrize2 = 0;
        _this.i12Gd4dSmallPrize2 = 0;
        _this.i6Gd4dSmallPrize2 = 0;
        _this.i4Gd4dSmallPrize2 = 0;
        _this.i2Gd44dSmallPrize3 = 0;
        _this.i12Gd4dSmallPrize3 = 0;
        _this.i6Gd4dSmallPrize3 = 0;
        _this.i4Gd4dSmallPrize3 = 0;
        _this.i24Gd4d4aPrize = 0;
        _this.i12Gd4d4aPrize = 0;
        _this.i6Gd4d4aPrize = 0;
        _this.i4Gd4d4aPrize = 0;*/

        _this.loadRecommendedPrizes = function() {
            //Load system recommended prizes value
            _this.package["4dBigPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_PRIZE_1"];
            _this.package["4dBigPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_PRIZE_2"];
            _this.package["4dBigPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_PRIZE_3"];
            _this.package["4dBigStarters"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_STARTERS"];
            _this.package["4dBigConsolation"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_CONSOLATION"];
            _this.package["4dSmallPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_SMALL_PRIZE_1"];
            _this.package["4dSmallPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_SMALL_PRIZE_2"];
            _this.package["4dSmallPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_SMALL_PRIZE_3"];
            _this.package["4d4aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4A_PRIZE"];
            _this.package["4d4bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4B_PRIZE"];
            _this.package["4d4cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4C_PRIZE"];
            _this.package["4d4dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4D_PRIZE"];
            _this.package["4d4ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4E_PRIZE"];
            _this.package["4d4fPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4F_PRIZE"];
            _this.package["3dAbcPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_ABC_PRIZE_1"];
            _this.package["3dAbcPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_ABC_PRIZE_2"];
            _this.package["3dAbcPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_ABC_PRIZE_3"];
            _this.package["3d3aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3A_PRIZE"];
            _this.package["3d3bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3B_PRIZE"];
            _this.package["3d3cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3C_PRIZE"];
            _this.package["3d3dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3D_PRIZE"];
            _this.package["3d3ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3E_PRIZE"];
            _this.package["gd4dBigPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_PRIZE_1"];
            _this.package["gd4dBigPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_PRIZE_2"];
            _this.package["gd4dBigPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_PRIZE_3"];
            _this.package["gd4dBigStarters"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_STARTERS"];
            _this.package["gd4dBigConsolation"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_CONSOLATION"];
            _this.package["gd4dSmallPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_SMALL_PRIZE_1"];
            _this.package["gd4dSmallPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_SMALL_PRIZE_2"];
            _this.package["gd4dSmallPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_SMALL_PRIZE_3"];
            _this.package["gd4d4aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4A_PRIZE"];
            _this.package["gd4d4bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4B_PRIZE"];
            _this.package["gd4d4cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4C_PRIZE"];
            _this.package["gd4d4dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4D_PRIZE"];
            _this.package["gd4d4ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4E_PRIZE"];
            _this.package["gd4d4fPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4F_PRIZE"];
            _this.package["gd3dAbcPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_ABC_PRIZE_1"];
            _this.package["gd3dAbcPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_ABC_PRIZE_2"];
            _this.package["gd3dAbcPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_ABC_PRIZE_3"];
            _this.package["gd3d3aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3A_PRIZE"];
            _this.package["gd3d3bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3B_PRIZE"];
            _this.package["gd3d3cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3C_PRIZE"];
            _this.package["gd3d3dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3D_PRIZE"];
            _this.package["gd3d3ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3E_PRIZE"];
            _this.package["5dPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_1"];
            _this.package["5dPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_2"];
            _this.package["5dPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_3"];
            _this.package["5dPrize4"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_4"];
            _this.package["5dPrize5"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_5"];
            _this.package["5dPrize6"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_6"];
            _this.package["6dPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_1"];
            _this.package["6dPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_2"];
            _this.package["6dPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_3"];
            _this.package["6dPrize4"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_4"];
            _this.package["6dPrize5"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_5"];
        };

        _this.getMasterMinimumPrizes = function() {
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/master/"+masterId,
                null)
                .then(function (response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    _this.masterData = response.data;
                }, function (response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    CommonService.SweetAlert({
                        title: "Error",
                        text: "Failed to retrieve master details.",
                        type: "error"
                    });
                });
        };

        //function to create the package & bind in package_create.html
        _this.createPackage = function createPackage(isValid){
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.package.masterId = masterId;
                _this.saveObj = _this.package;

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/package",_this.saveObj).
                then (function(response){
                    var successMessage = "Package "+_this.package.name+" created.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.packageView",{"id":response.data.id});
                    _this.isSaving = false;
                }, function(response){
                    var failMessage = "Failed to create package "+_this.package.name+".";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                })
            }
        };

        //function to update package & bind in package_edit.html
        _this.updatePackage = function updatePackage(isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.package.masterId = masterId;
                _this.saveObj = _this.package;

                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/package/" + _this.package.id,_this.saveObj).
                then(function(response) {
                    var successMessage = "Package "+_this.package.name+" Updated.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.packageView",{"id":response.data.id});
                    _this.isSaving = false;
                }, function(response) {
                    var failMessage = "Failed to update package "+_this.package.name+".";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

        //function to delete the package
        //bind in package_view.html
        _this.deletePackage = function() {
            CommonService.SweetAlert({
                title: "Are you sure?",
                text: "You will not be able to recover the deleted package!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm"
            }).then(function(isConfirm) {
                if (isConfirm.value) {
                    _this.isSaving = true
                    $http.delete($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/package/" + _this.package.id).then(function (response) {
                        var successMessage = "Package " + _this.package.name + " has been deleted.";
                        CommonService.handleSuccessResponse(successMessage,"root.main.packageListing",null);
                        _this.isSaving = false;
                    }, function (response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        var failMessage = "Failed to delete package "+_this.package.name+".";
                        CommonService.handleErrorResponse(failMessage,response);
                        _this.isSaving = false;
                    });
                }
            });
        };

        //To retrieve the listing of packages
        //Bind in package_listing.html
        _this.packageListing = function packageListing(tableState) {
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
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/package", {
                params: dataJsonParams
            }).then(function (response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.packages = response.data.items;
                _this.tableData = _this.packages;

                pagination.numberOfPages = Math.ceil(pagination.totalItemCount / _this.recordsPerPage);
                _this.isLoading = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Failed",
                    text: "Failed to retrieve package listing.",
                    type: "error"
                });
                _this.isLoading = false;
            });
        };

        if (stateName == "root.main.packageEdit" || stateName == "root.main.packageView") {
                $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/package/"+$stateParams.id,
                    null)
                    .then(function (response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        _this.package = response.data;
                        _this.getMasterMinimumPrizes();
                    }, function (response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        CommonService.SweetAlert({
                            title: "Error",
                            text: "Failed to retrieve package details.",
                            type: "error"
                        });
                    });
        } else if (stateName == "root.main.packageCreate") {
            _this.getMasterMinimumPrizes();
        }
    }; // End var Ctrl

    app.controller('PackageController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', Ctrl]);
}());
