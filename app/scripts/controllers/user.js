(function () {

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService, $q) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        var trueValue = $rootScope.APPCONSTANT.GLOBAL.TRUE;
        var falseValue = $rootScope.APPCONSTANT.GLOBAL.FALSE;
        _this.isSaving = false; //Default to false
        var masterId = $rootScope.userIdentity.masterId;
        _this.userType = $rootScope.userIdentity.userType;
        _this.canCreateUserType = null;
        if (masterId) {
            _this.masterPrefix = $rootScope.userIdentity.master.prefix;
        } else {
            _this.masterPrefix = null;
        }

        //Pagination Parameters
        _this.recordsPerPage = $rootScope.recordsPerPage; //Default to the setting in constant
        _this.currentPageNo = 1; //Default to first page
        _this.recordsToSkip = (_this.currentPageNo - 1) * _this.recordsPerPage;
        //Smart table filter
        //If it's parent table, model has to be the physical table name in the DB
        //If it's child table, model has to be the relation name in the model class (userProfile instead of user_profile)
        _this.tableFilterColumns = [
            {"username": {"attribute" : "username", "operator" : "like", "model" : "user", "isChild" : false}},
            {"firstName": {"attribute" : "firstName", "operator" : "like", "model" : "userProfile", "isChild" : true}},
            {"lastName": {"attribute" : "lastName", "operator" : "like", "model" : "userProfile", "isChild" : true}},
            {"email": {"attribute" : "email", "operator" : "like", "model" : "user", "isChild" : false}},
            {"departmentId": {"attribute" : "departmentId", "operator" : "equals", "model" : "userProfile", "isChild" : true}},
            {"active": {"attribute" : "active", "operator" : "equals", "model" : "user", "isChild" : false}},
            {"item_name": {"attribute" : "item_name", "operator" : "equals", "model" : "authAssignments", "isChild" : true}}
        ];

        _this.masterOptions = null;
        _this.packageOptions = null;
        _this.userTypeOptions = [
            {id:$rootScope.APPCONSTANT.USER.TYPE.ADMIN, "name":"text.admin"},
            {id:$rootScope.APPCONSTANT.USER.TYPE.MASTER, "name":"text.master"},
            {id:$rootScope.APPCONSTANT.USER.TYPE.AGENT, "name":"text.agent"},
            {id:$rootScope.APPCONSTANT.USER.TYPE.PLAYER, "name":"text.player"}
        ];
        _this.betMethodOptions = [{id:$rootScope.APPCONSTANT.USER.DETAIL.BET_METHOD.MULTIPLE, "name":"text.multiple"}, {id:$rootScope.APPCONSTANT.USER.DETAIL.BET_METHOD.DIVIDE, "name":"text.divide"}];
        _this.yesNoOptions = [{id:trueValue, "name":"text.yes"}, {id:falseValue, "name":"text.no"}];

        _this.viewUser = function (userId) {
            $state.go("root.main.userView",{"id":userId});
        };

        //Function to check if both password and confirmPassword field matched
        _this.checkPassword = function (password, confirmPassword) {
            if (password.$modelValue != confirmPassword.$modelValue) {
                confirmPassword.$setValidity('matching', false);
            } else {
                confirmPassword.$setValidity('matching', true);
            }
        };

        //Function to check if the specified username has been taken
        _this.checkUsername = function (usernameElement) {
            //Make sure the username is properly set
            if (_this.user.username) {
                $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user", {
                    params: {"where": {"username": _this.user.username}}
                }).then(function (response) {
                    if (response.data.items.length > 0) {
                        usernameElement.$setValidity('unique', false); //Set false - error
                    } else {
                        usernameElement.$setValidity('unique', true);
                        //Set true - no error
                    }
                }, function (response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    CommonService.SweetAlert({
                        title: "Failed",
                        text: "Count Fail.",
                        type: "warning"
                    });
                });
            }
        };

        _this.changeMaster = function() {
            if (_this.user.master) {
                _this.masterPrefix = _this.user.master.prefix;
            }
        };

        //Function to create the user
        //Bind in user_create.html
        _this.createUser = function (isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;
                _this.user.username = angular.lowercase(_this.user.username);
                var packageId = null, creditLimit = null, betMethod = null, betGdLotto = null, bet6d = null;
                var autoTransfer = null, autoTransferMode = null, autoTransferDays = {};

                if (_this.userType == $rootScope.APPCONSTANT.USER.TYPE.ADMIN) {
                    masterId = _this.user.master.id; //Creating Master User
                } else {
                    //Creating Agent/Player User
                    packageId = _this.user.package ? _this.user.package.id : null;
                    creditLimit = _this.user.creditLimit;
                    autoTransfer = _this.user.autoTransfer;
                    autoTransferMode = _this.user.autoTransferMode;
                    betMethod = _this.user.betMethod;
                    betGdLotto = _this.user.betGdLotto;
                    bet6d = _this.user.bet6d;
                }

                _this.saveObj = {
                    "username" : _this.user.username,
                    "name" : _this.user.name,
                    "password" : _this.user.password,
                    "confirmPassword" : _this.user.confirmPassword,
                    "mobileNo" : _this.user.mobileNo,
                    "active" : _this.user.active,
                    "packageId" : packageId,
                    "creditLimit" : creditLimit,
                    "autoTransfer" : autoTransfer,
                    "autoTransferMode" : autoTransferMode,
                    "autoTransferDays" : autoTransferDays,
                    "betMethod" : betMethod,
                    "betGdLotto" : betGdLotto,
                    "bet6d" : bet6d,
                    "masterId" : masterId
                };

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user", _this.saveObj).
                then(function (response) {
                    //Success Callback
                    var successMessage = "User " + _this.user.username + " Created.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.userListing",null);
                    _this.isSaving = false;
                }, function (response) {
                    //Error Callback
                    var failMessage = "Failed to create user " + _this.user.username;
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

        //Function to update the user
        //Bind in user_edit.html
        _this.updateUser = function (isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.saveObj = {
                    "name" : _this.user.name,
                    "mobileNo" : _this.user.mobileNo,
                    "active" : _this.user.active.id,
                    "packageId" : _this.user.package.id,
                    "betMethod" : _this.user.betMethod,
                    "betGdLotto" : _this.user.betGdLotto,
                    "bet6d" : _this.user.bet6d,
                    "creditLimit" : _this.user.creditLimit,
                    "extra4dCommRate" : _this.user.userDetail.extra4dCommRate,
                    "extra6dCommRate" : _this.user.userDetail.extra6dCommRate,
                    "extraGdCommRate" : _this.user.userDetail.extraGdCommRate
                };

                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/" + _this.user.id, _this.saveObj).
                then(function (response) {
                    //Success Callback
                    var successMessage = "User " + _this.user.name + " updated.";
                    var goToState = "root.main.userView";
                    if (stateName == "root.main.myAccountEdit") {
                        goToState = "root.main.myAccount";
                    }
                    CommonService.handleSuccessResponse(successMessage,goToState,{"id":response.data.id});
                    _this.isSaving = false;
                }, function (response) {
                    //Error Callback
                    var failMessage = "Failed to update user "+_this.user.username;
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

        //Function to change user password
        //Bind in user_edit.html
        _this.changeUserPassword = function (isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;
                var dataJsonParams = {};
                dataJsonParams.id = _this.user.id;
                if (stateName == "root.main.myAccountEdit") {
                    dataJsonParams.currentPassword = _this.user.currentPassword;
                }
                dataJsonParams.password = _this.user.password;
                dataJsonParams.confirmPassword = _this.user.confirmPassword;
                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/change-password", dataJsonParams).
                then(function (response) {
                    //Success callback
                    var successMessage = "User " + _this.user.username + "'s password updated.";
                    var goToState = "root.main.userView";
                    if (stateName == "root.main.myAccountEdit") {
                        goToState = "root.main.myAccount";
                    }
                    CommonService.handleSuccessResponse(successMessage,goToState,{"id":response.data.id});
                    _this.isSaving = false;
                }, function (response) {
                    //Error callback
                    var failMessage = "Failed to change user "+_this.user.username+"'s password.";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

        //Function to delete the user
        //Bind in user_view.html
        _this.deleteUser = function () {
            CommonService.SweetAlert({
                title: "Are you sure?",
                text: "You will not be able to recover the deleted user!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm"
            }).then(function(isConfirm) {
                if (isConfirm.value) {
                    _this.isSaving = true;
                    //  console.log(_this.user.id);
                    $http.delete($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/" + _this.user.id).then(function (response) {
                        var successMessage = "User " + _this.user.username + " has been deleted.";
                        CommonService.handleSuccessResponse(successMessage, "root.main.userListing", null)
                        _this.isSaving = false;
                    }, function (response) {
                        var failMessage = "Failed to delete user " + _this.user.username + ".";
                        CommonService.handleErrorResponse(failMessage, response);
                        _this.isSaving = false;
                    });
                }
            });
        };

        //To retrieve the listing of users
        //Bind in user_listing.html
        _this.userListing = function userListing(tableState) {
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
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user", {
                params: dataJsonParams
            }).then(function (response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.users = response.data.items;
                _this.tableData = _this.users;

                pagination.numberOfPages = Math.ceil(pagination.totalItemCount / _this.recordsPerPage);
                _this.isLoading = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve user listing.",
                    type: "error"
                });
                _this.isLoading = false;
            });
        };

        if (stateName == "root.main.userEdit" || stateName == "root.main.userView"
            || stateName == "root.main.myAccount" || stateName == "root.main.myAccountEdit") {
            var deferred = $q.defer();
            var promises = [];

            var currentUserPackageId = $rootScope.userIdentity.userDetail ? $rootScope.userIdentity.userDetail.packageId : null;
            if (currentUserPackageId) {
                var current4dAgentCommRate = 0;
                var current6dAgentCommRate = 0;
                var currentGdAgentCommRate = 0;
                promises.push(
                    $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/package/" + currentUserPackageId).
                    then(function (response) {
                        current4dAgentCommRate = response.data["4dAgentCommRate"];
                        current6dAgentCommRate = response.data["6dAgentCommRate"];
                        currentGdAgentCommRate = response.data["gdAgentCommRate"];
                    })
                )
            }

            $q.all(promises).then(function () {
                var userId = $stateParams.id;
                if (stateName == "root.main.myAccount" || stateName == "root.main.myAccountEdit") {
                    userId = $rootScope.userIdentity.id;
                }
                //Prevent user from viewing own user account via other states
                if (userId == $rootScope.userIdentity.id) {
                    if (stateName != "root.main.myAccount" && stateName != "root.main.myAccountEdit") {
                        CommonService.SweetAlert({
                            title: "Error",
                            text: "Failed to retrieve user details.",
                            type: "error"
                        });
                        return;
                    }
                }

                $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/" + userId+"?expand=userDetail.package").
                then(function (response) {
                    _this.user = response.data;

                    if (stateName == "root.main.userEdit" || stateName == "root.main.myAccountEdit") {
                        //Limit user to create certain type of users only
                        //Admin can create master
                        //Master can create agent
                        //Agent can create player
                        //Player cannot create any user
                        switch (_this.userType) {
                            case $rootScope.APPCONSTANT.USER.TYPE.ADMIN:
                                _this.canCreateUserType = $rootScope.APPCONSTANT.USER.TYPE.MASTER;
                                break;
                            case $rootScope.APPCONSTANT.USER.TYPE.MASTER:
                                _this.canCreateUserType = $rootScope.APPCONSTANT.USER.TYPE.AGENT;
                                CommonService.getPackages(masterId).then(function (result) {
                                    _this.packageOptions = result;
                                    for (var o in _this.packageOptions) {
                                        if (_this.user.userDetail.packageId == _this.packageOptions[o].id) {
                                            _this.user.package = _this.packageOptions[o];
                                        }
                                    }
                                });
                                _this.user.creditLimit = _this.user.userDetail.creditLimit;
                                _this.user.betMethod = _this.user.userDetail.betMethod;
                                _this.user.betGdLotto = _this.user.userDetail.betGdLotto;
                                _this.user.bet6d = _this.user.userDetail.bet6d;
                                break;
                            case $rootScope.APPCONSTANT.USER.TYPE.AGENT:
                                _this.canCreateUserType = $rootScope.APPCONSTANT.USER.TYPE.PLAYER;
                                CommonService.getPackages(masterId).then(function (result) {
                                    _this.packageOptions = result;
                                    for (var o in _this.packageOptions) {
                                        if (_this.user.userDetail.packageId == _this.packageOptions[o].id) {
                                            _this.user.package = _this.packageOptions[o];
                                        }
                                    }
                                });
                                _this.user.creditLimit = _this.user.userDetail.creditLimit;
                                _this.user.maxExtra4dCommRate = current4dAgentCommRate - _this.user.userDetail.package["4dPlayerCommRate"];
                                _this.user.maxExtra6dCommRate = current6dAgentCommRate - _this.user.userDetail.package["6dPlayerCommRate"];
                                _this.user.maxExtraGdCommRate = currentGdAgentCommRate - _this.user.userDetail.package["gdPlayerCommRate"];
                                _this.user.betMethod = _this.user.userDetail.betMethod;
                                _this.user.betGdLotto = _this.user.userDetail.betGdLotto;
                                _this.user.bet6d = _this.user.userDetail.bet6d;
                                _this.creditLimitAvailableToGrant = $rootScope.userIdentity.userDetail.creditLimitAvailableToGrant+_this.user.creditLimit;
                                break;
                            case $rootScope.APPCONSTANT.USER.TYPE.PLAYER:
                                _this.canCreateUserType = false;
                                break;
                        }

                        for (var u in _this.userTypeOptions){
                            if(_this.canCreateUserType == _this.userTypeOptions[u].id){
                                _this.user.userType = _this.userTypeOptions[u];
                                break;
                            }
                        }
                    }

                    $rootScope.pageTitle += " - " + _this.user.username;
                    $rootScope.bcText = _this.user.username;
                }, function (response) {
                    CommonService.SweetAlert({
                        title: "Error",
                        text: "Failed to retrieve user details.",
                        type: "error"
                    });
                })
            });
        } else if (stateName == "root.main.userCreate") {
            CommonService.getMasters(true).then(function (result) {
                _this.masterOptions = result;
            });

            _this.user = {};
            switch (_this.userType) {
                case $rootScope.APPCONSTANT.USER.TYPE.ADMIN:
                    _this.canCreateUserType = $rootScope.APPCONSTANT.USER.TYPE.MASTER;
                    break;
                case $rootScope.APPCONSTANT.USER.TYPE.MASTER:
                    _this.canCreateUserType = $rootScope.APPCONSTANT.USER.TYPE.AGENT;
                    CommonService.getPackages(masterId).then(function (result) {
                        _this.packageOptions = result;
                    });
                    break;
                case $rootScope.APPCONSTANT.USER.TYPE.AGENT:
                    _this.canCreateUserType = $rootScope.APPCONSTANT.USER.TYPE.PLAYER;
                    CommonService.getPackages(masterId).then(function (result) {
                        _this.packageOptions = result;
                    });
                    _this.creditLimitAvailableToGrant = $rootScope.userIdentity.userDetail.creditLimitAvailableToGrant;
                    break;
                case $rootScope.APPCONSTANT.USER.TYPE.PLAYER:
                    _this.canCreateUserType = false;
                    break;
            }

            for (var u in _this.userTypeOptions){
                if(_this.canCreateUserType == _this.userTypeOptions[u].id){
                    _this.user.userType = _this.userTypeOptions[u];
                    break;
                }
            }
        }
    }; // End var Ctrl

    app.controller('UserController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', '$q', Ctrl]);
}());
