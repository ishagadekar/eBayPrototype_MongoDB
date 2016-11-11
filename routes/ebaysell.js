var ejs = require('ejs');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/ebaydb";
var sequencegenerator = require('./sequencegenerator');
var logger = require('./logger');
var bidlogger = require('./bidlogger');

exports.displaySellerPage = function(req, res) {
	if(req.session.user) {
	logger.log("info", "Displaying seller home page for user with id = " + req.session.user._id);
	ejs.renderFile('./views/ebaysellerhome.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying seller home page");
			res.end('An error occurred');
			console.log(err);
		}
	});
	} else {
		res.redirect('/');
	}
};

exports.displayListing = function(req, res) {
	logger.log("info", "Displaying listing page for user with id = " + req.session.user._id);
	ejs.renderFile('./views/ebaylisting.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying listing page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.createList = function(req, res) {
	var json_response;
	var bidenddate;
	if (req.session.user) {
	logger.log("info", "Create listing button clicked by user with id = " + req.session.user._id);
	var time = new Date();
	var dateTime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
			+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
			+ ":" + time.getSeconds();
	
	if(req.param("isbidproduct") === 1) {
		var date = new Date(time.getTime() + 4*24*60*60*1000);
		bidenddate = date.getFullYear() + "-" + (date.getMonth()+1) + "-"
		+ date.getDate();
		logger.log("info", "Listing to be created is a bid product for user with id = " + req.session.user._id + 
				" with bid end date = " + bidenddate);
		bidlogger.log("info", "Listing to be created is a bid product for user with id = " + req.session.user._id + 
				" with bid end date = " + bidenddate);
	} else {
		bidenddate = '0000-00-00';
	}
	
	mongo.connect(mongoURL, function() {
		console.log('Connected to mongo at: ' + mongoURL);
		logger.log("info", 'Connected to mongo at: ' + mongoURL);
		
		sequencegenerator.getNextSeqNumber("id",function(seqId){
			var coll = mongo.collection('itemsforsale');
			coll.insert({_id:seqId, sellerId:req.session.user._id, itemname:req.param("itemname"),
				itemdescription:req.param("itemdescription"), sellername:req.session.user.firstname,
				selleraddress:req.param("itemaddress"), itemprice:req.param("itemprice"), quantity:req.param("itemquantity"),
				timestamp:dateTime, isbidproduct:req.param("isbidproduct"), bidenddate:bidenddate}, function(err, docs) {
					if (err) {
						logger.log("error", "Error occurred while executing query to insert into itemsforsale");
						throw err;
					} else {
						logger.log("info", "Listing created for for user with id = " + req.session.user._id);
						if(req.param("isbidproduct") == 1) {
							bidlogger.log("info", "Listing for bidding created for for user with id = " + req.session.user._id);
						}
						json_response = {
							"statuscode" : 200
						};
						res.send(json_response);
				}
			});
		});
	});
	} else {
		res.redirect('/');
	}
};

exports.getListingDetails = function(req, res) {
	var json_response;

	if (req.session.user) {
	logger.log("info", "Fetching listing details for item with id = " + req.param("itemId") + " for user with id = " + req.session.user._id);
	
	mongo.connect(mongoURL, function() {
		console.log('Connected to mongo at: ' + mongoURL);
		logger.log("info", 'Connected to mongo at: ' + mongoURL);
		
		var coll = mongo.collection('itemsforsale');
		coll.find({_id:req.param("itemId")}).toArray(function(err, results){
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query);
				throw err;
			} else {
				logger.log("info", "Listing details for item with id = " + req.param("itemId") + " for user with id = " + req.session.user._id
						+ " fetched successfully");
				json_response = {
						"statuscode" : 200,
						"sessionuser" : req.session.user,
						"listingitem" : results[0]
					};
					res.send(json_response);
			}
		});
	});
	} else {
		res.redirect('/');
	}

};

exports.bidproduct = function(req, res) {

	var json_response;

	if (req.session.user) {
		
		logger.log("info", "Bid product button clicked for item id = " + req.param("itemId") + " by user with id = " + req.session.user.user_id);
		bidlogger.log("info", "Bid product button clicked for item id = " + req.param("itemId") + " by user with id = " + req.session.user.user_id);
		
		var time = new Date();
		var bidDate = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
		+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
		+ ":" + time.getSeconds();

		mongo.connect(mongoURL, function() {
			console.log('Connected to mongo at: ' + mongoURL);
			logger.log("info", 'Connected to mongo at: ' + mongoURL);
			var amount = Number(req.param("bidamount"));
			var coll = mongo.collection('biduser');
			coll.insert({userId:req.session.user._id, itemId:req.param("itemId"), bidamount:amount,
				biddate:bidDate}, function(err) {
					if (err) {
						logger.log("error", "Error occurred while executing query = " + query);
						bidlogger.log("error", "Error occurred while executing query = " + query);
						throw err;
					} else {
						logger.log("info", "Bid amount of " + req.param("bidamount") + " for item id = " + req.param("itemId")
								+ " entered in DB for user with id = " + req.session.user._id);
						bidlogger.log("info", "Bid amount of " + req.param("bidamount") + " for item id = " + req.param("itemId")
								+ " entered in DB for user with id = " + req.session.user._id);
						
						var coll1 = mongo.collection('itemsforsale');
						coll1.update({_id:req.param("itemId")}, {$set : {itemprice:amount}}, function(err) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query1);
								bidlogger.log("error", "Error occurred while executing query = " + query1);
								throw err;
							} else {
								logger.log("info", "Bid amount entered in DB successully for user with id = " + req.session.user._id);
								bidlogger.log("info", "Bid amount entered in DB successully for user with id = " + req.session.user._id);
								json_response = {
									"statuscode" : 200
								};
								res.send(json_response);
							}
						});
					}
			});
			
		});
	} else {
		res.redirect('/');
	}

};