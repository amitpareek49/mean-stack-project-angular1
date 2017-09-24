angular.module('authServices', [])

angular.module('mainController', ['authServices'])

.controller('mainCtrl', function (Auth, $timeout, $location, $rootScope, $window) {
	var app = this;
	app.loadme = false;
		$rootScope.$on('$routeChangeStart', function(){
			if(Auth.isLoggedIn()){
			app.userIsLoggedIn = true;
			console.log('user is logged in bithes!');
			Auth.getUser().then(function(data){
				console.log(data.data);
				app.loadme = true;
				app.username = data.data.username;
				app.email = data.data.email;
			});
		} else{
			app.userIsLoggedIn = false;
			app.loadme = true;
			console.log('user not logged in');
			app.username = '';
		}

		if($location.hash() == '_=_') $location.hash(null);
		});

	this.facebook = function () {
		console.log($window.location.host);
		console.log($window.location.protocol);
		$window.location = $window.location.protocol + "//" + $window.location.host + "/auth/facebook";
	};

	this.twitter = function () {
		//console.log($window.location.host);
		//console.log($window.location.protocol);
		$window.location = $window.location.protocol + "//" + $window.location.host + "/auth/twitter";
	};

	this.google = function () {
		//console.log($window.location.host);
		//console.log($window.location.protocol);
		$window.location = $window.location.protocol + "//" + $window.location.host + "/auth/google";
	};

	this.doLogin = function(loginData) {
		app.loading = true;
		app.errorMsg = false;
		console.log('form submitted');
				//$http.post('/api/authenticate', app.loginData).then(function(data){
		     Auth.login(app.loginData).then(function(data){
			
				console.log(data.data.message);
				console.log(data.data.success);
				if(data.data.success){
					app.loading = false;
					app.successMsg = data.data.message;
					$timeout(function() {
						$location.path('/');
						app.loginData = '';
						app.successMsg =false;
					}, 2000);

				} else{
					app.loading = false;
					app.errorMsg = data.data.message;
				}
		});
	}

	this.logout = function (){
		Auth.logout();
		$location.path('/logout');
		$timeout(function (){
			$location.path('/about');
		}, 2000);
	};
});