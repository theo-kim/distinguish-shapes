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
			else if (currentRound > 0) {
				var choices = {}
				var clean_choices = {}

				if (!req.cookies.complexities || parseInt(req.cookies.complexities) == 0) {
					for (var i = 0; i < settings.complexity.length; ++i) {
						choices[settings.complexity[i].complex] = settings.complexity[i].n;
						clean_choices[settings.complexity[i].complex] = settings.complexity[i].n;
					}
				}
				else {
					choices = JSON.parse(req.cookies.complexities);
					clean_choices = JSON.parse(req.cookies.complexities);
				}
				res.cookie('round_start', (new Date()).toString(), { maxAge : 8.64e7 });
				var probs = Object.keys(choices);

				// get total rounds remaining and create Array of that length
				var remaining = parseInt(settings.rounds) - parseInt(req.cookies.round);
				var selectFrom = new Array(remaining);
				var j = 0;

				// Populate values in selection array
				for (let i = 0; i < probs.length; ++i) {
					while (choices[probs[i]] > 0) {
						selectFrom[j] = probs[i];
						--choices[probs[i]];
						++j;
					}
				}

				// Select from selection array randomly
				var selectedComplexity = selectFrom[Math.round(Math.random() * remaining)];

				res.cookie('complexities', JSON.stringify(clean_choices));
				
				res.render('study', {
					settings: settings,
					prob: selectedComplexity,
					round: parseInt(req.cookies.round)
				});
			}
			else {
				res.redirect('/welcome');
			}
		});
	}
});

module.exports = router;
