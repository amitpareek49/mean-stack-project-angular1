var User = require ('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var xoauth2 = require('xoauth2');

module.exports = function (router){

	const client = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
	    type: 'OAuth2',
	    user: 'amit33185@gmail.com', 
            clientId: '1072041634206-b325f1dvp7vei9rc2evbg61f12hc37c7.apps.googleusercontent.com',
            clientSecret: '3ZUN_9ZVaKAe8btGsZM5nYZz',
            refreshToken: '1/NjzWK23P1jrNTI0Qku92oDuABlyVltEcfarSxWkUNl0',
	    accessToken: 'ya29.GlutBK7jWB9IaMrt8x0TGxTYoFual_nE2dfWsMth4eC9HJsRrG2Eo_zwQU-fgGYcgC8LC5UzhLBOxtQiYw3Pe1HaRzaZziEKYtpj-d6nSXFtz0_Kl_3FDMMNzhWL',
	  },
	})

	router.post('/users', function(req, res){
	console.log('request recieved');
	console.log(req.body);
	var user = new User();
	user.username = req.body.username;
	user.password = req.body.password;
	user.email = req.body.email;
	user.name = req.body.name;
	user.temporarytoken = jwt.sign({ username: user.username, email: user.email}, secret , {expiresIn: '24h'});

	if(user.username == null || user.username == "" || user.password == null || user.password == "" || 
		user.email == null || user.email == "" || user.name == null || user.name == ""){
		res.json({success: false, message: 'Ensure name, email, username or password are provided'});
	} else{
		user.save(function(err){
		if(err) {
				if(err.errors != null) {
				if(err.errors.name){
				res.json({success: false, message: err.errors.name.message });
				} else if (err.errors.email){
				res.json({success: false, message: err.errors.email.message });	
				}  else if (err.errors.username){
				res.json({success: false, message: err.errors.username.message });	
				}  else if (err.errors.password){
				res.json({success: false, message: err.errors.password.message });	
				} else {
				res.json({success: false, message: err });	
				}
		} else if(err){
			if(err.code == 11000) {
				console.log(err);
				if(err.errmsg[61] == 'u') {
				res.json({success: false, message: 'Username already taken'});	
				} else if (err.errmsg[61] == 'e') {
				res.json({success: false, message: 'Email already taken'});
				} else {
					res.json({success: false, message: err});	
				}
				}
			} 
		}
		else{
            var email = {
                from: 'amit33185@gmail.com',
                to: user.email,
                subject: 'Account activation link',
                text: 'Plain Text Version of E-mail',
                //html: 'HTML Version of E-mail'
                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thank you for registering at localhost.com. Please click on the link below to complete your activation:<br><br><a href="http://localhost:8081/activate/' + user.temporarytoken + '">http://localhost:8081/activate/</a>'
            };

            client.sendMail(email, function(err, info) {
                if (err) {
                    console.log(err); 
                } else {
                    console.log('message = ' + info.message);
                }
            });
			res.json({success: true, message: 'Account created! Please check your email for the activation link'});
		}
	});
	}

});


router.post('/checkusername', function(req, res) {
    User.findOne({ username: req.body.username }).select('email username password').exec(function(err, user) {
        if (err) throw err;

        if (user) {
            res.json({ success: false, message: 'username already taken' });
        } else {
            res.json({ success: true, message: 'Valid username' });
        }
    });
});


router.post('/checkemail', function(req, res) {
    User.findOne({ email: req.body.email }).select('email username password').exec(function(err, user) {
        if (err) throw err;

        if (user) {
            res.json({ success: false, message: 'Email already taken' });
        } else {
            res.json({ success: true, message: 'Valid email' });
        }
    });
});

router.post('/authenticate', function(req, res) {
    User.findOne({ username: req.body.username }).select('email username password active').exec(function(err, user) {
        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Could not authenticate' });
        } else if (user) {
            if (req.body.password) {
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                res.json({ success: false, message: 'Could not validate Password' });
            } else if (!user.active){
            	res.json({ success: false, message: 'Your account is not activated yet. Please check your email for activation link.', expired: true});
            }


            else {
            	var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                res.json({ success: true, message: 'User Authenticated', token: token });
            }
            } else {
                res.json({ success: false, message: 'No password provided' });              
            }
        }
    });
});


router.post('/resend', function(req, res) {
    User.findOne({ username: req.body.username }).select('username password active').exec(function(err, user) {
        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Could not authenticate' });
        } else if (user) {
            if (req.body.password) {
                var validPassword = user.comparePassword(req.body.password);
	            if (!validPassword) {
	                res.json({ success: false, message: 'Could not validate Password' });
	            } else if (user.active) {
	            	res.json({ success: false, message: 'Account already activated'});
	            } else {
	                res.json({ success: true, user: user});
	            }
        } else{
        	res.json({ success: false, message: 'No password provided' });
        }
      }
    });
});

router.put('/resend', function(req, res){
	User.findOne({ username: req.body.username}).select('username name email temporarytoken').exec(function(err, user){
		if(err){
			console.log(err);
		}
		user.temporarytoken = jwt.sign({ username: user.username, email: user.email}, secret , {expiresIn: '24h'});
		user.save(function(err){
			if(err) {
				console.log(err);
			} else {
				var email = {
	            from: 'localhost',
	            to: user.email,
	            subject: 'Activation link request',
	            text: 'Plain Text Version of E-mail',
	            //html: 'HTML Version of E-mail'
	            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You requested for account activation. Please click on the link below to complete your activation:<br><br><a href="http://localhost:8081/activate/' + user.temporarytoken + '">http://localhost:8081/activate/</a>'
	            };

	            client.sendMail(email, function(err, info) {
	                if (err) {
	                    console.log(err); 
	                } else {
	                    console.log('message = ' + info.message);
	                }
	            });
	            res.json({success: true, message: 'Activation link sent to ' + user.email + '!'});
			}
		})
	})
});

