'use strict';

var app = angular.module('fdPortal');

app.constant("APPCONSTANT", {
    "GLOBAL" : {
        "PAGING" : {
            "RECORDS_PER_PAGE" : 10, //Default number of records per page
            "MAX_PAGE_SIZE" : 5, //Limit the number of pages in the pagination bar
            "PAGING_BUTTONS" : [10, 15, 20, 25], //pagination perpage button
            "MAX_RECORD_SIZE" : 99999
        },
        "TRUE" : 1,
        "FALSE" : 0,
        "CUT_OFF_TIME" : "19:00:00"
    },
    "USER" : {
        "TYPE" : {
            "ADMIN" : 1,
            "MASTER" : 2,
            "AGENT" : 3,
            "PLAYER" : 4
        },
        "DETAIL" : {
            "BET_METHOD" : {
                "MULTIPLY" : 1,
                "DIVIDE" : 2
            },
            "AUTO_TRANSFER_MODE" : {
                "DAILY" : 1,
                "WEEKLY" : 2
            }
        }
    },
    "BET" : {
        "NUMBER" : {
            "OPTION": {
                "SINGLE": 1,
                "RETURN": 2,
                "BOX": 3,
                "IBOX": 4,
                "PH": 5
            }
        }
    },
    "AUTH_ITEM" : {
        "TYPE" : {
            "ROLE" : 1,
            "PERMISSION" : 2
        }
    },
    "FILE_TEMPLATE" : {
        "REPORT" : {
            "TENANT" : {
                "LAYOUT" : {
                    "GENERAL" : 1000
                },
                "PO" : {
                    "PO" : 1100
                }
            }
        }
    },
    "COMPANY" : {
        "CODE" : {
            "MAGNUM" : "M",
            "PMP" : "P",
            "TOTO" : "T",
            "SINGAPORE" : "S",
            "SABAH" : "B",
            "SANDAKAN" : "K",
            "SARAWAK" : "W",
            "GD" : "H",
        }
    },
    "PACKAGE" : {
        "RECOMMENDED_PRIZE" : {
            "4D_BIG_PRIZE_1" : 2500,
            "4D_BIG_PRIZE_2" : 1000,
            "4D_BIG_PRIZE_3" : 500,
            "4D_BIG_STARTERS" : 220,
            "4D_BIG_CONSOLATION" : 66,
            "4D_SMALL_PRIZE_1" : 3500,
            "4D_SMALL_PRIZE_2" : 2000,
            "4D_SMALL_PRIZE_3" : 1000,
            "4D_4A_PRIZE" : 6000,
            "4D_4B_PRIZE" : 6000,
            "4D_4C_PRIZE" : 6000,
            "4D_4D_PRIZE" : 600,
            "4D_4E_PRIZE" : 600,
            "4D_4F_PRIZE" : 2000,
            "3D_ABC_PRIZE_1" : 220,
            "3D_ABC_PRIZE_2" : 220,
            "3D_ABC_PRIZE_3" : 220,
            "3D_3A_PRIZE" : 660,
            "3D_3B_PRIZE" : 660,
            "3D_3C_PRIZE" : 660,
            "3D_3D_PRIZE" : 66,
            "3D_3E_PRIZE" : 66,
            "GD_4D_BIG_PRIZE_1" : 2625,
            "GD_4D_BIG_PRIZE_2" : 1050,
            "GD_4D_BIG_PRIZE_3" : 525,
            "GD_4D_BIG_STARTERS" : 210,
            "GD_4D_BIG_CONSOLATION" : 63,
            "GD_4D_SMALL_PRIZE_1" : 3675,
            "GD_4D_SMALL_PRIZE_2" : 2100,
            "GD_4D_SMALL_PRIZE_3" : 1050,
            "GD_4D_4A_PRIZE" : 6300,
            "GD_4D_4B_PRIZE" : 6300,
            "GD_4D_4C_PRIZE" : 6300,
            "GD_4D_4D_PRIZE" : 630,
            "GD_4D_4E_PRIZE" : 630,
            "GD_4D_4F_PRIZE" : 2100,
            "GD_3D_ABC_PRIZE_1" : 262.5,
            "GD_3D_ABC_PRIZE_2" : 220.5,
            "GD_3D_ABC_PRIZE_3" : 157.5,
            "GD_3D_3A_PRIZE" : 693,
            "GD_3D_3B_PRIZE" : 693,
            "GD_3D_3C_PRIZE" : 693,
            "GD_3D_3D_PRIZE" : 69.3,
            "GD_3D_3E_PRIZE" : 69.3,
            "5D_PRIZE_1" : 16500,
            "5D_PRIZE_2" : 5500,
            "5D_PRIZE_3" : 3300,
            "5D_PRIZE_4" : 550,
            "5D_PRIZE_5" : 22,
            "5D_PRIZE_6" : 5.5,
            "6D_PRIZE_1" : 110000,
            "6D_PRIZE_2" : 3300,
            "6D_PRIZE_3" : 330,
            "6D_PRIZE_4" : 33,
            "6D_PRIZE_5" : 4.4
        }
    }
});
