var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';

module.exports = function (app, passport){

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false }}));

	passport.serializeUser(function(user, done) {
		if(user.active){
	  		token = jwt.sign({ username: user.username, password: user.password}, secret , {expiresIn: '24h'});
	  	} else{
	  		token = 'inactive/error';
	  	}
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});

	passport.use(new FacebookStrategy({
		clientID: '1816072505376705',
		clientSecret: '9437315e8009924eca27ff7f2d2c5061',
		callbackURL: "https://safe-island-40143.herokuapp.com/auth/facebook/callback",
		profileFields: ['id', 'displayName', 'photos', 'email']
	},
  	function(accessToken, refreshToken, profile, done) {
  		User.findOne({ email: profile._json.email}).select('username active password email').exec(function(err, user){
  		  			
  		  			if(err) done(err);

  		  			if(user && user!= null){
  		  				done(null, user);
  		  			} else {
  		  				done(err);
  		  			}
  		});

		//done(null, profile);
  	}
		));1
	passport.use(new TwitterStrategy({
	    consumerKey: 'u2gpQuYtGg9BlBnF9hPz2Ummr',
	    consumerSecret: '9cb95RPwvKBO2xrgXZxboOlGA1TuOL5BBHtpzZ6kgg6ElnDRTT',
	    callbackURL: "https://safe-island-40143.herokuapp.com/auth/twitter/callback",
	    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
	  },
	  function(token, tokenSecret, profile, done) {
	  		console.log(profile.emails[0].value);
	  		User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
  		  			
  		  			if(err) done(err);

  		  			if(user && user!= null){
  		  				done(null, user);
  		  			} else {
  		  				done(err);
  		  			}
  		});

	  		//done(null, profile);
	  }
	));

	passport.use(new GoogleStrategy({
	    clientID: '1072041634206-b325f1dvp7vei9rc2evbg61f12hc37c7.apps.googleusercontent.com',
	    clientSecret: '3ZUN_9ZVaKAe8btGsZM5nYZz',
	    callbackURL: "https://safe-island-40143.herokuapp.com/auth/google/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {
	       console.log(profile.emails[0].value);
	       User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
  		  			
  		  			if(err) done(err);

  		  			if(user && user!= null){
  		  				done(null, user);
  		  			} else {
  		  				done(err);
  		  			}
  		});
	       //done(null, profile);
	  }
	));

	app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));

	app.get('/auth/google/callback', 
	  passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) 
	  { 
	  	res.redirect('/google/' + token); 
	  });

	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function(req, res){
		res.redirect('/twitter/' + token);
	});

	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res){
		res.redirect('/facebook/' + token);
	});

	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

	return passport;
}
