var express = require('express');
var router = express.Router();

/* GET album */
router.get('/', function(req, res, next) {
  res.render('done', { title: 'Vielen Dank!' });
});

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

module.exports = router;
