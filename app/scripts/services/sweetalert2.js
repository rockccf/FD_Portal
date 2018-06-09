/**
 * underscore.js library
 */

'use strict';

var swal = angular.module('sweetalert2', []);
swal.factory('sweetalert2', ['$window', function($window) {
    return $window.sweetAlert;
}]);
