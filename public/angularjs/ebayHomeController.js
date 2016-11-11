
var ebay = angular.module('ebay', ['ngStorage']);

ebay.controller('ebayHomeController', ['$scope', '$http', '$sessionStorage', function($scope, $http, $sessionStorage) {
	
	
	$scope.title = "Electronics, Cars, Fashion, Collectibles, Coupons and More | eBay";
	$(function() {

	    $('#login-form-link').click(function(e) {
			$("#login-form").delay(100).fadeIn(100);
	 		$("#register-form").fadeOut(100);
			$('#register-form-link').removeClass('active');
			$(this).addClass('active');
			e.preventDefault();
		});
		$('#register-form-link').click(function(e) {
			$("#register-form").delay(100).fadeIn(100);
	 		$("#login-form").fadeOut(100);
			$('#login-form-link').removeClass('active');
			$(this).addClass('active');
			e.preventDefault();
		});

	});

	$scope.username = "";
	$scope.password = "";
	$scope.firstName = "";
	$scope.lastName = "";
	$scope.userExists = true;
	$scope.showCatalogLink = false;
	$scope.registerPageError = "";
	$scope.showLoginTime = false;
	
	$('#login-form').submit(function(event) {
		
		$http({
			url : '/checkSignIn',
			method: 'post',
			data: {
				"username" : $scope.username,
				"password" : $scope.password
			}
		}).success(function(data){
			if(data.statusCode === 401) {
				$scope.userExists = false;
				$scope.registerPageError = "Invalid username and/or password!";
			} else {
				$scope.userExists = true;
				$sessionStorage.user = data.user;
				$scope.user = data.user;
				if($scope.user.logintime !== '0000-00-00 00:00:00') {
					$scope.showLoginTime = true;
				} else {
					$scope.showLoginTime = false;
				}
//				sessionStorage.setItem('showLoginTime', $scope.showLoginTime);
				window.location.assign("/home"); 
			}
		}).error({
			
		});
	});
	
	$('#register-form').submit(function(event) {
		
		var str = $scope.username.split("@");
		
		$http({
			url : '/registerUser',
			method: 'post',
			data: {
				"firstName" : $scope.firstName,
				"lastName" : $scope.lastName,
				"username" : $scope.username,
				"password" : $scope.password,
				"handle" : str[0],
				"dob" : $scope.dob,
				"phone" : $scope.phone,
				"address" : $scope.address
			}
		}).success(function(data){
			if(data.statuscode === 401) {
				$scope.userExists = false;
				$scope.showCatalogLink = false;
				$scope.registerPageError = "User with same email id already exists! Please choose a different username.";
			} else {
				$scope.userExists = true;
				$scope.showCatalogLink = true;
			}
		}).error(function(error){
			
		});
	});
	
	//Code to control the corousel
	var t;

	var start = $('#myCarousel').find('.active').attr('data-interval');
	t = setTimeout("$('#myCarousel').carousel({interval: 1000});", start-1000);

	$('#myCarousel').on('slid.bs.carousel', function () {  
	     clearTimeout(t);  
	     var duration = $(this).find('.active').attr('data-interval');
	    
	     $('#myCarousel').carousel('pause');
	     t = setTimeout("$('#myCarousel').carousel();", duration-1000);
	})

	$('.carousel-control.right').on('click', function(){
	    clearTimeout(t);   
	});

	$('.carousel-control.left').on('click', function(){
	    clearTimeout(t);   
	});
	
}]);

