angular.module('categoryApp', [])
.config(['$httpProvider', function($httpProvider) {
    // Required for Django CSRF protection
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}])
.controller('CategoryController', function($scope, $http) {
    const API_URL = 'http://127.0.0.1:8000/category/'; // Update if your URL differs
    $scope.categories = [];
    $scope.newCategory = {};

    // 1. GET ALL
    $scope.loadCategories = function() {
        $http.get(API_URL)
            .then(function(res) { 
                $scope.categories = res.data; 
            })
            .catch(function(err) { console.error('Load error', err); });
    };

    // 2. POST (Add New Category)
    $scope.addCategory = function() {
        $http.post(API_URL, $scope.newCategory)
            .then(function(res) {
                $scope.categories.push(res.data);
                $scope.newCategory = {};
            })
            .catch(function(err) { 
                alert("Error adding category: " + JSON.stringify(err.data)); 
            });
    };

    // 3. PUT (Update Category)
    $scope.saveCategory = function(category) {
        $http.put(API_URL + category.id + '/', category)
            .then(function() { category.editing = false; })
            .catch(function(err) { alert("Update failed: " + JSON.stringify(err.data)); });
    };

    // Edit/Cancel UI Logic
    $scope.editCategory = function(c) {
        c.original = angular.copy(c);
        c.editing = true;
    };

    $scope.cancelEdit = function(c) {
        angular.copy(c.original, c);
        c.editing = false;
    };

    // 4. DELETE
    $scope.deleteCategory = function(category) {
        if (confirm('Delete this category?')) {
            $http.delete(API_URL + category.id + '/')
                .then(function() {
                    $scope.categories.splice($scope.categories.indexOf(category), 1);
                })
                .catch(function(err) { alert("Delete failed: " + JSON.stringify(err.data)); });
        }
    };

    // Initial load
    $scope.loadCategories();
});
