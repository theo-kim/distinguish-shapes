var express = require('express');
var router = express.Router();
var db = require('../db.js');
var settingsM = require('../settings.js');

var roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';
var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';

/* GET home page. */
router.get('/', (req, res, next) => {
	settingsM().then((settings) => {
		db.select("*").from(roundTable).where("testid", parseInt(req.cookies["test_id"])).then((rounds) => {
			// THIS IS WHERE TO FIX THRESHOLD VALUE!!!
			var requiredCorrect = 13;
			// ///////////////////////////////////////
			var totalCorrect = 0;

			for (var i = 0; i < rounds.length; ++i) {
				var polygons = rounds[i].polygons.split(",");
				for (var j = 0; j < polygons.length; ++j) {
					polygons[j] = parseInt(polygons[j].replace("[", "").replace("]", ""));
				}
				totalCorrect += (settings.correct[parseInt(rounds[i].selection)] + 1 ==
					polygons.indexOf(Math.max(...polygons)));
			}

			console.log("Total Correct: ", totalCorrect);

			if (totalCorrect < requiredCorrect) {
				var duration = (new Date()).getTime()- Date.parse(req.cookies["start_test"]);
				var ending = (new Date());
				db(testTable).update({ "selected_round": -1, "final_payout": 0, "duration": duration, ending: ending })
					.where("id", parseInt(req.cookies["test_id"]))
					.then(() => {
						res.redirect("/result");
					});
			}
			else res.render('end');


		});
	});
});

module.exports = router;
