angular.module('angularApp', ['commfun']).controller('ctrl', ['$scope', '$http', function ($scope, $http) {
    $scope.vial_img_path = vial_img_path;
    function Init() {
        $http.post(path_lang, {}).success(function (data, status, headers, config) {
        });
        $scope.fd = {
            lang: 'zh-TW',
            account: debug_account,
            password: debug_password
        };
    }
    $scope.submit = function () {
        $http.post(ajax_Login, $scope.fd).success(function (data, status, headers, config) {
            if (data.result) {
                document.location.href = data.url;
            }
            else {
                $scope.revildate();
                $scope.fd.img_vildate = '';
                alert(data.message);
            }
        });
    };
    $scope.forget_button_show = function () {
        var email = prompt(lab_input_email, '');
        if (email != null && email.trim() != '') {
            var obj = { Email: email.trim() };
            $http.post(ajax_ForgotPassword, obj).success(function (data, status, headers, config) {
                if (data.result) {
                    alert(Info_ForgetMial_Success);
                }
                else {
                    alert(data.message);
                }
            });
        }
    };
    $scope.revildate = function () {
        $scope.vial_img_path = vial_img_path + '?tid=' + uniqid();
    };
    Init();
}]);
