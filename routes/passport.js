
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/ebaydb";
var MongoClient = mongo.MongoClient;
var Crypto = require("crypto");
var logger = require('./logger');

module.exports = function(passport) {
    passport.use('login', new LocalStrategy(function(username, password, done) {

    	console.log("Yay!! it worked!");
    	mongo.connect(mongoURL, function() {
    		    //HURRAY!! We are connected. :)
    		    console.log('Connection established to', mongoURL);
    		   
    		    
    		    // do some work here with the database.
    		    var collection = mongo.collection('users');
    		 
    		    console.log("before find!");
    		    collection.findOne({email: username}, function(err,result){
    		    	if(err)
    		    	{
    		    		console.log(result);
    		    		logger.log("error", "Error occurred while checking sign in credentials for user with email id = " + username);
    		    		//throw err; 
    		    		return done(err);
    		    	}
    		    	if(!result) {
    		    		console.log(result);
    		    		logger.log("info", "Sign in credentials fetched successfully but either email id or password is invalid for user with email id = " + username);
    					console.log("Invalid username and/or password.");
                        return done(null, false);
                    }
    		    		
    		    	else if(result)
    		    	{
    					logger.log("info", "Sign in credentials fetched successfully and email id is valid for user with email id = " + username);
    					var salt = "Bl@ckS@1t";
    					var encryptedPassword = Crypto.createHash('sha1').update(password + salt).digest('hex');
    					if(encryptedPassword === result.password) {
    						logger.log("info", "Sign in credentials fetched successfully and are valid for user with email = " + username);
    							
    						var time = new Date();
    						var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
    									+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
    									+ ":" + time.getSeconds();
    						logger.log("info", "Login time to be updated for user with with email = " + username + " is = " + logintime);
    							
    						collection.update({'email' : username},{$set:{'logintime': logintime}}, function(err) {
    							if (err) {
    								logger.log("error", "Error occurred while updating login time for user with email id = " + username);
    								throw err;
    							} else {
    								logger.log("info", "Login time updated successfully for user with email id = " + username);
    								console.log("Login time updated successfully");
    							}
    						});	
    						done(null, result);
    					} else {
    						logger.log("info", "Sign in credentials fetched successfully but password is invalid for user with email id = " + username);
    						console.log("Invalid username and/or password.");
    						return done(null, false);
    					}
    		    	}	
    		    });
    	});
    }));
}