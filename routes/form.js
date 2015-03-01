var express = require('express');
var router = express.Router();
var client_id = 'cef23f7912af4b3a6629ff342f155d239';
var client_secret = '904efb802e1c5bed30976b50b09e76a0';
var querystring = require('querystring');
var https = require('https');

/* GET album */
router.get('/', function(req, res, next) {
  	res.render('form', { title: 'Lieferadresse' });
});
router.post('/', function(req, res, next) {
  	console.log( req.body );
  	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  	var postData = querystring.stringify({
  		'client_id': client_id,
  		'client_secret': client_secret,
  		'grant_type': 'password',
  		'username': 'test3@femory.de',
  		'password': 'Clixxie3',
  		'version': 'v1.1.5'
  	});
  	var options = {
  		host: 'fotobuch-api.clixxie.de',
  		path: '/api/oauth2/token.json',
  		method: 'POST',
  		headers: {
  			'Content-Type': 'application/x-www-form-urlencoded',
  			'Content-Length': postData.length
  		}
  	};
  	var callback = function( response )
  	{
  		console.log( response.statusCode );
  		response.setEncoding( 'utf8' );
  		var json = "";

  		response.on( 'data', function( data ){
  			json += data;
  		});

  		response.on( 'end', function(){
  	    	res.end();// redirect to done
  	    	json = JSON.parse( json );
  	    	console.log( json );
  	    	console.log( 'Access-Token: ' + json.access_token );
  		});

  		response.on( 'error', function( e ){
  			console.log( e.message );
  			res.render('form', { title: 'Lieferadresse' });
  		});
  	};
  	console.log( postData );
  	var token_req = https.request(options, callback);
  	token_req.write( postData );
  	token_req.end();
});

module.exports = router;
