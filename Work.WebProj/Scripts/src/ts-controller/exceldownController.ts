interface IExcelHandle extends IMakeScopeBase {

    ifrmeSrcPath: string;

    excelEquipmentDownLoad(): void;
    onExcelEquipmentFileSelect(f: File[]): void;
    excelEquipmentUpload(): void;
    selectEquipmentExcelFiles: File[];
    inputEquipmentFileValue: string[];
    excelEquipmentDelete(): void;
    gridEquipment: server.Equipment[];

    excelApplyDownLoad(): void;
    onExcelApplyFileSelect(f: File[]): void;
    excelApplyUpload(): void;
    selectApplyExcelFiles: File[];
    inputApplyFileValue: string[];
    getEquipmentData(): void;

    excelMonthDownLoad(): void;
    onExcelMonthFileSelect(f: File[]): void;
    excelMonthUpload(): void;
    selectMonthExcelFiles: File[];
    inputMonthFileValue: string[];
    getMonthUploadData(): void;

    getFileInfo: {};
    uploadProgress: {};
    fileUpload: any;
    isSelect: boolean;
    isUpload: boolean;

    lastUploadTime: Date;
    countUpload: number;
    gridItems: server.Apply_MonthUnit[];
};

angular
    .module('angularApp', ['commfun', 'ui.bootstrap', 'toaster', 'angularFileUpload'])
    .filter('category', function () {
        return function (input, data: server.Equipment_Category[]) {
            var r = input;
            if (data) {
                for (var i in data) {
                    if (input == data[i].equipment_category_id) {
                        r = data[i].category_name;
                        break;
                    }
                }
            }
            return r;
        }
    })
    .controller('ctrl', ['$scope', '$http', '$sce', '$upload',
        function ($scope: IExcelHandle, $http: ng.IHttpService, $sce: ng.ISCEService, $upload: ng.angularFileUpload.IUploadService) {

            var excelEquipmentDownloadPath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelEquipmentDown?tid=';
            var excelEquipmentUploadPath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelEquipmentUpload?tid=';
            var excelEquipmentDeletePath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelEquipmentDelete?tid=';

            var excelApplyDownloadPath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelApplyDown?tid=';
            var excelApplyUploadPath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelApplyUpload?tid=';
            var excelApplyDeletePath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelApplyDelete?tid=';

            var queryMonthDataState: string = gb_approot + apiGetAction + '/GetCheckMonthAverage';
            var excelMonthDownloadPath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelMonthDown?tid=';
            var excelMonthUploadPath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelMonthUpload?tid=';
            var excelMonthDeletePath: string = gb_approot + 'Sys_Active/ExcelHandle/aj_excelMonthDelete?tid=';

            $scope.excelEquipmentDownLoad = function () {
                var setPath = excelEquipmentDownloadPath + uniqid();
                $scope.ifrmeSrcPath = $sce.getTrustedResourceUrl(setPath);
            };
            $scope.onExcelEquipmentFileSelect = function ($files) {

                console.log($files);
                if ($files.length == 0)
                    return;

                var getName: string = $files[0].name;
                var getSize: number = $files[0].size;
                var getType: string = $files[0].type;
                var limitSize: number = 100 * 1024 * 1024;
                var limitType: string[] = ['application/vnd.ms-excel'];

                if (getSize > limitSize) {

                    console.log(getSize, limitSize);

                    alert('檔案超過大小，限制' + limitSize + 'MB以內。');
                    return false;
                }

                if (limitType.indexOf(getType) < 0) {
                    alert('檔案格式不符，請選取Excel檔(Office 2007以上格式版本 .xlsx)。');
                    return false;
                }

                $scope.isSelect = true;

                $scope.getFileInfo =
                {
                    fileName: getName,
                    fileSize: getSize //Math.floor(getSize / (1024 * 1024))
                };
                $scope.selectEquipmentExcelFiles = $files;
            };
            $scope.excelEquipmentUpload = function () {

                if (!$scope.isSelect) {
                    alert('尚未選擇檔案');
                    return;
                }

                var getFiles = $scope.selectEquipmentExcelFiles;
                $scope.isUpload = true;
                for (var i = 0; i < getFiles.length; i++) {
                    var file = getFiles[i];
                    var headerKeyValue = {};
                    $scope.fileUpload = $upload.upload({
                        url: excelEquipmentUploadPath + uniqid(),
                        method: 'POST',
                        data: headerKeyValue,
                        file: file
                    }).progress(function (evt: any) {
                            $scope.uploadProgress = {
                                snedSize: evt.loaded, //已傳送Byte
                                snedPresent: 100.0 * evt.loaded / evt.total //已傳送百分比
                            };
                        }).success(function (data: IResultBase, status, headers, config) {
                            if (data.result) {
                                $scope.inputEquipmentFileValue = [];
                                $scope.getEquipmentData();
                                alert('作業完成!')
                            }
                            else {
                                alert(data.message);
                            }
                            $scope.isSelect = false;
                            $scope.isUpload = false;
                        });
                }
            };
            $scope.excelEquipmentDelete = function () {
                if (confirm("確定全部刪除?")) {
                    $http.post(excelEquipmentDeletePath + uniqid(), {})
                        .success(function (data: IResultBase, status, headers, config) {
                            if (data.result) {
                                alert('全部刪除完成!');
                            } else {
                                alert(data.message);
                            }
                        });
                };
            };
            $scope.getEquipmentData = function () {
                $http.get(gb_approot + 'api/equipment', { params: {} })
                    .success(function (data: any, status, headers, config) {
                        $scope.gridEquipment = data.rows;
                    });
            };

            $scope.excelApplyDownLoad = function () {
                var setPath = excelApplyDownloadPath + uniqid();
                $scope.ifrmeSrcPath = $sce.getTrustedResourceUrl(setPath);
            };
            $scope.onExcelApplyFileSelect = function ($files) {

                console.log($files);
                if ($files.length == 0)
                    return;

                var getName: string = $files[0].name;
                var getSize: number = $files[0].size;
                var getType: string = $files[0].type;
                var limitSize: number = 100 * 1024 * 1024;
                var limitType: string[] = ['application/vnd.ms-excel'];

                if (getSize > limitSize) {

                    console.log(getSize, limitSize);

                    alert('檔案超過大小，限制' + limitSize + 'MB以內。');
                    return false;
                }

                if (limitType.indexOf(getType) < 0) {
                    alert('檔案格式不符，請選取Excel檔(Office 2007以上格式版本 .xlsx)。');
                    return false;
                }

                $scope.isSelect = true;

                $scope.getFileInfo =
                {
                    fileName: getName,
                    fileSize: getSize //Math.floor(getSize / (1024 * 1024))
                };
                $scope.selectApplyExcelFiles = $files;
            };
            $scope.excelApplyUpload = function () {

                if (!$scope.isSelect) {
                    alert('尚未選擇檔案');
                    return;
                }

                var getFiles = $scope.selectApplyExcelFiles;
                $scope.isUpload = true;
                for (var i = 0; i < getFiles.length; i++) {
                    var file = getFiles[i];
                    var headerKeyValue = {};
                    $scope.fileUpload = $upload.upload({
                        url: excelApplyUploadPath + uniqid(),
                        method: 'POST',
                        data: headerKeyValue,
                        file: file
                    }).progress(function (evt: any) {
                            $scope.uploadProgress = {
                                snedSize: evt.loaded, //已傳送Byte
                                snedPresent: 100.0 * evt.loaded / evt.total //已傳送百分比
                            };
                        }).success(function (data: IResultBase, status, headers, config) {
                            if (data.result) {
                                $scope.inputApplyFileValue = [];
                                alert('作業完成!')
                            }
                            else {
                                alert(data.message);
                            }
                            $scope.isSelect = false;
                            $scope.isUpload = false;
                        });
                }
            };

            $scope.excelMonthDownLoad = function () {
                var setPath = excelMonthDownloadPath + uniqid();
                $scope.ifrmeSrcPath = $sce.getTrustedResourceUrl(setPath);
            };
            $scope.onExcelMonthFileSelect = function ($files) {

                console.log($files);
                if ($files.length == 0)
                    return;

                var getName: string = $files[0].name;
                var getSize: number = $files[0].size;
                var getType: string = $files[0].type;
                var limitSize: number = 100 * 1024 * 1024;
                var limitType: string[] = ['application/vnd.ms-excel'];

                if (getSize > limitSize) {

                    console.log(getSize, limitSize);

                    alert('檔案超過大小，限制' + limitSize + 'MB以內。');
                    return false;
                }

                if (limitType.indexOf(getType) < 0) {
                    alert('檔案格式不符，請選取Excel檔(Office 2007以上格式版本 .xlsx)。');
                    return false;
                }

                $scope.isSelect = true;

                $scope.getFileInfo =
                {
                    fileName: getName,
                    fileSize: getSize //Math.floor(getSize / (1024 * 1024))
                };
                $scope.selectMonthExcelFiles = $files;
            };
            $scope.excelMonthUpload = function () {

                if (!$scope.isSelect) {
                    alert('尚未選擇檔案');
                    return;
                }

                var getFiles = $scope.selectMonthExcelFiles;
                $scope.isUpload = true;
                for (var i = 0; i < getFiles.length; i++) {
                    var file = getFiles[i];
                    var headerKeyValue = {};
                    $scope.fileUpload = $upload.upload({
                        url: excelMonthUploadPath + uniqid(),
                        method: 'POST',
                        data: headerKeyValue,
                        file: file
                    }).progress(function (evt: any) {
                            $scope.uploadProgress = {
                                snedSize: evt.loaded, //已傳送Byte
                                snedPresent: 100.0 * evt.loaded / evt.total //已傳送百分比
                            };
                        }).success(function (data: IResultBase, status, headers, config) {
                            if (data.result) {
                                $scope.inputMonthFileValue = [];
                                alert('作業完成!')
                            }
                            else {
                                alert(data.message);
                            }
                            $scope.isSelect = false;
                            $scope.isUpload = false;
                        });
                }
            };
            $scope.getMonthUploadData = function () {
                $http.get(queryMonthDataState, { params: {} })
                    .success(function (data:IResultData<server.Apply_MonthAverage>, status, headers, config) {
                        if (data.hasData) {

                            var collectItem: server.Apply_MonthUnit[] = [];
                            collectItem.push({ month: 1, temperature: data.data.temperature_01, oxygen_concentration: data.data.oxygen_concentration_01 });
                            collectItem.push({ month: 2, temperature: data.data.temperature_02, oxygen_concentration: data.data.oxygen_concentration_02 });
                            collectItem.push({ month: 3, temperature: data.data.temperature_03, oxygen_concentration: data.data.oxygen_concentration_03 });
                            collectItem.push({ month: 4, temperature: data.data.temperature_04, oxygen_concentration: data.data.oxygen_concentration_04 });
                            collectItem.push({ month: 5, temperature: data.data.temperature_05, oxygen_concentration: data.data.oxygen_concentration_05 });
                            collectItem.push({ month: 6, temperature: data.data.temperature_06, oxygen_concentration: data.data.oxygen_concentration_06 });
                            collectItem.push({ month: 7, temperature: data.data.temperature_07, oxygen_concentration: data.data.oxygen_concentration_07 });
                            collectItem.push({ month: 8, temperature: data.data.temperature_08, oxygen_concentration: data.data.oxygen_concentration_08 });
                            collectItem.push({ month: 9, temperature: data.data.temperature_09, oxygen_concentration: data.data.oxygen_concentration_09 });
                            collectItem.push({ month: 10, temperature: data.data.temperature_10, oxygen_concentration: data.data.oxygen_concentration_10 });
                            collectItem.push({ month: 11, temperature: data.data.temperature_11, oxygen_concentration: data.data.oxygen_concentration_11 });
                            collectItem.push({ month: 12, temperature: data.data.temperature_12, oxygen_concentration: data.data.oxygen_concentration_12 });
                            $scope.gridItems = collectItem;
                        } else {
                            alert(data.message);
                        }
                    });
            };

            $http.post(aj_Init, {})
                .success(function (data, status, headers, config) {
                    //options_equipment_category
                    $scope.InitData = data;
                });

            $scope.getEquipmentData();
            $scope.getMonthUploadData();
            $scope.lastUploadTime = new Date();
            $scope.countUpload = 5;
        }]);
