interface ILogin extends ng.IScope {
    vial_img_path: string;
    options_lang: server.i_Lang[];
    fd: server.loginField;
    submit(): void;
    forget_button_show(): void;
    revildate(): void;
}

interface IResultLogin extends IResultBase {
    url: string;
}

angular.module('angularApp', ['commfun'])
    .controller('ctrl', ['$scope', '$http', function ($scope: ILogin, $http: ng.IHttpService) {
        $scope.vial_img_path = vial_img_path;

        function Init() {
            $http.post(path_lang, {})
                .success(function (data: server.i_Lang[], status, headers, config) {
                    //$scope.options_lang = data;
                });
            $scope.fd = <server.loginField>{
                lang: 'zh-TW',
                account: debug_account,
                password: debug_password
            };
        }

        $scope.submit = function () {
            $http.post(ajax_Login, $scope.fd)
                .success(function (data: IResultLogin, status, headers, config) {
                    if (data.result) {
                        document.location.href = data.url;
                    } else {
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

                $http.post(ajax_ForgotPassword, obj)
                    .success(function (data: IResultBase, status, headers, config) {
                        if (data.result) {
                            alert(Info_ForgetMial_Success);
                        } else {
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