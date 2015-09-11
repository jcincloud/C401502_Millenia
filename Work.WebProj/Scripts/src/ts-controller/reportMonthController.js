;

angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster']).controller('ctrl', [
    '$scope', '$http', '$modal', 'gridpage', 'workService', '$filter', '$sce',
    function ($scope, $http, $modal, gridpage, workService, $filter, $sce) {
        var id_name = "apply_id";

        function getApplyUserEquipment(user_id) {
            workService.getApplyUserEquipment(user_id).success(function (data, status, headers, config) {
                $scope.equipment_option = data;
            }).error(function (data, status, headers, config) {
                alert('ajax error');
                console.error(data);
            });
        }
        ;

        $scope.$watch('sd.user_id', function (newValue, oldValue) {
            if (newValue != undefined) {
                getApplyUserEquipment(newValue);
            }
            ;
        });

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
        $scope.toOpenMonthPage = function () {
            var parm = [];
            parm.push('Y=' + $scope.sd.Y);
            parm.push('user_id=' + $scope.sd.user_id);
            parm.push('equipment_id=' + $scope.sd.equipment_id);
            parm.push('query_use_type=' + $scope.sd.query_use_type);
            parm.push('tid=' + uniqid());

            var setPath = gb_approot + 'Sys_Base/ReportChart/OpenMonthAverage?' + parm.join('&');
            window.open(setPath, 'ReportView', 'width=900,height=800,scrollbars=yes');
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

        $scope.setYear = workService.setApplyYearRange();
        $scope.fuel_category = commData.fuelCategory;
        $scope.query_use_type = commData.queryUseType;

        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.InitData = data;
        });

        workService.getApplyUser().success(function (data, status, headers, config) {
            $scope.option_apply_user = data;
        }).error(function (data, status, headers, config) {
            alert('ajax error');
            console.error(data);
        });
    }]);
