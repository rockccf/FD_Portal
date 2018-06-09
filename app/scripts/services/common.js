/**
 * Common Service
 * Consists of common methods to be shared by controllers
 */

'use strict';

var app = angular.module('fdPortal');
app.factory('CommonService', ['$rootScope', '$state', '$translate', '$http', 'Upload', '$q', '$timeout', 'sweetalert2', '$document', '$window', 'SYSCONSTANT', 'APPCONSTANT',
    function ($rootScope, $state, $translate, $http, Upload, $q, $timeout, sweetalert2, $document, $window, SYSCONSTANT, APPCONSTANT) {

        var CommonService = {};

        //function to upload Image
        CommonService.uploadImage = function (imageFile, title, description,  imageType, imagePosition, imageOwnerType, imageOwnerId) {
            //imageFile - image to be uploaded
            /***
             * imageType
             * 1 : Primary Picture / Profile Picture
             * 2 : Secondary Picture / Normal Picture
             * 3 : Cover Picture
             */
            /***
             * imageOwnerType
             * 1 : Tenant Logo
             * 2 : Tenant Item
             * 3 : Tenant User Image
             * 4 : Supplier Logo
             * 5 : Supplier Item
             * 6 : Admin User Image
             */
            if (imageFile) {
                var requestData = null;
                var action = null;

                if (!imageFile.$error) {
                    requestData = {
                        imageFile: imageFile,
                        title: title,
                        description: description,
                        imageType: imageType,
                        imagePosition: imagePosition,
                        imageOwnerType: imageOwnerType,
                        imageOwnerId: imageOwnerId
                    };

                    return Upload.upload({
                        url: SYSCONSTANT.BACKEND_SERVER_URL + "/image",
                        method: 'POST',
                        data: requestData
                    }).progress(function (evt) {

                    }).success(function (data, status, headers, config) {

                    }).error(function (data, status, headers, config) {

                    });
                }
            }
        };

        CommonService.uploadDocument = function (fileObject, title, description, expiryDate, documentType, ownerType, ownerId) {
            /***
             * ownerType : refer constant.js DOCUMENT.OWNER_TYPE
             */
            if (fileObject) {
                var requestData = null;
                var action = null;

                if (!fileObject.$error) {
                    if (expiryDate) {
                        requestData = {
                            fileObject: fileObject,
                            title: title,
                            description: description,
                            type: documentType,
                            expiryDate: expiryDate,
                            ownerType: ownerType,
                            ownerId: ownerId
                        };
                    } else {
                        requestData = {
                            fileObject: fileObject,
                            title: title,
                            description: description,
                            type: documentType,
                            ownerType: ownerType,
                            ownerId: ownerId
                        };
                    }

                    return Upload.upload({
                        url: SYSCONSTANT.BACKEND_SERVER_URL + "/document",
                        method: 'POST',
                        data: requestData
                    }).progress(function (evt) {

                    }).success(function (data, status, headers, config) {

                    }).error(function (data, status, headers, config) {

                    });
                }
            }
        };

        CommonService.downloadDocument = function(documentId, fileType) {
            var fileParams = {};
            var mimeType = null;

            fileParams.documentId = documentId;

            switch (fileType) {
                case "xls":
                case "xlsx":
                    mimeType = "application/vnd.ms-excel";
                    break;
                case "png":
                    mimeType = "image/png";
                    break;
                case "jpg":
                case "jpeg":
                    mimeType = "image/jpeg";
                    break;
                case "gif":
                    mimeType = "image/gif";
                    break;
                case "doc":
                    mimeType = "application/msword";
                    break;
                case "pdf":
                    mimeType = "application/pdf";
                    break;
            }

            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL+"/document/download",{
                responseType: "arraybuffer",
                params:fileParams
            }).then(function(response) {
                // Get the headers
                var headers = response.headers();
                var file = new Blob([response.data], {type: mimeType});
                var filename = headers['x-filename'];

                CommonService.downloadFile(file,filename);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                CommonService.SweetAlert({
                    title: "Error",
                    text: "Failed to download document.",
                    type: "error"
                });
            });
        };

        CommonService.getRequestParamsObj = function(where, search, sort, tableFilterColumns, currentPageNo, recordsPerPage) {
            var dataJsonParams = {
                "where": {},
                "filter" : {},
                "sort" : {},
                "pagination" : [{"page":currentPageNo,"per-page":recordsPerPage}]
            };

            if (where != null) {
                dataJsonParams["where"] = where;
            }

            var filterKeys = null;
            var filterValue = null;
            var filterAttribute = null;
            var filterType = null;
            var filterModel = null;
            var filterIsChild = null;
            var filterFlag = false;
            var valueType = null;
            var valueObject = null;

            //User has entered the filter
            if (search.predicateObject && Object.keys(search.predicateObject).length > 0) {
                filterKeys = Object.keys(search.predicateObject);
                for (var i = 0; i < filterKeys.length; i++) {
                    filterFlag = false;
                    filterValue = search.predicateObject[filterKeys[i]];
                    valueType = typeof filterValue;
                    for (var k in tableFilterColumns) {
                        if (filterKeys[i] == Object.keys(tableFilterColumns[k])) {
                            filterAttribute = tableFilterColumns[k][filterKeys[i]]["attribute"];
                            filterType = tableFilterColumns[k][filterKeys[i]]["operator"];
                            //For child object, the model is not the actual model class name in the backend Yii framework
                            //It's actually the property name defined under the model for the relationship
                            filterModel = tableFilterColumns[k][filterKeys[i]]["model"];
                            filterIsChild = tableFilterColumns[k][filterKeys[i]]["isChild"];
                            //Because (!filterValue) will evaluate empty string as false also
                            //Hence we need to check the value type to determine the value
                            //For example, active column (refer to activeFilters object)
                            //All - False, No - False, Yes - True (All and No will also be evaluated as false)
                            if (filterValue) {
                                valueObject = {"attribute": filterAttribute, "operator": filterType, "value" : filterValue, "model":filterModel, "isChild":filterIsChild};
                                filterFlag = true;
                            }
                            break;
                        }
                    }

                    if (filterFlag) {
                        dataJsonParams["filter"][i] = valueObject;
                    }
                }
            }

            var sortObject = {};
            var sortAttribute = null;
            var sortOrder = null;
            var sortModel = null;
            var sortIsChild = null;
            var sortFlag = false;
            //If sorting applied, add sort params to the dataJsonParams object
            if (sort.predicate) {
                if (sort.predicate.constructor === Array) { //Array, meaning sorting by more than 1 columns
                    for (var s = 0; s < sort.predicate.length; s++) {
                        sortFlag = false;
                        for (var i in tableFilterColumns) {
                            if (sort.predicate[s] == Object.keys(tableFilterColumns[i])) {
                                sortFlag = true;
                                sortAttribute = tableFilterColumns[i][sort.predicate[s]].attribute;
                                sortModel = tableFilterColumns[i][sort.predicate[s]].model;
                                sortIsChild = tableFilterColumns[i][sort.predicate[s]].isChild;
                                if (sort.reverse) { //Descending Order
                                    sortOrder = "SORT_DESC";
                                } else {
                                    sortOrder = "SORT_ASC";
                                }

                                sortObject = {"attribute": sortAttribute, "order": sortOrder, "model":sortModel, "isChild":sortIsChild};
                                break;
                            }
                        }

                        if (sortFlag) {
                            dataJsonParams["sort"][s] = sortObject;
                        }
                    }
                } else { //String, meaning sorting by 1 column only
                    for (var i in tableFilterColumns) {
                        if (sort.predicate == Object.keys(tableFilterColumns[i])) {
                            sortFlag = true;
                            sortAttribute = tableFilterColumns[i][sort.predicate].attribute;
                            sortModel = tableFilterColumns[i][sort.predicate].model;
                            sortIsChild = tableFilterColumns[i][sort.predicate].isChild;
                            if (sort.reverse) { //Descending Order
                                sortOrder = "SORT_DESC";
                            } else {
                                sortOrder = "SORT_ASC";
                            }

                            sortObject = {"attribute": sortAttribute, "order": sortOrder, "model":sortModel, "isChild":sortIsChild};
                            break;
                        }
                    }
                    if (sortFlag) {
                        dataJsonParams["sort"][0] = sortObject;
                    }
                }
            }

            return dataJsonParams;
        };

        CommonService.translateText = function(text) {
            return $translate(text).then(function (translatedText) {
                return translatedText;
            }, function (translationId) {
                return translationId;
            });
        };

        CommonService.addAlertMessage = function(type, message) {
            $rootScope.alertMessages.push({type:type, message: message});
        };

        CommonService.clearAlertMessage = function() {
            $rootScope.alertMessages = [];
        };

        CommonService.SweetAlert = sweetalert2;

        CommonService.handleSuccessResponse = function(message,goToState,goToStateParams) {
            CommonService.SweetAlert({
                title: "Success",
                text: message,
                type: "success",
            }).then(function() {
                if (goToState) {
                    $state.go(goToState, goToStateParams, {"reload":goToState});
                }
            });
        };

        CommonService.handlePrintFileResponse = function(response,mimeType,message) {
            if (message == null) {
                message = "No record found.";
            }
            //No record found for the report/document
            if (response.status == 204) {
                CommonService.SweetAlert({
                    title: "Warning",
                    text: message,
                    type: "warning",
                });
            } else {
                var headers = response.headers();
                var file = new Blob([response.data],{type:mimeType});
                var filename = headers['x-filename'];

                CommonService.downloadFile(file,filename);
            }
        };

        CommonService.handleErrorResponse = function(message,response) {
            CommonService.SweetAlert({
                title: "Error",
                text: message,
                type: "error"
            }).then(function () {
                $timeout(function () {
                    var status = response.status;
                    if (status == 422) { //Validation error
                        if (response.data.constructor === Array) {
                            angular.forEach(response.data, function (value, key) {
                                CommonService.addAlertMessage('danger',value.message);
                            });
                        } else {
                            CommonService.addAlertMessage('danger',response.data.message);
                        }
                    } else if (status == 409) { //Reousce conflict, mostly the resources are not allowed to be deleted due to some constraint
                        CommonService.addAlertMessage('danger',response.data.message);
                    } else if (status == 500) {
                        if (response.data.code == 23000) {
                            if (response.data["error-info"] && response.data["error-info"][1] == 1451) {
                                CommonService.translateText("global.dbError.1451").then(function (message) {
                                    CommonService.addAlertMessage('danger',message);
                                });
                            } else {
                                CommonService.translateText("global.error."+status).then(function (message) {
                                    CommonService.addAlertMessage('danger',message);
                                });
                            }
                        } else {
                            CommonService.translateText("global.error."+status).then(function (message) {
                                CommonService.addAlertMessage('danger',message);
                            });
                        }
                    } else { //Other Error
                        CommonService.translateText("global.error."+status).then(function (message) {
                            CommonService.addAlertMessage('danger',message);
                        });
                    }

                    var mainDiv = angular.element(document.getElementById('mainDiv'));
                    $document.scrollToElementAnimated(mainDiv);
                });
            });
        };

        CommonService.getRoles = function(type) {
            var result = [];
            var dataJsonParams = {"where":{"type":type}};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "description", "order": "SORT_ASC", "model":"auth_item", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            //get User Role Data
            return $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/auth-item",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.description});
                    });
                }
                return result;
            });
        };

        CommonService.getDepartments = function (active) {
            var result = [];
            var dataJsonParams = {};
            if (active != null) {
                dataJsonParams = {"where":{"active":active}};
            }
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "name", "order": "SORT_ASC", "model":"department", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            //get User Department Data
            return $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/department",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.name});
                    });
                }
                return result;
            });
        };

        CommonService.getTaxes = function(countryId) {
            var result = [];
            if (!countryId) {
                countryId = $rootScope.userIdentity.countryId;
            }
            var dataJsonParams = {"where":{"countryId":countryId}};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/tax",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.name, "code": value.code, "rate": value.rate});
                    });
                }
                return result;
            });
        };

        CommonService.getCurrencies = function() {
            var result = [];
            var dataJsonParams = {};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/currency", {
                params: dataJsonParams
            }).then(function (response) {
                    if (response.data && response.data.items && response.data.items.length > 0) {
                        angular.forEach(response.data.items, function (value, key) {
                            result.push({"id": value.id, "name": value.code});
                        });
                    }
                    return result;
                });
        };

        CommonService.getIndustries = function() {
            var result = [];
            var dataJsonParams = {};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/industry", {
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.name});
                    });
                }
                return result;
            });
        };

        CommonService.getCities = function(stateId) {
            var result = [];
            var dataJsonParams = {"where":{"stateId":stateId}};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "name", "order": "SORT_ASC", "model":"city", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/city",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.name});
                    });
                }
                return result;
            });
        };

        CommonService.getStates = function(countryId) {
            var result = [];
            var dataJsonParams = {"where":{"countryId":countryId}};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "name", "order": "SORT_ASC", "model":"state", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/state",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.name});
                    });
                }
                return result;
            });
        };

        CommonService.getCountries = function() {
            var result = [];
            var dataJsonParams = {};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "name", "order": "SORT_ASC", "model":"country", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/country", {
                params: dataJsonParams
            }).then(function (response) {
                    if (response.data && response.data.items && response.data.items.length > 0) {
                        angular.forEach(response.data.items, function (value, key) {
                            result.push({"id": value.id, "name": value.name});
                        });
                    }
                    return result;
                });
        };

        CommonService.getUoms = function(type) {
            var result = [];
            var dataJsonParams = {};
            if (type) {
                dataJsonParams = {"where":{"type":type}};
            }
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "name", "order": "SORT_ASC", "model":"uom", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/uom",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.symbol, "visible":true, "type":value.type});
                    });
                }
                return result;
            });
        };

        CommonService.getUomFormulas = function(uomId) {
            var result = [];
            var dataJsonParams = {};
            if (uomId) {
                dataJsonParams = {"where":{"uomId":uomId}};
            }
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/uom-formula",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.name, "formula":value.formula, "formulaText":value.formulaText});
                    });
                }
                return result;
            });
        };

        CommonService.getCategories = function() {
            var result = [];
            var dataJsonParams = {};
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "name", "order": "SORT_ASC", "model":"category", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/category", {
                params: dataJsonParams
            }).then(function (response) {
                    if (response.data && response.data.items && response.data.items.length > 0) {
                        angular.forEach(response.data.items, function (value, key) {
                            result.push({"id": value.id, "name": value.name, "tenderType" : value.tenderType, "disabled" : false});
                        });
                    }
                    return result;
                });
        };

        CommonService.getSubcategories = function(categoryId) {
            var result = [];
            var dataJsonParams = {};
            if (categoryId) {
                dataJsonParams = {"where":{"categoryId":categoryId}};
            }
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            var sortObject = {"attribute": "name", "order": "SORT_ASC", "model":"subcategory", "isChild":false};
            dataJsonParams["sort"] = {};
            dataJsonParams["sort"][0] = sortObject;
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/subcategory",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.name});
                    });
                }
                return result;
            });
        };

        CommonService.getDocuments = function(type,ownerType,ownerId) {
            var result = [];
            var dataJsonParams = {};
            dataJsonParams["where"] = {};
            if (type) {
                dataJsonParams["where"]["type"] = type;
            }
            if (ownerType) {
                dataJsonParams["where"]["ownerType"] = ownerType;
            }
            if (ownerId) {
                dataJsonParams["where"]["ownerId"] = ownerId;
            }
            //Get all records back from the backend, otherwise it will be default to 10 records.
            dataJsonParams["pagination"] = {"page":1,"per-page":APPCONSTANT.GLOBAL.PAGING.MAX_RECORD_SIZE};
            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/document",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"id": value.id, "name": value.title, "fileName": value.fileName});
                    });
                }
                return result;
            });
        };

        CommonService.getPendingApprovalProcesses = function(userId, processType) {
            //type - 1 - PR ; 2 - PO (Normal and Standalone) ; 3 - Acknowledge Tender ; 4 - Approve Tender ;
            var result = [];
            var dataJsonParams = {};
            if (!userId) {
                userId = $rootScope.userIdentity.id;
            }

            if (processType == $rootScope.APPCONSTANT.WORKFLOW.TYPE.APPROVE_PO) {
                //Get both types of PO
                processType = [$rootScope.APPCONSTANT.WORKFLOW.TYPE.APPROVE_PO,$rootScope.APPCONSTANT.WORKFLOW.TYPE.APPROVE_STANDALONE_PO];
            }

            dataJsonParams = {"where":{"process_workflow.processType":processType,"process_workflow.status":APPCONSTANT.PROCESS_WORKFLOW.STATUS.NEW}};

            var userIdFilterObject = {"attribute": "userId", "operator": "equals", "value" : userId, "model":"processWorkflowPaths", "isChild":true};
            var actionFilterObject = {"attribute": "action", "operator": "equals", "value" : null, "model":"processWorkflowPaths", "isChild":true};
            var levelFilterObject = {"attribute": "level", "operator": "join", "value" : "process_workflow.currentLevel", "model":"processWorkflowPaths", "isChild":true};
            dataJsonParams["filter"] = {};
            dataJsonParams["filter"]["userId"] = userIdFilterObject;
            dataJsonParams["filter"]["action"] = actionFilterObject;
            dataJsonParams["filter"]["level"] = levelFilterObject;

            if (processType == $rootScope.APPCONSTANT.WORKFLOW.TYPE.ACKNOWLEDGE_TENDER) {
                var tenderStatusFilterObject = {"attribute": "status", "operator": "equals", "value" : $rootScope.APPCONSTANT.TENDER.STATUS.CLOSED, "model":"tender", "isChild":true};
                dataJsonParams["filter"]["status"] = tenderStatusFilterObject;
            } else if (processType == $rootScope.APPCONSTANT.WORKFLOW.TYPE.APPROVE_TENDER) {
                var tenderStatusFilterObject = {"attribute": "status", "operator": "equals", "value" : $rootScope.APPCONSTANT.TENDER.STATUS.SUBMITTED, "model":"tender", "isChild":true};
                dataJsonParams["filter"]["status"] = tenderStatusFilterObject;
            }

            return $http.get(SYSCONSTANT.BACKEND_SERVER_URL + "/process-workflow",{
                params: dataJsonParams
            }).then(function (response) {
                if (response.data && response.data.items && response.data.items.length > 0) {
                    angular.forEach(response.data.items, function (value, key) {
                        result.push({"processId": value.processId, "processType": value.processType});
                    });
                }
                return result;
            });

            /*var dataJsonParams = CommonService.getRequestParamsObj({"purchase_order.status":$rootScope.APPCONSTANT.PO.STATUS.SUBMITTED}, search, sort, _this.tableFilterColumns, _this.currentPageNo, _this.recordsPerPage);
            dataJsonParams["processType"] = processType;

            //Proceed to retrieve the data with pagination settings
            $http.get($rootScope.SYSCONSTANT.BACKEND_SERVER_URL + "/process-workflow/get-pending-process-list", {
                params: dataJsonParams
            }).then(function (response) {

            });*/
        };

        CommonService.downloadFile = function (file,filename){
            //trick to download store a file having its URL
            var fileURL = URL.createObjectURL(file);
            var a = document.createElement('a');
            a.href = fileURL;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
        };

        //Compare the value against the object (array most of the time) and return the translated text
        CommonService.getText = function(value, objectToCompare){
            var translationId = null;

            for (var i in objectToCompare) {
                if (objectToCompare[i].id == value) {
                    translationId = objectToCompare[i].name;
                    break;
                }
            }

            if (!translationId) {
                return '-';
            } else {
                return CommonService.translateText(translationId);
            }
        };

        return CommonService;

    }]);
