(function(){

    'use strict';

    var app = angular.module('fdPortal');

    var Ctrl = function ($rootScope, $scope, $state, $stateParams, $http, $translate, $filter, CommonService, Notify) {
        var stateName = $state.current.name;
        var _this = this; //Declare local variable _this to refer to "this" controller
        _this.isSaving = false; //Default to false
        _this.betMethod = $rootScope.userIdentity.userDetail ? $rootScope.userIdentity.userDetail.betMethod : null;
        _this.canVoid = false;
        _this.aBetVoidCheckAll = false;
        _this.lBetVoidCheckAll = false;
        _this.betVoidCheckAll = false;
        _this.voidArray = [];
        _this.betRegex = "^\\d{0,3}(?:\\.\\d)?$";
        _this.grandTotal = 0;

        if ($rootScope.userIdentity.userDetail && $rootScope.userIdentity.userDetail.bet6d) {
            _this.amountColspan = 7;
        } else {
            _this.amountColspan = 5;
        }

        _this.indexFilterColumns = [
            {"drawDateStart": {"attribute" : "drawDate", "operator" : "gte", "model" : "user", "isChild" : false}},
            {"drawDateEnd": {"attribute" : "drawDate", "operator" : "lte", "model" : "userProfile", "isChild" : false}},
            {"betDateStart": {"attribute" : "lastName", "operator" : "like", "model" : "userProfile", "isChild" : false}},
            {"betDateEnd": {"attribute" : "email", "operator" : "like", "model" : "user", "isChild" : false}}
        ];

        _this.betFormRowsCount = 20; //Default to 20 rows
        _this.betFormRowsArray = [];
        for(var i=0;i<_this.betFormRowsCount;i++) {
            var rowObj = {};
            rowObj.betOption = {"id":$rootScope.APPCONSTANT.BET.NUMBER.OPTION.SINGLE,"name":"text.single"}; //Default option
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
        _this.betMethodOptions = [{id:$rootScope.APPCONSTANT.USER.DETAIL.BET_METHOD.MULTIPLE, "name":"text.multiple"}, {id:$rootScope.APPCONSTANT.USER.DETAIL.BET_METHOD.DIVIDE, "name":"text.divide"}];
        _this.betDetailStatusOptions =
            [
                {"id":$rootScope.APPCONSTANT.BET.DETAIL.STATUS.ACCEPTED,"name":"text.accepted"},
                {"id":$rootScope.APPCONSTANT.BET.DETAIL.STATUS.LIMITED,"name":"text.limited"},
                {"id":$rootScope.APPCONSTANT.BET.DETAIL.STATUS.REJECTED,"name":"text.rejected"},
                {"id":$rootScope.APPCONSTANT.BET.DETAIL.STATUS.VOIDED,"name":"text.voided"}
            ];

        //Datepicker options
        _this.datepicker = {};
        _this.datepicker.format = 'dd-MMM-yyyy';
        _this.datepicker.drawStartDate = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };
        _this.datepicker.drawEndDate = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };
        _this.datepicker.betStartDate = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };
        _this.datepicker.betEndDate = {
            "opened": false,
            "dateOptions": {
                "showWeeks": false
            }
        };

        _this.openDatepicker = function(which) {
            if (which == 1) {
                _this.datepicker.drawDateStart.opened = true;
            } else if (which == 2) {
                if (_this.drawDateStart) {
                    _this.datepicker.drawDateEnd.dateOptions.minDate = _this.drawDateStart;
                }
                _this.datepicker.drawDateEnd.opened = true;
            } else if (which == 3) {
                _this.datepicker.betDateStart.opened = true;
            } else if (which == 4) {
                if (_this.betDateStart) {
                    _this.datepicker.betDateEnd.dateOptions.minDate = _this.betDateStart;
                }
                _this.datepicker.betDateEnd.opened = true;
            }
        };

        //Take the first entered amount and override the rest with it
        _this.checkAllBet = function(bet) {
            var checkbox = _this.betAllCheckbox[bet];
            if (checkbox) {
                var firstEnteredAmount = _this.betFormRowsArray[0][bet];
                _this.betFormRowsArray.map(function(a) {
                    a[bet] = firstEnteredAmount;
                });
                _this.calculateBetsTotal();
            }
        };

        _this.checkAllDate = function(dateObj,index) {
            _this.betFormRowsArray.map(function(a) {
                a[dateObj] = _this.dateAllCheckbox[index];
            });
            _this.calculateBetsTotal();
        };

        _this.checkAllCompany = function(companyCode,index) {
            _this.betFormRowsArray.map(function(a) {
                a[companyCode] = _this.companyAllCheckbox[index];
            });
            _this.calculateBetsTotal();
        };

        _this.checkAllOption = function() {
            //Take the first selected option and override the rest with it
            //Only do something if it's checked
            if (_this.optionAllCheckbox) {
                var firstSelectedOption = _this.betFormRowsArray[0].betOption;
                _this.betFormRowsArray.map(function(a) {
                    a.betOption = firstSelectedOption;
                });
                _this.calculateBetsTotal();
            }
        };

        _this.checkAllRemarks = function() {
            //Take the first selected option and override the rest with it
            //Only do something if it's checked
            if (_this.remarksAllCheckbox) {
                var firstEnteredRemarks = _this.betFormRowsArray[0].remarks;
                _this.betFormRowsArray.map(function(a) {
                    a.remarks = firstEnteredRemarks;
                });
            }
        };

        //Populate this week of draw dates (excluding past dates)
        _this.drawDateArray = [];
        _this.activeDrawDateArray = [];

        var startOfWeek = moment().startOf('isoWeek');
        var endOfWeek = moment().endOf('isoWeek');
        var day = startOfWeek;
        var cutOffTime = moment($rootScope.APPCONSTANT.GLOBAL.CUT_OFF_TIME,'hh:mm:ss');
        if (moment().isSame(endOfWeek, 'day')) { //Reach sunday, check cut off time and jump to next week
            if (moment().isSameOrAfter(cutOffTime)) { //Cutoff Time Reached
                startOfWeek = moment().add(1, 'weeks').startOf('isoWeek');
                endOfWeek = moment().add(1, 'weeks').endOf('isoWeek');
                day = startOfWeek;
            }
        }

        while (day <= endOfWeek) {
            _this.drawDateArray.push(day.toDate());
            if (moment(day).isSameOrAfter(moment(), 'day')) {
                if (moment(day).isSame(moment(), 'day')) {
                    //Same day as today, check the cutoff date
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
            if (moment(day).isSameOrAfter(moment(), 'day')) {
                if (moment(day).isSame(moment(), 'day')) {
                    //Same day as today, check the cutoff date
                    var cutOffTime = moment($rootScope.APPCONSTANT.GLOBAL.CUT_OFF_TIME, 'hh:mm:ss');
                    if (moment().isSameOrAfter(cutOffTime)) { //Cutoff Time Reached
                        day = day.clone().add(1, 'd');
                        sixDaysAfter = moment().add(7,'d'); //Add 1 more day to become 7 days because today is passed the cut off time
                        continue;
                    }
                }
                _this.sevenDaysDrawDateArray.push(day.toDate());
            }
            day = day.clone().add(1, 'd');
        }

        CommonService.getCompanies(true).then(function (result) {
            _this.drawCompanyArray = [];
            angular.forEach(result, function(value, key) {
                switch (value.code) {
                    case $rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM:
                        value.name = "text.magnum";
                        _this.drawCompanyArray.push(value);
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.PMP:
                        value.name = "text.pmp";
                        _this.drawCompanyArray.push(value);
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.TOTO:
                        value.name = "text.toto";
                        _this.drawCompanyArray.push(value);
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE:
                        value.name = "text.singapore";
                        _this.drawCompanyArray.push(value);
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SABAH:
                        value.name = "text.sabah";
                        _this.drawCompanyArray.push(value);
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN:
                        value.name = "text.sandakan";
                        _this.drawCompanyArray.push(value);
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK:
                        value.name = "text.sarawak";
                        _this.drawCompanyArray.push(value);
                        break;
                    case $rootScope.APPCONSTANT.COMPANY.CODE.GD:
                        value.name = "text.gdLotto";
                        if ($rootScope.userIdentity.userDetail && $rootScope.userIdentity.userDetail.betGdLotto) {
                            _this.drawCompanyArray.push(value);
                        }
                        break;
                }
            });

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

        _this.copySuccess = function() {
            Notify.alert(
                'Copied successfully.',
                {status: 'success'}
            );
        };

        _this.checkAllBetVoid = function(mode) {
            if (stateName == "root.main.betView") {
                if (mode == 1) { //Accepted Bets (from state root.main.betView)
                    angular.forEach(_this.bet.acceptedBets, function (value, key) {
                        if (value.canVoid) {
                            value.void = _this.aBetVoidCheckAll;
                        }
                    });
                } else if (mode == 2) { //Limited Bets (from state root.main.betView)
                    angular.forEach(_this.bet.limitedBets, function (value, key) {
                        if (value.canVoid) {
                            value.void = _this.lBetVoidCheckAll;
                        }
                    });
                }
            } else if (stateName == "root.main.voidBet"){ //From state root.main.voidBet
                angular.forEach(_this.voidBets, function(value,key) {
                    value.void = _this.betVoidCheckAll;
                });
            }

            _this.updateSelectedVoidBet();
        };

        _this.updateSelectedVoidBet = function(mode) {
            _this.voidArray = [];
            if (stateName == "root.main.betView") {
                angular.forEach(_this.bet.acceptedBets, function (value, key) {
                    if (value.canVoid) {
                        if (value.void) {
                            _this.voidArray.push(value.id);
                        }
                    }
                });

                angular.forEach(_this.bet.limitedBets, function (value, key) {
                    if (value.canVoid) {
                        if (value.void) {
                            _this.voidArray.push(value.id);
                        }
                    }
                });
            } else if (stateName == "root.main.voidBet") {
                angular.forEach(_this.voidBets, function (value, key) {
                    if (value.void) {
                        _this.voidArray.push(value.id);
                    }
                });
            }
        };

        _this.changeBetVoid = function(betObj) {
            if (stateName == "root.main.betView") {
                if (betObj.canVoid) {
                    if (betObj.void) {
                        _this.voidArray.push(betObj.id);
                    } else {
                        var index = _this.voidArray.indexOf(betObj.id);
                        if (index > -1) {
                            _this.voidArray.splice(index, 1);
                        }
                    }
                }
            } else if (stateName == "root.main.voidBet") {
                if (betObj.void) {
                    _this.voidArray.push(betObj.id);
                } else {
                    var index = _this.voidArray.indexOf(betObj.id);
                    if (index > -1) {
                        _this.voidArray.splice(index, 1);
                    }
                }
            }
        };

        _this.getBetSlipHistory = function() {
            CommonService.clearAlertMessage();
            _this.isSaving = true;
            var dataJsonParams = {
                "drawDateStart": _this.drawDateStart ?  moment(_this.drawDateStart).format() : null,
                "drawDateEnd": _this.drawDateEnd ? moment(_this.drawDateEnd).format() : null,
                "betDateStart": _this.betDateStart ? moment(_this.betDateStart).format() : null,
                "betDateEnd": _this.betDateEnd ? moment(_this.betDateEnd).format() : null,
            };

            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet/get-bet-slip-history?expand=creator", {
                params: dataJsonParams
            }).then(function (response) {
                // this callback will be called asynchronously
                // when the response is available
                _this.betData = response.data;

                _this.isSaving = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve bet slip history.",
                    type: "error"
                });
                _this.isSaving = false;
            });
        };

        _this.getBetNumberHistory = function() {
            CommonService.clearAlertMessage();
            _this.isSaving = true;
            var dataJsonParams = {
                "drawDateStart": _this.drawDateStart ?  moment(_this.drawDateStart).format() : null,
                "drawDateEnd": _this.drawDateEnd ? moment(_this.drawDateEnd).format() : null,
                "betDateStart": _this.betDateStart ? moment(_this.betDateStart).format() : null,
                "betDateEnd": _this.betDateEnd ? moment(_this.betDateEnd).format() : null,
                "number": _this.number
            };

            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet/get-bet-number-history", {
                params: dataJsonParams
            }).then(function (response) {
                // this callback will be called asynchronously
                // when the response is available
                _this.betData = response.data;

                _this.isSaving = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve bet slip history.",
                    type: "error"
                });
                _this.isSaving = false;
            });
        };

        _this.getVoidBetHistory = function() {
            CommonService.clearAlertMessage();
            _this.isSaving = true;
            var dataJsonParams = {
                "drawDateStart": _this.drawDateStart ?  moment(_this.drawDateStart).format() : null,
                "drawDateEnd": _this.drawDateEnd ? moment(_this.drawDateEnd).format() : null,
                "betDateStart": _this.betDateStart ? moment(_this.betDateStart).format() : null,
                "betDateEnd": _this.betDateEnd ? moment(_this.betDateEnd).format() : null,
                "number": _this.number
            };

            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet/get-void-bet-history", {
                params: dataJsonParams
            }).then(function (response) {
                // this callback will be called asynchronously
                // when the response is available
                _this.betData = response.data;

                _this.isSaving = false;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve void bet history.",
                    type: "error"
                });
                _this.isSaving = false;
            });
        };

        _this.selectRow = function(index) {
            _this.betFormRowsArray.map(function(a) {
                a.selected = false;
            });
            _this.betFormRowsArray[index].selected = true;
        };

        _this.populateBetArray = function() {
            var result = [];
            var rowIndex = 0;

            for (var b = 0;b <  _this.betFormRowsArray.length;b++) {
                var row = _this.betFormRowsArray[b];
                row.drawDateArray = [];
                var betObj = {};
                if (row.number) {
                    if (row.big > 0 || row.small > 0 || row['4a'] > 0 || row['3d'] > 0 || row['3abc'] || row['5d'] > 0 || row['6d'] > 0) {
                        for (var d in _this.activeDrawDateArray) {
                            var activeDrawDate = _this.activeDrawDateArray[d];
                            if (row[activeDrawDate] == true) {
                                row.drawDateArray.push(moment(activeDrawDate).format("YYYY-MM-DD"));
                                //Check betMethod
                                var big = row.big ? row.big : null;
                                var small = row.small ? row.small : null;
                                var amount4a = row['4a'] ? row['4a'] : null;
                                var amount4b = row['4b'] ? row['4b'] : null;
                                var amount4c = row['4c'] ? row['4c'] : null;
                                var amount4d = row['4d'] ? row['4d'] : null;
                                var amount4e = row['4e'] ? row['4e'] : null;
                                var amount4f = row['4f'] ? row['4f'] : null;
                                var amount3abc = row['3abc'] ? row['3abc'] : null;
                                var amount3a = row['3a'] ? row['3a'] : null;
                                var amount3b = row['3b'] ? row['3b'] : null;
                                var amount3c = row['3c'] ? row['3c'] : null;
                                var amount3d = row['3d'] ? row['3d'] : null;
                                var amount3e = row['3e'] ? row['3e'] : null;
                                var amount5d = row['5d'] ? row['5d'] : null;
                                var amount6d = row['6d'] ? row['6d'] : null;

                                if (_this.betMethod == $rootScope.APPCONSTANT.USER.DETAIL.BET_METHOD.DIVIDE) {
                                    var betCompaniesCount = 0;
                                    //Need to divide the amount by the number of companies that the user has placed bets for
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM]) {
                                        betCompaniesCount++;
                                    }
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.PMP]) {
                                        betCompaniesCount++;
                                    }
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.TOTO]) {
                                        betCompaniesCount++;
                                    }
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE]) {
                                        betCompaniesCount++;
                                    }
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SABAH]) {
                                        betCompaniesCount++;
                                    }
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN]) {
                                        betCompaniesCount++;
                                    }
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK]) {
                                        betCompaniesCount++;
                                    }
                                    if (row[$rootScope.APPCONSTANT.COMPANY.CODE.GD]) {
                                        betCompaniesCount++;
                                    }

                                    if (betCompaniesCount > 0) {
                                        big = big ? (big/betCompaniesCount).toFixed(3) : null;
                                        small = small ? (small/betCompaniesCount).toFixed(3) : null;
                                        amount4a = amount4a ? (amount4a/betCompaniesCount).toFixed(3) : null;
                                        amount4b = amount4b ? (amount4b/betCompaniesCount).toFixed(3) : null;
                                        amount4c = amount4c ? (amount4c/betCompaniesCount).toFixed(3) : null;
                                        amount4d = amount4d ? (amount4d/betCompaniesCount).toFixed(3) : null;
                                        amount4e = amount4e ? (amount4e/betCompaniesCount).toFixed(3) : null;
                                        amount4f = amount4f ? (amount4f/betCompaniesCount).toFixed(3) : null;
                                        amount3abc = amount3abc ? (amount3abc/betCompaniesCount).toFixed(3) : null;
                                        amount3a = amount3a ? (amount3a/betCompaniesCount).toFixed(3) : null;
                                        amount3b = amount3b ? (amount3b/betCompaniesCount).toFixed(3) : null;
                                        amount3c = amount3c ? (amount3c/betCompaniesCount).toFixed(3) : null;
                                        amount3d = amount3d ? (amount3d/betCompaniesCount).toFixed(3) : null;
                                        amount3e = amount3e ? (amount3e/betCompaniesCount).toFixed(3) : null;
                                        amount5d = amount5d ? (amount5d/betCompaniesCount).toFixed(3) : null;
                                        amount6d = amount6d ? (amount6d/betCompaniesCount).toFixed(3) : null;
                                    }
                                }

                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    betObj['4a'] = amount4a;
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM;
                                    betObj['remarks'] = row['remarks'];
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.PMP]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    betObj['4a'] = amount4a;
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.PMP;
                                    betObj['remarks'] = row['remarks'];
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.TOTO]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    betObj['4a'] = amount4a;
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['5d'] = amount5d;
                                    betObj['6d'] = amount6d;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.TOTO;
                                    betObj['remarks'] = row['remarks'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    betObj['4a'] = amount4a;
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE;
                                    betObj['remarks'] = row['remarks'];
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SABAH]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    betObj['4a'] = amount4a;
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SABAH;
                                    betObj['remarks'] = row['remarks'];
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    //betObj['4a'] = amount4a;
                                    betObj['4a'] = null; //Modified on 13-10-2018, forcibly do not accept 4A bet on sandakan
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN;
                                    betObj['remarks'] = row['remarks'];
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    betObj['4a'] = amount4a;
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK;
                                    betObj['remarks'] = row['remarks'];
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.GD]) {
                                    betObj = {};
                                    betObj.rowIndex = rowIndex;
                                    betObj.number = row.number;
                                    betObj.betOption = row.betOption.id;
                                    betObj.big = big;
                                    betObj.small = small;
                                    betObj['4a'] = amount4a;
                                    betObj['4b'] = amount4b;
                                    betObj['4c'] = amount4c;
                                    betObj['4d'] = amount4d;
                                    betObj['4e'] = amount4e;
                                    betObj['4f'] = amount4f;
                                    betObj['3abc'] = amount3abc;
                                    betObj['3a'] = amount3a;
                                    betObj['3b'] = amount3b;
                                    betObj['3c'] = amount3c;
                                    betObj['3d'] = amount3d;
                                    betObj['3e'] = amount3e;
                                    betObj['drawDate'] = moment(activeDrawDate).format();
                                    betObj['companyCode'] = $rootScope.APPCONSTANT.COMPANY.CODE.GD;
                                    betObj['remarks'] = row['remarks'];
                                    delete betObj['5d'];
                                    delete betObj['6d'];
                                    result.push(betObj);
                                }
                            }
                        }
                    }
                    rowIndex++;
                }
            }

            return result;
        };

        function permute(string) {
            if (string.length < 2) return string; // This is our break condition

            var permutations = []; // This array will hold our permutations

            for (var i=0; i<string.length; i++) {
                var char = string[i];

                // Cause we don't want any duplicates:
                if (string.indexOf(char) != i) // if char was used already
                    continue;           // skip it this time

                var remainingString = string.slice(0,i) + string.slice(i+1,string.length); //Note: you can concat Strings via '+' in JS

                for (var subPermutation of permute(remainingString))
                    permutations.push(char + subPermutation)

            }
            return permutations;
        }

        //To calculate total
        _this.calculateBetsTotal = function() {
            var grandTotal = 0;

            //Rule 1 : Number must be entered
            //Rule 2 : Either one of B, S, 4a, 3d, 3abc, 5d, 6d must be entered.
            //Rule 3 : One of the draw dates must be checked.
            //Rule 4 : One of the draw companies must be checked
            //Rule 5 : Check the betOption

            _this.betFormRowsArray.map(function(row) {
                var total = 0;
                row.total = 0; //Reset to 0
                if (row.number) {
                    if (row.big > 0 || row.small > 0 || row['4a'] > 0 || row['3d'] > 0 || row['3abc'] || row['5d'] > 0 || row['6d'] > 0) {
                        for (var d in _this.activeDrawDateArray) {
                            var activeDrawDate = _this.activeDrawDateArray[d];
                            if (row[activeDrawDate] == true) {
                                //Check betMethod
                                var big = row.big ? row.big : 0;
                                var small = row.small ? row.small : 0;
                                var amount4a = row['4a'] ? row['4a'] : 0;
                                var amount4b = row['4b'] ? row['4b'] : 0;
                                var amount4c = row['4c'] ? row['4c'] : 0;
                                var amount4d = row['4d'] ? row['4d'] : 0;
                                var amount4e = row['4e'] ? row['4e'] : 0;
                                var amount4f = row['4f'] ? row['4f'] : 0;
                                var amount3abc = row['3abc'] ? row['3abc'] : 0;
                                var amount3a = row['3a'] ? row['3a'] : 0;
                                var amount3b = row['3b'] ? row['3b'] : 0;
                                var amount3c = row['3c'] ? row['3c'] : 0;
                                var amount3d = row['3d'] ? row['3d'] : 0;
                                var amount3e = row['3e'] ? row['3e'] : 0;
                                var amount5d = row['5d'] ? row['5d'] : 0;
                                var amount6d = row['6d'] ? row['6d'] : 0;
                                var betCompaniesCount = 0;
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.MAGNUM]) {
                                    betCompaniesCount++;
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.PMP]) {
                                    betCompaniesCount++;
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.TOTO]) {
                                    betCompaniesCount++;
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SINGAPORE]) {
                                    betCompaniesCount++;
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SABAH]) {
                                    betCompaniesCount++;
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SANDAKAN]) {
                                    betCompaniesCount++;
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.SARAWAK]) {
                                    betCompaniesCount++;
                                }
                                if (row[$rootScope.APPCONSTANT.COMPANY.CODE.GD]) {
                                    betCompaniesCount++;
                                }

                                if (_this.betMethod == $rootScope.APPCONSTANT.USER.DETAIL.BET_METHOD.DIVIDE) {
                                    //Need to divide the amount by the number of companies that the user has placed bets for
                                    if (betCompaniesCount > 0) {
                                        big = big ? (big/betCompaniesCount).toFixed(3) : 0;
                                        small = small ? (small/betCompaniesCount).toFixed(3) : 0;
                                        amount4a = amount4a ? (amount4a/betCompaniesCount).toFixed(3) : 0;
                                        amount4b = amount4b ? (amount4b/betCompaniesCount).toFixed(3) : 0;
                                        amount4c = amount4c ? (amount4c/betCompaniesCount).toFixed(3) : 0;
                                        amount4d = amount4d ? (amount4d/betCompaniesCount).toFixed(3) : 0;
                                        amount4e = amount4e ? (amount4e/betCompaniesCount).toFixed(3) : 0;
                                        amount4f = amount4f ? (amount4f/betCompaniesCount).toFixed(3) : 0;
                                        amount3abc = amount3abc ? (amount3abc/betCompaniesCount).toFixed(3) : 0;
                                        amount3a = amount3a ? (amount3a/betCompaniesCount).toFixed(3) : 0;
                                        amount3b = amount3b ? (amount3b/betCompaniesCount).toFixed(3) : 0;
                                        amount3c = amount3c ? (amount3c/betCompaniesCount).toFixed(3) : 0;
                                        amount3d = amount3d ? (amount3d/betCompaniesCount).toFixed(3) : 0;
                                        amount3e = amount3e ? (amount3e/betCompaniesCount).toFixed(3) : 0;
                                        amount5d = amount5d ? (amount5d/betCompaniesCount).toFixed(3) : 0;
                                        amount6d = amount6d ? (amount6d/betCompaniesCount).toFixed(3) : 0;
                                    }
                                }

                                big = parseFloat(big);
                                small = parseFloat(small);
                                amount4a = parseFloat(amount4a);
                                amount4b = parseFloat(amount4b);
                                amount4c = parseFloat(amount4c);
                                amount4d = parseFloat(amount4d);
                                amount4e = parseFloat(amount4e);
                                amount4f = parseFloat(amount4f);
                                amount3abc = parseFloat(amount3abc);
                                amount3a = parseFloat(amount3a);
                                amount3b = parseFloat(amount3b);
                                amount3c = parseFloat(amount3c);
                                amount3d = parseFloat(amount3d);
                                amount3e = parseFloat(amount3e);
                                amount5d = parseFloat(amount5d);
                                amount6d = parseFloat(amount6d);

                                total = big+small+amount4a+amount4b+amount4c+amount4d+amount4e+amount4f;
                                total += amount3abc+amount3a+amount3b+amount3c+amount3d+amount3e;
                                total += amount5d+amount6d;
                                if (_this.betMethod == $rootScope.APPCONSTANT.USER.DETAIL.BET_METHOD.MULTIPLE) {
                                    total = total * betCompaniesCount;
                                }

                                //Check the betOption
                                var numberArray = [];
                                if (row.betOption.id == $rootScope.APPCONSTANT.BET.NUMBER.OPTION.RETURN) {
                                    numberArray = permute(row.number);
                                    if (numberArray.length > 1) { //Meaning the user did not enter a number with the same 4 digits. 1111,2222 etc
                                        total = total * 2;
                                    }
                                } else if (row.betOption.id == $rootScope.APPCONSTANT.BET.NUMBER.OPTION.BOX) {
                                    numberArray = permute(row.number);
                                    total = total * numberArray.length;
                                } else if (row.betOption.id == $rootScope.APPCONSTANT.BET.NUMBER.OPTION.PH) {
                                    numberArray = permute(row.number.substring(1));
                                    total = total * numberArray.length;
                                }

                                row.total = total;
                                grandTotal += total;
                            } //End if (row[activeDrawDate] == true) {
                        } //End for (var d in _this.activeDrawDateArray) {
                    }
                }
            });
            _this.grandTotal = grandTotal;
        };

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
                    "betArray" : betArray,
                    "betFormRowsArray" : _this.betFormRowsArray
                };

                $http.post($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet", _this.saveObj).
                then(function (response) {
                    //Success Callback
                    var successMessage = "Bet submitted successfully.";
                    CommonService.handleSuccessResponse(successMessage,"root.main.betView",{"id":response.data.id});
                    //CommonService.handleSuccessResponse(successMessage,null,null);
                    _this.isSaving = false;
                }, function (response) {
                    //Error Callback
                    var failMessage = "Failed to submit bet";
                    CommonService.handleErrorResponse(failMessage,response);
                    _this.isSaving = false;
                });
            }
        };

        _this.voidBet = function() {
            CommonService.clearAlertMessage();
            _this.isSaving = true;

            _this.saveObj = {
                "voidArray" : _this.voidArray
            };

            $http.put($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet/void", _this.saveObj).
            then(function (response) {
                //Success Callback
                var successMessage = "Total "+response.data.betIdCount+" bet(s) selected to void, "+response.data.voidCount+" bet(s) voided successfully.";
                CommonService.handleSuccessResponse(successMessage, "root.main.voidBetView", {"betDetailIdArray": response.data.betDetailIdArray});
                _this.isSaving = false;
            }, function (response) {
                //Error Callback
                var failMessage = "Failed to void bet(s).";
                CommonService.handleErrorResponse(failMessage,response);
                _this.isSaving = false;
            });
        };

        if (stateName == "root.main.betView") {
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet/"+$stateParams.id+"?expand=slipText,betDetailsSortByNumber.companyDraw,betDetailsSortByNumber.betDetailReject")
                .then(function (response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    _this.bet = response.data;

                    var acceptedBets = [], limitedBets = [], rejectedBets = [], voidedBets = [];
                    angular.forEach(_this.bet.betDetailsSortByNumber, function(value,key) {
                        value.canVoid = false;
                        if (moment().isBefore(moment(value.voidDateBy.date))) {
                            value.canVoid = true;
                        }

                        if (value.status == $rootScope.APPCONSTANT.BET.DETAIL.STATUS.ACCEPTED) {
                            acceptedBets.push(value);
                        } else if (value.status == $rootScope.APPCONSTANT.BET.DETAIL.STATUS.LIMITED) {
                            limitedBets.push(value);
                            if (value.betDetailReject) {
                                var rejectObj = value.betDetailReject;
                                rejectObj.number = value.number;
                                rejectObj.drawDate = value.drawDate;
                                rejectObj.companyDraw = value.companyDraw;
                                rejectedBets.push(rejectObj);
                            }
                        } else if (value.status == $rootScope.APPCONSTANT.BET.DETAIL.STATUS.REJECTED) {
                            rejectedBets.push(value);
                        } else if (value.status == $rootScope.APPCONSTANT.BET.DETAIL.STATUS.VOIDED) {
                            voidedBets.push(value);
                        }
                    });

                    _this.bet.acceptedBets = acceptedBets;
                    _this.bet.limitedBets = limitedBets;
                    _this.bet.rejectedBets = rejectedBets;
                    _this.bet.voidedBets = voidedBets;
                }, function (response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    CommonService.SweetAlert({
                        title: "Error",
                        text: "Failed to retrieve master details.",
                        type: "error"
                    });
                });
        } else if (stateName == "root.main.voidBet") {
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet/get-voidable-bets")
                .then(function (response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    _this.voidBets = response.data;
                }, function (response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    CommonService.SweetAlert({
                        title: "Error",
                        text: "Failed to retrieve bet(s).",
                        type: "error"
                    });
                });
        } else if (stateName == "root.main.voidBetView") {
            var dataJsonParams = {"betDetailIdArray":$stateParams.betDetailIdArray};
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/bet/get-voided-bets", {
                params: dataJsonParams
            }).then(function (response) {
                // this callback will be called asynchronously
                // when the response is available
                _this.voidBets = response.data;
            }, function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to retrieve bet(s).",
                    type: "error"
                });
            });
        }
    }; // End var Ctrl

    app.controller('BetController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$translate', '$filter', 'CommonService', 'Notify', Ctrl]);
}());
