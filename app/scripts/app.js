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
    'sweetalert2',
    'multipleDatePicker',
    'angular-clipboard'
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
            title: "text.login",
            data: {
                permissions: []
            },
            templateUrl: 'views/login.html',
            controller: 'MainController',
            controllerAs: 'main'
        })
        .state('root.accessDenied', {
            url: "/accessDenied",
            title: "text.accessDenied",
            data: {
                permissions: []
            },
            templateUrl: "views/access_denied.html",
            controller: "MainController",
            controllerAs: 'main'
        })
        .state('root.forgotPassword', {
            url: "/forgotPassword",
            title: "text.forgotPassword",
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
            title: 'text.home',
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.home' // angular-breadcrumb's configuration
            },
            templateUrl: 'views/home.html',
            resolve: helper.resolveFor('dashboard'),
            controller: 'DashboardController',
            controllerAs: 'dashboard'
        })
        .state('root.main.myAccount', {
            url: "/myAccount",
            title: "text.myAccount",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.myAccount'
            },
            templateUrl: "views/user_view.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.myAccountEdit', {
            url: "/myAccountEdit",
            title: "text.myAccountEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.myAccountEdit'
            },
            templateUrl: "views/user_edit.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.userCreate', {
            url: "/userCreate/:hotelId",
            title: "text.userCreate",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.userCreate","translate":"text.userCreate"},
                    {"class":"btn-info","active":false,"state":"root.main.userListing","translate":"text.userListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.userCreate'
            },
            templateUrl: "views/user_create.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.userListing', {
            url: "/userListing",
            title: "text.userListing",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.userCreate","translate":"text.userCreate"},
                    {"class":"btn-info","active":true,"state":"root.main.userListing","translate":"text.userListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.userListing'
            },
            templateUrl: "views/user_listing.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.userEdit', {
            url: "/userEdit/:id",
            title: "text.userEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.userEdit',
                parent: 'root.main.userListing'
            },
            templateUrl: "views/user_edit.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.userView', {
            url: "/userView/:id",
            title: "text.userView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.userView',
                parent: 'root.main.userListing'
            },
            templateUrl: "views/user_view.html",
            resolve: helper.resolveFor('user'),
            controller: "UserController",
            controllerAs: 'user'
        })
        .state('root.main.roleCreate', {
            url: "/roleCreate",
            title: "text.roleCreate",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.roleCreate","translate":"role.menu.roleCreate"},
                    {"class":"btn-info","active":false,"state":"root.main.roleListing","translate":"role.menu.roleListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.roleCreate'
            },
            templateUrl: "views/role_create.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.roleListing', {
            url: "/roleListing",
            title: "text.roleListing",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.roleCreate","translate":"role.menu.roleCreate"},
                    {"class":"btn-info","active":true,"state":"root.main.roleListing","translate":"role.menu.roleListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.roleListing'
            },
            templateUrl: "views/role_listing.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.roleEdit', {
            url: "/roleEdit/:id",
            title: "text.roleEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.roleEdit',
                parent: 'root.main.roleListing'
            },
            templateUrl: "views/role_edit.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.roleView', {
            url: "/roleView/:id",
            title: "text.roleView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.roleView',
                parent: 'root.main.roleListing'
            },
            templateUrl: "views/role_view.html",
            resolve: helper.resolveFor('role'),
            controller: "RoleController",
            controllerAs: 'role'
        })
        .state('root.main.masterCreate', {
            url: "/masterCreate",
            title: "text.masterCreate",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.masterCreate","translate":"text.masterCreate"},
                    {"class":"btn-info","active":false,"state":"root.main.masterListing","translate":"text.masterListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.masterCreate'
            },
            templateUrl: "views/master_create.html",
            resolve: helper.resolveFor('master'),
            controller: "MasterController",
            controllerAs: 'master'
        })
        .state('root.main.masterListing', {
            url: "/masterListing",
            title: "text.masterListing",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.masterCreate","translate":"text.masterCreate"},
                    {"class":"btn-info","active":true,"state":"root.main.masterListing","translate":"text.masterListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.masterListing'
            },
            templateUrl: "views/master_listing.html",
            resolve: helper.resolveFor('master'),
            controller: "MasterController",
            controllerAs: 'master'
        })
        .state('root.main.masterEdit', {
            url: "/masterEdit/:id",
            title: "text.masterEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.masterEdit',
                parent: 'root.main.masterListing'
            },
            templateUrl: "views/master_edit.html",
            resolve: helper.resolveFor('master'),
            controller: "MasterController",
            controllerAs: 'master'
        })
        .state('root.main.masterView', {
            url: "/masterView/:id",
            title: "text.masterView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.masterView',
                parent: 'root.main.masterListing'
            },
            templateUrl: "views/master_view.html",
            resolve: helper.resolveFor('master'),
            controller: "MasterController",
            controllerAs: 'master'
        })
        .state('root.main.companyDrawCreate', {
            url: "/companyDrawCreate",
            title: "text.companyDrawCreate",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.companyDrawCreate","translate":"text.companyDrawCreate"},
                    {"class":"btn-info","active":false,"state":"root.main.companyDrawListing","translate":"text.companyDrawListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.companyDrawCreate'
            },
            templateUrl: "views/company_draw_create.html",
            resolve: helper.resolveFor('company'),
            controller: "CompanyController",
            controllerAs: 'company'
        })
        .state('root.main.companyDrawListing', {
            url: "/companyDrawListing",
            title: "text.companyDrawListing",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.companyDrawCreate","translate":"text.companyDrawCreate"},
                    {"class":"btn-info","active":true,"state":"root.main.companyDrawListing","translate":"text.companyDrawListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.companyDrawListing'
            },
            templateUrl: "views/company_draw_listing.html",
            resolve: helper.resolveFor('company'),
            controller: "CompanyController",
            controllerAs: 'company'
        })
        .state('root.main.packageCreate', {
            url: "/packageCreate",
            title: "text.packageCreate",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.packageCreate","translate":"text.packageCreate"},
                    {"class":"btn-info","active":false,"state":"root.main.packageListing","translate":"text.packageListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.packageCreate'
            },
            templateUrl: "views/package_create.html",
            resolve: helper.resolveFor('package'),
            controller: "PackageController",
            controllerAs: 'package'
        })
        .state('root.main.packageListing', {
            url: "/packageListing",
            title: "text.packageListing",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.packageCreate","translate":"text.packageCreate"},
                    {"class":"btn-info","active":true,"state":"root.main.packageListing","translate":"text.packageListing"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.packageListing'
            },
            templateUrl: "views/package_listing.html",
            resolve: helper.resolveFor('package'),
            controller: "PackageController",
            controllerAs: 'package'
        })
        .state('root.main.packageEdit', {
            url: "/packageEdit/:id",
            title: "text.packageEdit",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.packageEdit',
                parent: 'root.main.packageListing'
            },
            templateUrl: "views/package_edit.html",
            resolve: helper.resolveFor('package'),
            controller: "PackageController",
            controllerAs: 'package'
        })
        .state('root.main.packageView', {
            url: "/packageView/:id",
            title: "text.packageView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.packageView',
                parent: 'root.main.packageListing'
            },
            templateUrl: "views/package_view.html",
            resolve: helper.resolveFor('package'),
            controller: "PackageController",
            controllerAs: 'package'
        })
        .state('root.main.bet', {
            url: "/bet",
            title: "text.bet",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":true,"state":"root.main.bet","translate":"text.bet"},
                    {"class":"btn-info","active":false,"state":"root.main.4dSpecial","translate":"text.4dSpecial"},
                    {"class":"btn-green","active":false,"state":"root.main.3dSpecial","translate":"text.3dSpecial"},
                    {"class":"btn-warning","active":false,"state":"root.main.voidBet","translate":"text.voidBet"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.bet'
            },
            templateUrl: "views/bet.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.4dSpecial', {
            url: "/4dSpecial",
            title: "text.4dSpecial",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.bet","translate":"text.bet"},
                    {"class":"btn-info","active":true,"state":"root.main.4dSpecial","translate":"text.4dSpecial"},
                    {"class":"btn-green","active":false,"state":"root.main.3dSpecial","translate":"text.3dSpecial"},
                    {"class":"btn-warning","active":false,"state":"root.main.voidBet","translate":"text.voidBet"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.4dSpecial'
            },
            templateUrl: "views/bet.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.3dSpecial', {
            url: "/3dSpecial",
            title: "text.3dSpecial",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.bet","translate":"text.bet"},
                    {"class":"btn-info","active":false,"state":"root.main.4dSpecial","translate":"text.4dSpecial"},
                    {"class":"btn-green","active":true,"state":"root.main.3dSpecial","translate":"text.3dSpecial"},
                    {"class":"btn-warning","active":false,"state":"root.main.voidBet","translate":"text.voidBet"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.3dSpecial'
            },
            templateUrl: "views/bet.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.voidBet', {
            url: "/voidBet",
            title: "text.voidBet",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.bet","translate":"text.bet"},
                    {"class":"btn-info","active":false,"state":"root.main.4dSpecial","translate":"text.4dSpecial"},
                    {"class":"btn-green","active":false,"state":"root.main.3dSpecial","translate":"text.3dSpecial"},
                    {"class":"btn-warning","active":true,"state":"root.main.voidBet","translate":"text.voidBet"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.voidBet'
            },
            templateUrl: "views/void_bet.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.betView', {
            url: "/betView/:id",
            title: "text.betView",
            data: {
                permissions: [],
                menu: [
                    {"class":"btn-primary","active":false,"state":"root.main.bet","translate":"text.bet"},
                    {"class":"btn-info","active":false,"state":"root.main.4dSpecial","translate":"text.4dSpecial"},
                    {"class":"btn-green","active":false,"state":"root.main.3dSpecial","translate":"text.3dSpecial"},
                    {"class":"btn-warning","active":false,"state":"root.main.voidBet","translate":"text.voidBet"}
                ]
            },
            ncyBreadcrumb: {
                label: 'text.bet'
            },
            templateUrl: "views/bet_view.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.voidBetView', {
            url: "/voidBetView",
            title: "text.voidBetView",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.voidBetView'
            },
            params: {
                "betDetailIdArray" : null
            },
            templateUrl: "views/void_bet.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.betSlipHistory', {
            url: "/betSlipHistory",
            title: "text.betSlipHistory",
            data: {
                permissions: [],
            },
            ncyBreadcrumb: {
                label: 'text.betSlipHistory'
            },
            templateUrl: "views/bet_slip_history.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.betNumberHistory', {
            url: "/betNumberHistory",
            title: "text.betNumberHistory",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.betNumberHistory'
            },
            templateUrl: "views/bet_number_history.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.voidBetHistory', {
            url: "/voidBetHistory",
            title: "text.voidBetHistory",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.voidBetHistory'
            },
            templateUrl: "views/void_bet_history.html",
            resolve: helper.resolveFor('bet'),
            controller: "BetController",
            controllerAs: 'bet'
        })
        .state('root.main.report', {
            url: "/report",
            title: "text.report",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.report'
            },
            templateUrl: "views/report.html",
            resolve: helper.resolveFor('report'),
            controller: "ReportController",
            controllerAs: 'report'
        })
        .state('root.main.winLossDetailsReport', {
            url: "/winLossDetailsReport",
            title: "text.winLossDetails",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.winLossDetails',
                parent: 'root.main.report'
            },
            templateUrl: "views/reports/win_loss_details_report.html",
            resolve: helper.resolveFor('report'),
            controller: "ReportController",
            controllerAs: 'report'
        })
        .state('root.main.drawWinningNumberReport', {
            url: "/drawWinningNumberReport",
            title: "text.drawWinningNumber",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.drawWinningNumber',
                parent: 'root.main.report'
            },
            templateUrl: "views/reports/draw_winning_number_report.html",
            resolve: helper.resolveFor('report'),
            controller: "ReportController",
            controllerAs: 'report'
        })
        .state('root.main.companyDrawResultsReport', {
            url: "/companyDrawResultsReport",
            title: "text.companyDrawResults",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.companyDrawResults',
                parent: 'root.main.report'
            },
            templateUrl: "views/reports/company_draw_results_report.html",
            resolve: helper.resolveFor('report'),
            controller: "ReportController",
            controllerAs: 'report'
        })
        .state('root.main.betSumAmountNumberReport', {
            url: "/betSumAmountNumberReport",
            title: "text.betSumAmountNumber",
            data: {
                permissions: []
            },
            ncyBreadcrumb: {
                label: 'text.betSumAmountNumber',
                parent: 'root.main.report'
            },
            templateUrl: "views/reports/bet_sum_amount_number_report.html",
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
