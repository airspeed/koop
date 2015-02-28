var express = require('express');
var router = express.Router();
var https = require('https');

/* GET album */
router.get('/', function(req, res, next) {
  	res.render('form', { title: 'Lieferadresse' });
});
router.post('/', function(req, res, next) {
  	console.log( req.body );
  	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  	var options = {
  		host: 'fotobuch-api-dev.clixxie.de',
  		path: '/api/countries.json?version=v1.1.5'
  	};
  	callback = function( response )
  	{
  		console.log( response.statusCode );
  		response.setEncoding( 'utf8' );
  		var json = "";

  		response.on( 'data', function( data ){
  			json += data;
  		});

  		response.on( 'end', function(){
  	    	res.end();// redirect to done
  	    	json = JSON.parse(json);
  	    	console.log(json.result.countries[0].code);
  		});

  		response.on( 'error', function( e ){
  			console.log( e.message );
  			res.render('form', { title: 'Lieferadresse' });
  		});
  	};
  	https.request(options, callback).end();
});

module.exports = router;
