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
			if (parseInt(req.cookies.round) > settings.rounds) { 
				res.redirect('/end');
			}
			else {
				var choices = {}
				if (!req.cookies.probs || parseInt(req.cookies.probs) == 0) {
					for (var i = 0; i < settings.probabilities.length; ++i) {
						choices[settings.probabilities[i].prob] = settings.probabilities[i].n;
					}
				}
				else choices = JSON.parse(req.cookies.probs)
				res.cookie('round_start', (new Date()).toString(), { maxAge : 8.64e7 });
				var prob = 0;
				var probs = Object.keys(choices);
								console.log(choices)

				do {
					prob = Math.floor(Math.random() * probs.length)
				} while (choices[probs[prob]] <= 0)
				res.cookie('probs', JSON.stringify(choices));
				res.render('study', {
					settings: settings,
					prob: probs[prob],
					round: parseInt(req.cookies.round)
				});
			}
		});
	}
});

module.exports = router;
