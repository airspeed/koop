var express = require('express');
var router = express.Router();
var https = require('https');
var Promise = require('promise');
var fs = require('fs');
var FormData = require('form-data');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var CLIENT_ID = 'cef23f7912af4b3a6629ff342f121233';
var CLIENT_SECRET = '904efb802e1c5bed30976b50b067875878';
var PDF_PATH = 'public/redbull.pdf';// fotobuch that can be ordered with this app.
var API_VERSION = 'v1.1.5';
var REQUEST_LOCALE = 'de_DE';
var API_HOST = 'fotobuch-api-dev.clixxie.de';
var PRODUCT_CODE = 'CLXB5S2Q';

/* GET album */
router.get( '/', function( req, res, next ) {
  	res.render( 'form', { title: 'Lieferadresse' } );
});
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
		return saveOrder( access_token, address_json.result.id, album_id, req.body.payment_type_id, req.body.quantity );
	}, errorCallback )
	.then( function ( order_json ){
		order_id = order_json.result.id;
		return uploadPDFFile( access_token, album_id, PDF_PATH );
	}, errorCallback )
	.then( function ( upload_json ){
		return commitOrder( access_token, order_id );
	}, errorCallback )
	.then( function( json ) {
		next();
	}, errorCallback );
});
router.post( '/', function(req, res, next ) {
	res.redirect( '/overview' );
});

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
	  			console.log( '@saveAddress :: ' + e.message );
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

function uploadPDFFile( access_token, album_id, pdf_path )
{
	return new Promise( function( resolve, reject ) {
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
	  			console.log( '@uploadPDFFile :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var form = new FormData();
	  	form.append( 'client_id', CLIENT_ID );
	  	form.append( 'client_secret', CLIENT_SECRET );
	  	form.append( 'version', API_VERSION );
	  	form.append( 'access_token', access_token );
	  	form.append( 'locale', REQUEST_LOCALE );
	  	form.append( 'pdf', fs.createReadStream( pdf_path ) );
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/albums/' + album_id + '.json?upload=true&access_token=' + access_token,
	  		method: 'PUT',
	  		headers: form.getHeaders()
	  	};
	  	var token_req = https.request( options, callback );
	  	form.pipe( token_req );
	});
}

function commitOrder( access_token, order_id )
{
	return new Promise( function( resolve, reject ) {
	  	var postData = JSON.stringify({
	  		client_id: CLIENT_ID,
	  		client_secret: CLIENT_SECRET,
	  		version: API_VERSION,
	  		access_token: access_token,
	  		locale: REQUEST_LOCALE,
	  		payment_info: {}
	  	});
	  	var options = {
	  		host: API_HOST,
	  		path: '/api/orders/' + order_id + '/proceed.json?access_token=' + access_token,
	  		method: 'PUT',
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
	  			console.log( '@commitOrder :: ' + e.message );
	  			reject( e );
	  		});
	  	};
	  	var token_req = https.request( options, callback );
	  	token_req.write( postData );
	  	token_req.end();
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
