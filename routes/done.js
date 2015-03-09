var express = require('express');
var router = express.Router();
var https = require('https');
var fs = require('fs');
var Promise = require('promise');
var FormData = require('form-data');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/* GET album */
router.get('/', function(req, res, next) {
	var access_token = req.query.access_token,
		order_id = req.query.order_id;
	getOrder( access_token, order_id )
	.then( function ( order_json ){
		var album_id = order_json.result.order_items[0].album_id;
		return uploadPDFFile( access_token, album_id, PDF_PATH )
	}, errorCallback )
	.then( function ( upload_json ){
		return commitOrder( access_token, order_id );
	}, errorCallback )
	.then( function ( order_json ){
		res.render('done', { title: 'Vielen Dank!' });
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
