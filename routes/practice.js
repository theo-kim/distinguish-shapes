var express = require('express');
var settingsM = require('../settings.js');
var router = express.Router();
var practiceProbs = require('../data/practice_probs.json');

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.cookies.round &&  parseInt(req.cookies.round) < 1) {
		settingsM().then((settings) => {
			res.render('practice', { settings: settings, prob: practiceProbs[parseInt(req.cookies.round) * -1] });
		});
	}
	else if (req.cookies.round && parseInt(req.cookies.round) > 0) {
		res.redirect('/survey')
	}
	else {
		next();
	}
});

module.exports = router;
