angular.module('myApp', ['appRoutes', 'userControllers', 'emailController', 'userServices', 'mainController', 'authServices'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
})