(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $state, $stateParams, $http, PrincipalService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false

        _this.auth = function(isValid) {
            _this.authMsg = null;
            // check to make sure the form is completely valid
            if (isValid) {
                _this.isSaving = true;
                //Proceed to login to see if the loginId and password are correct
                _this.login.userType = 1; //1 - Admin Portal ; 2 - Tenant Portal ; 3 - Supplier Portal
                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/user/login", _this.login).
                    then(function (response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        // HTTP status
                        // 200 OK
                        // 201 Created
                        // 400 Validation Error
                        if (response.status == 200) { //Login successfully
                            // here, we fake authenticating and give a fake user
                            PrincipalService.authenticate(response.data); //Set the identity object
                            if ($rootScope.returnToState) {
                                $state.go($rootScope.returnToState.name, $rootScope.returnToStateParams);
                            } else {
                                $state.go('root.main.home');
                            }
                        } else { //Login failed
                            PrincipalService.authenticate(null); //Set it to null
                            $state.go('root.login');
                        }
                        _this.isSaving = false;
                    }, function (response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        PrincipalService.authenticate(null); //Set it to null
                        if (response.status == 401) {
                            _this.authMsg = "main.login.invalidUserPass";
                        }
                        $state.go('root.login');
                        _this.isSaving = false;
                    });
            }
        };

        _this.resetPassword = function() {

        };

    }; // End var Ctrl

    app.controller('MainController', ['$rootScope', '$state', '$stateParams', '$http', 'PrincipalService', Ctrl]);
}());
