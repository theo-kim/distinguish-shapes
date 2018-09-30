var express = require('express');
var router = express.Router();
var iplocation = require('iplocation')
var db = require('../../db.js');
// var adminAPI = require('./admin.js');

var userTable = (process.env.DEBUG) ? 'prod_participants' : 'prod_participants';
var testTable = (process.env.DEBUG) ? 'prod_tests' : 'prod_tests';
var roundTable = (process.env.DEBUG) ? 'prod_rounds' : 'prod_rounds';

router.post("/participant", (req, res, next) => {
	var data = {
		age: req.body.age,
		gender: req.body.gender,
		"welcome_time": (new Date()).getTime()- Date.parse(req.cookies["start"])
	}

	db(userTable).insert(data).returning('id').then((id) => {
		res.cookie('start_test', (new Date()).toString(), { maxAge : 8.64e7 });
		res.cookie('user_id', id[0], { maxAge : 8.64e7 });
		db(testTable).insert({userid: id[0], "total_payout": 0}).returning('id').then((testid) => {
			res.cookie('test_id', testid[0], { maxAge : 8.64e7 });
			res.cookie('total_payout', 0, { maxAge : 8.64e7 });
			res.send("success");
		});
	})
});

router.post("/round", (req, res, next) => {
	var data = {
		testid: parseInt(req.cookies["test_id"]),
		selection: req.body.selection,
		duration: (new Date()).getTime()- Date.parse(req.cookies["round_start"]),
		payout: req.body.payout,
		polygons: req.body.polygons,
		prob: req.body.prob
	}

	db(roundTable).insert(data).returning('id').then((id) => {
		console.log(id)
		res.send("success");
	})
});

router.post("/end", (req, res, next) => {
	var roll = req.body.roll;
	console.log(roll)

	db.select("*").from(roundTable).where("testid", parseInt(req.cookies["test_id"])).then((rounds) => {
		var intervals = [];
		var counter = 0;
		for (var i = 0; i < rounds.length; ++i) {
			intervals.push({
				start: counter,
				end: counter + rounds[i].prob,
				payout: rounds[i].payout
			})
			counter += rounds[i].prob
		}
		console.log(intervals)
		for (var i = 0; i < intervals.length; ++i) {
			if (roll > intervals[i].start && roll <= intervals[i].end) {
				db(testTable).update("final_payout", intervals[i].payout).where("id", parseInt(req.cookies["test_id"])).then(() => {
					res.send("success");
				});
			}
		}
		// res.send("success");
	});
});


module.exports = router;