ebay.controller('ebayLoginController', ['$scope', '$http', '$sessionStorage', function($scope, $http, $sessionStorage) {
	
	$scope.listings = [];
	$scope.listingMsg = "";
	$scope.noOfItemsInCart = 0;
	$scope.addedToCart = false;
	$scope.cartItems = [];
	$scope.quantityToBuy = null;
	$scope.noQuantitySelected = false;
	$scope.showLoginTime = false;

	$scope.initialize = function() {
		$http({
			method : "post",
			url : '/loginUser',
		}).success(function(data) {
			$sessionStorage.user = data.sessionuser;
			$scope.user = data.sessionuser;
			if($scope.user.logintime !== '0-0-0 0:0:0') {
				$scope.showLoginTime = true;
				var time = new Date($scope.user.logintime);
				var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
				+ time.getDate() + " at " + time.getHours() + ":" + time.getMinutes()
				+ ":" + time.getSeconds();
				$scope.user.logintime = logintime;
			} else {
				$scope.showLoginTime = false;
			}
			
			if(data.statuscode === 401) {
				$scope.listingMsg = "No listings to show!";
				$scope.listings = [];
			} else {
				$scope.listingMsg = "Featured Collections";	
				$scope.listings = data.listings;
			}
		}).error(function(error) {
			
		});
	};
	
	$scope.replaceBidDiv = false;
	$scope.showBidError = false;
	$scope.bidProduct = function(item,bidvalue) {
		if(bidvalue > item.itemprice) {
		$http({
			url : '/bidproduct',
			method: 'post',
			data: {
				"bidamount" : bidvalue,
				"itemId" : item._id
			}
		}).success(function(data){
			$scope.replaceBidDiv = true;
			item.itemprice = bidvalue;
			$scope.showBidError = false;
		}).error(function(error){
			
		});
		} else {
			$scope.showBidError = true;
		}
	};
	
	$scope.signout = function() {
		$http({
			url : '/signout',
			method: 'post',
			data: {
				"firstName" : $scope.firstName,
				"lastName" : $scope.lastName,
				"username" : $scope.username,
				"password" : $scope.password
			}
		}).success(function(data){
			if(data.statuscode === 401) {
				$scope.userExists = false;
				$scope.showCatalogLink = false;
				$scope.registerPageError = "User with same email id already exists! Please choose a different username.";
			} else {
				$scope.userExists = true;
				$scope.showCatalogLink = true;
			}
		}).error(function(error){
			
		});
	};
	
	//Code to control the corousel
	var t;

	var start = $('#myCarousel').find('.active').attr('data-interval');
	t = setTimeout("$('#myCarousel').carousel({interval: 1000});", start-1000);

	$('#myCarousel').on('slid.bs.carousel', function () {  
	     clearTimeout(t);  
	     var duration = $(this).find('.active').attr('data-interval');
	    
	     $('#myCarousel').carousel('pause');
	     t = setTimeout("$('#myCarousel').carousel();", duration-1000);
	})

	$('.carousel-control.right').on('click', function(){
	    clearTimeout(t);   
	});

	$('.carousel-control.left').on('click', function(){
	    clearTimeout(t);   
	});
	
	$scope.showlisting = function(item) {
		$sessionStorage.listItemToShow = item;
		window.location.assign("/showlisting"); 
	};
	
	$scope.getPageDetails = function(item) {
		$http({
			method : "post",
			url : '/listingdetails',
			data : {
				"itemId" : $sessionStorage.listItemToShow._id
			}
		}).success(function(data) {
			$scope.user = data.sessionuser;
			$scope.item = data.listingitem;
			if($scope.user.logintime !== '0-0-0 0:0:0') {
				$scope.showLoginTime = true;
				var time = new Date($scope.user.logintime);
				var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
				+ time.getDate() + " at " + time.getHours() + ":" + time.getMinutes()
				+ ":" + time.getSeconds();
				$scope.user.logintime = logintime;
			} else {
				$scope.showLoginTime = false;
			}
		}).error(function(error) {
			
		});
	};
	
	$scope.addToCart = function() {
		if($scope.quantityToBuy === null || $scope.quantityToBuy === "" || $scope.quantityToBuy <= 0 || $scope.quantityToBuy.length === 'undefined'
			|| $scope.quantityToBuy > $sessionStorage.listItemToShow.quantity) {
			$scope.noQuantitySelected = true;
		} else {
			$http({
				method : "post",
				url : '/addtocart',
				data : {
					"userId" : $sessionStorage.user._id,
					"itemId" : $sessionStorage.listItemToShow._id,
					"quantityBought" : $scope.quantityToBuy
				}
			}).success(function(data) {
					$scope.firstName = $sessionStorage.user.firstname;
					$scope.noQuantitySelected = false;
					$scope.addedToCart = true;
					$scope.noOfItemsInCart = $scope.noOfItemsInCart + 1;
			}).error(function(error) {
				
			});
		}
	};
	$scope.buyProduct = function() {
		if($scope.quantityToBuy === null || $scope.quantityToBuy === "" || $scope.quantityToBuy <= 0 || $scope.quantityToBuy.length === 'undefined'
			|| $scope.quantityToBuy > $sessionStorage.listItemToShow.quantity) {
			$scope.noQuantitySelected = true;
		} else {
			sessionStorage.setItem('fromBuyNow', true);
			sessionStorage.setItem('buyTotal', $sessionStorage.listItemToShow.itemprice * $scope.quantityToBuy);
			sessionStorage.setItem('buyQuantity', $scope.quantityToBuy);
			sessionStorage.setItem('buyItemId', $sessionStorage.listItemToShow._id);
			sessionStorage.setItem('sellerId', $sessionStorage.listItemToShow.sellerId);
			window.location.assign('/checkout');
		}
	};
	
	$scope.showPurchaseHistory = false;
	$scope.showSellHistory = false;
	$scope.showBidHistory = false;
	$scope.showOwnBidHistory = false;
	
	$scope.getMyEbayDetails = function() {
		$http({
			method : "post",
			url : '/myebayhome'
		}).success(function(data) {
			
			var userIndex, purchasehistoryIndex, purchasedItemsIndex, sellhistoryIndex, sellItemsIndex;
			var bidhistoryIndex, bidItemsIndex, ownbidsIndex;
			for (var i = data.items.length - 1; i >= 0; --i) {
			    var o = data.items[i];
			    for (var key in o) {
			      if( key == "user") {
			    	  userIndex = i;
			      } else if(key == "purchasehistory") {
			    	  purchasehistoryIndex = i;
			      }else if(key == "puchaseditems") {
			    	  purchasedItemsIndex = i;
			      }else if(key == "sellhistory") {
			    	  sellhistoryIndex = i;
			      }else if(key == "sellitems") {
			    	  sellItemsIndex = i;
			      }else if(key == "bidhistory") {
			    	  bidhistoryIndex = i;
			      }else if(key == "bidItems") {
			    	  bidItemsIndex = i;
			      }else if(key == "ownbids") {
			    	  ownbidsIndex = i;
			      }
			    }
			}
		    
			$scope.user = data.items[userIndex].user;
			var time = new Date($scope.user.dob);
			var dob = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
			+ time.getDate();
			$scope.user.dob = dob;
			var time = new Date($scope.user.logintime);
			var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
			+ time.getDate() + " at " + time.getHours() + ":" + time.getMinutes()
			+ ":" + time.getSeconds();
			$scope.user.logintime = logintime;
			
			if(data.items[purchasehistoryIndex].purchasehistory.length > 0) {
				angular.forEach(data.items[purchasehistoryIndex].purchasehistory, function(purchaseitem, index) {
					var time = new Date(purchaseitem.datepurchased);
					var date = time.getFullYear() + "-" + (time.getMonth() + 1) + "-"
					+ time.getDate();
					purchaseitem.datepurchased = date;
				});
				$scope.purchaseHistory = data.items[purchasehistoryIndex].purchasehistory;
				$scope.purchasedItems = data.items[purchasedItemsIndex].puchaseditems;
				$scope.showPurchaseHistory = true; 
			} else {
				$scope.showPurchaseHistory = false;
			}
			
			if(data.items[sellhistoryIndex].sellhistory.length > 0) {
					angular.forEach(data.items[sellhistoryIndex].sellhistory, function(sellitem, index) {
						var time = new Date(sellitem.datesold);
						var date = time.getFullYear() + "-" + (time.getMonth() + 1) + "-"
						+ time.getDate();
						sellitem.datesold = date;
					});
					$scope.sellHistory = data.items[sellhistoryIndex].sellhistory;
					$scope.sellItems = data.items[sellItemsIndex].sellitems;
					$scope.showSellHistory = true; 
			} else {
				$scope.showSellHistory = false;
			}
			
			/*if(data.items[bidhistoryIndex].bidhistory.length > 0) {
				angular.forEach(data.items[bidhistoryIndex].bidhistory, function(biditem, index) {
					var time = new Date(biditem.datewon);
					var date = time.getFullYear() + "-" + (time.getMonth() + 1) + "-"
					+ time.getDate();
					biditem.datewon = date;
				});
				$scope.bidHistory = data.items[bidhistoryIndex].bidhistory;
				$scope.bidItems = data.items[bidItemsIndex].bidItems;
				$scope.showBidHistory = true; 
			} else {
				$scope.showBidHistory = false;
			}
			
			if(data.items[ownbidsIndex].ownbids.length > 0) {
				angular.forEach(data.items[ownbidsIndex].ownbids, function(biditem, index) {
					var time = new Date(biditem.bidenddate);
					var date = time.getFullYear() + "-" + (time.getMonth() + 1) + "-"
					+ time.getDate();
					biditem.bidenddate = date;
				});
				$scope.ownbids = data.items[ownbidsIndexs].ownbids;
				$scope.showOwnBidHistory = true; 
		} else {
			$scope.showOwnBidHistory = false;
		}*/
			
		}).error(function(error) {
			
		});
	};
}]);

