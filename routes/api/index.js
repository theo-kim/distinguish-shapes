var express = require('express');
var router = express.Router();
var iplocation = require('iplocation')
var db = require('../../db.js');
var settingsM = require('../../settings.js');

var userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
var roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';
var adminTable = (process.env.DEBUG) ? 'dev_admin' : 'prod_admin';
var probTable = (process.env.DEBUG) ? 'dev_complexity' : 'prod_complexity';

router.post("/admin", (req, res, next) => {
	var data = {
		n: req.body.n,
		polygons: req.body.polygons,
		m: req.body.m,
		"true_polygons": req.body["true_polygons"],
		"max_delta": req.body["max_delta"],
		"mid_delta": req.body["mid_delta"],
		"mud_delta": req.body["mud_delta"],
		"action_weights": req.body["action_weights"],
		rounds: req.body.rounds,
		"max_payout": req.body["max_payout"]
	}

	var p = JSON.parse(req.body.complexities);

	db(adminTable).insert(data).returning('id').then((id) => {
		db.select("*").from(probTable).orderBy('complex', 'desc').then((rows) => {
			var newProbs = [];
			var deleteProbs = [];
			var oldProbs = [];
			var updateProbs = [];
			var queries = [];
			for (var i = 0; i < rows.length; ++i) {
				oldProbs.push(rows[i].complex);
			}
			for (var i = 0; i < p.length; ++i) {
				updateProbs.push(parseInt(p[i].complex));
			}
			console.log(updateProbs);
			console.log(rows);
			for (var i = 0; i < rows.length; ++i) {
				if (updateProbs.indexOf(parseInt(rows[i].complex)) == -1) {
					deleteProbs.push(parseInt(rows[i].complex))
				}
			}
			for (var i = 0; i < p.length; ++i) {
				if (oldProbs.indexOf(parseInt(p[i].complex)) == -1) {
					newProbs.push(p[i])
				}
			}
			if (newProbs.length > 0)
				db(probTable).insert(newProbs).then(() => {
					if (deleteProbs.length > 0) {
						queries = []
						for (var i = 0; i < deleteProbs.length; ++i) {
							queries.push(db(probTable).delete().where("complex", parseInt(deleteProbs[i])));
						}
						return Promise.all(queries);
					}
					else {
						return Promise.resolve();
					}
				}).then(() => { 
					queries = []
					for (var i = 0; i < p.length; ++i) {
						queries.push(db(probTable).update(p[i]).where("complex", parseInt(p[i].prob)));
					}
					return Promise.all(queries);
				}).then(() => { res.send("success"); });
			else if (deleteProbs.length > 0) {
				queries = []
				for (var i = 0; i < deleteProbs.length; ++i) {
					queries.push(db(probTable).delete().where("complex", parseInt(deleteProbs[i])));
				}
				Promise.all(queries).then(() => { 
					queries = []
					for (var i = 0; i < p.length; ++i) {
						queries.push(db(probTable).update(p[i]).where("complex", parseInt(p[i].prob)));
					}
					return Promise.all(queries);
				}).then(() => { res.send("success"); });
			}
			else {
				for (var i = 0; i < p.length; ++i) {
					queries.push(db(probTable).update(p[i]).where("complex", parseInt(p[i].prob)));
				}
				Promise.all(queries).then(() => { res.send("success"); });
			}
		})
	})
});

router.post("/participant", (req, res, next) => {
	iplocation(req.connection.remoteAddress, function (error, ip) {
		var city, country;

		if (error) {
			city = "blocked";
			country = "blocked";
		}
		else {
			city = ip.city;
			country = ip.country;
		}

		var data = {
			age: req.body.age,
			gender: req.body.gender,
			"welcome_time": (new Date()).getTime()- Date.parse(req.cookies["start"]),
			ipaddress: req.connection.remoteAddress,
			city: city,
			country: country
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
});

router.post("/round", (req, res, next) => {
	var data = {
		testid: parseInt(req.cookies["test_id"]),
		selection: req.body.selection,
		duration: (new Date()).getTime()- Date.parse(req.cookies["round_start"]),
		payout: req.body.payout,
		polygons: req.body.polygons,
		complex: req.body.complex,
		mudding: req.body.mudding
	}

	db(roundTable).insert(data).returning('id').then((id) => {
		console.log(id)
		res.send("success");
	})
});

router.post("/end", (req, res, next) => {
	var roll = parseInt(req.body.roll);
	console.log("roll", roll)

	settingsM().then((settings) => {
		db.select("*").from(roundTable)
			.where("testid", parseInt(req.cookies["test_id"]))
			.orderBy("id", "asc")
			.then((rounds) => {
			// var intervals = [];
			// var counter = 0;
			// var increment = 100 / settings.rounds;
			// for (var i = 0; i < rounds.length; ++i) {
			// 	if (rounds[i].prob) {
			// 		intervals.push({
			// 			start: counter,
			// 			end: counter + settings.rounds,
			// 			payout: rounds[i].payout
			// 		})
			// 		counter += 5
			// 	}
			// }
			var selectedRound = rounds[roll];

			var duration = (new Date()).getTime()- Date.parse(req.cookies["start_test"]);
			var ending = (new Date());
			db(testTable).update({ "selected_round": (roll + 1), "final_payout": selectedRound.payout, "duration": duration, ending: ending }).where("id", parseInt(req.cookies["test_id"])).then(() => {
				res.send("success");
			});
			// for (var i = 0; i < intervals.length; ++i) {
			// 	if (roll > intervals[i].start && roll <= intervals[i].end) {
			// 		db(testTable).update({ "selected_round": (i + 1), "final_payout": selectedRound.payout, "duration": duration, ending: ending }).where("id", parseInt(req.cookies["test_id"])).then(() => {
			// 			res.send("success");
			// 		});
			// 	}
			// }
			// res.send("success");
		});
	});
});


module.exports = router;

