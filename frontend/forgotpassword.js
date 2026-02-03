var app = angular.module('forgotApp', []);

app.controller('ForgotController', function($scope, $http) {
    $scope.data = {};
    $scope.success = "";
    $scope.error = "";

    // Step 1: Send OTP to Telegram
    $scope.sendOTP = function() {
        $http.post("http://127.0.0.1:8000/user/send-otp-telegram/", {
            email: $scope.data.email,
            mobile: $scope.data.phone
        }).then(function(response) {
            $scope.success = response.data.message;
            $scope.error = "";
        }).catch(function(error) {
            // Safely access error message
            if (error && error.data && error.data.error) {
                $scope.error = error.data.error;
            } else {
                $scope.error = "Something went wrong. Please try again.";
            }
            $scope.success = "";
        });
    };

    // Step 2: Verify OTP & Reset Password
    $scope.resetPassword = function() {
        $http.post("http://127.0.0.1:8000/user/verify-telegram-otp/", {
            email: $scope.data.email,
            mobile: $scope.data.phone,
            otp: $scope.data.otp,
            new_password: $scope.data.new_password
        }).then(function(response) {
            $scope.success = response.data.message;
            $scope.error = "";
            setTimeout(function() {
                window.location.href = "login.html";
            }, 2000);
        }).catch(function(error) {
            if (error && error.data && error.data.error) {
                $scope.error = error.data.error;
            } else {
                $scope.error = "Something went wrong. Please try again.";
            }
            $scope.success = "";
        });
    };
});
