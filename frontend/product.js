// var app = angular.module("productApp", []);

// app.controller("ProductController", function($scope, $http) {
//     $scope.products = [];
//     $scope.categories = [];
//     $scope.newProduct = {};

//     // Load all categories for dropdown
//     $scope.loadCategories = function() {
//         $http.get("http://127.0.0.1:8000/category/").then(function(response){
//             $scope.categories = response.data;
//         });
//     };

//     // Load all products
//     $scope.loadProducts = function() {
//         $http.get("http://127.0.0.1:8000/product/").then(function(response){
//             $scope.products = response.data;
//         });
//     };

//     // Add new product
//     $scope.addProduct = function() {
//         $http.post("http://127.0.0.1:8000/product/", $scope.newProduct).then(function(response){
//             $scope.products.push(response.data);
//             $scope.newProduct = {};
//         }, function(error){
//             alert("Error adding product");
//         });
//     };

//     // Edit product
//     $scope.editProduct = function(product) {
//         product.editing = true;
//     };

//     // Cancel edit
//     $scope.cancelEdit = function(product) {
//         product.editing = false;
//         $scope.loadProducts();
//     };

//     // Save product
//     $scope.saveProduct = function(product) {
//         $http.put("http://127.0.0.1:8000/product/" + product.id + "/", product).then(function(response){
//             product.editing = false;
//         }, function(error){
//             alert("Error updating product");
//         });
//     };

//     // Delete product
//     $scope.deleteProduct = function(product) {
//         if(confirm("Are you sure you want to delete this product?")){
//             $http.delete("http://127.0.0.1:8000/product/" + product.id + "/").then(function(response){
//                 var index = $scope.products.indexOf(product);
//                 $scope.products.splice(index, 1);
//             }, function(error){
//                 alert("Error deleting product");
//             });
//         }
//     };

//     // Helper: get category name from ID
//     $scope.getCategoryName = function(catId){
//         var cat = $scope.categories.find(c => c.id === catId);
//         return cat ? cat.name : "";
//     };

//     // Initialize
//     $scope.loadCategories();
//     $scope.loadProducts();
// });

var app = angular.module("productApp", []);

