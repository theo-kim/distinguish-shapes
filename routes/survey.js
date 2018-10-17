var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	var currentRound = parseInt(req.cookies.round);
	if (currentRound > 1) { 
		res.redirect('/');
	}
	else if (currentRound < 1) {
		res.redirect('/practice');
	}
	else {
		res.render('survey');
	}
});

module.exports = router;
