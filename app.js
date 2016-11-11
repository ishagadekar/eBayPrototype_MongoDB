
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

//URL for the sessions collections in mongoDB
var mongoSessionConnectURL = "mongodb://localhost:27017/ebaydb";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./routes/mongo");
var passport = require('passport');
require('./routes/passport')(passport);

var app = express();
var ebayhome = require("./routes/ebayhome");
var sellItems = require('./routes/ebaysell');
var checkout = require('./routes/ebaycheckout');
var cart = require('./routes/ebayshoppingcart');

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(expressSession({
	secret: 'cmpe273_teststring',
	resave: false,  //don't save session if unmodified
	saveUninitialized: false,	// don't create session until something stored
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,
	store: new mongoStore({
		url: mongoSessionConnectURL
	})
}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

//development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/signInSignUpForm', ebayhome.displaySignIn);
app.get('/homepage',ebayhome.redirectToHomepage);
app.get('/home', ebayhome.displayHome);
app.get('/sellItems', sellItems.displaySellerPage);
app.get('/myebay', ebayhome.displaymyebay);
app.get('/showlisting', sellItems.displayListing);
app.get('/checkout', checkout.displayCheckout);
app.get('/shoppingcart', cart.displayShoppingCart);

app.post('/myebayhome', ebayhome.getMyEbayDetails);
app.post('/loginUser', ebayhome.getUserData);

app.post('/registerUser', ebayhome.checkAndRegisterUser);
//app.post('/checkSignIn', ebayhome.checkSignIn);

app.post('/checkSignIn', function(req, res, next) {
	  passport.authenticate('login', function(err, user, info) {
		  
		console.log("in passport authenticate");
	    if(err) {
	      return next(err);
	    }

	    if(!user) {
	    	response={"statusCode" : 401};
			res.send(response);	
//	        return res.redirect('/');
	    } else {
	    req.logIn(user, {session:false}, function(err) {
	      if(err) {
	        return next(err);
	      }

	      console.log("USER Details!!!!!!_-------------"+user.email + " id : " + user._id);
	      req.session.user = user;
			console.log(req.session.user);
	      console.log("session initilized");
	      response = {
					"statuscode" : 200,
					"user" : req.session.user
			};
	      res.send(response);	
	    });
	    }
	  })(req, res, next);
	});

function isAuthenticated(req, res, next) {
	  if(req.session.user) {
	     console.log(req.session.user);
	     return next();
	  }

	  res.redirect('/');
	}

	app.get('/home', isAuthenticated, function(req, res) {
		res.renderFile('./views/ebayhome.ejs', function(err, result) {
			if (!err) {
				res.end(result);
			} else {
				logger.log("error", "Error occurred while displaying home page");
				res.end('An error occurred');
				console.log(err);
			}
		});
	});

app.post('/list', sellItems.createList);
app.post('/listingdetails', sellItems.getListingDetails);
app.post('/addtocart', cart.saveCart);
app.post('/displayshoppingcart', cart.getCartDetails);
app.post('/removefromshoppingcart', cart.removeFromCart);
app.post('/removecartitems', checkout.removecartitems);
app.post('/removeboughtitems', checkout.removeboughtitems);
app.post('/bidproduct', sellItems.bidproduct);

app.get('/signout', ebayhome.signout);

//connect to the mongo collection session and then createServer
mongo.connect(mongoSessionConnectURL, function(){
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);
	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});  
});
