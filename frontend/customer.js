// Declare the AngularJS module first
var app = angular.module('customerApp', []);

app.config(['$httpProvider', function($httpProvider) {
    // Required for Django CSRF protection
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

// CustomerController definition
app.controller('CustomerController', function($scope, $http) {
    const API_URL = 'http://127.0.0.1:8000/customer/';
    $scope.customers = [];
    $scope.newCustomer = {};

    // 1. GET ALL
    $scope.loadCustomers = function() {
        $http.get(API_URL)
            .then(function(res) { $scope.customers = res.data; })
            .catch(function(err) { console.error('Load error', err); });
    };

    // 2. POST
    $scope.addCustomer = function() {
        $http.post(API_URL, $scope.newCustomer)
            .then(function(res) {
                $scope.customers.push(res.data);
                $scope.newCustomer = {};
            })
            .catch(function(err) { alert("Error adding customer: " + JSON.stringify(err.data)); });
    };

    // 3. PUT (Save)
    $scope.saveCustomer = function(customer) {
        $http.put(API_URL + customer.id + '/', customer)
            .then(function() { customer.editing = false; })
            .catch(function(err) { alert("Update failed"); });
    };

    // Edit/Cancel UI Logic
    $scope.editCustomer = function(c) {
        c.original = angular.copy(c);
        c.editing = true;
    };
    $scope.cancelEdit = function(c) {
        angular.copy(c.original, c);
        c.editing = false;
    };

    // 4. DELETE
    $scope.deleteCustomer = function(customer) {
        if (confirm('Delete this customer?')) {
            $http.delete(API_URL + customer.id + '/')
                .then(function() {
                    $scope.customers.splice($scope.customers.indexOf(customer), 1);
                });
        }
    };

    $scope.loadCustomers();
});

// LoginController definition
app.controller('LoginController', function($scope, $http, $window, $timeout) {
    $scope.credentials = {};
    $scope.errorMessage = "";
    $scope.successMessage = "";

    // IMPORTANT: Ensure this URL matches your urls.py (e.g., http://127.0.0.1:8000/login/)
    const loginApiUrl = 'http://127.0.0.1:8000/login/'; 

    $scope.login = function() {
        $scope.errorMessage = "";
        $scope.successMessage = "";

        $http.post(loginApiUrl, $scope.credentials)
            .then(function(response) {
                // Success logic
                $scope.successMessage = "Login successful! Redirecting...";
                
                // Store user data in browser storage
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
                
                // Wait 2 seconds then redirect to user management page
                $timeout(function() {
                    $window.location.href = 'index.html'; 
                }, 2000);
            })
            .catch(function(error) {
                console.error("Full Error:", error);
                
                // If Django sent a specific error message (like "Email and password are required")
                if (error.data && error.data.error) {
                    $scope.errorMessage = error.data.error;
                } else {
                    $scope.errorMessage = "Status " + error.status + ": " + error.statusText;
                }
            });
    };
});
