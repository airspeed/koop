var express = require('express');
var router = express.Router();

/* GET album */
router.get( '/', function( req, res, next ) {
  res.render( 'album', { title: 'Fotobuch' } );
});

module.exports = router;
