var express = require('express');
var router = express.Router();
var welcometext = require('../data/welcometext.json');
var db = require('../db.js');

var adminTable = (process.env.DEBUG) ? 'dev_admin' : 'prod_admin';

var i, j;

var numRef = 	["zero", "one", "two", "three", "four", "five", "six", "seven", 
				"eight", "nine", "ten", "eleven", "twelve", "thirteen"];

//
function translatePolyString(input) {
	var output = "", translate = [];
	for (i = 0; i < input.length; ++i)
		if (input[i] == "1") 
			output += numRef[input.length - i] + '-sided, ';

	translate = output.split(", ")
	translate.pop()
	translate.reverse()
	translate[translate.length - 1] = "and " + translate[translate.length - 1];
	return translate.join(", ")
}

//
router.get('/', (req, res, next) => {
	db.select("*").from(adminTable).orderBy('id', 'desc').first()
		.then((settings) => {
			settings["n-m"] = settings.n - settings.m;
			settings["polygons_text"] = translatePolyString(settings.polygons);
			settings["true_polygons_text"] = translatePolyString(settings["true_polygons"]);

			for (i in welcometext)
				for (j in settings)
					welcometext[i] = welcometext[i].split("{{" + j + "}}").join(settings[j]);

			res.cookie('round', 1, { maxAge : 8.64e7 });
			res.render('welcome', { text: welcometext, size: Object.keys(welcometext).length });

		});

	// let min = 0, max = 4;
	// const rand = Math.floor(Math.random() * (max - min)) + min;
	// res.cookie('round', 1, { maxAge : 8.64e7 });
	// res.cookie('rand', rand, { maxAge : 8.64e7 });
	// res.cookie('return', 0, { maxAge : 8.64e7 }); 
});

module.exports = router;
