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
                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thank you for registering at localhost.com. Please click on the link below to complete your activation:<br><br><a href="https://safe-island-40143.herokuapp.com/activate/' + user.temporarytoken + '">https://safe-island-40143.herokuapp.com/activate/</a>'
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
            }   else {
            	var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '2h' });
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
	            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You requested for account activation. Please click on the link below to complete your activation:<br><br><a href="https://safe-island-40143.herokuapp.com/activate/' + user.temporarytoken + '">https://safe-island-40143.herokuapp.com/activate/</a>'
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
		                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently requested a password reset link. Please click on the link below to reset your password:<br><br><a href="https://safe-island-40143.herokuapp.com/reset/' + user.resettoken + '">https://safe-island-40143.herokuapp.com/reset/</a>'
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


router.get('/renewToken/:username', function(req, res) {
	User.findOne({ username: req.params.username }).select('username email').exec(function(err, user){
		if(err) throw err;
		if(!user){
			res.json({ success: false, message: 'No user found'});
		} else {
			var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
            res.json({ success: true, token: newToken });
		}
	})
});

router.get('/permission', function(req, res) {
	User.findOne({ username: req.decoded.username }, function(err, user){
		if(err) throw err;
		if(!user){
			res.send({ success: false, message: 'User not found'});
		} else {
			console.log("permission:");
			res.send({ success: true, permission: user.permission });
		}
	})
});

router.get('/management', function(req, res){
	User.find( {}, function(err, users){
		if(err) throw err;
		User.findOne({ username: req.decoded.username }, function(err, mainUser) {
			if(err) throw err;
			if(!mainUser){
				res.json({ success: false, message: 'No user found.'})
			} else {
				if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
					if(!users){
						res.json({ success: false, message: 'Users not found.'})
					} else {
						res.json({ success: true, users: users, permission: mainUser.permission});
					}
				} else {
					res.json({ success: true, message: 'Insufficient permission'});
				}
			} 
		});
	});
});

router.delete('/management/:username', function(req, res){
	var deletedUser = req.params.username;
	User.findOne({ username: req.decoded.username }, function(err, mainUser){
		if(err) throw err;
		if(!mainUser){
			res.json({ success: false, message: 'No user found.'});
		} else {
			if(mainUser.permission != 'admin'){
				res.json({ success : false, message: 'Insufficient permission'})
			} else {
				User.findOneAndRemove({ username: deletedUser}, function(err, user){
					if(err) throw err;
					res.json({ success: true });
				});
			}
		}
	})
})

router.get('/edit/:id', function(req, res){
	var editUser = req.params.id;
	User.findOne({ username: req.decoded.username }, function(err, mainUser){
		if(err) throw err;
		if(!mainUser){
			res.json({ success: false, message: 'No user found.'});
		} else {
			if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
				User.findOne({ _id: editUser }, function(err, user){
					if(err) throw err;
					if(!user){
						res.json({ success: false, message: 'No user found.'});
					} else {
						res.json({ success: true, user: user });
					}
				});
			} else {
				res.json({ success : false, message: 'Insufficient permission'});
			}
		}
	});
})

router.put('/edit', function(req, res){
	var editUser = req.body._id;
	if(req.body.name) var newName = req.body.name;
	if(req.body.username) var newUsername = req.body.username;
	if(req.body.email) var newEmail = req.body.email;
	if(req.body.permission) var newPermission = req.body.permission;
	console.log("New name = " + newName); 
	User.findOne({ username: req.decoded.username }, function(err, mainUser){
		if(err) throw err;
		if(!mainUser){
			res.json({ success : false, message: 'No user found'});
		} else{
			if(newName){
				if(mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
					User.findOne({ _id: editUser}, function(err, user){
						if(err) throw err;
						if(!user){
							res.json({ success: false, message: 'No user found.'});
						} else {
							user.name = newName;
							user.save(function(err){
								if(err){
									console.log(err);
								} else{
									res.json({ success: true, message: 'Name has been updated.'});
								}
							});
						}
					})
				} else {
					res.json({ success : false, message: 'Insufficient permission'});
				}
			}
			if(newUsername){
				if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
					User.findOne({ _id: editUser}, function(err, user){
						if(err) throw err;
						if(!user){
							res.json({ success: false, message: 'No user found.'});
						} else {
							user.username = newUsername;
							user.save(function(err){
								if(err){
									console.log(err);
								} else{
									res.json({ success: true, message: 'Username has been updated.'});
								}
							});
						}
					})
				} else{
					res.json({ success : false, message: 'Insufficient permission'});
				}
			} 
			if(newEmail){
				if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
					User.findOne({ _id: editUser}, function(err, user){
						if(err) throw err;
						if(!user){
							res.json({ success: false, message: 'No user found.'});
						} else {
							user.email = newEmail;
							user.save(function(err){
								if(err){
									console.log(err);
								} else{
									res.json({ success: true, message: 'Username has been updated.'});
								}
							});
						}
					})
				} else{
					res.json({ success : false, message: 'Insufficient permission'});
				}
			} 
			if(newPermission){
				if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
					User.findOne({ _id: editUser}, function(err, user){
						if(err) throw err;
						if(!user){
							res.json({ success: false, message: 'No user found.'});
						} else {
							if(newPermission === 'user'){
								if(user.permission === 'admin'){
									if(mainUser.permission != 'admin'){
										res.json({ success: false, message: 'Insufficient permission. You must be an admin to downgrade another admin'})
									} else {
										user.permission = newPermission;
										user.save(function(err){
											if(err){
												console.log(err);
											} else{
												res.json({ success: true, message: 'Permission has been updated.'});
											}
										});
									}
								} else {
									user.permission = newPermission;
									user.save(function(err){
										if(err){
											console.log(err);
										} else{
											res.json({ success: true, message: 'Permission has been updated.'});
										}
									});
								}
							}
							if(newPermission === 'moderator'){
								if(user.permission === 'admin'){
									if(mainUser.permission != 'admin'){
										res.json({ success: false, message: 'Insufficient permission. You must be an admin to downgrade another admin'})
									} else {
										user.permission = newPermission;
										user.save(function(err){
											if(err){
												console.log(err);
											} else{
												res.json({ success: true, message: 'Permission has been updated.'});
											}
										});
									}
								} else {
									user.permission = newPermission;
									user.save(function(err){
										if(err){
											console.log(err);
										} else{
											res.json({ success: true, message: 'Permission has been updated.'});
										}
									});
								}
							}
							if( newPermission === 'admin'){
								if(mainUser.permission === 'admin') {
									user.permission = newPermission;
										user.save(function(err){
											if(err){
												console.log(err);
											} else{
												res.json({ success: true, message: 'Permission has been updated.'});
											}
										});
								} else {
									res.json({ success: false, message: 'Insufficient permission. You must be an admin to upgrage another admin'})
								}
							}
						}
					})
				}
				else{
				res.json({ success : false, message: 'Insufficient permission'});
				}
			} 
		}
	})

})

return router;
}﻿;


