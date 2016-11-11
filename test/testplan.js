var request = require('request')
, express = require('express')
,assert = require('chai').assert
,http = require("http");

describe('http tests', function(){

	it('should return the ebay site main page if the url is correct', function(done){
		http.get('http://localhost:3000/', function(res) {
			assert.equal(200, res.statusCode);
			done();
		})
	});

	it('should be able to login with correct details', function(done) {
		request.post(
			    'http://localhost:3000/checkSignIn',
			    { form: { username: 'ishagadekar@gmail.com',password:'12345' } },
			    function (error, response, body) {
			    	assert.equal(200, response.statusCode);
			    	done();
			    }
			);
	  });
	
	it('should not be able to login with incorrect details', function(done) {
		request.post(
			    'http://localhost:3000/checkSignIn',
			    { form: { email: 'test1@gmail.com',password:'12345' } },
			    function (error, response, body) {
			    	assert.equal(200, response.statusCode);
			    	done();
			    }
			);
	  });
	
	it('should not display the seller home page without logging in', function(done){
		http.get('http://localhost:3000/sellItems', function(res) {
			assert.equal(302, res.statusCode);
			done();
		})
	});

	it('should not return the eBay site main page if the url is wrong', function(done){
		http.get('http://localhost:3000/ebayhome', function(res) {
			assert.equal(404, res.statusCode);
			done();
		})
	});
	
});