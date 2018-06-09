'use strict';

/**
 * @ngdoc overview
 * @name fdPortal
 * @description
 * # fdPortal
 *
 * Main module of the application.
 */

var app = angular.module('fdPortal', [
    /*
     'ngAnimate', //Available in Angle
     'ngCookies', //Available in Angle
     'ngResource', //Available in Angle
     'ui.router', //Available in Angle
     'ngSanitize', //Available in Angle
     'ngStorage', //Available in Angle
     */
    //Inject the entire Angle framework
    'angle',
    'ngFileUpload',
    'ngTouch',
    'ngMessages',
    'ncy-angular-breadcrumb',
    'akoenig.deckgrid',
    'smart-table',
    'ui.select',
    'textAngular',
    'duScroll',
    'underscore',
    'sweetalert2'
]);

// register the interceptor as a service
app.factory('myHttpInterceptor', function($q, $window, $injector, SYSCONSTANT) {
    return {
        'request': function (config) {
            if (config.url.indexOf(SYSCONSTANT.BACKEND_SERVER_URL) > -1) {
                config.headers = config.headers || {};
                //config.headers['language'] = 'EN';
                //config.headers['currency'] = 'MYR';
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }
            }
            return config;
        },
        response: function(response){
            if (response.status === 401) {
                //var stateService = $injector.get('$state');
                //stateService.go('root.login');
            }
            return response || $q.when(response);
        },
        'responseError': function (response) {
            if (response.status === 401 || response.status === 403) {
                //var stateService = $injector.get('$state');
                //stateService.go('root.login');
            }
            return $q.reject(response);
        }
    };
});

app.factory('sharedService', function() {
    var locationObj = {
        lat: "",
        lng: ""
    };
    return {
        getValue: function() {
            return locationObj;
        },

        setValue: function(lat,lng) {
            locationObj.lat = lat;
            locationObj.lng = lng;
        }
    };
});

//Smart Table
app.config(function (stConfig) {
    //Make the pipe delay longer than the sort so it wont be called twice with st-sort-default enabled
    stConfig.pipe.delay = 500; //Default 100ms
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('myHttpInterceptor');
    //By default, http response is not cached. Set it to false just to make sure that the caching is disabled.
    $httpProvider.defaults.cache = false;
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
});

/*app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBJ3lDruK4ERYtXqaWGLYOChTRVnJUltYU',
        v: '3.20', //defaults to latest D3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});*/

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RouteHelpersProvider', function($stateProvider, $urlRouterProvider, $locationProvider, helper) {

    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise("/home");

    // Now set up the states
    $stateProvider
        .state('root', {
            abstract: true,
            template: '<ui-view/>',
            resolve:
                angular.extend(helper.resolveFor('icons','spinkit','loaders.css','directives','main','filestyle'), //Always resolve for icons (font awesome and simple line)
                    {
                        authorize: ['AuthService',
                            function(AuthService) {
                                return AuthService.authorize();
                            }
                        ]
                    }
                )
        })
        .state('root.login', {
            url: "/login",
            title: "title.login",
            data: {
                permissions: []
            },
            templateUrl: 'views/login.html',
            controller: 'MainController',
            controllerAs: 'main'
        })
        .state('root.accessDenied', {
            url: "/accessDenied",
            title: "title.accessDenied",
            data: {
                permissions: []
            },
            templateUrl: "views/access_denied.html",
            controller: "MainController",
            controllerAs: 'main'
        })
        .state('root.forgotPassword', {
            url: "/forgotPassword",
            title: "title.forgotPassword",
            data: {
                permissions: []
            },
            templateUrl: "views/forgot_password.html",
            controller: "MainController",
            controllerAs: 'main'
        })
        .state('root.main', {
            abstract: true,
            data: {
                permissions: []
            },
            views:{
                "@":{
                    templateUrl: 'views/main.html'
                }
            },
            resolve: helper.resolveFor('home')
        })
        .state('root.main.home', { //Default Home Page
            url: "/home",
            title: 'title.home',
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.home' // angular-breadcrumb's configuration
            },
            templateUrl: 'views/home.html',
            resolve: helper.resolveFor('dashboard'),
            controller: 'DashboardController',
            controllerAs: 'dashboard'
        })
        .state('root.main.profileView', {
            url: "/profileView",
            title: "title.profileView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.profileView'
            },
            templateUrl: "views/profile_view.html",
            resolve: helper.resolveFor('profile'),
            controller: "ProfileController",
            controllerAs: 'profile'
        })
        .state('root.main.profileEdit', {
            url: "/profileEdit",
            title: "title.profileEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.profileEdit'
            },
            templateUrl: "views/profile_edit.html",
            resolve: helper.resolveFor('profile'),
            controller: "ProfileController",
            controllerAs: 'profile'
        })
        .state('root.main.userCreate', {
            url: "/userCreate/:hotelId",
            title: "title.userCreate",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.userCreate","translate":"user.menu.userCreate"},
                    {"class":"btn-info","active":false,"state":"root.main.userListing","translate":"user.menu.userListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'bcLabel.userCreate'
            },
            templateUrl: "views/user_create.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.userListing', {
            url: "/userListing",
            title: "title.userListing",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.userCreate","translate":"user.menu.userCreate"},
                    {"class":"btn-info","active":true,"state":"root.main.userListing","translate":"user.menu.userListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'bcLabel.userListing'
            },
            templateUrl: "views/user_listing.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.userEdit', {
            url: "/userEdit/:id",
            title: "title.userEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.userEdit',
                parent: 'root.main.userListing'
            },
            templateUrl: "views/user_edit.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.userView', {
            url: "/userView/:id",
            title: "title.userView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.userView',
                parent: 'root.main.userListing'
            },
            templateUrl: "views/user_view.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.roleCreate', {
            url: "/roleCreate",
            title: "title.roleCreate",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.roleCreate","translate":"role.menu.roleCreate"},
                    {"class":"btn-info","active":false,"state":"root.main.roleListing","translate":"role.menu.roleListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'bcLabel.roleCreate'
            },
            templateUrl: "views/role_create.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.roleListing', {
            url: "/roleListing",
            title: "title.roleListing",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.roleCreate","translate":"role.menu.roleCreate"},
                    {"class":"btn-info","active":true,"state":"root.main.roleListing","translate":"role.menu.roleListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'bcLabel.roleListing'
            },
            templateUrl: "views/role_listing.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.roleEdit', {
            url: "/roleEdit/:id",
            title: "title.roleEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.roleEdit',
                parent: 'root.main.roleListing'
            },
            templateUrl: "views/role_edit.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.roleView', {
            url: "/roleView/:id",
            title: "title.roleView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.roleView',
                parent: 'root.main.roleListing'
            },
            templateUrl: "views/role_view.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.report', {
            url: "/report",
            title: "title.report",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'bcLabel.report'
            },
            templateUrl: "views/report.html",
            resolve: helper.resolveFor('report'),
            controller: "ReportController",
            controllerAs: 'report'
        });

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

}]);

