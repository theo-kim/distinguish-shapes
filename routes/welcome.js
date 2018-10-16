var express = require('express');
var router = express.Router();
var welcome = require('../data/welcometext.json');
var db = require('../db.js');
var settingsM = require('../settings.js');


//
router.get('/', (req, res, next) => {
	// let welcometext = Object.assign({}, welcome);
	let welcometext = Object.values(welcome)
	settingsM().then((settings) => {
		// Add examples to welcome text
		// Assumes that it starts after 3rd section
		var exampleStart = 3;
		welcometext[exampleStart - 1] += " An example with " + settings.complexity[0].complex + " shapes is shown below."
		for (var i = settings.complexity.length - 1; i > 0; --i)
			welcometext.splice(3, 0, "An example with " + settings.complexity[i].complex + " shapes is shown below.");

		for (var i = 0; i < welcometext.length; ++i)
			for (j in settings)
				welcometext[i] = welcometext[i].split("{{" + j + "}}").join(settings[j]);

		res.cookie('round', -2, { maxAge : 8.64e7 });
		res.cookie('complexities', 0, { maxAge : 8.64e7 });
		res.cookie('start', (new Date()).toString(), { maxAge : 8.64e7 });

		res.render('welcome', { text: welcometext, size: Object.keys(welcometext).length, settings: settings });
	})

	// let min = 0, max = 4;
	// const rand = Math.floor(Math.random() * (max - min)) + min;
	// res.cookie('round', 1, { maxAge : 8.64e7 });
	// res.cookie('rand', rand, { maxAge : 8.64e7 });
	// res.cookie('return', 0, { maxAge : 8.64e7 }); 
});

module.exports = router;
