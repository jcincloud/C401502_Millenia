;

angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster']).controller('ctrl', [
    '$scope', '$http', '$modal', 'gridpage', 'workService', '$filter', '$sce',
    function ($scope, $http, $modal, gridpage, workService, $filter, $sce) {
        var id_name = "apply_id";

        var pathOpenYearPage = gb_approot + 'Sys_Base/ReportChart/OpenYearAverage?';
        var pathSearchYearUrl = gb_approot + apiGetAction + '/GetQueryYearAverage';

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
            parm.push('user_id=' + $scope.sd.user_id);
            parm.push('query_use_type=0');
            parm.push('tid=' + uniqid());

            var setPath = pathOpenYearPage + parm.join('&');
            window.open(setPath, 'ReportView', 'width=960,height=800,scrollbars=yes');
        };
        $scope.searchManagerYear = function () {
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

        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.InitData = data;
        });

        $scope.$watch('sd.user_id', function (newValue, oldValue) {
            if (newValue != undefined) {
                getApplyUserEquipment(newValue);
            }
            ;
        });
        function getApplyUserEquipment(user_id) {
            workService.getApplyUserEquipment(user_id).success(function (data, status, headers, config) {
                $scope.equipment_option = data;
            }).error(function (data, status, headers, config) {
                alert('ajax error');
                console.error(data);
            });
        }
        ;

        workService.getApplyUser().success(function (data, status, headers, config) {
            $scope.option_apply_user = data;
        }).error(function (data, status, headers, config) {
            alert('ajax error');
            console.error(data);
        });
    }]);
