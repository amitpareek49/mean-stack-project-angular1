angular.module('userServices', [])

.factory('User', function($http){
	var userFactory = {};

	userFactory.create = function(regData){
		return $http.post('/api/users', regData);
	}

	//User.checkUsername(regData)
	userFactory.checkUsername = function(regData){
		return $http.post('/api/checkusername', regData);
	}

	//User.checkEmail(regData)
	userFactory.checkEmail = function(regData){
		return $http.post('/api/checkemail', regData);
	}

	//User.activeAccount(token)
	userFactory.activeAccount = function(token){
		return $http.put('/api/activate/' + token);
	}

	//userFactory.checkCredentials(loginData)
	userFactory.checkCredentials = function(loginData){
		return $http.post('/api/resend', loginData);
	}

	//User.resendLink(username);
	userFactory.resendLink = function (username){
		return $http.put('/api/resend', username);
	}

	//User.sendUsername(userData)
	userFactory.sendUsername = function(userData){
		return $http.get('/api/resetusername/' + userData);
	}

	userFactory.sendPassword = function(resetData){
		return $http.put('/api/resetpassword', resetData);
	}

	userFactory.resetUser = function(token){
		return $http.get('/api/resetpassword/' + token);
	}

	userFactory.savePassword = function(regData){
		return $http.put('/api/savepassword', regData);
	}

	//userFactory.renewSession(username)
	userFactory.renewSession = function(username){
		return $http.get('/api/renewToken/' + username);
	}

	return userFactory;
});