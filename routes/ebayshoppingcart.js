var ejs = require('ejs');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/ebaydb";
var sequencegenerator = require('./sequencegenerator');
var logger = require('./logger');

exports.displayShoppingCart = function(req, res) {
	ejs.renderFile('./views/ebayshoppingcart.ejs', function(err, result) {
		if (!err) {
			logger.log("info", "Displaying shopping cart page for user with id = " + req.session.user.user_id);
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying shopping cart page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.getCartDetails = function(req, res) {

	var json_response;

	if (req.session.user) {
		logger.log("info", "Shopping cart icon clicked by user. Fetching shopping cart details for user with id = " + req.session.user._id);
		
		mongo.connect(mongoURL, function() {
			console.log('Connected to mongo at: ' + mongoURL);
			logger.log("info", 'Connected to mongo at: ' + mongoURL);
			
			var coll = mongo.collection('shoppingcart');
			coll.find({userId:req.session.user._id}).toArray(function(err, results){
				if (err) {
					logger.log("error", "Error occurred while executing query to get from shoppingcart for user with id = " + req.session.user._id);
					throw err;
				} else {
					if (results.length > 0) {
						logger.log("info", "Shopping cart items fetched successfully for user with id = " + req.session.user._id);
						var idArray = [];
						var quantities = [];
						for (var i = 0; i < results.length; i++) {
							idArray[i] = (results[i].itemId);
							quantities[i] = (results[i].quantitybought);
						}
						
						var coll1 = mongo.collection('itemsforsale');
						coll1.find({_id:{$in:idArray}}).toArray(function(err, results){
							if (err) {
								logger.log("error", "Error occurred while executing query to get from itemsforsale");
								throw err;
							} else {
								logger.log("info", "Shopping cart item details fetched successfully for user with id = " + req.session.user._id);
								for (var i = 0; i < results.length; i++) {
									results[i].quantity = quantities[i];
								}
								json_response = {
									"statuscode" : 200,
									"user" : req.session.user,
									"cartItems" : results
								};
								res.send(json_response);
							}
						});
					} else {
						logger.log("info", "Shopping cart empty for user with id = " + req.session.user._id);
						json_response = {
							"statuscode" : 401,
							"user" : req.session.user
						};
						res.send(json_response);
					}
				}
			});
		});
	} else {
		res.redirect('/');
	}

};

exports.saveCart = function(req, res) {

	var json_response;

	if (req.session.user) {
	mongo.connect(mongoURL, function() {
		console.log('Connected to mongo at: ' + mongoURL);
		logger.log("info", 'Connected to mongo at: ' + mongoURL);
		
		var coll = mongo.collection('shoppingcart');
		coll.find({$and : [{userId:req.param("userId")}, {itemId:req.param("itemId")}]}).toArray(function(err, results){
		if (err) {
			logger.log("error", "Error occurred while executing query to check if user with id = " + req.param("userId") + " contains item with id = " 
					+ req.param("itemId") + " in cart" );
			throw err;
		} else {
			if(results.length > 0) {
				logger.log("info", "Updating quantity in user's cart for item with id = " + req.param("itemId") + 
						" as cart already contains it for user with id = " + req.param("userId"));
				var quantity = req.param("quantityBought");
				coll.update({$and:[{userId : req.param("userId")},{itemId:req.param("itemId")}]},{$inc:{'quantitybought': quantity}}, function(err) {
					if (err) {
						logger.log("error", "Error occurred while executing query to update shoppingcart to add quantitybought = " + req.param("quantityBought"));
						throw err;
					} else {
						logger.log("info", "Updating quantity in itemsforsale table for item with id = " + req.param("itemId") + 
								" to reflect item added to cart for user with id = " + req.param("userId"));
						
						var coll1 = mongo.collection('itemsforsale');
						coll1.update({_id : req.param("itemId")},{$inc:{'quantity': -quantity}}, function(err) {
							if (err) {
								logger.log("error", "Error occurred while executing query to update itemsforsale to subtract quantitybought = " + req.param("quantityBought"));
								throw err;
							} else {
								console.log("Query for updating quantity for same cart item executed successfully!");
							}
						});
					}
				});
				
				json_response = {
						"statuscode" : 200,
						"user" : req.session.user,
					};
					res.send(json_response);
			} else {
				logger.log("info", "Inserting new cart item for user with id = " + req.session.user._id);
				
				coll.insert({userId:req.param("userId"), itemId:req.param("itemId"), quantitybought:req.param("quantityBought")}, function(err) {
					if (err) {
						logger.log("error", "Error occurred while executing query to insert new cart item for user with id = " + req.param("userId"));
						throw err;
					} else {
						var coll1 = mongo.collection('itemsforsale');
						var quantity = req.param("quantityBought");
						coll1.update({_id : req.param("itemId")},{$inc:{'quantity': -quantity}}, function(err) {
							if (err) {
								logger.log("error", "Error occurred while executing query itemsforsale to subtract quantitybought = " + req.param("quantityBought"));
								throw err;
							} else {
								json_response = {
										"statuscode" : 200
									};
									res.send(json_response);
							}
						});
							
					}
				});
			}
		}
		});
	});
	} else {
		res.redirect('/');
	}
	
};

exports.removeFromCart = function(req, res) {

	var json_response;
	
	if (req.session.user) {
	logger.log("info", "Remove from cart button clicked by user. Remoing item with id = " + req.param("itemId") 
			+ " from shopping cart of user with id = " + req.session.user._id);
	
	mongo.connect(mongoURL, function() {
		console.log('Connected to mongo at: ' + mongoURL);
		logger.log("info", 'Connected to mongo at: ' + mongoURL);
		
		var coll = mongo.collection('shoppingcart');
		coll.remove({itemId:req.param("itemId")}, function(err){
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query);
				throw err;
			} else {
				logger.log("info", "Updating quantity in itemsforsale table for item with id = " + req.param("itemId") + 
						" to reflect item removed from cart for user with id = " + req.session.user._id);
				var quantity = req.param("quantityBought");
				var coll1 = mongo.collection('itemsforsale');
				coll1.update({_id:req.param("itemId")},{$inc:{'quantity':quantity}}, function(err) {
					if (err) {
						logger.log("error", "Error occurred while executing query to update itemsforsale to remove cart items");
						throw err;
					} else {
						json_response = {
							"statuscode" : 200
						};
						res.send(json_response);
					}
				});
			}
		});
	});
	}else {
		res.redirect('/');
	}
};