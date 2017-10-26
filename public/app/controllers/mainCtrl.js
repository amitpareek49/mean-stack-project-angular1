angular.module('authServices', [])

angular.module('mainController', ['authServices', 'userServices'])

.controller('mainCtrl', function (Auth, $timeout, $location, $rootScope, $window, $interval, $route, User, AuthToken) {
	var app = this;
	app.loadme = false;

	app.checkSession = function() {
		if(Auth.isLoggedIn()){
				app.checkingSession = true;

				var interval = $interval(function() {
					var token = $window.localStorage.getItem('token');

					if(token === null) {
						$interval.cancel(interval);
					} else {
						self.parseJwt = function(token) {
		                    var base64Url = token.split('.')[1];
		                    var base64 = base64Url.replace('-', '+').replace('_', '/');
		                    return JSON.parse($window.atob(base64));
		                }
		                var expireTime = self.parseJwt(token);
		                var timeStamp = Math.floor(Date.now() / 1000);
		                console.log(expireTime.exp);
		                console.log(timeStamp); 
		                var timeCheck = expireTime.exp - timeStamp;
		                console.log('Time check ' + timeCheck);
		                if(timeCheck <= 25){
		                	console.log('Token has expired');
		                	showModal(1);
		                	$interval.cancel(interval);
		                } else {
		                	console.log('Token yet to expire');
		                }
					}
			}, 2000);
		}
	};

	app.checkSession();

	var showModal = function(option){
		app.choiceMade = false;
		app.modalHeader = undefined;
		app.modalBody = undefined;
		app.hideButton = false;

		if(option === 1) {			
			app.modalHeader ="Timeout warning";
			app.modalBody = "Your session will expire in 5 minutes. Would you like to renew the session."
			$("#myModal").modal({ backdrop: 'static'});
		} else if (option === 2) {
			app.hideButton = true;
			app.modalHeader ="Logging Out";
			$("#myModal").modal({ backdrop: 'static'});
			$timeout(function(){
				Auth.logout();
				$location.path('/logout');
				hideModal();
				$route.reload();
			}, 5000);
		}
		$timeout(function(){
				console.log('Logged out!!');
				hideModal();
		}, 5000);
	};

	app.renewSession = function(){
		app.choiceMade = true;

		User.renewSession(app.username).then(function(data){
			if(data.data.success){
				AuthToken.setToken(data.data.token);
				app.checkSession();
			} else {
				app.modalBody = data.data.message;
			}
		});
		console.log('Your session has been renewed');
		hideModal();
	}

	app.endSession = function(){
		app.choiceMade = true;
		console.log('Your session has ended');
		hideModal();
		$timeout(function(){
			showModal(2);
		}, 1000);
	}

	var hideModal = function(){
		$("#myModal").modal("hide");
	}

	$rootScope.$on('$routeChangeStart', function(){

		if(!app.checkingSession) app.checkSession();
		if(Auth.isLoggedIn()){
		app.userIsLoggedIn = true;
		Auth.getUser().then(function(data){
			//console.log(data.data);
			app.loadme = true;
			app.username = data.data.username;
			app.email = data.data.email;
		});
	} else{
		app.userIsLoggedIn = false;
		app.loadme = true;
		//console.log('user not logged in');
		app.username = '';
	}

	if($location.hash() == '_=_') $location.hash(null);
	});

	this.facebook = function () {
		console.log($window.location.host);
		console.log($window.location.protocol);
		app.disabled = true;
		$window.location = $window.location.protocol + "//" + $window.location.host + "/auth/facebook";
	};

	this.twitter = function () {
		//console.log($window.location.host);
		//console.log($window.location.protocol);
		app.disabled = true;
		$window.location = $window.location.protocol + "//" + $window.location.host + "/auth/twitter";
	};

	this.google = function () {
		//console.log($window.location.host);
		//console.log($window.location.protocol);
		app.disabled = true;
		$window.location = $window.location.protocol + "//" + $window.location.host + "/auth/google";
	};

	this.doLogin = function(loginData) {
		app.loading = true;
		app.errorMsg = false;
		app.expired = false;
		app.disabled = true;
		//console.log('form submitted');
				//$http.post('/api/authenticate', app.loginData).then(function(data){
		     Auth.login(app.loginData).then(function(data){
				if(data.data.success){
					app.loading = false;
					app.successMsg = data.data.message;
					$timeout(function() {
						$location.path('/');
						app.loginData = '';
						app.successMsg =false;
					}, 2000);

				} 
				else{
					if(data.data.expired){
						app.expired = true;
						app.loading = false;
						app.errorMsg = data.data.message;
					} else {
						app.loading = false;
						app.errorMsg = data.data.message;
						app.disabled = false;
				}
				}
		});
	}

	app.logout = function (){
		showModal(2);
	};
});