ebay.controller('ebaySellerController', ['$scope', '$http', '$sessionStorage', function($scope, $http, $sessionStorage) {
	
	$scope.title = "Electronics, Cars, Fashion, Collectibles, Coupons and More | eBay";
	$scope.itemname = "";
	$scope.itemdescription = "";
	$scope.itemprice = "";
	$scope.itemquantity = "";
	$scope.itemaddress = "";
	$scope.itemhandlingtime = "";
	$scope.listingCreated = false;
	$scope.user = $sessionStorage.user;
	
	$(document).ready(function () { 
		
		$("#bidproduct").click(function() {
			   $("#bidlabel").show();
			   $("#biddiv").show();
			   $("#pricelabel").hide();
			   $("#pricediv").hide();
			   $("#quantitylabel").hide();
			   $("#quantitydiv").hide();
		});
		
		$("#sellproduct").click(function() {
			   $("#bidlabel").hide();
			   $("#biddiv").hide();
			   $("#pricelabel").show();
			   $("#pricediv").show();
			   $("#quantitylabel").show();
			   $("#quantitydiv").show();
		});
	});

	$scope.createListing = function() {
		var isBidProduct = ($( "input:checked" ).val() === "bid") ? 1 : 0;
		var quantity = (isBidProduct === 1) ? 1 : $scope.itemquantity;
		
		$http({
			url : '/list',
			method : 'post',
			data : {
				"itemname" : $scope.itemname,
				"itemdescription" : $scope.itemdescription,
				"itemprice" : $scope.itemprice,
				"itemquantity" : quantity,
				"itemaddress" : $scope.itemaddress,
				"itemhandlingtime" : $scope.itemhandlingtime,
				"isbidproduct" : isBidProduct,
				
			}
		}).success (function(data) {
			if(data.statuscode === 200) {
				$scope.listingCreated = true;
				$scope.itemname = "";
				$scope.itemdescription = "";
				$scope.itemprice = "";
				$scope.itemquantity = "";
				$scope.itemaddress = "";
				$scope.itemhandlingtime = "";
			}
		}).error (function(error) {
			$scope.listingCreated = false;
		});
	};
}]);

