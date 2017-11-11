var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/route/api')(router);
var path = require('path');
var passport = require('passport');
var social = require('./app/passport/passport')(app, passport);

app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use("/api", appRoutes);

//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://amitnitt:AMIT533185@ds155315.mlab.com:55315/mymondodb', function(err){
	if(err){
		console.log('Not connected to the server' + err);
	} else{
		console.log('Successfully connected to mongodb')
	}
}); 

app.get('*' , function(req, res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen( process.env.PORT || '8081' , function () {
	console.log('server has started');
});