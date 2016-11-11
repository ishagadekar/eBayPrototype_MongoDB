var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/ebaydb";
/**
 * New node file
 */
function getNextSeqNumber(name, callback) {
	
	var query = {'_id' : name};
	var sort = [];
	var operator = { '$inc' : {seqno : 1}};
	var options = { 'new' : true, upsert : true};
	mongo.connect(mongoURL, function(db){
	   db.collection("SeqNumber").findAndModify(query, sort, operator,options, function(err, docs){
	        	  callback(docs.value.seqno);
	          });
	});
}

exports.getNextSeqNumber=getNextSeqNumber;