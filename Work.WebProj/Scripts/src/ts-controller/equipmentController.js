angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster']).filter('category', function () {
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
    '$scope', '$http', '$modal', 'toaster', 'gridpage', 'workService',
    function ($scope, $http, $modal, toaster, gridpage, workService) {
        var id_name = "equipment_id";

        $scope.show_master_edit = false;
        $scope.edit_type = 0 /* none */;
        var timer = false;

        $scope.grid_new_show = true;
        $scope.grid_del_show = true;
        $scope.grid_nav_show = true;

        $scope.check_del_value = false;

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
        $scope.ExpandSub = function ($index) {
            $scope.Grid_Items[$index].expland_sub = !$scope.Grid_Items[$index].expland_sub;
            console.info("Sub Grid", $scope.Grid_Items[$index][id_name], $scope.Grid_Items[$index].expland_sub);
        };

        $scope.Master_Grid_Delete = function () {
            var ids = [];
            for (var key in $scope.Grid_Items) {
                if ($scope.Grid_Items[key].check_del) {
                    console.info("Select Delete Id:" + $scope.Grid_Items[key][id_name]);
                    ids.push($scope.Grid_Items[key][id_name]);
                }
            }

            if (ids.length > 0) {
                if (confirm(msg_Info_Is_SureDelete)) {
                    $http['delete'](apiConnection + 'ids=' + ids).success(function (data, status, headers, config) {
                        if (data.result) {
                            $scope.Init_Query();
                        } else {
                            toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                        }
                    });
                }
            } else {
                alert(msg_Warn_Select_Delete_Data);
            }
        };
        $scope.SelectAllCheckDel = function ($event) {
            for (var key in $scope.Grid_Items) {
                $scope.Grid_Items[key].check_del = $event.target.checked;
                console.log($scope.Grid_Items[key].check_del);
            }
        };
        $scope.Master_Submit = function () {
            if ($scope.edit_type == 1 /* insert */) {
                console.info("Insert Mode Start...");
                $http.post(apiConnection, $scope.fd).success(function (data, status, headers, config) {
                    if (data.result) {
                        $scope.edit_type = 2 /* update */;
                        toaster.pop('success', js_Info_Toast_Return_Title, Info_Insert_Success);
                        $scope.Init_Query();
                        console.info("Insert Finish", $scope.edit_type);
                    } else {
                        toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                    }
                });
            }

            if ($scope.edit_type == 2 /* update */) {
                console.info("Update Mode Start...");
                $http.put(apiConnection, $scope.fd).success(function (data, status, headers, config) {
                    if (data.result) {
                        toaster.pop('success', js_Info_Toast_Return_Title, Info_Update_Success);
                        $scope.Init_Query();
                        console.info("Update Finish");
                    } else {
                        toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                    }
                });
            }
        };
        $scope.Master_Edit_Close = function () {
            $scope.edit_type = 0 /* none */;
            $scope.show_master_edit = false;
            $scope.fd = {};
        };
        $scope.Master_Open_Modify = function ($index) {
            var get_id = $scope.Grid_Items[$index][id_name];
            console.log('Start get master modify data', get_id);

            $http.get(apiConnection, { params: { id: get_id } }).success(function (data, status, headers, config) {
                if (data.result) {
                    $scope.fd = data.data;
                    $scope.show_master_edit = true;
                    $scope.edit_type = 2 /* update */;
                    console.info("Master data get ok!", "Show", $scope.show_master_edit);
                    $scope.Detail_Init();
                } else {
                    console.error(data.message);
                    toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                }
            });
        };
        $scope.Master_Open_New = function () {
            $http.post(aj_MGetId, {}).success(function (data, status, headers, config) {
                $scope.fd = {
                    equipment_id: data,
                    is_new_equip: false
                };
                $scope.edit_type = 1 /* insert */;
                console.info("Get New Id Value:", data);
            });
            $scope.show_master_edit = true;
        };
        $scope.Detail_Init = function () {
        };

        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.InitData = data;
        });

        $scope.Init_Query();

        workService.getApplyUser().success(function (data, status, headers, config) {
            $scope.option_apply_user = data;
            console.log(data);
        }).error(function (data, status, headers, config) {
            alert('ajax error');
            console.error(data);
        });
    }]);