router.put('/activate/:token', function(req, res) {
	User.findOne({temporarytoken : req.params.token }, function(err, user){
		if(err) throw err;
		var token= req.params.token;
		jwt.verify(token, secret , function(err, decoded) {
			 if(err){ 
			 	res.json({success: false, message: 'Activation link expired'});
			} else if (!user) {
				res.json({success: false, message: 'Activation link expired'});
			} else {
				user.temporarytoken = false;
				user.active = true;
				user.save(function(err){
				if (err){
					console.log(err);
				} else {
					var email = {
		            from: 'localhost',
		            to: user.email,
		            subject: 'Acount Activated',
		            text: 'Plain Text Version of E-mail',
		            //html: 'HTML Version of E-mail'
		            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your account has been successfully activated!'	            
		        	};

	            client.sendMail(email, function(err, info) {
	                if (err) console.log(err);
	            });
				res.json({ success: true, message: 'Account activated!' }); 
				}
			});

			}
		});
	});
});

router.get('/resetusername/:email', function(req, res){
	User.findOne({ email: req.params.email }).select('email username name').exec(function(err, user){
		if(err){
			res.json({ success: false, message: err});
		} else{
			if(!req.params.email){
				res.json({ success: false, message: 'No email was provided'});
			} else{
				if(!user){
					res.json({ success: false, message: 'Email was not found'});
				} else{
					var email = {
			            from: 'localhost',
			            to: user.email, 
			            subject: 'Localhost host username request',
			            text: 'Plain Text Version of E-mail',
			            //html: 'HTML Version of E-mail'
			            //html: 'Hello <strong> ' + user.name + '</strong><br><br>Your recently requested your username. Please save it in your files: ' + user.username + '!'	            l
			        	html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your recently requested your username. Please save it in your files: ' + user.username + '!'
			        };

		            client.sendMail(email, function(err, info) {
		                if (err) console.log(err);
		            });

					res.json({ success: true, message: 'username has been sent to the E-mail'});
				}
			}
		}
	})
});

router.put('/resetpassword', function(req, res){
	User.findOne({username: req.body.username}).select('username active email resettoken name').exec(function(err, user){
		if(err) console.log(err);
		if(!user) {
			res.json({ success: false, message: 'User was not found'});
		} else if(!user.active){
			res.json({ success: false, message: 'Account has not yet been activated'});
		} else {
			console.log(req.body);
			user.resettoken = jwt.sign({ username: user.username, email: user.email}, secret , {expiresIn: '24h'});
			user.save(function(err){
				if(err){
					res.json({success: false, message: err});
				} else {
					var email = {
		                from: 'amit33185@gmail.com',
		                to: user.email,
		                subject: 'Localhost reset password request',
		                text: 'Plain Text Version of E-mail',
		                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently requested a password reset link. Please click on the link below to reset your password:<br><br><a href="http://localhost:8081/reset/' + user.resettoken + '">http://localhost:8081/reset/</a>'
		            };

		            client.sendMail(email, function(err, info) {
		                if (err) {
		                    console.log(err); 
		                } else {
		                    console.log('message = ' + info.message);
		                }
		            });
					res.json({ success: true, message: 'Please check your email for password reset link'});
				}
			})
		}
	})
})

router.get('/resetpassword/:token', function(req, res){
	console.log('Test');
	User.findOne({resettoken: req.params.token}).select().exec(function(err, user){
		if(err) console.log(err);
		var token= req.params.token;
		jwt.verify(token, secret , function(err, decoded) {
		 if(err){ 
		 	res.json({success: false, message: 'Password link has expired'});
		} else {
			if(!user){
				res.json({success: false, message: 'Password link has expired'});
			} else{
				res.json({success: true, user: user});
			}
		}
	})
	})
})

router.put('/savepassword', function(req, res){
	User.findOne({ username: req.body.username }).select('username name email resettoken password').exec(function(err, user){
		if(err) console.log(err);
		else{
			if(req.body.password === null || req.body.password === '') {
				res.json({success: false, message: 'Password not provided'});
			} else{
				console.log(req.body);
				user.password = req.body.password;
				user.resettoken = false;
				user.save(function(err){
					if(err){
						res.json({ success: false, message: 'Error saving in database' });
					} else {
						var email = {
				            from: 'localhost',
				            to: user.email,
				            subject: 'Localhost reset password',
				            text: 'Plain Text Version of E-mail',
				            html: 'Hello<strong> ' + user.name + '</strong>,<br><br> This email is to notify that you recently changed your password using localhost.'
			            };

			            client.sendMail(email, function(err, info) {
			                if (err) {
			                    console.log(err); 
			                } else {
			                    console.log('message = ' + info.message);
			                }
			            });
						res.json({ success: true, message: 'Password has been reset'});
					}
				})
			}
		}
	});
})

router.use(function(req, res, next){
	var token = req.body.token || req.body.query || req.headers['x-access-token'];

	console.log(req.headers);
	if(token){
		jwt.verify(token, secret , function(err, decoded) {
			 if(err){ 
			 	res.json({success: false, message: 'invalid token'});
			} else {
				req.decoded = decoded;
				next();
			}
	});

	} else {
		res.json({success: false, message: 'No token provided'})
	}
})

router.post('/me', function (req, res){
	res.send(req.decoded);
});

    return router;
}﻿;


