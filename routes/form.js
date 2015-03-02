var express = require('express');
var router = express.Router();
var https = require('https');
var Promise = require('promise');
var fs = require('fs');
var FormData = require('form-data');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var CLIENT_ID = 'cef23f7912af4b3a6629ff342f155d239';
var CLIENT_SECRET = '904efb802e1c5bed30976b50b09e76a0';
var ALBUM_ID = 49474;// fotobuch that can be ordered with this app.
var PDF_PATH = 'public/' + ALBUM_ID + '.pdf';// fotobuch that can be ordered with this app.
var API_VERSION = 'v1.1.5';
var REQUEST_LOCALE = 'de_DE';

/* GET album */
router.get('/', function(req, res, next) {
  	res.render('form', { title: 'Lieferadresse' });
});
router.post('/', function(req, res, next) {
	var access_token = '';
	getAccessToken( req.body.email )
	// create album for user? ask Slawek
	.then( function ( access_token_json ){
		access_token = access_token_json.access_token;
		return saveAddress( access_token, req.body );
	}, errorCallback )
	.then( function ( address_json ){
		return saveOrder( access_token, address_json.result.id, ALBUM_ID, req.body.payment_type_id );
	}, errorCallback )
	.then( function ( order_json ){
		return uploadPDFFile( access_token, ALBUM_ID, PDF_PATH );
	}, errorCallback )
	.then( function( json ) {
		res.end();
	}, errorCallback );
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
	  		host: 'fotobuch-api.clixxie.de',
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
	  			company: address.company
	  		}
	  	});
	  	var options = {
	  		host: 'fotobuch-api.clixxie.de',
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

function saveOrder( access_token, address_id, album_id, payment_type_id )
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
	  					quantity: 1
	  				}
	  			]
	  		}
	  	});
	  	var options = {
	  		host: 'fotobuch-api.clixxie.de',
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
	  	console.log( form );
	  	var options = {
	  		host: 'fotobuch-api.clixxie.de',
	  		path: '/api/albums/' + album_id + '.json?upload=true&access_token=' + access_token,
	  		method: 'PUT',
	  		headers: form.getHeaders()
	  	};
	  	var token_req = https.request( options, callback );
	  	form.pipe( token_req );
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
