var ejs = require('ejs');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/ebaydb";
var sequencegenerator = require('./sequencegenerator');

var logger = require('./logger');

exports.displayCheckout = function(req, res) {
	logger.log("info", "Displaying checkout page for user with id = " + req.session.user._id);
	ejs.renderFile('./views/ebaycheckout.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.removecartitems = function(req, res) {
	logger.log("info", "Removing cart items for checkout after cart items checkout");
	var json_response;

	if (req.session.user) {
		logger.log("info", "Removing cart items for user with id = " + req.session.user._id);
		
		mongo.connect(mongoURL, function() {
			console.log('Connected to mongo at: ' + mongoURL);
			logger.log("info", 'Connected to mongo at: ' + mongoURL);
			
			var coll = mongo.collection('shoppingcart');
			coll.remove({userId:req.session.user._id}, function(err) {
				if (err) {
					logger.log("error", "Error occurred while executing query = " + query);
					throw err;
				} else {
						console.log("Cart items deleted");
						logger.log("info", "Cart items deleted for user with id = " + req.session.user._id);
						var cartItems = req.param("cartItems");
						var time = new Date();
						var date = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
								+ time.getDate();
						console.log("Purchase/Sell date : " + date);
						
						var stampmonths = new Array( "01","02","03","04","05","06","07","08","09","10","11","12");
						var thedate = new Date();
						var orderId = stampmonths[thedate.getMonth()] + thedate.getDate() + thedate.getFullYear() + thedate.getSeconds();
						console.log("Order Id is : " + orderId);
						logger.log("info", "Order id for user with id = " + req.session.user._id + " is = " + orderId);
						for(var i = 0; i < cartItems.length; i++) {
							logger.log("info", "Inserting cart items into user activity history for user with id = " + req.session.user._id);
							var coll1 = mongo.collection('useractivityhistory');
							coll1.insert({orderId:orderId, userId:req.session.user._id, itemId:cartItems[i]._id, quantitybought:cartItems[i].quantity,
								datepurchased:date}, function(err) {
									if (err) {
										logger.log("error", "Error occurred while executing query to insert into useractivityhistory for " +
												"user with id = " + req.session.user._id);
										throw err;
									} else {
										logger.log("info", "User activity history updated for user with id = " + req.session.user._id);
										console.log("Query executed successfully");
										res.send(json_response);
									}
								});
							
							var coll2 = mongo.collection('usersellhistory');
							coll2.insert({orderId:orderId, sellerId:cartItems[i].sellerId, itemId:cartItems[i]._id, quantitysold:cartItems[i].quantity,
								datesold:date}, function(err) {
									if (err) {
										logger.log("error", "Error occurred while executing query to insert into usersellhistory for " +
												"user with id = " + req.session.user._id);
										throw err;
									} else {
										logger.log("info", "Seller's sell history updated");
										console.log("Query executed successfully");
										res.send(json_response);
									}
								});
						}
						json_response = {
								"statuscode" : 200
							};
						res.send(json_response);
				}
			});
		});
	} else {
		res.redirect('/');
	}
};

exports.removeboughtitems = function(req, res) {
	logger.log("info", "Removing bought items for checkout after buy now click");
	var json_response;

	if (req.session.user) {
		
		var coll = mongo.collection('itemsforsale');
		var quantity = Number(req.param("quantity"));
		var itemId = Number(req.param("itemId"));
		var sellerId = Number(req.param("sellerId"));
		coll.update({_id : itemId},{$inc:{'quantity': -quantity}}, function(err) {
				if (err) {
					logger.log("error", "Error occurred while executing query to update itemsforsale to remove bought items for " +
							"user with id = " + req.session.user._id);
					throw err;
				} else {
					console.log("Items for sale updated");
					logger.log("info", "Items for sale updated");
					var time = new Date();
					var date = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
					+ time.getDate();
					
					var stampmonths = new Array( "01","02","03","04","05","06","07","08","09","10","11","12");
					var thedate = new Date();
					var orderId = stampmonths[thedate.getMonth()] + thedate.getDate() + thedate.getFullYear() + thedate.getSeconds();
					console.log("Order Id is : " + orderId);
					logger.log("info", "Order id for user with id = " + req.session.user._id + " is = " + orderId);
					
					var coll1 = mongo.collection('useractivityhistory');
					coll1.insert({orderId:orderId, userId:req.session.user._id, itemId:itemId, quantitybought:quantity,
						datepurchased:date}, function(err) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query1);
								throw err;
							} else {
								logger.log("info", "User activity history updated for user with id = " + req.session.user._id);
								console.log("Query for " + req.param("itemId") + " executed successfully");
								res.send(json_response);
							}
					});
					
					var coll1 = mongo.collection('usersellhistory');
					coll1.insert({orderId:orderId, sellerId:sellerId, itemId:itemId, quantitysold:quantity,
						datesold:date}, function(err) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query1);
								throw err;
							} else {
								logger.log("info", "Seller's sell history updated for seller with id = " + req.param("sellerId"));
								console.log("Query executed successfully");
								res.send(json_response);
							}
					});
					json_response = {
							"statuscode" : 200
						};
					res.send(json_response);
				}
			});
		
	} else {
		res.redirect('/');
	}
};