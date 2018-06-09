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
        "FALSE" : 0
    },
    "USER" : {
        "TYPE" : {
            "ADMIN" : 1,
            "MASTER" : 2,
            "AGENT" : 3,
            "PLAYER" : 4
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
    }
});
