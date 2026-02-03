// 1. Initialize the module (Only do this ONCE in the entire file)
var app = angular.module('userApp', []);

// --- USER MANAGEMENT CONTROLLER ---
app.controller('UserController', function($scope, $http) {
    const apiBase = 'http://127.0.0.1:8000/user/'; 

    $scope.users = [];
    $scope.newUser = {};

    $scope.getUsers = function() {
        $http.get(apiBase)
            .then(function(response) {
                $scope.users = response.data;
            })
            .catch(function(error) {
                console.error("Error fetching users:", error);
            });
    };

    $scope.addUser = function() {
        $http.post(apiBase, $scope.newUser)
            .then(function(response) {
                $scope.users.push(response.data);
                $scope.newUser = {}; 
                alert("User created successfully!");
            })
            .catch(function(error) {
                console.error("Error adding user:", error);
                alert("Failed to add user.");
            });
    };

    $scope.editUser = function(user) {
        user.originalData = angular.copy(user);
        user.editing = true;
    };

    $scope.cancelEdit = function(user) {
        angular.extend(user, user.originalData);
        user.editing = false;
        delete user.originalData;
    };

    $scope.saveUser = function(user) {
        $http.put(apiBase + user.id + '/', user)
            .then(function(response) {
                user.editing = false;
                delete user.originalData;
                alert("User updated successfully!");
            })
            .catch(function(error) {
                console.error("Error updating user:", error);
                alert("Update failed.");
            });
    };

    $scope.deleteUser = function(user) {
        if (confirm("Are you sure you want to delete " + user.name + "?")) {
            $http.delete(apiBase + user.id + '/')
                .then(function() {
                    $scope.users = $scope.users.filter(u => u.id !== user.id);
                })
                .catch(function(error) {
                    console.error("Error deleting user:", error);
                });
        }
    };

    $scope.getUsers();
});

// --- LOGIN CONTROLLER (New) ---
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