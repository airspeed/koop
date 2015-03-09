var express = require('express');
var router = express.Router();
var https = require('https');
var Promise = require('promise');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/* GET album */
router.get( '/', function( req, res, next ) {
  	res.render( 'form', { title: 'Lieferadresse' } );
});
/* POST album */
router.post('/', function(req, res, next) {
	var access_token = '';
	var album_id = 0;
	var order_id = 0;
	// getAccessToken( req.body.email )
	getAccessTokenForDummyUser() // scheint nicht zu funktionieren, Slawek?
	.then( function ( access_token_json ){
		// access_token = access_token_json.access_token;
		access_token = access_token_json.result.access_token;
		return saveAlbum( access_token );
	}, errorCallback )
	.then( function ( album_json ){
		album_id = album_json.result.id;
		return saveAddress( access_token, req.body );
	}, errorCallback )
	.then( function ( address_json ){
		return saveOrder( access_token, address_json.result.id, album_id, req.body.payment_type_id, +req.body.quantity );
	}, errorCallback )
	.then( function( order_json ) {
		order_id = order_json.result.id;
		return saveVoucher( access_token, order_id, req.body.voucher_code );
	}, errorCallback )
	.then( function( order_json ) {
		res.redirect( '/overview?order_id=' + order_id + '&access_token=' + access_token );
	}, errorCallback );
});

/*
function getAccessToken( email )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		grant_type: 'password',
	  		username: email,
	  		password: 'Clixxie3',
	  		version: API_VERSION,
	  		locale: REQUEST_LOCALE
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/oauth2/token.json',
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
	  			console.log( '@getAccessToken :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var token_req = https.request( options, callback );
	  	token_req.write( postData );
	  	token_req.end();
	  });
}
*/

function getAccessTokenForDummyUser()
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		locale: REQUEST_LOCALE,
	  		version: API_VERSION,
	  		user: {
	  			dummy: true,
	  			lang: REQUEST_LOCALE
	  		}
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/users.json',
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
	  			console.log( '@getAccessTokenForDummyUser :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var token_req = https.request( options, callback );
	  	token_req.write( postData );
	  	token_req.end();
	  });
}

function saveAlbum( access_token )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		version: API_VERSION,
	  		access_token: access_token,
	  		locale: REQUEST_LOCALE,
	  		album: {
	  			title: 'Red Bull',
	  			description: 'Verleiht dir Flügel ... ',
	  			'client-uuid': 'KoopRedBull' + (+new Date()).toString(),
	  			format: PRODUCT_CODE,
	  			content_type: 'pdf'
	  		}
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/albums.json?access_token=' + access_token,
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
	  			console.log( '@saveAlbum :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var token_req = https.request( options, callback );
	  	token_req.write( postData );
	  	token_req.end();
	  });
}

function saveAddress( access_token, address )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		version: API_VERSION,
	  		access_token: access_token,
	  		locale: REQUEST_LOCALE,
	  		address: {
	  			name: address.name,
	  			surname: address.surname,
	  			street: address.street,
	  			city: address.city,
	  			district: address.district,
	  			zip_code: address.zip_code,
	  			country_code: address.country_code,
	  			company: address.company,
	  			email: address.email
	  		}
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/addresses.json?access_token=' + access_token,
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
	  			console.log( '@saveAddress :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var token_req = https.request( options, callback );
	  	token_req.write( postData );
	  	token_req.end();
	  });
}

function saveOrder( access_token, address_id, album_id, payment_type_id, quantity )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		version: API_VERSION,
	  		access_token: access_token,
	  		locale: REQUEST_LOCALE,
	  		order: {
	  			invoice_address_id: address_id,
	  			provider_id: 1,
	  			currency: "EU",
	  			delivery_at: "",
	  			payment_type_id: payment_type_id,
	  			campaign: {},
	  			xmas_package: 0,
	  			order_items: [
	  				{
	  					album_id: album_id,
	  					address_id: address_id,
	  					quantity: quantity
	  				}
	  			]
	  		}
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/orders.json?access_token=' + access_token,
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
	  			console.log( '@saveOrder :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var token_req = https.request( options, callback );
	  	token_req.write( postData );
	  	token_req.end();
	  });
}

function saveVoucher( access_token, order_id, voucher_code )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		version: API_VERSION,
	  		access_token: access_token,
	  		locale: REQUEST_LOCALE,
	  		order: {
	  			voucher_code: voucher_code
	  		}
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/orders/' + order_id.toString() + '/voucher.json?access_token=' + access_token,
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
	  			console.log( '@saveVoucher :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	if ( voucher_code.length )
	  	{
		  	var token_req = https.request( options, callback );
		  	token_req.write( postData );
		  	token_req.end();	
	  	}
	  	else// no voucher code
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
