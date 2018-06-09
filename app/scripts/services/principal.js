/**
 * Principal Service
 * A service that tracks the user's identity.
 * Calling identity() returns a promise while it does what you need it to do to look up the signed-in user's identity info.
 * For example, it could make an HTTP request to a rest endpoint which returns the user's name, roles, etc.
 * After validating an auth token in a cookie. it will only do this identity lookup once, when the application first runs.
 * You can force re-request it by calling identity(true)
 */

'use strict';

var app = angular.module('fdPortal');
app.factory('PrincipalService', ['$rootScope', '$q', '$http', '$timeout', 'SYSCONSTANT', function ($rootScope, $q, $http, $timeout, SYSCONSTANT) {

    var _identity = undefined,
        _authenticated = false;

    return {
        isIdentityResolved: function () {
            return angular.isDefined(_identity);
        },
        isAuthenticated: function () {
            return _authenticated;
        },
        hasPermission: function (permission) {
            if (!_authenticated || !_identity.permissions) return false;
            return (_identity.permissions).indexOf(permission) != -1;
        },
        checkPermission: function (permissions) {
            if (!_authenticated || !_identity.permissions) return false;

            for (var i = 0; i < permissions.length; i++) {
                if (this.hasPermission(permissions[i])) return true;
            }

            return false;
        },
        getIdentity: function () {
            return _identity;
        },
        authenticate: function (identity) {
            _identity = identity;
            _authenticated = identity != null;

            // for this demo, we'll store the identity in localStorage. For you, it could be a cookie, sessionStorage, whatever
            if (identity) {
                sessionStorage.setItem("fdPortal.identity", angular.toJson(identity));
                sessionStorage.token = identity.jwt;
            } else {
                sessionStorage.removeItem("fdPortal.identity");
            }
        },
        identity: function (force) {
            var deferred = $q.defer();

            if (force === true) _identity = undefined;

            // check and see if we have retrieved the identity data from the server. if we have, reuse it by immediately resolving
            if (angular.isDefined(_identity)) {
                deferred.resolve(_identity);

                return deferred.promise;
            } /*else {
                //otherwise, retrieve the identity data from the server, update the identity object, and then resolve.
                $http.get('/svc/account/identity', { ignoreErrors: true })
                    .success(function(data) {
                        _identity = data;
                        _authenticated = true;
                        deferred.resolve(_identity);
                    })
                    .error(function () {
                        _identity = null;
                        _authenticated = false;
                        deferred.resolve(_identity);
                    });
            }*/

            // for the sake of the demo, we'll attempt to read the identity from localStorage. the example above might be a way if you use cookies or need to retrieve the latest identity from an api
            // i put it in a timeout to illustrate deferred resolution
            var self = this;
            $timeout(function () {
                _identity = angular.fromJson(sessionStorage.getItem("fdPortal.identity"));
                self.authenticate(_identity);
                deferred.resolve(_identity);
            }, 1000);

            return deferred.promise;
        }
    };

}]);
