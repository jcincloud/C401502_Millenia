;

angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster', 'angularFileUpload']).filter('category', function () {
    return function (input, data) {
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
    };
}).controller('ctrl', [
    '$scope', '$http', '$sce', '$upload',
    function ($scope, $http, $sce, $upload) {
        var excelEquipmentDownloadPath = gb_approot + 'Sys_Active/ExcelHandle/aj_excelEquipmentDown?tid=';
        var excelEquipmentUploadPath = gb_approot + 'Sys_Active/ExcelHandle/aj_excelEquipmentUpload?tid=';
        var excelEquipmentDeletePath = gb_approot + 'Sys_Active/ExcelHandle/aj_excelEquipmentDelete?tid=';

        $scope.excelEquipmentDownLoad = function () {
            var setPath = excelEquipmentDownloadPath + uniqid();
            $scope.ifrmeSrcPath = $sce.getTrustedResourceUrl(setPath);
        };
        $scope.onExcelEquipmentFileSelect = function ($files) {
            console.log($files);
            if ($files.length == 0)
                return;

            var getName = $files[0].name;
            var getSize = $files[0].size;
            var getType = $files[0].type;
            var limitSize = 100 * 1024 * 1024;
            var limitType = ['application/vnd.ms-excel'];

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

            $scope.getFileInfo = {
                fileName: getName,
                fileSize: getSize
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
                }).progress(function (evt) {
                    $scope.uploadProgress = {
                        snedSize: evt.loaded,
                        snedPresent: 100.0 * evt.loaded / evt.total
                    };
                }).success(function (data, status, headers, config) {
                    if (data.result) {
                        $scope.inputEquipmentFileValue = [];
                        $scope.getEquipmentData();
                        alert('作業完成!');
                    } else {
                        alert(data.message);
                    }
                    $scope.isSelect = false;
                    $scope.isUpload = false;
                });
            }
        };
        $scope.excelEquipmentDelete = function () {
            if (confirm("確定全部刪除?")) {
                $http.post(excelEquipmentDeletePath + uniqid(), {}).success(function (data, status, headers, config) {
                    if (data.result) {
                        alert('全部刪除完成!');
                    } else {
                        alert(data.message);
                    }
                });
            }
            ;
        };
        $scope.getEquipmentData = function () {
            $http.get(gb_approot + 'api/equipment', { params: {} }).success(function (data, status, headers, config) {
                $scope.gridItems = data.rows;
            });
        };

        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.InitData = data;
        });

        $scope.getEquipmentData();
        $scope.lastUploadTime = new Date();
        $scope.countUpload = 5;
    }]);
