(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false

        if ($rootScope.userIdentity.userDetail.bet6d) {
            _this.amountColspan = 7;
        } else {
            _this.amountColspan = 5;
        }

        _this.betFormRowsCount = 20; //Default to 20 rows
        _this.betFormRowsArray = [];
        for(var i=0;i<_this.betFormRowsCount;i++) {
            var rowObj = {};
            rowObj.betOption = {"id":$rootScope.APPCONSTANT.BET.OPTION.SINGLE,"name":"text.single"}; //Default option
            _this.betFormRowsArray.push(rowObj);
        }

        _this.betOptions =
            [
                {"id":$rootScope.APPCONSTANT.BET.NUMBER.OPTION.SINGLE,"name":"text.single"},
                {"id":$rootScope.APPCONSTANT.BET.NUMBER.OPTION.RETURN,"name":"text.return"},
                {"id":$rootScope.APPCONSTANT.BET.NUMBER.OPTION.BOX,"name":"text.box"},
                {"id":$rootScope.APPCONSTANT.BET.NUMBER.OPTION.IBOX,"name":"text.ibox"},
                {"id":$rootScope.APPCONSTANT.BET.NUMBER.OPTION.PH,"name":"text.ph"},
            ];

        //Populate this week of draw dates (excluding past dates)
        _this.drawDateArray = [];
        _this.activeDrawDateArray = [];
        /*_this.drawCompanyArray =
            [
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM,"name":"text.magnum","bgColor":"yellow","color":"black"},
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.PMP,"name":"text.pmp","bgColor":"blue","color":"white"},
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.TOTO,"name":"text.toto","bgColor":"#CC0000","color":"white"},
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE,"name":"text.singapore","bgColor":"#4C8ED1","color":"white"},
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.SABAH,"name":"text.sabah","bgColor":"#E51D20","color":"white"},
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN,"name":"text.sandakan","bgColor":"#008835","color":"white"},
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK,"name":"text.sarawak","bgColor":"#00540E","color":"white"},
                {"id":$rootScope.APPCONSTANT.COMPANY.CODE.GD,"name":"text.gdLotto","bgColor":"gold","color":"black"},
            ];*/


        var startOfWeek = moment().startOf('isoWeek');
        var endOfWeek = moment().endOf('isoWeek');
        var day = startOfWeek;
        while (day <= endOfWeek) {
            _this.drawDateArray.push(day.toDate());
            if (moment(day).isSameOrAfter(moment(), 'day')) {
                if (moment(day).isSame(moment(), 'day')) {
                    //Same day as today, check the cutoff date
                    var cutOffTime = moment($rootScope.APPCONSTANT.GLOBAL.CUT_OFF_TIME,'hh:mm:ss');
                    if (moment().isSameOrAfter(cutOffTime)) { //Cutoff Time Reached
                        day = day.clone().add(1, 'd');
                        continue;
                    }
                }
                _this.activeDrawDateArray.push(day.toDate());
            }
            day = day.clone().add(1, 'd');
        }

        _this.sevenDaysDrawDateArray = [];
        var sixDaysAfter = moment().add(6,'d');
        var day = moment();
        while (day <= sixDaysAfter) {
            _this.sevenDaysDrawDateArray.push(day.toDate());
            day = day.clone().add(1, 'd');
        }

        CommonService.getCompanies(true).then(function (result) {
            _this.drawCompanyArray = result;
            angular.forEach(_this.drawCompanyArray, function(value, key) {
                switch (value.code) {
                    case $rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM:
                        value.name = "text.magnum";
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.PMP:
                        value.name = "text.pmp";
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.TOTO:
                        value.name = "text.toto";
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE:
                        value.name = "text.singapore";
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SABAH:
                        value.name = "text.sabah";
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN:
                        value.name = "text.sandakan";
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK:
                        value.name = "text.sarawak";
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.GD:
                        value.name = "text.gdLotto";
                        break;
                }

                //Populate 7 days for display for each company

            });
            //console.log(_this.drawCompanyArray);
            angular.forEach(_this.sevenDaysDrawDateArray, function (value,key) {
                var companyArray = [];
                angular.forEach(_this.drawCompanyArray, function (value2,key2) {
                    var drawCompanyObj = {"bgColor":value2.bgColor,"fontColor":value2.fontColor,"drawDate":"-"};
                    for (var i in value2.companyDraws) {
                        if (moment(value).isSame(moment(value2.companyDraws[i].drawDate), 'day')) {
                            drawCompanyObj.drawDate = value;
                            break;
                        }
                    }
                    companyArray.push(drawCompanyObj);
                });
                value.companyArray = companyArray;
            });
        });

        _this.selectRow = function(index) {
            _this.betFormRowsArray.map(function(a) {
                a.selected = false;
            });
            _this.betFormRowsArray[index].selected = true;
        };

        _this.populateBetArray = function() {
            var result = [];

            for (var b in _this.betFormRowsArray) {
                var row = _this.betFormRowsArray[b];
                var betObj = {};
                if (row.number) {
                    if (row.big > 0 || row.small > 0 || row['4a'] > 0 || row['3d'] > 0 || row['3abc'] || row['5d'] > 0 || row['6d'] > 0) {
                        for (var d in _this.activeDrawDateArray) {
                            var activeDrawDate = _this.activeDrawDateArray[d];
                            if (row[activeDrawDate] == true) {
                                betObj.number = row.number;
                                betObj.betOption = row.betOption.id;
                                betObj.big = row.big;
                                betObj.small = row.small;
                                betObj['4a'] = row['4a'];
                                betObj['3d'] = row['3d'];
                                betObj['3abc'] = row['3abc'];
                                betObj['5d'] = row['5d'];
                                betObj['6d'] = row['6d'];
                                betObj['drawDate'] = moment(activeDrawDate).format();

                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM;
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.PMP]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.PMP;
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.TOTO]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.TOTO;
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE;
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SABAH]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SABAH;
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN;
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK;
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.GD]) {
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.GD;
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                            }
                        }
                    }
                }

            }

            return result;
        };

        //To calculate total
        /*_this.changeBet = function(index) {
            var grandTotal = 0, totalBig = 0, totalSmall = 0, total4a = 0, total3d = 0, total3abc = 0, total5d = 0, total6d = 0;
            var row = _this.betFormRowsArray[index];

            //Rule 1 : Either one of B, S, 4a, 3d, 3abc, 5d, 6d must be entered.
            //Rule 2 : One of the draw dates must be checked.
            //Rule 3 : One of the draw companies must be checked
            //Rule 4 : The draw must be available for the checked dates for the checked companies

            //Rule 1
            if (row.big > 0 || row.small > 0 || row['4a'] > 0 || row['3d'] > 0 || row['3abc'] || row['5d'] > 0 || row['6d'] > 0) {

            }
            grandTotal = totalBig+totalSmall+total4a+total3d+total3abc+total5d+total6d;
            row.total = grandTotal;
        };*/

        _this.submitBet = function(isValid) {
            if (isValid) {
                CommonService.clearAlertMessage();
                _this.isSaving = true;

                var betArray = _this.populateBetArray();
                if (betArray.length < 1) {
                    CommonService.SweetAlert({
                        title: "Error",
                        text: "There's no bet to submit. Please check.",
                        type: "error"
                    })
                    _this.isSaving = false;
                    return;
                }

                _this.saveObj = {
                    "betArray" : betArray
                };

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet", _this.saveObj).
                then(function (response) {
                    //Success Callback
                    var successMessage = "Bet submitted successfully.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.betView",{"id":response.data.id});
                    _this.isSaving = false;
                }, function (response) {
                    //Error Callback
                    var failMessage = "Failed to submit bet";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

    }; // End var Ctrl

    app.controller('BetController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', Ctrl]);
}());
