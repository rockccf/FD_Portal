/**
 * Created by james.lim on 5/31/2016.
 */
/**
 * Created by james.lim on 5/27/2016.
 */
/**
 * Common Service
 * Consists of common methods to be shared by controllers
 */

'use strict';

var app = angular.module('fdPortal');
app.factory('GMapService', ['$state', '$rootScope', '$translate', '$http', '$timeout', 'SYSCONSTANT', 'APPCONSTANT', '$window',
    'uiGmapGoogleMapApi', 'uiGmapIsReady', '$q',
    function ($state, $rootScope, $translate, $http, $timeout, SYSCONSTANT, APPCONSTANT, $window, uiGmapGoogleMapApi, uiGmapIsReady, $q) {

        var GMapService = {};
        var _this = GMapService;

        //Initialize Local Variables
        var map = null;
        var uuid = null;
        var mapInstanceNumber = null;

        GMapService.mapOptions = {
            center: {latitude: 0, longitude: 0 },
            zoom: 16, //Default zoom level
            options : {
                //disableDefaultUI : false, //True : disable the default map controls;
                mapTypeControl : false,
                streetViewControl:false,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT
                }
            },
            refresh: false
        };

        // uiGmapGoogleMapApi is a promise.
        // The "then" callback function provides the google.maps object.
        uiGmapGoogleMapApi.then(function(maps) {
            //console.log("uiGmapGoogleMapApi");
        });

        GMapService.initMap = function(mapInstance) {
            var deferred = $q.defer();
            uiGmapIsReady.promise(1).then(function(instances) {
                instances.forEach(function(inst) {
                    map = inst.map;
                    uuid = map.uiGmap_id;
                    mapInstanceNumber = inst.instance; // Starts at 1.
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(new google.maps.LatLng(GMapService.mapOptions.center.latitude, GMapService.mapOptions.center.longitude));
                    //console.log("mapInstanceNumber = "+mapInstanceNumber);
                    //console.log("uuid = "+uuid);
                });
                deferred.resolve(map);
            });
            return deferred.promise;
        };

        return GMapService;
    }]);
