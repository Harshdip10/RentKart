var app = angular.module("loginApp", []);

app.controller("LoginController", function ($scope, $http, $window) {

    $scope.loginData = {};

    $scope.login = function () {

        $http.post("http://127.0.0.1:8000/user/login/", $scope.loginData)
            .then(function (response) {
                // SUCCESS
                alert("Login Successful");

                // Optional: store user info
                localStorage.setItem("userId", response.data.user_id);
                localStorage.setItem("userName", response.data.name);

                // Redirect to homepage
                $window.location.href = "homepage.html";
            })
            .catch(function (error) {
                // FAILURE
                $scope.errorMessage = error.data.error || "Login failed";
            });
    };
});
