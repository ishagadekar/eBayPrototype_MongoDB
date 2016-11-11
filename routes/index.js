
/*
 * GET home page.
 */
var logger = require('./logger');

exports.index = function(req, res){
	logger.log("info", "Website hit");
	res.render('index', { title: 'Electronics, Cars, Fashion, Collectibles, Coupons and More | eBay' });
};