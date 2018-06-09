(function () {

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService, $q) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        var trueValue = $rootScope.APPCONSTANT.GLOBAL.TRUE;
        var falseValue = $rootScope.APPCONSTANT.GLOBAL.FALSE;
        _this.isSaving = false; //Default to false
        var tenantId = $rootScope.userIdentity.tenantId;

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

        _this.roleFilters = [{id: "", name: "global.label.all"}]; //declare role filters array
        _this.roleOptions = []; //declare role options array
        _this.departmentFilters = [{id: "", name: "global.label.all"}]; //declare department filters array
        _this.departmentOptions = []; //declare department options array
        _this.activeFilters = [{id: "", name: "global.label.all"}, {id: trueValue, name: "global.label.yes"}, {id: falseValue, name: "global.label.no"}];
        _this.activeOptions = [{id:trueValue, "name":"global.label.yes"}, {id:falseValue, "name":"global.label.no"}];

        _this.getRoles = function() {
            //get User Role Data
            var dataJsonParams = {"where":{"type":$rootScope.APPCONSTANT.AUTH_ITEM.TYPE.ROLE}}
            dataJsonParams["pagination"] = {"page":1,"per-page":$rootScope.APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            return $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/auth-item",{
                params: dataJsonParams
            }).then(function (response) {
                    _this.roles = response.data.items;

                    //set user role options
                    angular.forEach(_this.roles, function (value, key) {
                        _this.roleFilters.push({"id": value.name, "name": value.description});
                        _this.roleOptions.push({"id": value.name, "name": value.description});
                    });
                }, function (response) {
                    CommonService.SweetAlert({
                        title: "Failed",
                        text: "Role List Fail",
                        type: "warning"
                    });
                }
            );
        };

        _this.getDepartments = function (active) {
            var dataJsonParams = {};
            if (active != null) {
                dataJsonParams = {"where":{"active":active}};
            }
            dataJsonParams["pagination"] = {"page":1,"per-page":$rootScope.APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            //get User Department Data
            return $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/department",{
                params: dataJsonParams
            }).then(function (response) {
                    _this.departments = response.data.items;

                    //set user department options
                    angular.forEach(_this.departments, function (value, key) {
                        _this.departmentFilters.push({"id": value.id, "name": value.name});
                        _this.departmentOptions.push({"id": value.id, "name": value.name});
                    });
                }, function (response) {
                    CommonService.SweetAlert({
                        title: "Failed",
                        text: "Department List Fail",
                        type: "warning"
                    });
                }
            );
        };

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

        _this.checkProfileUpload = function(boxElement){
            _this.showProfileUploadBoxFlag = !jQuery.isEmptyObject(boxElement.$error);
            _this.profileImageDirtyFlag = true;
        };

        //Delete Profile Image
        //Bind in profile_edit.html
        _this.deleteProfileImage = function() {
            CommonService.SweetAlert({
                title: "Are you sure?",
                //text: "You will not be able to recover the image file once you hit the update button.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm",
            }).then(function (isConfirm) {
                if (isConfirm.value) {
                    _this.profileImageDirtyFlag = true;
                    _this.user.userProfile.profileImageFile = null;
                    _this.showProfileUploadBoxFlag = true;
                    $scope.$apply();
                }
            });
        };

        //Function to create the user
        //Bind in user_create.html
        _this.createUser = function (isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;
                _this.user.username = angular.lowercase(_this.user.username);

                _this.saveObj = {
                    "username" : _this.user.username,
                    "firstName" : _this.user.firstName,
                    "lastName" : _this.user.lastName,
                    "email" : _this.user.email,
                    "password" : _this.user.password,
                    "confirmPassword" : _this.user.confirmPassword,
                    "active" : _this.user.active,
                    "role" : _this.user.role,
                    "jobTitle" : _this.user.jobTitle,
                    "departmentId" : _this.user.department,
                    "userType" : $rootScope.APPCONSTANT.USER.TYPE.TENANT
                };

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user", _this.saveObj).
                then(function (response) {
                    //Success Callback
                    if (_this.profileImageDirtyFlag) { //Logo image touched
                        //Insert the new logo image
                        CommonService.uploadImage(_this.user.userProfile.profileImageFile,'User Profile Image',null,$rootScope.APPCONSTANT.IMAGE.TYPE.PRIMARY,1,$rootScope.APPCONSTANT.IMAGE.OWNER_TYPE.TENANT_USER,_this.user.id)
                            .progress(function (evt) {
                                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                //New logo uploaded
                            })
                            .error(function (data, status, headers, config) {

                            });
                    }

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
                    "firstName" : _this.user.userProfile.firstName,
                    "lastName" : _this.user.userProfile.lastName,
                    "email" : _this.user.email,
                    "active" : _this.user.active.id,
                    "jobTitle" : _this.user.userProfile.jobTitle,
                    "role" : _this.user.role.id,
                    "departmentId" : _this.user.department.id,
                    "userType" : $rootScope.APPCONSTANT.USER.TYPE.TENANT
                };

                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/" + _this.user.id, _this.saveObj).
                then(function (response) {
                    //Success Callback
                    //Success Callback
                    if (_this.profileImageDirtyFlag) { //Logo image touched
                        //Insert the new logo image
                        CommonService.uploadImage(_this.user.userProfile.profileImageFile,'User Profile Image',null,$rootScope.APPCONSTANT.IMAGE.TYPE.PRIMARY,1,$rootScope.APPCONSTANT.IMAGE.OWNER_TYPE.TENANT_USER,_this.user.id)
                            .progress(function (evt) {
                                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                //New logo uploaded
                                if (_this.oldProfileImageExists) { //Old image exists, proceed to delete
                                    $http.delete($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/image/" +  _this.user.userProfile.profileImage.id)
                                        .then(function (response) {
                                            //Success callback
                                            _this.isSaving = false;
                                        }, function (response) {
                                            //Error callback
                                            _this.isSaving = false;
                                        });
                                }
                            })
                            .error(function (data, status, headers, config) {

                            });
                    }
                    var successMessage = "User " + _this.user.username + " updated.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.userView",{"id":response.data.id});
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
                dataJsonParams.password = _this.user.password;
                dataJsonParams.confirmPassword = _this.user.confirmPassword;
                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/change-password", dataJsonParams).
                then(function (response) {
                    //Success callback
                    var successMessage = "User " + _this.user.username + "'s password updated.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.userView",{"id":response.data.id});
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

                //change status from boolean to text
                angular.forEach(_this.tableData, function (value, key) {
                    if (value.active == true) {
                        value.active = "Yes";
                    } else if (value.active == false) {
                        value.active = "No";
                    }
                });

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

        if (stateName == "root.main.userEdit" || stateName == "root.main.userView") {
            _this.profileImageDirtyFlag = false;

            var deferred = $q.defer();
            var promises = [];
            promises.push(_this.getRoles());
            promises.push(_this.getDepartments());
            $q.all(promises).then(function () {
                $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/" + $stateParams.id).
                then(function (response) {
                    _this.user = response.data;

                    if (_this.user.userProfile.profileImage) {
                        _this.oldProfileImageExists = true;
                        _this.showProfileUploadBoxFlag = false;
                    } else {
                        _this.showProfileUploadBoxFlag = true;
                    }

                    for (var o in _this.activeOptions){
                        if(_this.user.active == _this.activeOptions[o].id){
                            _this.user.active = _this.activeOptions[o];
                        }
                    }

                    for (var r in _this.roleOptions){
                        if(_this.user.roles[0].name == _this.roleOptions[r].id) {
                            _this.user.role = _this.roleOptions[r];
                            break;
                        }
                    }

                    for (var d in _this.departmentOptions){
                        if(_this.user.department.id == _this.departmentOptions[d].id) {
                            _this.user.department = _this.departmentOptions[d];
                            break;
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
        } else if (stateName == "root.main.userCreate" || stateName == "root.main.userListing") {
            _this.getRoles();
            _this.getDepartments(true);
        }
    }; // End var Ctrl

    app.controller('UserController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', '$q', Ctrl]);
}());
