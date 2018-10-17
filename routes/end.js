var express = require('express');
var router = express.Router();
var db = require('../db.js');
var settingsM = require('../settings.js');

var roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';
var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';

/* GET home page. */
router.get('/', (req, res, next) => {
	settingsM().then((settings) => {
		db.select("selected_round").from(testTable).where("id", parseInt(req.cookies["test_id"])).first().then((test) => {
			if (test["selected_round"] == null)
				return db.select("*").from(roundTable).where("testid", parseInt(req.cookies["test_id"]))
			else res.redirect('/result');
		})
		.then((rounds) => {
			// THIS IS WHERE TO FIX THRESHOLD VALUE!!!
			var requiredCorrect = 13;
			// ///////////////////////////////////////
			var totalCorrect = 0;

			for (var i = 0; i < rounds.length; ++i) {
				var table = settings.getTableForRound(i + 1);
				var polygons = rounds[i].polygons.split(",");
				for (var j = 0; j < polygons.length; ++j) {
					polygons[j] = parseInt(polygons[j].replace("[", "").replace("]", ""));
				}
				// remove the 2 dummy polygons
				polygons.pop()
				polygons.shift()
				// check if the user got their selection correct
				totalCorrect += (settings.correct[table][parseInt(rounds[i].selection)] ==
					polygons.indexOf(Math.max(...polygons)));
			}

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
