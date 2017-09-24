angular.module('myApp', ['appRoutes', 'userControllers', 'userServices', 'mainController', 'authServices'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
})