angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster', 'ngInputDate']).filter('category', function () {
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
            console.info("Sub Grid", $scope.Grid_Items[$index].apply_id, $scope.Grid_Items[$index].expland_sub);
        };

        $scope.Master_Grid_Delete = function () {
            var ids = [];
            for (var key in $scope.Grid_Items) {
                if ($scope.Grid_Items[key].check_del) {
                    ids.push($scope.Grid_Items[key].apply_id);
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
            $scope.Detail_Items = {};
        };
        $scope.Master_Open_Modify = function ($index) {
            var get_master_id = $scope.Grid_Items[$index].apply_id;
            $scope.edit_type = 2 /* update */;
            $http.get(apiConnection, { params: { id: get_master_id } }).success(function (data, status, headers, config) {
                if (data.result) {
                    data.data = obj_prop_date(data.data);
                    $scope.fd = data.data;
                    getDetailItems(get_master_id);
                } else {
                    toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                }
                ;
            });
        };
        $scope.Master_Open_New = function () {
            $scope.edit_type = 1 /* insert */;
            $http.post(aj_MGetId, {}).success(function (data, status, headers, config) {
                $scope.fd = {
                    apply_id: data,
                    doc_date: new Date(),
                    i_UpdateDateTime: new Date()
                };
                $scope.show_master_edit = true;
                console.log('show_master_edit', $scope.show_master_edit);
            });
        };
        $scope.openNewDetail = function () {
            $scope.editTypeDetail = 1 /* insert */;
            $http.post(aj_DGetId, {}).success(function (data, status, headers, config) {
                $scope.fds = {
                    apply_detail_id: data,
                    apply_id: $scope.fd.apply_id,
                    Y: $scope.fd.Y
                };
                $scope.show_detail_edit = true;
            });
        };
        $scope.openModifyDetail = function (apply_detail_id) {
            console.log('apply_detail_id', apply_detail_id);
            $scope.editTypeDetail = 2 /* update */;
            $http.get(apiDConnection, { params: { id: apply_detail_id } }).success(function (data, status, headers, config) {
                if (data.result) {
                    $scope.fds = data.data;
                    getFuelItems($scope.fds.apply_detail_id);
                    $scope.show_detail_edit = true;
                } else {
                    toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                }
                ;
            });
        };
        $scope.closeDetail = function () {
            $scope.show_detail_edit = false;
            $scope.fds = {};
            $scope.fuel_applys = {};
            $scope.equipmentInfo = {};
            $scope.editTypeDetail = 0 /* none */;
            getDetailItems($scope.fd.apply_id);
        };
        $scope.submitDetail = function () {
            if ($scope.editTypeDetail == 1 /* insert */) {
                $http.post(apiDConnection, $scope.fds).success(function (data, status, headers, config) {
                    if (data.result) {
                        $scope.editTypeDetail = 2 /* update */;
                        toaster.pop('success', js_Info_Toast_Return_Title, Info_Insert_Success);
                    } else {
                        toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                    }
                });
            }

            if ($scope.editTypeDetail == 2 /* update */) {
                console.info("Update Mode Start...");
                $http.put(apiDConnection, $scope.fds).success(function (data, status, headers, config) {
                    if (data.result) {
                        toaster.pop('success', js_Info_Toast_Return_Title, Info_Update_Success);
                        console.info("Update Finish");
                    } else {
                        toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                    }
                });
            }
        };
        $scope.eventDeleteDetail = function (apply_detail_id) {
            if (confirm(msg_Info_Is_SureDelete)) {
                $http['delete'](apiDConnection + '?ids=' + apply_detail_id).success(function (data, status, headers, config) {
                    if (data.result) {
                        getDetailItems($scope.fd.apply_id);
                        alert(Info_Update_Success);
                    } else {
                        alert(data.message);
                    }
                });
            }
        };
        $scope.eventDeleteFuel = function (fuel_apply_id) {
            if (confirm(msg_Info_Is_SureDelete)) {
                $http['delete'](gb_approot + 'api/Fuel_Apply?ids=' + fuel_apply_id).success(function (data, status, headers, config) {
                    if (data.result) {
                        getFuelItems($scope.fds.apply_detail_id);
                        alert(Info_Update_Success);
                    } else {
                        alert(data.message);
                    }
                });
            }
        };

        $scope.openNewFuel = function () {
            var modalInstance = $modal.open({
                templateUrl: gb_approot + 'ScriptsCtrl/tmp/modalEditFuel.html?' + uniqid(),
                controller: modalEditFuelData,
                resolve: {
                    items: function () {
                        return {
                            appy_id: $scope.fd.apply_id,
                            apply_detail_id: $scope.fds.apply_detail_id,
                            fuelCategory: $scope.fuelCategory,
                            Y: $scope.fd.Y,
                            edit_type: 1 /* insert */
                        };
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                getFuelItems($scope.fds.apply_detail_id);
            }, function () {
            });
        };
        $scope.openModifyFuel = function (fuel_apply_id) {
            var modalInstance = $modal.open({
                templateUrl: gb_approot + 'ScriptsCtrl/tmp/modalEditFuel.html?' + uniqid(),
                controller: modalEditFuelData,
                resolve: {
                    items: function () {
                        return {
                            fuel_apply_id: fuel_apply_id,
                            appy_id: $scope.fd.apply_id,
                            apply_detail_id: $scope.fds.apply_detail_id,
                            fuelCategory: $scope.fuelCategory,
                            Y: $scope.fd.Y,
                            edit_type: 2 /* update */
                        };
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                getFuelItems($scope.fds.apply_detail_id);
            }, function () {
            });
        };

        function getDetailItems(apply_id) {
            $http.get(apiDConnection, { params: { apply_id: apply_id } }).success(function (data, status, headers, config) {
                if (data.result) {
                    $scope.Detail_Items = data.data;
                    $scope.show_master_edit = true;
                    $scope.edit_type = 2 /* update */;
                } else {
                    toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                }
                ;
            });
        }
        ;
        function getFuelItems(apply_detail_id) {
            $http.get(gb_approot + 'api/Fuel_Apply', { params: { apply_detail_id: apply_detail_id } }).success(function (data, status, headers, config) {
                if (data.result) {
                    $scope.fuel_applys = data.data;
                } else {
                    toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                }
                ;
            });
        }

        $scope.show_master_edit = false;
        $scope.show_detail_edit = false;
        $scope.edit_type = 0 /* none */;
        var timer = false;

        $scope.grid_new_show = true;
        $scope.grid_del_show = true;
        $scope.grid_nav_show = true;

        $scope.check_del_value = false;
        $scope.setYear = workService.setApplyYearRange();
        $scope.genders = commData.genderData;
        $scope.fuelCategory = commData.fuelCategory;

        $scope.$watch('fd.Y', function (newValue, oldValue) {
            console.log('fd.Y', newValue);
            if ($scope.edit_type == 1 /* insert */) {
                $scope.fd.start_date = new Date(newValue + '-01-01');
                $scope.fd.end_date = new Date(newValue + '-12-31');
            }
            ;
        });
        $scope.$watch('fds.equipment_id', function (newValue, oldValue) {
            if (newValue != undefined) {
                for (var i in $scope.equipments) {
                    if ($scope.equipments[i].equipment_id == newValue) {
                        $scope.equipmentInfo = $scope.equipments[i];
                        $scope.fds.equipment_sn = $scope.equipments[i].equipment_sn;
                    }
                }
            }
        });

        $http.post(aj_Init, {}).success(function (data, status, headers, config) {
            $scope.equipments = data.options_equipment;
        });

        $scope.sd = { Y: 2015 };

        $scope.Init_Query();
        workService.getApplyUser().success(function (data, status, headers, config) {
            $scope.option_apply_user = data;
        }).error(function (data, status, headers, config) {
            alert('ajax error');
            console.error(data);
        });
    }]);

var modalEditFuelData = [
    '$scope', '$http', '$modalInstance', 'items',
    function ($scope, $http, $modalInstance, items) {
        console.log(items);
        $scope.fuelCategory = items.fuelCategory;
        $scope.edit_type = items.edit_type;
        $scope.get_fuel_unit = commData.fuelCategory;
        $scope.fuel = {
            Y: items.Y,
            apply_detail_id: items.apply_detail_id
        };

        if ($scope.edit_type == 1 /* insert */) {
            $http.post(gb_approot + 'Sys_Active/Apply/ajax_GetFuelApplyNewId', {}).success(function (data, status, headers, config) {
                $scope.fuel.fuel_apply_id = data;
                $scope.edit_type = 1 /* insert */;
            });
        }
        ;

        if ($scope.edit_type == 2 /* update */) {
            $http.get(gb_approot + 'api/Fuel_Apply', { params: { id: items.fuel_apply_id } }).success(function (data, status, headers, config) {
                $scope.fuel = data.data;
            });
        }
        ;

        $scope.submitFuel_Apply = function () {
            console.log($scope.edit_type);
            if ($scope.edit_type == 1 /* insert */) {
                $http.post(gb_approot + 'api/Fuel_Apply', $scope.fuel).success(function (data, status, headers, config) {
                    if (data.result) {
                        $scope.edit_type = 2 /* update */;
                        alert(Info_Insert_Success);
                    } else {
                        alert(data.message);
                    }
                    ;
                });
            }
            ;

            if ($scope.edit_type == 2 /* update */) {
                $http.put(gb_approot + 'api/Fuel_Apply', $scope.fuel).success(function (data, status, headers, config) {
                    if (data.result) {
                        alert(Info_Update_Success);
                    } else {
                        alert(data.message);
                    }
                    ;
                });
            }
            ;
        };
        $scope.close = function () {
            $modalInstance.close();
        };
    }];