app.controller("ProductController", function($scope, $http) {
    $scope.products = [];
    $scope.categories = [];
    $scope.newProduct = {};
    $scope.newProductImageFile = null;
    $scope.newProductImagePreview = null;
    $scope.selectedProduct = {};

    // Load all categories for dropdown
    $scope.loadCategories = function() {
        $http.get("http://127.0.0.1:8000/category/").then(function(response){
            $scope.categories = response.data;
        }, function(error){
            console.error("Error loading categories:", error);
            alert("Error loading categories");
        });
    };

    // Load all products
    $scope.loadProducts = function() {
        $http.get("http://127.0.0.1:8000/product/").then(function(response){
            $scope.products = response.data;
            console.log("Products loaded:", $scope.products);
        }, function(error){
            console.error("Error loading products:", error);
            alert("Error loading products");
        });
    };

    // Handle image selection for NEW product
    $scope.handleNewProductImage = function(files) {
        if (files && files[0]) {
            const file = files[0];
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                document.getElementById('newProductImage').value = '';
                return;
            }

            // Validate file type
            if (!file.type.match('image.*')) {
                alert('Please select a valid image file');
                document.getElementById('newProductImage').value = '';
                return;
            }

            $scope.newProductImageFile = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.newProductImagePreview = e.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove new product image
    $scope.removeNewProductImage = function() {
        $scope.newProductImageFile = null;
        $scope.newProductImagePreview = null;
        document.getElementById('newProductImage').value = '';
    };

    // Add new product with image
    $scope.addProduct = function() {
        const formData = new FormData();
        formData.append('name', $scope.newProduct.name);
        formData.append('description', $scope.newProduct.description);
        formData.append('mrp', $scope.newProduct.mrp);
        formData.append('category', $scope.newProduct.category);
        
        // Add image if selected
        if ($scope.newProductImageFile) {
            formData.append('image', $scope.newProductImageFile);
        }

        $http.post("http://127.0.0.1:8000/product/", formData, {
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
        }).then(function(response){
            $scope.products.push(response.data);
            $scope.newProduct = {};
            $scope.removeNewProductImage();
            alert("Product added successfully!");
        }, function(error){
            console.error("Error adding product:", error);
            alert("Error adding product: " + (error.data ? JSON.stringify(error.data) : error.statusText));
        });
    };

    // Handle image selection for EDIT mode
    $scope.handleEditImage = function(files, index) {
        if (files && files[0]) {
            const file = files[0];
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                document.getElementById('editImage' + $scope.products[index].id).value = '';
                return;
            }

            // Validate file type
            if (!file.type.match('image.*')) {
                alert('Please select a valid image file');
                document.getElementById('editImage' + $scope.products[index].id).value = '';
                return;
            }

            $scope.products[index].newImageFile = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.products[index].newImagePreview = e.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove image in edit mode
    $scope.removeEditImage = function(product) {
        product.newImageFile = null;
        product.newImagePreview = null;
        product.removeImage = true; // Flag to remove existing image
        document.getElementById('editImage' + product.id).value = '';
    };

    // Edit product
    $scope.editProduct = function(product) {
        // Store original values for cancel
        product.originalName = product.name;
        product.originalDescription = product.description;
        product.originalMrp = product.mrp;
        product.originalCategory = product.category;
        product.originalImageUrl = product.image_url;
        
        product.editing = true;
        product.newImageFile = null;
        product.newImagePreview = null;
        product.removeImage = false;
    };

    // Cancel edit
    $scope.cancelEdit = function(product) {
        // Restore original values
        product.name = product.originalName;
        product.description = product.originalDescription;
        product.mrp = product.originalMrp;
        product.category = product.originalCategory;
        product.image_url = product.originalImageUrl;
        
        // Clear edit-related properties
        product.editing = false;
        product.newImageFile = null;
        product.newImagePreview = null;
        product.removeImage = false;
        
        // Clear file input
        if (document.getElementById('editImage' + product.id)) {
            document.getElementById('editImage' + product.id).value = '';
        }
    };

    // Save product with image
    $scope.saveProduct = function(product) {
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('mrp', product.mrp);
        formData.append('category', product.category);
        
        // Add new image if selected
        if (product.newImageFile) {
            formData.append('image', product.newImageFile);
        }
        // If removeImage flag is set and no new image, send empty string to remove
        else if (product.removeImage && !product.newImageFile) {
            formData.append('image', '');
        }

        $http.put("http://127.0.0.1:8000/product/" + product.id + "/", formData, {
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
        }).then(function(response){
            // Update product with response data
            angular.extend(product, response.data);
            
            // Clear edit mode
            product.editing = false;
            product.newImageFile = null;
            product.newImagePreview = null;
            product.removeImage = false;
            
            alert("Product updated successfully!");
        }, function(error){
            console.error("Error updating product:", error);
            alert("Error updating product: " + (error.data ? JSON.stringify(error.data) : error.statusText));
        });
    };

    // Delete product
    $scope.deleteProduct = function(product) {
        if(confirm("Are you sure you want to delete '" + product.name + "'? This will also delete the associated image.")){
            $http.delete("http://127.0.0.1:8000/product/" + product.id + "/").then(function(response){
                var index = $scope.products.indexOf(product);
                $scope.products.splice(index, 1);
                alert("Product deleted successfully!");
            }, function(error){
                console.error("Error deleting product:", error);
                alert("Error deleting product");
            });
        }
    };

    // View image in modal
    $scope.viewImage = function(product) {
        if(product.image_url) {
            $scope.selectedProduct = product;
            var imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
        }
    };

    // Helper: get category name from ID
    $scope.getCategoryName = function(catId){
        var cat = $scope.categories.find(c => c.id === catId);
        return cat ? cat.name : "Unknown";
    };

    // Initialize
    $scope.loadCategories();
    $scope.loadProducts();
});