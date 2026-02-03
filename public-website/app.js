var app = angular.module('publicApp', ['ngRoute']);

// Configure routes
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .when('/categories', {
            templateUrl: 'views/categories.html',
            controller: 'CategoriesController'
        })
        .when('/products/:categoryId', {
            templateUrl: 'views/products.html',
            controller: 'ProductsController'
        })
        .when('/product-detail/:productId', {
            templateUrl: 'views/product-detail.html',
            controller: 'ProductDetailController'
        })
        .when('/checkout/:productId', {
            templateUrl: 'views/checkout.html',
            controller: 'CheckoutController'
        })
        .when('/my-rentals', {
            templateUrl: 'views/my-rentals.html',
            controller: 'MyRentalsController'
        })
        .when('/about', {
            templateUrl: 'views/about.html'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html',
            controller: 'ContactController'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterController'
        })
        .when('/forgot-password', {
            templateUrl: 'views/forgot-password.html',
            controller: 'ForgotPasswordController'
        })
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'ProfileController'
        })
        .when('/invoice/:orderId', {
            templateUrl: 'views/invoice.html',
            controller: 'InvoiceController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

// Configure HTTP for Django CSRF
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

// --- Main Controller (Global Helpers) ---
app.controller('MainController', function($scope, $location) {
    $scope.isLoggedIn = false;
    $scope.currentUser = null;

    // Global Rental Calculation Logic
    $scope.calculateRent = function(mrp, type) {
        if (!mrp) return 0;
        let baseMonthly = mrp * 0.05; // 5% of MRP
        
        switch(type) {
            case 'monthly': return baseMonthly;
            case 'quarterly': return baseMonthly * 0.97; // 3% Off
            case 'half-yearly': return baseMonthly * 0.96; // 4% Off
            case 'annually': return baseMonthly * 0.95; // 5% Off
            default: return baseMonthly;
        }
    };

    $scope.checkLogin = function() {
        var user = localStorage.getItem('currentUser');
        if (user) {
            $scope.currentUser = JSON.parse(user);
            $scope.isLoggedIn = true;
        }
    };

    $scope.logout = function() {
        localStorage.removeItem('currentUser');
        $scope.isLoggedIn = false;
        $scope.currentUser = null;
        $location.path('/');
    };

    $scope.checkLogin();

    $scope.$on('userLoggedIn', function(event, user) {
        $scope.currentUser = user;
        $scope.isLoggedIn = true;
    });
});

// --- Home Controller ---
app.controller('HomeController', function($scope) {
    $scope.featuredCategories = [
        { name: 'Furniture', icon: 'fa-couch', description: 'Premium furniture', color: '#4A90E2' },
        { name: 'Appliances', icon: 'fa-blender', description: 'Modern home appliances', color: '#E94B3C' },
        { name: 'Electronics', icon: 'fa-tv', description: 'Latest electronics', color: '#50C878' },
        { name: 'Fitness', icon: 'fa-dumbbell', description: 'Home gym equipment', color: '#F39C12' }
    ];

    $scope.features = [
        { icon: 'fa-truck', title: 'Free Delivery', description: 'We deliver and install for free' },
        { icon: 'fa-tools', title: 'Free Maintenance', description: '24/7 maintenance support' },
        { icon: 'fa-exchange-alt', title: 'Easy Exchange', description: 'Upgrade or exchange anytime' },
        { icon: 'fa-shield-alt', title: 'Secure & Safe', description: 'All products are sanitized' }
    ];
});

// --- Categories Controller ---
app.controller('CategoriesController', function($scope, $http, $location) {
    const API_URL = 'http://127.0.0.1:8000/category/';
    $scope.categories = [];
    $scope.loading = true;

    $scope.loadCategories = function() {
        $http.get(API_URL)
            .then(function(response) {
                $scope.categories = response.data;
                $scope.loading = false;
            })
            .catch(function(error) {
                console.error('Error loading categories:', error);
                $scope.loading = false;
            });
    };

    $scope.viewProducts = function(categoryId) {
        $location.path('/products/' + categoryId);
    };

    $scope.loadCategories();
});

// --- Products Controller ---
app.controller('ProductsController', function($scope, $http, $routeParams, $location) {
    const PRODUCT_API = 'http://127.0.0.1:8000/product/';
    const CATEGORY_API = 'http://127.0.0.1:8000/category/';
    
    $scope.products = [];
    $scope.category = {};
    $scope.loading = true;
    $scope.categoryId = $routeParams.categoryId;

    $scope.loadCategory = function() {
        $http.get(CATEGORY_API + $scope.categoryId + '/')
            .then(function(response) { $scope.category = response.data; });
    };

    $scope.loadProducts = function() {
        $http.get(PRODUCT_API)
            .then(function(response) {
                $scope.products = response.data.filter(p => p.category == $scope.categoryId);
                $scope.loading = false;
            });
    };

    $scope.viewProductDetail = function(productId) {
        $location.path('/product-detail/' + productId);
    };

    $scope.loadCategory();
    $scope.loadProducts();
});

// --- Product Detail Controller ---
app.controller('ProductDetailController', function($scope, $http, $routeParams, $location) {
    const PRODUCT_API = 'http://127.0.0.1:8000/product/';
    $scope.product = {};
    $scope.loading = true;
    $scope.productId = $routeParams.productId;

    $http.get(PRODUCT_API + $scope.productId + '/')
        .then(function(response) {
            $scope.product = response.data;
            $scope.loading = false;
        })
        .catch(function(error) {
            $scope.loading = false;
        });

    $scope.proceedToCheckout = function() {
        if (!$scope.isLoggedIn) {
            alert('Please login to continue');
            $location.path('/login');
            return;
        }
        $location.path('/checkout/' + $scope.productId);
    };
});

// --- Checkout Controller ---
app.controller('CheckoutController', function($scope, $http, $routeParams, $location) {
    const PRODUCT_API = 'http://127.0.0.1:8000/product/';
    
    $scope.product = {};
    $scope.plans = [
        { id: 1, name: 'Monthly Plan', type: 'monthly', duration: 1 },
        { id: 2, name: 'Quarterly Plan', type: 'quarterly', duration: 3 },
        { id: 3, name: 'Half-Yearly Plan', type: 'half-yearly', duration: 6 },
        { id: 4, name: 'Annual Plan', type: 'annually', duration: 12 }
    ];
    $scope.selectedPlan = null;
    $scope.loading = true;

    if (!$scope.isLoggedIn) {
        $location.path('/login');
        return;
    }

    $http.get(PRODUCT_API + $routeParams.productId + '/')
        .then(function(response) {
            $scope.product = response.data;
            $scope.loading = false;
        });

    $scope.selectPlan = function(plan) {
        $scope.selectedPlan = plan;
    };

    $scope.calculateSubtotal = function() {
        if (!$scope.selectedPlan || !$scope.product) return 0;
        let monthlyRent = $scope.calculateRent($scope.product.mrp, $scope.selectedPlan.type);
        return monthlyRent * $scope.selectedPlan.duration;
    };

    $scope.calculateGST = function() {
        return $scope.calculateSubtotal() * 0.18;
    };

    $scope.calculateGrandTotal = function() {
        return $scope.calculateSubtotal() + $scope.calculateGST();
    };

    $scope.confirmOrder = function() {
        if (!$scope.selectedPlan) {
            alert('Please select a rental plan');
            return;
        }

        var orderData = {
            customer_id: $scope.currentUser.id,
            product_id: $scope.product.id,
            product_name: $scope.product.name,
            subscription_name: $scope.selectedPlan.name,
            price: $scope.calculateRent($scope.product.mrp, $scope.selectedPlan.type),
            subtotal: $scope.calculateSubtotal(),
            gst: $scope.calculateGST(),
            grand_total: $scope.calculateGrandTotal(),
            duration: $scope.selectedPlan.duration, 
            order_date: new Date().toISOString()
        };

        var orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        orders.push(orderData);
        localStorage.setItem('customerOrders', JSON.stringify(orders));

        alert('Order placed successfully!');
        $location.path('/my-rentals');
    };
});

// --- My Rentals Controller ---
app.controller('MyRentalsController', function($scope, $rootScope, $location) {
    
    if (!$scope.isLoggedIn) {
        $location.path('/login');
        return;
    }

    var allOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    $scope.rentals = allOrders.filter(order => order.customer_id === $scope.currentUser.id);

    $scope.calculateSubtotal = function(rental) {
        return rental.subtotal || (rental.price * rental.duration);
    };

    $scope.calculateGST = function(rental) {
        return rental.gst || ($scope.calculateSubtotal(rental) * 0.18);
    };

    $scope.calculateTotalWithTax = function(rental) {
        return rental.grand_total || ($scope.calculateSubtotal(rental) + $scope.calculateGST(rental));
    };

    $scope.viewInvoice = function(rental, index) {
        var startDate = new Date(rental.order_date);
        var endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + parseInt(rental.duration));
        
        $rootScope.selectedInvoice = {
            invoice_number: "INV-" + (new Date().getFullYear()) + "-" + (index + 1001),
            order_id: "ORD-" + rental.customer_id + "-" + Date.now(),
            order_date: rental.order_date,
            start_date: rental.order_date,
            end_date: endDate.toISOString(),
            customer_name: $scope.currentUser.name,
            customer_id: rental.customer_id,
            customer_email: $scope.currentUser.email,
            product_name: rental.product_name,
            product_id: rental.product_id,
            plan_name: rental.subscription_name || rental.plan_name,
            price: rental.price,
            duration: rental.duration,
            phone: $scope.currentUser.phone || rental.customer_phone || 'N/A',
            subtotal: $scope.calculateSubtotal(rental),
            gst: $scope.calculateGST(rental),
            grand_total: $scope.calculateTotalWithTax(rental)
        };
        
        $location.path('/invoice/' + index);
    };

    $scope.cancelRental = function(rental) {
        if (confirm('Are you sure you want to cancel this rental?')) {
            var index = $scope.rentals.indexOf(rental);
            if (index > -1) {
                $scope.rentals.splice(index, 1);
                var updatedOrders = allOrders.filter(o => !(o.customer_id === rental.customer_id && o.order_date === rental.order_date));
                localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));
                allOrders = updatedOrders;
            }
        }
    };

    $scope.calculateEndDate = function(orderDate, durationMonths) {
        if (!orderDate || !durationMonths) return '';
        var date = new Date(orderDate);
        date.setMonth(date.getMonth() + parseInt(durationMonths));
        return date;
    };

    $scope.calculateProgress = function(orderDate, durationMonths) {
        if (!orderDate || !durationMonths) return 0;
        var start = new Date(orderDate);
        var now = new Date();
        var totalDays = durationMonths * 30;
        var diffTime = Math.abs(now - start);
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        var progress = (diffDays / totalDays) * 100;
        return Math.min(Math.max(progress, 5), 100);
    };
});

