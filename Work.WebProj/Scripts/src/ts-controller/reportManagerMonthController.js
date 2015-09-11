;

angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster']).controller('ctrl', [
    '$scope', '$http', '$modal', 'gridpage', 'workService', '$filter', '$sce',
    function ($scope, $http, $modal, gridpage, workService, $filter, $sce) {
        var id_name = "apply_id";
        var pathOpenMonthPage = gb_approot + 'Sys_Base/ReportChart/OpenMonthAverage?';
        var pathSearchMonthUrl = gb_approot + apiGetAction + '/GetQueryMonthAverage';

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
        $scope.openMonthChart = function () {
            var parm = [];
            parm.push('Y=' + $scope.sd.Y);
            parm.push('user_id=' + $scope.sd.user_id);
            parm.push('equipment_id=' + $scope.sd.equipment_id);
            parm.push('query_use_type=' + $scope.sd.query_use_type);
            parm.push('tid=' + uniqid());

            var setPath = pathOpenMonthPage + parm.join('&');
            window.open(setPath, 'ReportView', 'width=960,height=800,scrollbars=yes');
        };
        $scope.searchManagerMonth = function () {
            $http.get(pathSearchMonthUrl, { params: $scope.sd }).success(function (data, status, headers, config) {
                if (data != undefined) {
                    console.log('get data', data);
                    var collectItem = [];
                    collectItem.push({ month: 1, temperature: data.temperature_01, oxygen_concentration: data.oxygen_concentration_01 });
                    collectItem.push({ month: 2, temperature: data.temperature_02, oxygen_concentration: data.oxygen_concentration_02 });
                    collectItem.push({ month: 3, temperature: data.temperature_03, oxygen_concentration: data.oxygen_concentration_03 });
                    collectItem.push({ month: 4, temperature: data.temperature_04, oxygen_concentration: data.oxygen_concentration_04 });
                    collectItem.push({ month: 5, temperature: data.temperature_05, oxygen_concentration: data.oxygen_concentration_05 });
                    collectItem.push({ month: 6, temperature: data.temperature_06, oxygen_concentration: data.oxygen_concentration_06 });
                    collectItem.push({ month: 7, temperature: data.temperature_07, oxygen_concentration: data.oxygen_concentration_07 });
                    collectItem.push({ month: 8, temperature: data.temperature_08, oxygen_concentration: data.oxygen_concentration_08 });
                    collectItem.push({ month: 9, temperature: data.temperature_09, oxygen_concentration: data.oxygen_concentration_09 });
                    collectItem.push({ month: 10, temperature: data.temperature_10, oxygen_concentration: data.oxygen_concentration_10 });
                    collectItem.push({ month: 11, temperature: data.temperature_11, oxygen_concentration: data.oxygen_concentration_11 });
                    collectItem.push({ month: 12, temperature: data.temperature_12, oxygen_concentration: data.oxygen_concentration_12 });
                    $scope.gridItems = collectItem;
                }
                ;
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