app.config(function($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
        prefixStateName: 'root.main.home',
        templateUrl: 'views/common/breadcrumb.html'
    });
});

app.run(['$rootScope', '$state', '$stateParams', '$translate', 'AuthService', 'PrincipalService', 'CommonService', 'SYSCONSTANT', 'APPCONSTANT', '$cacheFactory',
    function($rootScope, $state, $stateParams, $translate, AuthService, PrincipalService, CommonService, SYSCONSTANT, APPCONSTANT, $cacheFactory) {
        //Pagination Global Settings
        $rootScope.recordsPerPage = APPCONSTANT.GLOBAL.PAGING.RECORDS_PER_PAGE;
        $rootScope.maxPageSize = APPCONSTANT.GLOBAL.PAGING.MAX_PAGE_SIZE;
        $rootScope.pagingButtons = APPCONSTANT.GLOBAL.PAGING.PAGING_BUTTONS;
        $rootScope.maxRecordSize = APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE;
        $rootScope.profilePicture = '/assets/images/user.png';

        $rootScope.SYSCONSTANT = SYSCONSTANT;
        $rootScope.APPCONSTANT = APPCONSTANT;
        $rootScope.globalLabelOptions = [
            {"id":0, "name":"global.label.no"},
            {"id":1, "name":"global.label.yes"}
        ];
        $rootScope.backendImageURL = SYSCONSTANT.BACKEND_SERVER_URL+"/image";

        //Global Alert Messages
        $rootScope.alertMessages = []; //Initialize an empty array
        $rootScope.closeAlertMessage = function(index) {
            $rootScope.alertMessages.splice(index, 1);
        };

        $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams, fromState, fromParams, options) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;
            $rootScope.bcText = null; //Clean the dynamic breadcrumb text
            $rootScope.alertMessages = []; //Clear the alert messages

            if (PrincipalService.isIdentityResolved())  {
                AuthService.authorize();
            }
        });
        $rootScope.$on('$stateChangeSuccess', function(/*event, toState, toParams, fromState, fromParams*/) {
            // display new view from top
            //$window.scrollTo(0, 0);
            // Save the route title
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            //alert($state.current.data.bcText);

            $rootScope.currTitle = $state.current.title;
            var title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);

            $translate($state.current.title).then(function(value) {
                $rootScope.currTitle = value;
                title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
                $rootScope.pageTitle = title;
            }, function() {
                $rootScope.pageTitle = title;
            });
        });

        $rootScope.currTitle = $state.current.title;
        var title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
        $rootScope.pageTitle = title;
    }
]);
