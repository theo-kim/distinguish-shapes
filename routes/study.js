var express = require('express');
var router = express.Router();
var settingsM = require('../settings.js');


/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round) { 
		next();
	}
	else {
		settingsM().then(function(settings) {
			var currentRound = parseInt(req.cookies.round);
			if (currentRound > settings.rounds) { 
				res.redirect('/end');
			}
			else if (currentRound <= settings.rounds && currentRound > 0) { 
				var type = settings.getTableForRound(currentRound);
				var changed = settings.getTableForRound(currentRound - 1) != type;

				res.cookie('round_start', (new Date()).toString(), { maxAge : 8.64e7 });
				res.render('study', {
					settings: settings,
					type: type,
					round: parseInt(req.cookies.round),
					changed: changed
				});
			}
			else {
				res.redirect('/welcome')
			}
		});
	}
});

module.exports = router;
