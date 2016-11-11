/*var ejs = require('ejs');
var mysql = require('./mysql');
var logger = require('./logger');

exports.displayUserProfile = function(req, res) {
	if (req.session.user) {
		logger.log("info", "Displaying user profile page for user with id = " + req.session.user.user_id);
		ejs.renderFile('./views/ebayuserprofile.ejs', function(err, result) {
			if (!err) {
				res.end(result);
			} else {
				logger.log("error", "Error occurred while displaying user profile page");
				res.end('An error occurred');
				console.log(err);
			}
		});
	}
};

exports.getUserDetails = function(req, res) {
	var json_response;

	if (req.session.user) {
		
		json_response = {
				"statuscode" : 200,
				"sessionuser" : req.session.user
			};
			res.send(json_response);
		
		var query = "select * from itemsforsale where sellername != '"
				+ req.session.user.firstname
				+ "' and quantity > 0 ORDER BY timestamp DESC;";
		console.log("Query is : " + query);
		logger.log("info", "Executing query = " + query);

		mysql.fetchData2(function(err, results) {
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query);
				throw err;
			} else {
				if (results.length > 0) {
					console.log("Listings fetched");
					logger.log("info", "Listings fetched successfully for user with id = " + req.session.user.user_id);
					json_response = {
						"statuscode" : 200,
						"sessionuser" : req.session.user,
						"listings" : results
					};
					res.send(json_response);
				} else {
					console.log("No listings in database");
					logger.log("info", "No listings in database for user with id = " + req.session.user.user_id);
					json_response = {
						"statuscode" : 401,
						"sessionuser" : req.session.user
					};
					res.send(json_response);
				}
			}
		}, query);
	} else {
		res.redirect('/');
	}
};
*/