;

angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster', 'angularFileUpload']).filter('category', function () {
    return function (input, data) {
        var r = input;
        if (data) {
            for (var i in data) {
                if (input == data[i].code) {
                    r = data[i].value;
                    break;
                }
            }
        }
        return r;
    };
}).filter('gender', function () {
    return function (input) {
        var r = input;
        if (input) {
            return '男';
        } else {
            return '女';
        }
    };
}).controller('ctrl', [
    '$scope', '$http', '$sce', '$upload',
    function ($scope, $http, $sce, $upload) {
        var queryApplyDataState = gb_approot + apiGetAction + '/GetCheckApply';
        var excelApplyDownloadPath = gb_approot + 'Sys_Active/ExcelHandle/aj_excelApplyDown?tid=';
        var excelApplyUploadPath = gb_approot + 'Sys_Active/ExcelHandle/aj_excelApplyUpload?tid=';
        var excelApplyDeletePath = gb_approot + 'Sys_Active/ExcelHandle/aj_excelApplyDelete?tid=';
        $scope.excelApplyDownLoad = function () {
            var setPath = excelApplyDownloadPath + uniqid();
            $scope.ifrmeSrcPath = $sce.getTrustedResourceUrl(setPath);
        };
        $scope.onExcelApplyFileSelect = function ($files) {
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
                }).progress(function (evt) {
                    $scope.uploadProgress = {
                        snedSize: evt.loaded,
                        snedPresent: 100.0 * evt.loaded / evt.total
                    };
                }).success(function (data, status, headers, config) {
                    if (data.result) {
                        $scope.inputApplyFileValue = [];
                        getApplyUploadData();
                        alert('作業完成!');
                    } else {
                        alert(data.message);
                    }
                    $scope.isSelect = false;
                    $scope.isUpload = false;
                });
            }
        };

        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.InitData = data;
        });

        function getApplyUploadData() {
            $http.get(queryApplyDataState, { params: {} }).success(function (data, status, headers, config) {
                if (data.hasData) {
                    console.log(data.data.doc_tel);
                    $scope.fd = data.data;
                } else {
                    alert(data.message);
                }
                $scope.hasData = data.hasData;
            });
        }
        ;

        $scope.fuelCategory = commData.fuelCategory;
        $scope.lastUploadTime = new Date();
        $scope.countUpload = 5;
        getApplyUploadData();
    }]);
