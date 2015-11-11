;
;
var agApp = angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster']);
agApp.controller('ctrl', ['$scope', '$http', 'toaster', 'gridpage',
    function ($scope, $http, toaster, gridpage) {
        var id_name = "Id";
        var sn_name = "Id";
        $scope.fd = {};
        $scope.fd[id_name] = 0;
        $scope.Grid_Items = [];
        $scope.Detail_Items = [];
        $scope.TotalPage = 0;
        $scope.NowPage = 1;
        $scope.RecordCount = 0;
        $scope.StartCount = 0;
        $scope.EndCount = 0;
        $scope.firstpage = 1;
        $scope.lastpage = 0;
        $scope.nextpage = 0;
        $scope.prevpage = 0;
        $scope.show_master_edit = false;
        $scope.edit_type = 0;
        var timer = false;
        $scope.grid_new_show = true;
        $scope.grid_del_show = true;
        $scope.grid_nav_show = true;
        $scope.check_del_value = false;
        $scope.isPassword = true;
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
        $scope.Master_Grid_Delete = function () {
            var sns = [];
            for (var key in $scope.Grid_Items) {
                if ($scope.Grid_Items[key].check_del) {
                    console.info("Select Delete Id:" + $scope.Grid_Items[key][sn_name]);
                    sns.push($scope.Grid_Items[key][sn_name]);
                }
            }
            if (sns.length > 0) {
                if (confirm(msg_Info_Is_SureDelete)) {
                    $http.post(aj_MDelete, sns)
                        .success(function (data, status, headers, config) {
                        if (data.result) {
                            $scope.Init_Query();
                        }
                        else {
                            toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                        }
                    });
                }
            }
            else {
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
            if ($scope.edit_type == 1) {
                console.info("Insert Mode Start...");
                $http.post(gb_allpath + 'ajax_MasterInsert', $scope.fd)
                    .success(function (data, status, headers, config) {
                    console.log(data);
                    if (data.result) {
                        $scope.edit_type = 2;
                        $scope.isPassword = false;
                        $scope.fd[id_name] = data.aspnetid;
                        toaster.pop('success', js_Info_Toast_Return_Title, Info_Insert_Success);
                        $scope.Init_Query();
                        console.info("Insert Finish", $scope.edit_type);
                    }
                    else {
                        toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                    }
                });
            }
            if ($scope.edit_type == 2) {
                console.info("Update Mode Start...");
                console.log('Update fd', $scope.fd);
                $http.post(aj_MUpdata, $scope.fd)
                    .success(function (data, status, headers, config) {
                    if (data.result) {
                        toaster.pop('success', js_Info_Toast_Return_Title, Info_Update_Success);
                        $scope.Init_Query();
                        console.info("Update Finish");
                    }
                    else {
                        toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                    }
                });
            }
        };
        $scope.Master_Edit_Close = function () {
            $scope.edit_type = 0;
            $scope.show_master_edit = false;
        };
        $scope.Master_Open_Modify = function ($index) {
            var get_sn = $scope.Grid_Items[$index][sn_name];
            $scope.isPassword = false;
            console.log('Start get master modify data', get_sn);
            $http.post(aj_MGet, { sn: get_sn })
                .success(function (data, status, headers, config) {
                if (data.result) {
                    $scope.fd = data.data;
                    $scope.show_master_edit = true;
                    $scope.edit_type = 2;
                }
                else {
                    console.error(data.message);
                    toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                }
            });
        };
        $scope.Master_Open_New = function () {
            $scope.isPassword = true;
            $scope.fd = {
                role_array: $scope.InitData.checkbox_roles
            };
            $scope.edit_type = 1;
            $scope.show_master_edit = true;
        };
        $scope.Detail_Init = function () {
        };
        $http.post(aj_Init, {})
            .success(function (data, status, headers, config) {
            $scope.InitData = data;
            $scope.fd = {
                role_array: $scope.InitData.checkbox_roles
            };
            console.info("Init Msater Data finish...", data);
        });
        $scope.Init_Query();
    }]);
