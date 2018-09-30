var express = require('express');
var router = express.Router();
var welcometext = require('../data/welcometext.json');
var db = require('../db.js');
var settingsM = require('../settings.js');


//
router.get('/', (req, res, next) => {
	settingsM().then((settings) => {
		for (i in welcometext)
			for (j in settings)
				welcometext[i] = welcometext[i].split("{{" + j + "}}").join(settings[j]);

		res.cookie('round', -2, { maxAge : 8.64e7 });
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
