var express = require('express');
var router = express.Router();
var https = require('https');
var Promise = require('promise');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/* GET album */
router.get( '/', function( req, res, next ) {
	var access_token = req.query.access_token,
		order_id = req.query.order_id,
		kaufen_link = '/done?order_id=' + order_id + '&access_token=' + access_token,
		order = null;
	getOrder( access_token, order_id )
	.then( function ( order_json ){
		order = order_json.result;
		return authorizePayPalPayment( access_token, order_id, kaufen_link, '/form', order.payment_type_id );
	}, errorCallback )
	.then( function ( paypal_json ){
		if ( paypal_json && paypal_json.result && paypal_json.result.paypal_url )
		{
			kaufen_link = paypal_json.result.paypal_url;
		}
	  	res.render( 'overview', { title: 'Bestellübersicht', order: order, kaufen_link: kaufen_link } );
	}, errorCallback )
});

function getOrder( access_token, order_id )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		version: API_VERSION,
	  		access_token: access_token,
	  		locale: REQUEST_LOCALE
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/orders/' + order_id.toString() + '.json?access_token=' + access_token,
	  		method: 'GET',
	  		headers: {
	  			'Content-Type': 'application/json',
	  			'Content-Length': Buffer.byteLength( postData )
	  		}
	  	};
	  	var callback = function( response )
	  	{
	  		// console.log( response.statusCode );
	  		response.setEncoding( 'utf8' );
	  		var json = "";

	  		response.on( 'data', function( data ){
	  			json += data;
	  		});

	  		response.on( 'end', function(){
	  	    	json = JSON.parse( json );
	  	    	// console.log( json );
	  	    	resolve( json );
	  		});

	  		response.on( 'error', function( e ){
	  			console.log( '@getOrder :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var token_req = https.request( options, callback );
	  	token_req.write( postData );
	  	token_req.end();
	  });
}

function authorizePayPalPayment( access_token, order_id, redirect_success, redirect_fail, payment_type_id )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		version: API_VERSION,
	  		access_token: access_token,
	  		locale: REQUEST_LOCALE,
	  		redirect_success: redirect_success,
	  		redirect_fail: redirect_fail,
	  		mobile: false
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/orders/' + order_id.toString() + '/authorize_paypal_payment.json?access_token=' + access_token,
	  		method: 'POST',
	  		headers: {
	  			'Content-Type': 'application/json',
	  			'Content-Length': Buffer.byteLength( postData )
	  		}
	  	};
	  	var callback = function( response )
	  	{
	  		// console.log( response.statusCode );
	  		response.setEncoding( 'utf8' );
	  		var json = "";

	  		response.on( 'data', function( data ){
	  			json += data;
	  		});

	  		response.on( 'end', function(){
	  	    	json = JSON.parse( json );
	  	    	// console.log( json );
	  	    	resolve( json );
	  		});

	  		response.on( 'error', function( e ){
	  			console.log( '@authorizePayPalPayment :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	if ( +payment_type_id === PAYMENT_TYPE_ID_PAYPAL )
	  	{
		  	var token_req = https.request( options, callback );
		  	token_req.write( postData );
		  	token_req.end();	  		
	  	}
	  	else// invoice payment
	  	{
  	    	resolve( JSON.stringify({
  	    		status: 201,
  	    		data: [],
  	    		message: "OK"
  	    	}));
	  	}
	  });
}

var errorCallback = function( e )
{
	console.log( '@errorCallback :: ' + e.message );
	console.log( e );
  	res.sendStatus( 500 );
  	res.end();
}

router.use(function(err, req, res, next){
	console.log( '@router.error :: ' );
  	console.log(err);
  	console.error(err.stack);
  	res.sendStatus( 500 );
});

module.exports = router;
