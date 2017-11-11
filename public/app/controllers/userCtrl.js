angular.module('userControllers', ['userServices'])

.controller('regCtrl', function($http, $location, $timeout, User){
		
		var app = this;
		this.regUser = function(regData, valid, confirmed) {
		app.loading = true;
		app.errorMsg = false;
        app.disabled = true;
		console.log('form submitted');
		
        if(valid && confirmed){
            User.create(app.regData).then(function(data) {
                // Check if user was saved to database successfully
                if (data.data.success) {
                    app.loading = false; // Stop bootstrap loading icon
                    //$scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message + '...Redirecting'; // If successful, grab message from JSON object and redirect to login page
                    // Redirect after 2000 milliseconds (2 seconds)
                    $timeout(function() {
                        $location.path('/');
                    }, 2000);
                } else {
                    app.disabled = false;
                    app.loading = false; // Stop bootstrap loading icon
                    app.disabled = false; // If error occurs, remove disable lock from form
                    //$scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsg = data.data.message; // If not successful, grab message from JSON object
                }
            });
        } else{
                app.disabled = false;
                app.loading = false; // Stop bootstrap loading icon
                app.disabled = false; // If error occurs, remove disable lock from form
                //$scope.alert = 'alert alert-danger'; // Set class for message
                app.errorMsg = 'Please ensure that you have filled the form properly.'; 
        }
	};


    //checkUsername(regData)
    this.checkUsername = function(regData){
        app.checkingUsername = true;
        app.usernameMsg = false;
        app.usernameInvalid = false;

        User.checkUsername(app.regData).then(function(data){
            if(data.data.success){
                app.usernameMsg= data.data.message;
                app.checkingUsername = false;
            } else{
                app.usernameMsg= data.data.message;
                app.checkingUsername = false;
                app.usernameInvalid = true;
            }
        });
    }

    this.checkEmail = function(regData){
         app.checkingEmail = true;
         app.emailMsg = false;
         app.emailInvalid = false;

        User.checkEmail(app.regData).then(function(data){
            //console.log(data.data);
            if(data.data.success){
                app.emailMsg= data.data.message;
                app.checkingEmail = false;
            } else{
                app.emailMsg= data.data.message;
                app.checkingEmail = false;
                app.emailInvalid = true;
            }
        });
    }
        
    //User.checkUsername(regData)
    //User.checkEmail(regData)
})

.directive('match', function() {
    return {
        restrict: 'A', // Restrict to HTML Attribute
        controller: function($scope) {
            $scope.confirmed = false; // Set matching password to false by default

            // Custom function that checks both inputs against each other               
            $scope.doConfirm = function(values) {
                // Run as a loop to continue check for each value each time key is pressed
                values.forEach(function(ele) {
                    // Check if inputs match and set variable in $scope
                    console.log(ele);
                    if ($scope.confirm == ele) {
                        $scope.confirmed = true; // If inputs match
                    } else {
                        $scope.confirmed = false; // If inputs do not match
                    }
                });
            };
        },

        link: function(scope, element, attrs) {

            // Grab the attribute and observe it            
            attrs.$observe('match', function() {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });

            // Grab confirm ng-model and watch it           
            scope.$watch('confirm', function() {
                console.log(attrs.match);
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });
        }
    };
})

.controller('facebookCtrl', function($routeParams, Auth, $location, $window){
        var app = this;
        app.errorMsg = false;
        app.expired = false;
        //Auth.facebook
        if($window.location.pathname == '/facebookerror'){
            app.errorMsg = "username not found in database";
        } else if($window.location.pathname == '/facebook/inactive/error'){
            app.expired = true;
            app.errorMsg = "Your account is not activated yet. Please check your email for activation link.";
        } else {
            Auth.facebook($routeParams.token);
            $location.path('/');
        }
       
})


.controller('twitterCtrl', function($routeParams, Auth, $location, $window){
        var app = this;
        app.errorMsg = false;
        app.expired = false;
        //Auth.facebook
        if($window.location.pathname == '/twittererror'){
            app.errorMsg = "username not found in database";
        } else if($window.location.pathname == '/twitter/inactive/error'){
            app.expired = true;
            app.errorMsg = "Your account is not activated yet. Please check your email for activation link.";
        } else {
            Auth.facebook($routeParams.token);
            $location.path('/');
        }
       
})

.controller('googleCtrl', function($routeParams, Auth, $location, $window){
        var app = this;
        app.errorMsg = false;
        app.expired = false;
        //Auth.facebook
        if($window.location.pathname == '/googleerror'){
            app.errorMsg = "username not found in database";
        } else if($window.location.pathname == '/google/inactive/error'){
            app.expired = true;
            app.errorMsg = "Your account is not activated yet. Please check your email for activation link.";
        } else {
            Auth.facebook($routeParams.token);
            $location.path('/');
        }
       
});

