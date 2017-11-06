angular.module('myApp', ['appRoutes', 'userControllers', 'emailController', 'userServices', 'mainController','managementController', 'authServices'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
})