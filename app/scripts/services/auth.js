/**
 * Auth Service
 * Auth service's purpose is to wrap up authorize functionality
 * it basically just checks to see if the principal is authenticated and checks the root state
 * to see if there is a state that needs to be authorized. if so, it does a role check.
 * this is used by the state resolver to make sure when you refresh, hard navigate, or drop onto a
 * route, the app resolves your identity before it does an authorize check. after that,
 * authorize is called from $stateChangeStart to make sure the principal is allowed to change to
 */

'use strict';

var app = angular.module('fdPortal');
app.factory('AuthService', ['$rootScope', '$state', 'PrincipalService', function($rootScope, $state, PrincipalService) {
    return {
        authorize: function() {
            return PrincipalService.identity()
                .then(function() {
                    var isAuthenticated = PrincipalService.isAuthenticated();

                    if (isAuthenticated) {
                        //Set the global hotelUser object returned by the server
                        $rootScope.userIdentity = PrincipalService.getIdentity();
                        var permissions = [];
                        angular.forEach($rootScope.userIdentity.permissions, function (value,key) {
                            permissions.push(value.name);
                        });
                        $rootScope.permissions = permissions;
                    }

                    var nonLoginState = ["root.login","root.forgotPassword","root.passwordResetVerify"];

                    //If it's not logged in and the user is trying to go pages other than login
                    if (!isAuthenticated && nonLoginState.indexOf($rootScope.toState.name) < 0) {
                        // user is not authenticated. stow the state they wanted before you
                        // send them to the signin state, so you can return them when you're done
                        $rootScope.returnToState = $rootScope.toState;
                        $rootScope.returnToStateParams = $rootScope.toStateParams;

                        // now, send them to the signin state so they can log in
                        $state.go('root.login');
                    } else if (isAuthenticated && $rootScope.toState.name == "root.login") {
                        $state.go('root.main.home');
                    }

                    if ($rootScope.toState.data.permissions && $rootScope.toState.data.permissions.length > 0 && !PrincipalService.checkPermission($rootScope.toState.data.permissions))
                    {
                        if (isAuthenticated) {
                            $state.go('root.main.accessDenied'); // user is signed in but not authorized for desired state
                        } else {
                            // user is not authenticated. stow the state they wanted before you
                            // send them to the signin state, so you can return them when you're done
                            $rootScope.returnToState = $rootScope.toState;
                            $rootScope.returnToStateParams = $rootScope.toStateParams;

                            // now, send them to the signin state so they can log in
                            $state.go('root.login');
                        }
                    }
                });
        }
    };
}]);
