angular.module('emailController', ['userServices'])

.controller('emailCtrl', function($routeParams, User, $timeout, $location){
             app = this;

            User.activeAccount($routeParams.token).then(function(data){
            	app.successMsg = false;
            	app.errorMsg = false;

                if(data.data.success){
                    app.successMsg = data.data.message + '.... Redirecting';
                    $timeout(function() {
                    $location.path('/login');
                    }, 2000);
                } else {
                	app.errorMsg = data.data.message + '.... Redirecting';
                    $timeout(function() {
                        $location.path('/login');
                    }, 2000);
                }
	});

})


//userFactory.checkCredentials(loginData)
.controller('resendCtrl', function(User){
    app = this;

    app.checkCredentials = function(loginData){
        app.errorMsg = false;
        app.successMsg = false;
        app.disabled = true;
        User.checkCredentials(app.loginData).then(function(data){
            //console.log(data);
            if(data.data.success){
                User.resendLink(app.loginData).then(function(data){
                    console.log(data);
                    app.successMsg = data.data.message;
                })
            } else {
                    app.disabled= false;
                    app.errorMsg = data.data.message;
            }
        })
    }
})

//userFactory.sendUsername(userData)
.controller('usernameCtrl', function(User){
    app = this;

    app.sendUsername = function(userData, valid){
        console.log(userData);
        app.errorMsg = false;
        app.loading = true;
        app.disabled = true;
        if(valid){
            User.sendUsername(app.userData.email).then(function(data){
                app.loading = false;
                if(data.data.success){
                    app.successMsg = data.data.message;
                } else {
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
                //console.log(data);
            });
        } else{
            app.loading = false;
            app.disabled = false;
            app.errorMsg = 'Please provide a valid email';
        }
        
    }
})

.controller('passwordCtrl', function(User){
    app = this;

    app.sendPassword = function(resetData, valid){
        app.errorMsg = false;
        app.loading = true;
        app.disabled = true;
        if(valid){
            User.sendPassword(app.resetData).then(function(data){
                app.loading = false;
                console.log(data);
                if(data.data.success){
                    app.successMsg = data.data.message;
                } else {
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            });
        } else{
            app.loading = false;
            app.disabled = false;
            app.errorMsg = 'Please provide a valid username';
        }
        
    }
})


.controller('resetCtrl', function(User, $routeParams, $scope, $timeout, $location) {
    app = this;
    app.hide = true;

    User.resetUser($routeParams.token).then(function(data){
        //console.log(data);
        if(data.data.success){
            app.hide = false;
            app.successMsg = 'Please enter a new password';
            $scope.username = data.data.user.username;
        } else {
            app.errorMsg = data.data.message;
        } 
    });

    app.savePassword =function(regData, valid, confirmed) {
        app.errorMsg = false;
        app.disabled = false;
        app.loading = true;

        if(valid && confirmed){
            app.regData.username = $scope.username;
            console.log(app.regData);
            User.savePassword(app.regData).then(function(data){
                app.loading = false;
                console.log(data);
                if(data.data.success){
                    app.successMsg = data.data.message + '....Redirecting';
                    $timeout(function(){
                         $location.path('/login');
                    }, 2000);
                } else {
                    app.loading = false;
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            });
        } else {
            app.loading = false;
            app.disabled = false;
            app.errorMsg = 'Please ensure the form has been filled properly';
        }
    }
});
