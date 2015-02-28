var express = require('express');
var router = express.Router();

/* GET album */
router.get('/', function(req, res, next) {
  res.render('form', { title: 'Lieferadresse' });
});

module.exports = router;
