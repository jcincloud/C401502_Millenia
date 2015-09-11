;

angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster']).controller('ctrl', [
    '$scope', '$http', '$modal', 'gridpage', 'workService', '$filter', '$sce',
    function ($scope, $http, $modal, gridpage, workService, $filter, $sce) {
        var id_name = "apply_id";

        var pathOpenYearPage = gb_approot + 'Sys_Base/ReportChart/OpenYearAverage?';
        var pathSearchYearUrl = gb_approot + apiGetAction + '/GetQueryYearAverage';

        function getApplyUserEquipment() {
            workService.getApplyUserEquipmentByLogin().success(function (data, status, headers, config) {
                $scope.equipment_option = data;
            }).error(function (data, status, headers, config) {
                alert('ajax error');
                console.error(data);
            });
        }
        ;

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
        $scope.openYearChart = function () {
            var parm = [];
            parm.push('equipment_id=' + $scope.sd.equipment_id);
            parm.push('user_id=0');
            parm.push('query_use_type=0');
            parm.push('tid=' + uniqid());

            var setPath = pathOpenYearPage + parm.join('&');
            window.open(setPath, 'ReportView', 'width=960,height=800,scrollbars=yes');
        };
        $scope.searchClientYear = function () {
            $http.get(pathSearchYearUrl, { params: $scope.sd }).success(function (data, status, headers, config) {
                if (data != undefined) {
                    $scope.gridItems = data;
                }
                ;
            });
        };

        $scope.setYear = workService.setApplyYearRange();
        $scope.fuel_category = commData.fuelCategory;
        $scope.query_use_type = commData.queryUseType;

        getApplyUserEquipment();

        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.InitData = data;
        });
    }]);
