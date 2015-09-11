angular.module('angularApp', ['commfun', 'ui.bootstrap', 'toaster'])
    .controller('ctrl', ['$scope', '$http', 'toaster',
        function ($scope, $http, toaster) {
            $scope.submit = function () {
                $http.post(gb_approot + 'Sys_Base/Users/aj_MasterPasswordUpdate', $scope.fd)
                    .success(function (data: IResultBase, status, headers, config) {
                        if (data.result) {
                            $scope.fd = {}
                            alert(Info_ChangePassword_Success);
                        } else {
                            toaster.pop('error', msg_Err_System_Failure, data.message, 5000);
                        }
                    });
            }
    }
    ]);
