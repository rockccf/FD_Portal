(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false

        //Pagination Parameters
        _this.recordsPerPage = $rootScope.recordsPerPage; //Default to the setting in constant
        _this.currentPageNo = 1; //Default to first page
        _this.recordsToSkip = (_this.currentPageNo - 1) * _this.recordsPerPage;
        _this.roleOptions = [];
        _this.permissionOptions = [];

        _this.tableFilterColumns = [
            {"description": {"attribute" : "description", "operator" : "like", "model" : "auth_item", "isChild" : false}},
            {"remarks": {"attribute" : "remarks", "operator" : "like", "model" : "auth_item", "isChild" : false}}
        ];

        //Get available permissions
        _this.getPermissions = function getPermissions() {
            var dataJsonParams = {};
            var where = {};
            where.type = $rootScope.APPCONSTANT.AUTH_ITEM.TYPE.PERMISSION; //1 - Role ; 2 - Permission
            var sort = {
                "category":{"attribute": "category", "order": "SORT_ASC", "model": "authItem", "isChild": false},
                "description":{"attribute": "description","order": "SORT_ASC", "model": "authItem", "isChild": false}
            };
            dataJsonParams["where"] = where;
            dataJsonParams["sort"] = sort;
            dataJsonParams["pagination"] = [{"page":1,"per-page":$rootScope.maxRecordSize}]; //Getting all the records in 1 page

            return $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/auth-item", {
                params: dataJsonParams
            }).then (function(response){
                _this.permissions = response.data.items;
                _this.permissionCategories = [];
                for (var i in _this.permissions) {
                    var categoryExists = false;
                    for (var k = 0; k < _this.permissionCategories.length; k++) {
                        if (_this.permissionCategories[k].id == _this.permissions[i].category) {
                            categoryExists = true;
                            break;
                        }
                    }

                    if (!categoryExists) {
                        var categoryObj = {};
                        categoryObj.id = _this.permissions[i].category;
                        categoryObj.translationId = 'permission.category.'+_this.permissions[i].category;
                        _this.permissionCategories.push(categoryObj);
                    }

                    _this.permissionOptions.push({"id":_this.permissions[i].name, "name":_this.permissions[i].description, "category":_this.permissions[i].category});
                }
                },  function(response){
                    CommonService.SweetAlert({
                        title: "Failed",
                        text: "Permission List Fail",
                        type: "warning"
                    });
                }
            );
        };

        //toggling the permissions list checkboxes
        _this.toggleSelection = function toggleSelection() {
            for(var i in _this.role.permissions.selected) {
                if(_this.role.permissions.selected.hasOwnProperty(i)) {
                    if(_this.role.permissions.selected[i] === "") {
                        delete _this.role.permissions.selected[i];
                    }
                }
            }
        };

        //to set the form element got touched
        _this.doTouched = function doTouched(form){
            form.permissionsList.$setTouched();
        };

        //function to set ng-required to true if the related element value empty
        _this.setRequired = function setRequired(){
            var result = true; //true is required, meaning there's not even one checkbox checked.
            if (_this.role && _this.role.permissions && _this.role.permissions.selected != null) {
                result = (Object.keys(_this.role.permissions.selected).length == 0);
            }

            return result;
        };

        //function to create the role & bind in role_create.html
        _this.createRole = function createRole(isValid){
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.tempPermissions = [];

                for(var i in _this.role.permissions.selected){
                    _this.tempPermissions.push(_this.role.permissions.selected[i]);
                }

                _this.saveObj = {
                    "name" : _this.role.name,
                    "remarks" : _this.role.remarks,
                    "permissions" : _this.tempPermissions,
                    "type" : $rootScope.APPCONSTANT.AUTH_ITEM.TYPE.ROLE
                };

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/auth-item",_this.saveObj).
                then (function(response){
                    var successMessage = "Role "+_this.role.name+" created.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.roleView",{"id":response.data.id});
                    _this.isSaving = false;
                }, function(response){
                    var failMessage = "Failed to create role "+_this.role.name+".";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                })
            }
        };

        //function to update role & bind in role_edit.html
        _this.updateRole = function updateRole(isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                _this.tempPermissions = [];

                for(var i in _this.role.permissions.selected){
                    _this.tempPermissions.push(_this.role.permissions.selected[i]);
                }

                _this.saveObj = {
                    "oldName" : _this.role.oldName,
                    "name" : _this.role.description,
                    "remarks" : _this.role.remarks,
                    "permissions" : _this.tempPermissions,
                    "type" : $rootScope.APPCONSTANT.AUTH_ITEM.TYPE.ROLE
                };

                $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL+"/auth-item/update",_this.saveObj).
                then(function(response) {
                    var successMessage = "Role "+_this.role.name+" Updated.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.roleView",{"id":response.data.id});
                    _this.isSaving = false;
                }, function(response) {
                    var failMessage = "Failed to update role "+_this.role.name+".";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

        //function to delete the role
        //bind in role_view.html
        _this.deleteRole = function() {
            CommonService.SweetAlert({
                title: "Are you sure?",
                text: "You will not be able to recover the deleted role!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm"
            }).then(function(isConfirm) {
                if (isConfirm.value) {
                    _this.isSaving = true
                    $http.delete($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/auth-item/" + _this.role.id, {params:{"type":$rootScope.APPCONSTANT.AUTH_ITEM.TYPE.ROLE}}).
                    then(function (response) {
                        var successMessage = "Role " + _this.role.description + " has been deleted.";
                        CommonService.handleSuccessResponse(successMessage,"root.main.roleListing",null);
                        _this.isSaving = false;
                    }, function (response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        var failMessage = "Failed to delete role "+_this.role.description+".";
                        CommonService.handleErrorResponse(failMessage,response);
                        _this.isSaving = false;
                    });
                }
            });
        };

        //To retrieve the listing of roles
        //Bind in role_listing.html
        _this.roleListing = function roleListing(tableState) {
            var pagination = tableState.pagination;
            var search = tableState.search;
            var sort = tableState.sort;

            _this.isLoading = true;

            //pagination.start || 0;    // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            //pagination.number || 10;  // Number of entries showed per page.

            _this.recordsPerPage = pagination.number || $rootScope.recordsPerPage;
            _this.recordsToSkip = pagination.start || 0;
            _this.currentPageNo = Math.floor(pagination.start / pagination.number) + 1;

            var where = {};
            where.type = 1; //1 - Role ; 2 - Permission
            var dataJsonParams = CommonService.getRequestParamsObj(where, search, sort, _this.tableFilterColumns, _this.currentPageNo, _this.recordsPerPage);

            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/auth-item", {
                params: dataJsonParams
            }).then(function (response) {
                pagination.totalItemCount = response.data._meta.totalCount;

                // this callback will be called asynchronously
                // when the response is available
                _this.roles = response.data.items;
                _this.tableData = _this.roles;

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
                    title: "Failed",
                    text: "Failed to retrieve role listing.",
                    type: "error"
                });
                _this.isLoading = false;
            });
        };

        if (stateName == "root.main.roleEdit" || stateName == "root.main.roleView") {
            _this.getPermissions().then(function () {
                $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/auth-item/"+$stateParams.id,
                    {params:{"type":$rootScope.APPCONSTANT.AUTH_ITEM.TYPE.ROLE}})
                    .then(function (response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        _this.role = response.data;

                        _this.oldPermissions = [];
                        _this.role.permissions.selected = [];
                        _this.role.name = _this.role.description;
                        _this.role.oldName = _this.role.description;

                        // get previous selected features
                        angular.forEach(_this.role.permissions, function(value, key) {
                            _this.oldPermissions.push(value.name);
                        });

                        for (var x in _this.permissionOptions){
                            for (var z in _this.oldPermissions){
                                if(_this.oldPermissions[z] == _this.permissionOptions[x].id){
                                    _this.role.permissions.selected[x] = _this.permissionOptions[x].id;
                                }
                            }
                        }
                    }, function (response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        CommonService.SweetAlert({
                            title: "Error",
                            text: "Failed to retrieve role details.",
                            type: "error"
                        });
                    });
            });
        } else if (stateName == "root.main.roleCreate") {
            _this.getPermissions();
        }
    }; // End var Ctrl

    app.controller('RoleController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', Ctrl]);
}());