ebay.controller('ebayShoppingCartController',['$scope', '$http', '$sessionStorage',  function($scope, $http, $sessionStorage) {
	
	$scope.title = "Electronics, Cars, Fashion, Collectibles, Coupons and More | eBay";
	$scope.emptyCartMsg1 = "Your shopping cart is empty, but it doesn't have to be.";
	$scope.emptyCartMsg2 = "Start shopping, and look for the \"Add to cart\" button.";
	$scope.emptyCartMsg3 = "You can add several items to your cart from different sellers and pay for them all at once.";
	$scope.emptyCart = true;
	$scope.showcheckouterror = false;
	$scope.cartItems = [];
	$scope.showLoginTime = sessionStorage.getItem('showLoginTime');
	$scope.cartTotal = 0;
	
	$scope.initialize = function() {
		$http({
			method : "post",
			url : '/displayshoppingcart',
		}).success(function(data) {
			$scope.user = data.user;
			
			if($scope.user.logintime !== '0-0-0 0:0:0') {
				$scope.showLoginTime = true;
				var time = new Date($scope.user.logintime);
				var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
				+ time.getDate() + " at " + time.getHours() + ":" + time.getMinutes()
				+ ":" + time.getSeconds();
				$scope.user.logintime = logintime;
			} else {
				$scope.showLoginTime = false;
			}
			
			if(data.statuscode === 200) {
				$scope.emptyCart = false;
				$scope.cartItems = data.cartItems;
				angular.forEach($scope.cartItems, function (item, index) {
					$scope.cartTotal = $scope.cartTotal + item.quantity * item.itemprice;
				})
			} else if(data.statuscode === 401){
				$scope.emptyCart = true;
				$scope.cartItems = [];
			}
		}).error(function(error) {
			
		});
	};
	
	$scope.removeItemById = function (cartItem) {
		
		$http({
			method : "post",
			url : '/removefromshoppingcart',
			data : {
				"itemId" : cartItem._id,
				"quantityBought" : cartItem.quantity
			}
		}).success(function(data) {
			var itemToRemove;
	        angular.forEach($scope.cartItems, function (item, index) {
	            if(cartItem.id === item.id) {
	            	itemToRemove = $scope.cartItems.splice(index, 1);
	            	$scope.cartTotal = $scope.cartTotal - (item.quantity * item.itemprice);
	            }
	        });
	        if($scope.cartItems.length === 0) {
	        	$scope.emptyCart = true;
	        } else {
	        	$scope.emptyCart = false;
	        }
		}).error(function(error) {
			
		});
		
    };

    $scope.checkout = function() {
    	if($scope.emptyCart === true) {
    		$scope.showcheckouterror = true;
		} else {
			$scope.showcheckouterror = false;
			//var parsedResult = JSON.parse($scope.cartItems);
			sessionStorage.setItem('cartItems', JSON.stringify($scope.cartItems));
			//$sessionStorage.cartItems = $scope.cartItems;
			sessionStorage.setItem('cartTotal', $scope.cartTotal);
			//$sessionStorage.cartTotal = $scope.cartTotal;
			sessionStorage.setItem('fromBuyNow', false);
			window.location.assign('/checkout');
		}
    }
}]);

