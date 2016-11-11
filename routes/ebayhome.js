var ejs = require('ejs');
var Crypto = require("crypto");
var logger = require('./logger');
var bidlogger = require('./bidlogger');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/ebaydb";
var sequencegenerator = require('./sequencegenerator');

exports.displaySignIn = function(req, res) {
	logger.log("info", "Sign in or register link clicked");
	ejs.renderFile('./views/ebayloginregister.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying sign in or register page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.displayHome = function(req, res) {
	logger.log("info", "Displaying home page for user with id = " + req.session.user._id);
	ejs.renderFile('./views/ebayhome.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying home page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.displaymyebay = function(req, res) {
	logger.log("info", "Displaying MyeBay page for user with id = " + req.session.user._id);
	ejs.renderFile('./views/ebaymyebay.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying MyeBay page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

/*exports.checkSignIn = function(req, res) {

	logger.log("info", "Sign in button clicked by user to check for email id = " + req.param("username"));
	var json_response;
	
	mongo.connect(mongoURL, function() {
		console.log('Connected to mongo at: ' + mongoURL);
		logger.log("info", 'Connected to mongo at: ' + mongoURL);
		
		var coll = mongo.collection('users');
		coll.findOne({email:req.param("username")}, function(err, user){
			if(err) {
				logger.log("error", "Error occurred while checking sign in credentials for user with email id = " + req.param("username"));
				throw err;
			}
			if (user) {
				logger.log("info", "Sign in credentials fetched successfully and email id is valid for user with email id = " + req.param("username"));
				var salt = "Bl@ckS@1t";
				var encryptedPassword = Crypto.createHash('sha1').update(req.param("password") + salt).digest('hex');
				if(encryptedPassword === user.password) {
					req.session.user = user;
					logger.log("info", "Sign in credentials fetched successfully and are valid for user with id = " + req.session.user._id);
					logger.log("info", "User = " + JSON.stringify(req.session.user) + " has been put into the session");
					
					json_response = {
							"statuscode" : 200,
							"user" : req.session.user
					};
						
					var time = new Date();
					var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
								+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
								+ ":" + time.getSeconds();
					logger.log("info", "Login time to be updated for user with id = " + req.session.user._id + " is = " + logintime);
						
					coll.update({'email' : req.param("username")},{$set:{'logintime': logintime}}, function(err) {
						if (err) {
							logger.log("error", "Error occurred while updating login time for user with email id = " + req.param("username"));
							throw err;
						} else {
							logger.log("info", "Login time updated successfully for user with id = " + req.session.user._id);
							console.log("Login time updated successfully");
							res.send(json_response);
						}
					});	
				} else {
					logger.log("info", "Sign in credentials fetched successfully but password is invalid for user with email id = " + req.param("username"));
					console.log("Invalid username and/or password.");
					json_response = {
						"statuscode" : 401
					};
					res.send(json_response);
				}
			} else {
				logger.log("info", "Sign in credentials fetched successfully but either email id or password is invalid for user with email id = " + req.param("username"));
				console.log("Invalid username and/or password.");
				json_response = {
					"statuscode" : 401
				};
				res.send(json_response);
			}
		});
	});

};*/

exports.checkAndRegisterUser = function(req, res) {

	logger.log("info", "Register button clicked by user to register for email id = " + req.param("username"));
	
	var json_response;
	
	mongo.connect(mongoURL, function() {
		console.log('Connected to mongo at: ' + mongoURL);
		logger.log("info", 'Connected to mongo at: ' + mongoURL);
		
		var coll = mongo.collection('users');
		coll.findOne({email:req.param("username")}, function(err, user){
			if(err) {
				logger.log("error", "Error occurred while processing query to check if user with email id = " + 
						req.param("username") + " already exists in DB for checkAndRegisterUser functionality");
				throw err;
			}
			if (user) {
				console.log("User with same email id already exists.");
				logger.log("info", "User with same email id = " + req.param("username") + " already exists.");
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			} else {
				console.log("New user registration.");
				logger.log("info", "Registering user with email id = " + req.param("username"));
				var salt = "Bl@ckS@1t";
				var encryptedPassword = Crypto.createHash('sha1').update(req.param("password") + salt).digest('hex');
				console.log(encryptedPassword);
				var dateTime = 0 + "-" + 0 + "-" + 0 + " " + 0 + ":" + 0 + ":" + 0;
				console.log(dateTime);

				console.log("Dob : " + req.param("dob"));
				var time = new Date(req.param("dob"));
				var dob = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
						+ time.getDate();
				sequencegenerator.getNextSeqNumber("user_id",function(seqId){
				coll.insert({ _id: seqId, firstname: req.param("firstName"), lastname:req.param("lastName"),
					email:req.param("username"),password:encryptedPassword, handle:req.param("handle"),logintime:dateTime,
					dob:dob, phone:req.param("phone"), address:req.param("address")}, function(err, docs){
						console.log("data after insert "+ docs);
					if (err) {
						logger.log("error", "Error occurred while executing query to insert values in users table" +
								"for user with email id = " + req.param("username"));
						throw err;
					} else {
						logger.log("info", "User with email id = " + req.param("username") + " has been registered successfully");
						json_responses = {"statusCode" : 200};
						res.send(json_responses);
					} 
				});
				});
			}
		});
	});
};

exports.getUserData = function(req, res) {
	logger.log("info", "Fetching home page data after home page hit");
	var json_response;

	if (req.session.user) {

		mongo.connect(mongoURL, function() {
			console.log('Connected to mongo at: ' + mongoURL);
			logger.log("info", 'Connected to mongo at: ' + mongoURL);
			
			var coll = mongo.collection('itemsforsale');
			coll.find({ $query: {$and: [{sellername:{$ne:req.session.user.firstname}},{quantity:{$gt:0}}]}, $orderby: { timestamp : -1 }}).toArray(function(err, results){
				if(err) {
					logger.log("error", "Error occurred while executing query to fetch listings for home page data");
					throw err;
				} else {
					if (results.length > 0) {
					var time = new Date();
					var bidDate = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
					+ time.getDate();
					
					var productsToBeShown = [];
					var closeBids = [];
					
					for(var i = 0; i < results.length; i++) {
						var time1 = new Date(results[i].bidenddate);
						var bidDate1 = time1.getFullYear() + "-" + (time1.getMonth() + 1) + "-"
						+ time1.getDate();
						console.log(bidDate);
						
						if(bidDate1 > bidDate) {
							productsToBeShown.push(results[i]);
						} else if (bidDate1 === bidDate && results[i].sold != 1) {
							bidlogger.log("info", "Bid end date " + bidDate1 + " for item with id = " + results[i]._id + " has arrived");
							
							var coll1 = mongo.collection('biduser');
							coll1.find({itemId:results[i]._id}, function(err, results2) {
								if (err) {
									logger.log("error", "Error occurred while executing query to fetch data from biduser table");
									bidlogger.log("error", "Error occurred while executing query to fetch data from biduser table");
									throw err;
								} else {
									var length = results2.length;
									if(length > 0) {
										logger.log("info", "Fetching data from bid users to get highest bidder");
										bidlogger.log("info", "Fetching data from bid users to get highest bidder");
										var stampmonths = new Array( "01","02","03","04","05","06","07","08","09","10","11","12");
										var thedate = new Date();
										var orderId = stampmonths[thedate.getMonth()] + thedate.getDate() + thedate.getFullYear() + thedate.getSeconds();
										console.log("Order Id is : " + orderId);
										
										var time2 = new Date(results2[length-1].biddate);
										var bidDate2 = time2.getFullYear() + "-" + (time2.getMonth()+1) + "-"
										+ time2.getDate() + " " + time2.getHours() + ":" + time2.getMinutes()
										+ ":" + time2.getSeconds();
										bidlogger.log("info", "Highest bidder for item id = " + results2[length-1].itemId + " is user with id = " + results2[length-1].userId);
										
										var coll2 = mongo.collection('bidwinners');
										coll2.insert({userId:results2[length-1]._id, itemId:results2[length-1].itemId 
										, highestbid: results2[length-1].bidamount, orderId:orderId, datewon:bidDate2}, function(err){
											if (err) {
												logger.log("error", "Error occurred while executing query to insert bid winners");
												bidlogger.log("error", "Error occurred while executing query to insert bid winners");
												throw err;
											} else {
												
												coll.update({_id : results2[length-1].itemId},{$set:{'sold': 1}}, function(err) {
													if (err) {
														logger.log("error", "Error occurred while executing query to update itemsforsale when setting " +
																"sold item");
														bidlogger.log("error", "Error occurred while executing query to update itemsforsale when setting " +
																"sold item");
														throw err;
													} else {
														console.log("Bid queries done successfully");
														logger.log("Bid queries done successfully");
														bidlogger.log("Bid queries done successfully");
													}
												});
											}
											});
										}
									}
								});
						}
					}
			
			console.log("Listings fetched");
			json_response = {
				"statuscode" : 200,
				"sessionuser" : req.session.user,
				"listings" : productsToBeShown
			};
				} else {
			console.log("No listings in database");
			logger.log("info", "No items to show on home page listings");
			json_response = {
				"statuscode" : 401,
				"sessionuser" : req.session.user
			};
				}
		}
		res.send(json_response);
			});
//		}).sort({'timestamp':-1});
		});
	} else {
		res.redirect('/');
	}
};

exports.getMyEbayDetails = function(req, res) {
	logger.log("info", "User clicked on MyeBay link");
	var json_response = {items:[]};
	var purchasehistory = [];
	var puchaseditems = [];
	var sellhistory = [];
	var sellitems = [];
	/*var bidhistory = [];
	var biditems = [];
	var ownbids = [];*/
	
	if (req.session.user) {
		
		mongo.connect(mongoURL, function() {
			console.log('Connected to mongo at: ' + mongoURL);
			logger.log("info", 'Connected to mongo at: ' + mongoURL);
			
			var coll = mongo.collection('useractivityhistory');
			coll.find({userId:req.session.user._id}).toArray(function(err, results){
				if (err) {
					logger.log("error", "Error occurred while executing query to fetch useractivityhistory for user with id = " + req.session.user._id);
					throw err;
				} else {
					if (results.length > 0) {
						console.log("Purchase history fetched for user with id " + req.session.user._id);
						logger.log("info", "Purchase history fetched for user with id = " + req.session.user._id);
						var itemIds = [];
						for(var i = 0; i < results.length; i++) {
							itemIds[i] = results[i].itemId;
						}
						var coll1 = mongo.collection('itemsforsale');
						coll1.find({_id:{$in:itemIds}}).toArray(function(err, results1){
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query);
								throw err;
							} else {
								console.log("Items purchased fetched for user with id " + req.session.user._id);
								logger.log("info", "Items purchased fetched for user with id = " + req.session.user._id);
								 purchasehistory = results;
								 puchaseditems = results1;
								 json_response.items.push(
											{"user" : req.session.user},
											{"purchasehistory" : purchasehistory},
												{"puchaseditems" : puchaseditems}
								 );
							}
						});
					} else {
						console.log("No purchase history found for user with id " + req.session.user._id);
						logger.log("info", "No purchase history found for user with id = " + req.session.user._id);
						 purchasehistory = [];
						 puchaseditems = [];
						 json_response.items.push(
													{"user" : req.session.user},
													{"purchasehistory" : purchasehistory},
														{"puchaseditems" : puchaseditems}
						 );
					}
					
					var coll2 = mongo.collection('usersellhistory');
					coll2.find({sellerId:req.session.user._id}).toArray(function(err, results2){
						if (err) {
							logger.log("error", "Error occurred while executing query = " + query);
							throw err;
						} else {
							if (results2.length > 0) {
								console.log("Sell history fetched for user with id " + req.session.user._id);
								logger.log("info", "Sell history fetched for user with id = " + req.session.user._id);
								
								var coll1 = mongo.collection('itemsforsale');
								var itemIds = [];
								for(var i = 0; i < results.length; i++) {
									itemIds[i] = results2[i].itemId;
								}
								coll1.find({itemId:{$in:itemIds}}).toArray(function(err, results3){
									if (err) {
										logger.log("error", "Error occurred while executing query = " + query);
										throw err;
									} else {
										 console.log("Items sold fetched for use with id " + req.session.user._id);
										 logger.log("info", "Items sold fetched for use with id = " + req.session.user._id);
										 
										 sellhistory = results2;
										 sellitems = results3;
										 json_response.items.push(
													 {"sellhistory" : sellhistory},
													 {"sellitems" : sellitems}
												 );
										 res.send(json_response);
									}
								});
							}  else {
								console.log("No sell history found for use with id " + req.session.user._id);
								logger.log("info", "No sell history found for use with id = " + req.session.user._id);
								
								sellhistory = [];
								sellitems = [];
								 json_response.items.push(
										 {"sellhistory" : sellhistory},
										 {"sellitems" : sellitems}
									 );
								 res.send(json_response);
							}
						}
					});
				}
			});
		});
		
	} else {
		res.redirect('/');
	}
};

/*exports.getsummary = function(req, res) {

	var json_response;

	var query = "select * from users where email='" + req.param("username")
			+ "'";// and password='" + req.param("password") + "'";
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);

	mysql.fetchData2(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				var salt = "Bl@ckS@1t";
				var encryptedPassword = Crypto.createHash('sha1').update(req.param("password") + salt).digest('hex');
//				var passwordhash = crypto.createDecipher("aes192",
//						results[0].password);
				if (encryptedPassword === results[0].password) {
					console.log("Valid login.");
					
					req.session.user = results[0];
					json_response = {
						"statuscode" : 200,
						"user" : req.session.user
					};
					
					var time = new Date();
					var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
							+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
							+ ":" + time.getSeconds();
					console.log(logintime);
					
					var query1 = "update users set logintime='" + logintime + "' where email='" + req.param("username")
									+ "'";
				console.log("Query is : " + query1);
				mysql.fetchData2(function(err, results) {
					if (err) {
						throw err;
					} else {
						console.log("Login time updated successfully");
						res.send(json_response);
					}
				}, query1);
					
				
				} else {
					console.log("Invalid username and/or password.");
					json_response = {
						"statuscode" : 401
					};
					res.send(json_response);
				}
			} else {
				console.log("Invalid username and/or password.");
				json_response = {
					"statuscode" : 401
				};
				res.send(json_response);
			}
		}
	}, query);

};

*/

//Redirects to the homepage
exports.redirectToHomepage = function(req,res)
{
	//Checks before redirecting whether the session is valid
	if(req.session.user)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render("./views/ebayhome.ejs");
	}
	else
	{
		res.redirect('/');
	}
};

exports.signout = function(req, res) {
	logger.log("info", "User with username = " + req.session.user.email + " has been signed out successfully");
	req.session.destroy();
	console.log("Session destroyed");
	res.redirect('/');
};
