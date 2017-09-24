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

/*var xmlcompare = require('node-xml-compare');
 
xml1 = "<sample><a>1</a><a>2</a><a>4</a><b>4</b></sample>";
xml2 = "<sample><a>2</a><a>1</a><a>3</a><c>3</c></sample>";
 
xmlcompare(xml1, xml2, function(result) {
 
    //render result[-] to html page to show the xml1 nodes that are not in xml2 
    //render result[+] to html page to show the xml2 nodes that are not in xml1 
 	console.log(result['-']);
});*/

app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use("/api", appRoutes);

//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/tutorial', function(err){
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