;

angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster']).filter('equipmentCategory', function () {
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
}).filter('fuelCategory', function () {
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
}).controller('ctrl', [
    '$scope', '$http', '$modal', 'gridpage', 'workService', '$filter', '$sce',
    function ($scope, $http, $modal, gridpage, workService, $filter, $sce) {
        var id_name = "apply_id";

        $scope.show_master_edit = false;
        $scope.edit_type = 0 /* none */;

        $scope.JumpPage = function (page) {
            $scope.NowPage = page;
            gridpage.CountPage($scope);
        };
        $scope.JumpPageKey = function () {
            gridpage.CountPage($scope);
        };
        $scope.Init_Query = function () {
            gridpage.CountPage($scope);
        };
        $scope.Detail_Init = function () {
        };
        $scope.toPdfApply = function () {
            var parm = [];
            parm.push('Y=' + $scope.sd.Y);
            parm.push('user_id=' + $scope.sd.user_id);
            parm.push('equipment_category_id=' + $scope.sd.equipment_category_id);
            parm.push('tid=' + uniqid());

            var setPath = gb_approot + 'Sys_Base/ReportToPdf/Apply?' + parm.join('&');
            $scope.ifrmeSrcPath = $sce.getTrustedResourceUrl(setPath);
        };
        $scope.toSearchApply = function () {
            var parm = {
                Y: $scope.sd.Y,
                user_id: $scope.sd.user_id,
                equipment_category_id: $scope.sd.equipment_category_id
            };
            var setPath = gb_approot + 'Sys_Base/ReportToPdf/ApplyQuery';

            $http.get(setPath, { params: parm }).success(function (data, status, headers, config) {
                $scope.gridItems = data;
            });
        };
        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.InitData = data;
        });

        $scope.setYear = workService.setApplyYearRange();
        $scope.equipment_category = commData.equipmentCategory;
        $scope.fuel_category = commData.fuelCategory;

        workService.getApplyUser().success(function (data, status, headers, config) {
            $scope.option_apply_user = data;
        }).error(function (data, status, headers, config) {
            alert('ajax error');
            console.error(data);
        });
    }]);
