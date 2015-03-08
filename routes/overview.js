var express = require('express');
var router = express.Router();
var https = require('https');
var Promise = require('promise');
var fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/* GET album */
router.get( '/', function( req, res, next ) {
	var access_token = req.query.access_token,
		order_id = req.query.order_id,
		kaufen_link = '/done?order_id=' + order_id + '&access_token=' + access_token;
	getOrder( access_token, order_id )
	// .then( function ( order_json ){
	// 	// when paypal, generate link to store and assign to kaufen_link
	// }, errorCallback )
	.then( function ( order_json ){
	  	res.render( 'overview', { title: 'Bestellübersicht', order: order_json.result, kaufen_link: kaufen_link } );
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
	  			console.log( '@saveOrder :: ' + e.message );
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
