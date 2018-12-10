(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        var trueValue = $rootScope.APPCONSTANT.GLOBAL.TRUE;
        var falseValue = $rootScope.APPCONSTANT.GLOBAL.FALSE;
        _this.isSaving = false; //Default to false

        //Pagination Parameters
        _this.recordsPerPage = $rootScope.recordsPerPage; //Default to the setting in constant
        _this.currentPageNo = 1; //Default to first page
        _this.recordsToSkip = (_this.currentPageNo - 1) * _this.recordsPerPage;
        _this.masterOptions = [];
        _this.yesNoOptions = [{id:trueValue, "name":"text.yes"}, {id:falseValue, "name":"text.no"}];

        _this.tableFilterColumns = [
            {"name": {"attribute" : "name", "operator" : "like", "model" : "master", "isChild" : false}},
            {"prefix": {"attribute" : "prefix", "operator" : "like", "model" : "master", "isChild" : false}},
            {"active": {"attribute" : "active", "operator" : "like", "model" : "master", "isChild" : false}}
        ];

        _this.loadRecommendedPrizes = function() {
            //Load system recommended prizes value
            _this.master["4dBigPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_PRIZE_1"];
            _this.master["4dBigPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_PRIZE_2"];
            _this.master["4dBigPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_PRIZE_3"];
            _this.master["4dBigStarters"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_STARTERS"];
            _this.master["4dBigConsolation"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_BIG_CONSOLATION"];
            _this.master["4dSmallPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_SMALL_PRIZE_1"];
            _this.master["4dSmallPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_SMALL_PRIZE_2"];
            _this.master["4dSmallPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_SMALL_PRIZE_3"];
            _this.master["4d4aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4A_PRIZE"];
            _this.master["4d4bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4B_PRIZE"];
            _this.master["4d4cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4C_PRIZE"];
            _this.master["4d4dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4D_PRIZE"];
            _this.master["4d4ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4E_PRIZE"];
            _this.master["4d4fPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["4D_4F_PRIZE"];
            _this.master["3dAbcPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_ABC_PRIZE_1"];
            _this.master["3dAbcPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_ABC_PRIZE_2"];
            _this.master["3dAbcPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_ABC_PRIZE_3"];
            _this.master["3d3aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3A_PRIZE"];
            _this.master["3d3bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3B_PRIZE"];
            _this.master["3d3cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3C_PRIZE"];
            _this.master["3d3dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3D_PRIZE"];
            _this.master["3d3ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["3D_3E_PRIZE"];
            _this.master["gd4dBigPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_PRIZE_1"];
            _this.master["gd4dBigPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_PRIZE_2"];
            _this.master["gd4dBigPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_PRIZE_3"];
            _this.master["gd4dBigStarters"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_STARTERS"];
            _this.master["gd4dBigConsolation"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_BIG_CONSOLATION"];
            _this.master["gd4dSmallPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_SMALL_PRIZE_1"];
            _this.master["gd4dSmallPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_SMALL_PRIZE_2"];
            _this.master["gd4dSmallPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_SMALL_PRIZE_3"];
            _this.master["gd4d4aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4A_PRIZE"];
            _this.master["gd4d4bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4B_PRIZE"];
            _this.master["gd4d4cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4C_PRIZE"];
            _this.master["gd4d4dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4D_PRIZE"];
            _this.master["gd4d4ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4E_PRIZE"];
            _this.master["gd4d4fPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_4D_4F_PRIZE"];
            _this.master["gd3dAbcPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_ABC_PRIZE_1"];
            _this.master["gd3dAbcPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_ABC_PRIZE_2"];
            _this.master["gd3dAbcPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_ABC_PRIZE_3"];
            _this.master["gd3d3aPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3A_PRIZE"];
            _this.master["gd3d3bPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3B_PRIZE"];
            _this.master["gd3d3cPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3C_PRIZE"];
            _this.master["gd3d3dPrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3D_PRIZE"];
            _this.master["gd3d3ePrize"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["GD_3D_3E_PRIZE"];
            _this.master["5dPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_1"];
            _this.master["5dPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_2"];
            _this.master["5dPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_3"];
            _this.master["5dPrize4"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_4"];
            _this.master["5dPrize5"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_5"];
            _this.master["5dPrize6"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["5D_PRIZE_6"];
            _this.master["6dPrize1"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_1"];
            _this.master["6dPrize2"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_2"];
            _this.master["6dPrize3"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_3"];
            _this.master["6dPrize4"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_4"];
            _this.master["6dPrize5"] = $rootScope.APPCONSTANT.PACKAGE.RECOMMENDED_PRIZE["6D_PRIZE_5"];
        };

        _this.viewMaster = function (masterId) {
            $state.go("root.main.masterView",{"id":masterId});
        };

        //function to create the master & bind in master_create.html
        _this.createMaster = function (isValid){
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.saveObj = {
                    //"name" : _this.master.name,
                    //"prefix" : _this.master.prefix,
                    "active" : _this.master.active.id,
                    "locked" : _this.master.locked.id,
                    /*"commissionRate" : _this.master.commissionRate,
                    "voidBetMinutes" : _this.master.voidBetMinutes,
                    "betMaxLimitBig" : _this.master.betMaxLimitBig,
                    "betMaxLimitSmall" : _this.master.betMaxLimitSmall,
                    "betMaxLimit4a" : _this.master.betMaxLimit4a,
                    "betMaxLimit4b" : _this.master.betMaxLimit4b,
                    "betMaxLimit4c" : _this.master.betMaxLimit4c,
                    "betMaxLimit4d" : _this.master.betMaxLimit4d,
                    "betMaxLimit4e" : _this.master.betMaxLimit4e,
                    "betMaxLimit4f" : _this.master.betMaxLimit4f,
                    "betMaxLimit3abc" : _this.master.betMaxLimit3abc,
                    "betMaxLimit3a" : _this.master.betMaxLimit3a,
                    "betMaxLimit3b" : _this.master.betMaxLimit3b,
                    "betMaxLimit3c" : _this.master.betMaxLimit3c,
                    "betMaxLimit3d" : _this.master.betMaxLimit3d,
                    "betMaxLimit3e" : _this.master.betMaxLimit3e,
                    "betMaxLimit5d" : _this.master.betMaxLimit5d,
                    "betMaxLimit6d" : _this.master.betMaxLimit6d,
                    "remarks" : _this.master.remarks,*/
                };

                angular.forEach(_this.master, function(value,key) {
                    if (key != "active" && key != "locked") {
                        _this.saveObj[key] = value;
                    }
                });

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/master",_this.saveObj).
                then (function(response){
                    var successMessage = "Master "+_this.master.name+" created.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.masterView",{"id":response.data.id});
                    _this.isSaving = false;
                }, function(response){
                    var failMessage = "Failed to create master "+_this.master.name+".";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                })
            }
        };

        //function to update master & bind in master_edit.html
        _this.updateMaster = function updateMaster(isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.saveObj = {
                    "active" : _this.master.active.id,
                    "locked" : _this.master.locked.id,
                    /*"voidBetMinutes" : _this.master.voidBetMinutes,
                    "betMaxLimitBig" : _this.master.betMaxLimitBig,
                    "betMaxLimitSmall" : _this.master.betMaxLimitSmall,
                    "betMaxLimit4a" : _this.master.betMaxLimit4a,
                    "betMaxLimit4b" : _this.master.betMaxLimit4b,
                    "betMaxLimit4c" : _this.master.betMaxLimit4c,
                    "betMaxLimit4d" : _this.master.betMaxLimit4d,
                    "betMaxLimit4e" : _this.master.betMaxLimit4e,
                    "betMaxLimit4f" : _this.master.betMaxLimit4f,
                    "betMaxLimit3abc" : _this.master.betMaxLimit3abc,
                    "betMaxLimit3a" : _this.master.betMaxLimit3a,
                    "betMaxLimit3b" : _this.master.betMaxLimit3b,
                    "betMaxLimit3c" : _this.master.betMaxLimit3c,
                    "betMaxLimit3d" : _this.master.betMaxLimit3d,
                    "betMaxLimit3e" : _this.master.betMaxLimit3e,
                    "betMaxLimit5d" : _this.master.betMaxLimit5d,
                    "betMaxLimit6d" : _this.master.betMaxLimit6d,
                    "remarks" : _this.master.remarks,*/
                };

                angular.forEach(_this.master, function(value,key) {
                    if (key != "active" && key != "locked") {
                        _this.saveObj[key] = value;
                    }
                });

                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/master/" + _this.master.id,_this.saveObj).
                then(function(response) {
                    var successMessage = "Master "+_this.master.name+" updated.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.masterView",{"id":response.data.id});
                    _this.isSaving = false;
                }, function(response) {
                    var failMessage = "Failed to update master "+_this.master.name+".";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

        //function to delete the master
        //bind in master_view.html
        _this.deleteMaster = function() {
            CommonService.SweetAlert({
                title: "Are you sure?",
                text: "You will not be able to recover the deleted master!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm"
            }).then(function(isConfirm) {
                if (isConfirm.value) {
                    _this.isSaving = true
                    $http.delete($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/master/" + _this.master.id).
                    then(function (response) {
                        var successMessage = "Master " + _this.master.name + " has been deleted.";
                        CommonService.handleSuccessResponse(successMessage,"root.main.masterListing",null);
                        _this.isSaving = false;
                    }, function (response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        var failMessage = "Failed to delete master "+_this.master.name+".";
                        CommonService.handleErrorResponse(failMessage,response);
                        _this.isSaving = false;
                    });
                }
            });
        };

        //To retrieve the listing of masters
        //Bind in master_listing.html
        _this.masterListing = function masterListing(tableState) {
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
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/master", {
                params: dataJsonParams
            }).then(function (response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.masters = response.data.items;
                _this.tableData = _this.masters;

                pagination.numberOfPages = Math.ceil(pagination.totalItemCount / _this.recordsPerPage);
                _this.isLoading = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Failed",
                    text: "Failed to retrieve master listing.",
                    type: "error"
                });
                _this.isLoading = false;
            });
        };

        if (stateName == "root.main.masterEdit" || stateName == "root.main.masterView") {
                $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/master/"+$stateParams.id)
                    .then(function (response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        _this.master = response.data;

                        angular.forEach(_this.yesNoOptions, function (value, key) {
                            if (_this.master.active == value.id) {
                                _this.master.active = value;
                            }

                            if (_this.master.locked == value.id) {
                                _this.master.locked = value;
                            }
                        });

                        $rootScope.pageTitle += " - " + _this.master.name;
                        $rootScope.bcText = _this.master.name;
                    }, function (response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        CommonService.SweetAlert({
                            title: "Error",
                            text: "Failed to retrieve master details.",
                            type: "error"
                        });
                    });
        }
    }; // End var Ctrl

    app.controller('MasterController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', Ctrl]);
}());