// --- Invoice Controller ---
app.controller('InvoiceController', function($scope, $rootScope, $routeParams, $location) {
    if (!$rootScope.selectedInvoice) {
        alert('No invoice data found');
        $location.path('/my-rentals');
        return;
    }

    $scope.invoice = $rootScope.selectedInvoice;
    $scope.customer = $scope.currentUser;

    $scope.subtotal = $scope.invoice.price * $scope.invoice.duration;
    $scope.gst = $scope.subtotal * 0.18;
    $scope.grandTotal = $scope.subtotal + $scope.gst;

    $scope.printInvoice = function() {
        window.print();
    };

    $scope.downloadInvoice = function() {
        window.print();
    };
});

// --- Contact Controller ---
app.controller('ContactController', function($scope) {
    $scope.contact = {};
    $scope.submitted = false;
    $scope.submitContact = function() {
        if ($scope.contactForm.$valid) {
            $scope.submitted = true;
            $scope.contact = {};
            $scope.contactForm.$setPristine();
            setTimeout(() => { $scope.$apply(() => { $scope.submitted = false; }); }, 3000);
        }
    };
});

// --- Login Controller ---
app.controller('LoginController', function($scope, $http, $location, $rootScope) {
    $scope.credentials = {};
    $scope.errorMessage = '';
    $scope.loading = false;

    const LOGIN_API = 'http://127.0.0.1:8000/customer/login/';

    $scope.login = function() {
        if ($scope.loginForm.$valid) {
            $scope.loading = true;
            $scope.errorMessage = '';

            $http.post(LOGIN_API, $scope.credentials)
                .then(function(response) {
                    var userData = {
                        id: response.data.customer_id,
                        name: response.data.name,
                        email: response.data.email,
                        avatar: response.data.avatar
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    $rootScope.$broadcast('userLoggedIn', userData);
                    
                    $location.path('/');
                })
                .catch(function(error) {
                    $scope.loading = false;
                    if (error.data && error.data.error) {
                        $scope.errorMessage = error.data.error;
                    } else {
                        $scope.errorMessage = 'Login failed. Please try again.';
                    }
                });
        }
    };
});

// --- Register Controller ---
app.controller('RegisterController', function($scope, $http, $location) {
    const REGISTER_API = 'http://127.0.0.1:8000/customer/';
    $scope.customer = {};
    $scope.errorMessage = '';
    $scope.loading = false;

    $scope.register = function() {
        if ($scope.registerForm.$valid) {
            if ($scope.customer.password !== $scope.customer.confirmPassword) {
                $scope.errorMessage = 'Passwords do not match!';
                return;
            }
            
            $scope.loading = true;
            $scope.errorMessage = '';
            
            var data = angular.copy($scope.customer);
            delete data.confirmPassword;
            
            $http.post(REGISTER_API, data)
                .then(function() {
                    alert('Registration successful! Please login.');
                    $location.path('/login');
                })
                .catch(function(error) {
                    $scope.loading = false;
                    if (error.data && error.data.email) {
                        $scope.errorMessage = 'Email already exists!';
                    } else {
                        $scope.errorMessage = 'Registration failed. Please try again.';
                    }
                });
        }
    };
});

// --- NEW: Forgot Password Controller ---
app.controller('ForgotPasswordController', function($scope, $http, $location) {
    const LINK_TELEGRAM_API = 'http://127.0.0.1:8000/customer/link-telegram/';
    const SEND_OTP_API = 'http://127.0.0.1:8000/customer/send-otp-telegram/';
    const VERIFY_OTP_API = 'http://127.0.0.1:8000/customer/verify-telegram-otp/';
    
    $scope.step = 1; // Current step in the process
    $scope.resetData = {
        email: '',
        mobile: '',
        otp: '',
        new_password: '',
        confirm_password: ''
    };
    $scope.telegramLink = '';
    $scope.errorMessage = '';
    $scope.successMessage = '';
    $scope.loading = false;

    // Step 1: Check if Telegram is linked
    $scope.checkTelegramLink = function() {
        $scope.loading = true;
        $scope.errorMessage = '';
        $scope.successMessage = '';

        var data = {
            email: $scope.resetData.email,
            phone: $scope.resetData.mobile
        };

        $http.post(LINK_TELEGRAM_API, data)
            .then(function(response) {
                $scope.loading = false;
                // If we get a telegram_link, account exists but not linked
                if (response.data.telegram_link) {
                    $scope.telegramLink = response.data.telegram_link;
                    $scope.step = 2; // Go to link Telegram step
                    $scope.successMessage = 'Account found! Please link your Telegram account.';
                }
            })
            .catch(function(error) {
                $scope.loading = false;
                if (error.status === 404) {
                    $scope.errorMessage = 'No account found with this email and mobile number.';
                } else if (error.data && error.data.error) {
                    // If error says already linked, proceed to OTP
                    if (error.data.error.includes('already linked') || error.status === 200) {
                        $scope.step = 3;
                        $scope.successMessage = 'Telegram account is linked!';
                    } else {
                        $scope.errorMessage = error.data.error;
                    }
                } else {
                    $scope.errorMessage = 'An error occurred. Please try again.';
                }
            });
    };

    // Step 2: Proceed to OTP after linking Telegram
    $scope.proceedToOTP = function() {
        $scope.step = 3;
        $scope.successMessage = 'Great! Now let\'s send you an OTP.';
    };

    // Step 3: Send OTP to Telegram
    $scope.sendOTP = function() {
        $scope.loading = true;
        $scope.errorMessage = '';
        $scope.successMessage = '';

        var data = {
            email: $scope.resetData.email,
            mobile: $scope.resetData.mobile
        };

        $http.post(SEND_OTP_API, data)
            .then(function(response) {
                $scope.loading = false;
                $scope.step = 4; // Go to verify OTP step
                $scope.successMessage = 'OTP sent to your Telegram! Please check your messages.';
            })
            .catch(function(error) {
                $scope.loading = false;
                if (error.data && error.data.error) {
                    $scope.errorMessage = error.data.error;
                    // If Telegram not linked, go back to step 2
                    if (error.data.error.includes('not linked')) {
                        $scope.step = 1;
                        $scope.errorMessage = 'Telegram account not linked. Please start over.';
                    }
                } else {
                    $scope.errorMessage = 'Failed to send OTP. Please try again.';
                }
            });
    };

    // Step 4: Verify OTP and reset password
    $scope.verifyOTPAndReset = function() {
        if ($scope.resetData.new_password !== $scope.resetData.confirm_password) {
            $scope.errorMessage = 'Passwords do not match!';
            return;
        }

        $scope.loading = true;
        $scope.errorMessage = '';
        $scope.successMessage = '';

        var data = {
            email: $scope.resetData.email,
            mobile: $scope.resetData.mobile,
            otp: $scope.resetData.otp,
            new_password: $scope.resetData.new_password
        };

        $http.post(VERIFY_OTP_API, data)
            .then(function(response) {
                $scope.loading = false;
                $scope.step = 5; // Success step
                $scope.successMessage = 'Password reset successful!';
                
                // Clear form data
                $scope.resetData = {
                    email: '',
                    mobile: '',
                    otp: '',
                    new_password: '',
                    confirm_password: ''
                };
            })
            .catch(function(error) {
                $scope.loading = false;
                if (error.data && error.data.error) {
                    $scope.errorMessage = error.data.error;
                } else {
                    $scope.errorMessage = 'Failed to reset password. Please try again.';
                }
            });
    };

    // Go back to previous step
    $scope.goBack = function() {
        if ($scope.step > 1) {
            $scope.step--;
            $scope.errorMessage = '';
            $scope.successMessage = '';
        }
    };
});

// --- Profile Controller ---
app.controller('ProfileController', function($scope, $http, $location) {
    $scope.customer = {};
    $scope.isEditing = false;
    $scope.successMessage = '';
    $scope.errorMessage = '';
    $scope.imagePreview = null;
    $scope.avatarBase64 = null;

    var userData = localStorage.getItem('currentUser');
    if (!userData) {
        $location.path('/login');
        return;
    }

    var user = JSON.parse(userData);
    const CUSTOMER_API = 'http://127.0.0.1:8000/customer/' + user.id + '/';

    $scope.loadProfile = function() {
        $http.get(CUSTOMER_API)
            .then(function(response) {
                $scope.customer = response.data;
                $scope.originalCustomer = angular.copy(response.data);
            })
            .catch(function(error) {
                console.error('Error loading profile:', error);
            });
    };

    $scope.onFileSelect = function(event) {
        var file = event.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                $scope.$apply(function() {
                    $scope.errorMessage = 'Please select a valid image file';
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                $scope.$apply(function() {
                    $scope.errorMessage = 'Image size should be less than 5MB';
                });
                return;
            }

            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.imagePreview = e.target.result;
                    $scope.avatarBase64 = e.target.result;
                    $scope.errorMessage = '';
                });
            };
            reader.readAsDataURL(file);
        }
    };

    $scope.saveAvatar = function() {
        if (!$scope.avatarBase64) {
            $scope.errorMessage = 'Please select an image first';
            return;
        }

        $scope.errorMessage = '';
        $scope.successMessage = '';

        var updateData = {
            avatar: $scope.avatarBase64
        };

        $http.put(CUSTOMER_API, updateData)
            .then(function(response) {
                $scope.successMessage = 'Profile picture updated successfully!';
                $scope.customer = response.data;
                $scope.originalCustomer = angular.copy(response.data);
                $scope.imagePreview = null;
                $scope.avatarBase64 = null;
                
                var userData = JSON.parse(localStorage.getItem('currentUser'));
                userData.avatar = response.data.avatar;
                localStorage.setItem('currentUser', JSON.stringify(userData));

                var fileInput = document.getElementById('avatarInput');
                if (fileInput) {
                    fileInput.value = '';
                }

                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.successMessage = '';
                    });
                }, 3000);
            })
            .catch(function(error) {
                console.error('Error updating avatar:', error);
                $scope.errorMessage = 'Failed to update profile picture. Please try again.';
            });
    };

    $scope.cancelAvatar = function() {
        $scope.imagePreview = null;
        $scope.avatarBase64 = null;
        $scope.errorMessage = '';
        
        var fileInput = document.getElementById('avatarInput');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    $scope.toggleEdit = function() {
        $scope.isEditing = !$scope.isEditing;
        if (!$scope.isEditing) {
            $scope.customer = angular.copy($scope.originalCustomer);
        }
        $scope.errorMessage = '';
        $scope.successMessage = '';
    };

    $scope.updateProfile = function() {
        $scope.errorMessage = '';
        $scope.successMessage = '';

        var updateData = {
            name: $scope.customer.name,
            email: $scope.customer.email,
            phone: $scope.customer.phone,
            address: $scope.customer.address
        };

        $http.put(CUSTOMER_API, updateData)
            .then(function(response) {
                $scope.successMessage = 'Profile updated successfully!';
                $scope.isEditing = false;
                $scope.originalCustomer = angular.copy(response.data);
                
                var userData = JSON.parse(localStorage.getItem('currentUser'));
                userData.name = response.data.name;
                userData.email = response.data.email;
                localStorage.setItem('currentUser', JSON.stringify(userData));

                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.successMessage = '';
                    });
                }, 3000);
            })
            .catch(function(error) {
                console.error('Error updating profile:', error);
                $scope.errorMessage = 'Failed to update profile. Please try again.';
            });
    };

    $scope.loadProfile();
});