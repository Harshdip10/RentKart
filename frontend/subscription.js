var app = angular.module("subscriptionApp", []);

app.controller("SubscriptionController", function($scope, $http){
    $scope.subscriptions = [];
    $scope.products = [];
    $scope.newSubscription = {};

    // Load products for dropdown
    $scope.loadProducts = function(){
        $http.get("http://127.0.0.1:8000/product/").then(function(response){
            $scope.products = response.data;
        });
    };

    // Load subscriptions
    $scope.loadSubscriptions = function(){
        $http.get("http://127.0.0.1:8000/subscription/").then(function(response){
            $scope.subscriptions = response.data;
        });
    };

    // Add new subscription
    $scope.addSubscription = function(){
        $http.post("http://127.0.0.1:8000/subscription/", $scope.newSubscription).then(function(response){
            $scope.subscriptions.push(response.data);
            $scope.newSubscription = {};
        }, function(error){
            alert("Error adding subscription");
        });
    };

    // Edit subscription
    $scope.editSubscription = function(sub){
        sub.editing = true;
    };

    // Cancel edit
    $scope.cancelEdit = function(sub){
        sub.editing = false;
        $scope.loadSubscriptions();
    };

    // Save subscription
    $scope.saveSubscription = function(sub){
        $http.put("http://127.0.0.1:8000/subscription/" + sub.id + "/", sub).then(function(response){
            sub.editing = false;
        }, function(error){
            alert("Error updating subscription");
        });
    };

    // Delete subscription
    $scope.deleteSubscription = function(sub){
        if(confirm("Are you sure you want to delete this subscription?")){
            $http.delete("http://127.0.0.1:8000/subscription/" + sub.id + "/").then(function(response){
                var index = $scope.subscriptions.indexOf(sub);
                $scope.subscriptions.splice(index, 1);
            }, function(error){
                alert("Error deleting subscription");
            });
        }
    };

    // Initialize
    $scope.loadProducts();
    $scope.loadSubscriptions();
});