ebay.controller('ebayUserController', ['$scope', '$http', '$sessionStorage', function($scope, $http, $sessionStorage) {
	
	$scope.title = "Electronics, Cars, Fashion, Collectibles, Coupons and More | eBay";
	
	$scope.initialize = function() {
		$http({
			method : "post",
			url : '/displayuserdetails',
		}).success(function(data) {
			$scope.firstName = data.user.firstname;
			if(data.statuscode === 200) {
				$scope.emptyCart = false;
				$scope.cartItems = data.cartItems;
			} else if(data.statuscode === 401){
				$scope.emptyCart = true;
				$scope.cartItems = [];
			}
		}).error(function(error) {
			
		});
	};
	
}]);

ebay.controller('ebayCheckoutController', ['$scope', '$http', '$sessionStorage', function($scope, $http, $sessionStorage) {
	$scope.title = "Electronics, Cars, Fashion, Collectibles, Coupons and More | eBay";
	var items = JSON.parse(sessionStorage.getItem('cartItems'));
	$scope.cartTotal = (sessionStorage.getItem('fromBuyNow') === "true") ? sessionStorage.getItem('buyTotal') : sessionStorage.getItem('cartTotal');
	$scope.totalQuantity = (sessionStorage.getItem('fromBuyNow') === "true") ? 1 : items.length;
	$scope.cartItems = items;
	$scope.itemLabel = ($scope.totalQuantity > 1) ? "Items" : "Item";
	$scope.cardValidated = false;
	$scope.invalidDetails = true;
	
	$scope.validateCardDetails = function() {

//		var nowMonth = new Date().getMonth() + 1;
//		var nowYear = new Date().getFullYear();
		var creditCardRegex = new RegExp("^[0-9]{16}$");
		var cvvRegex = new RegExp("^[0-9]{3}$");
		
		var today, someday;
		today = new Date();
//		someday = new Date();
//		someday.setFullYear(enteredDate[1]);
//		someday.setMonth(enteredDate[0]);
		if($scope.expdate !== undefined && $scope.expdate !== '' && $scope.expdate.length !=0) {
			var enteredDate = $scope.expdate.split("/");
		if((!cvvRegex.test($scope.cvv)) || (enteredDate[0] < (today.getMonth() + 1) && enteredDate[1] <= today.getFullYear()) || (!creditCardRegex.test($scope.cardnumber))) {
			$scope.invalidDetails = false;
		} else {
			if(sessionStorage.getItem('fromBuyNow') !== "true") {
				$http({
					method : "post",
					url : '/removecartitems',
					data : {
						"cartItems" : $scope.cartItems
					}
				}).success(function(data) {
					$scope.cardValidated = true;
					$scope.invalidDetails = true;
				}).error(function(error) {
					
				});
			} else {
				$http({
					method : "post",
					url : '/removeboughtitems',
					data : {
						"itemId" : sessionStorage.getItem('buyItemId'),
						"quantity" : sessionStorage.getItem('buyQuantity'),
						"sellerId" : sessionStorage.getItem('sellerId')
					}
				}).success(function(data) {
					$scope.cardValidated = true;
					$scope.invalidDetails = true;
				}).error(function(error) {
					
				});
			}
		}
		} else {
			$scope.invalidDetails = false;
		}
	}
}]);
