var express = require('express');
var router = express.Router();
var iplocation = require('iplocation')
var db = require('../../db.js');
var settingsM = require('../../settings.js');

var userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
var roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';
var adminTable = (process.env.DEBUG) ? 'dev_admin' : 'prod_admin';
var tableTable = (process.env.DEBUG) ? 'dev_tables' : 'prod_tables';
var actionTable = (process.env.DEBUG) ? 'dev_actions' : 'prod_actions';

router.post("/admin", (req, res, next) => {
	var data = {
		"total_n": req.body["total_n"],
		n: req.body.n,
		polygons: req.body.polygons,
		m: req.body.m,
		"true_polygons": req.body["true_polygons"],
		"max_delta": req.body["max_delta"],
		"mid_delta": req.body["mid_delta"],
		"mud_delta": req.body["mud_delta"],
		rounds: req.body.rounds,
		"max_payout": req.body["max_payout"]
	}

	var actions = JSON.parse(req.body["action_weights"]);
	var tables = [];
	var actionWheres = [];
	var tableQueries = [];
	var actionQueries = [];
	db(adminTable).insert(data).returning('id').then((id) => {
		for (var i = 0; i < actions.length; ++i) {
			if (!(actions[i].tableid in tables)) {
				tables.push({ 
								start_round: actions[i]["start_round"],
								end_round: actions[i]["end_round"]
							});
			}
			actionWheres.push({
								action: actions[i]["action"],
								shape: actions[i]["shape"],
								tableid: actions[i]["tableid"] + 1
							})
			delete actions[i]["start_round"];
			delete actions[i]["end_round"];
			delete actions[i]["action"];
			delete actions[i]["shape"];
			delete actions[i]["tableid"];
		}
		for (var i = 0; i < tables.length; ++i) {
			tableQueries.push(db(tableTable).update(tables[i]).where("id", i + 1))
		}
		for (var i = 0; i < actions.length; ++i) {
			console.log(actionWheres[i])
			actionQueries.push(db(actionTable).update(actions[i]).where(actionWheres[i]));
		}
		Promise.all(tableQueries).then((done) => {
			Promise.all(actionQueries).then((actionDone) => {
				console.log(actionDone)
				res.send("success");
			})
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
		"used_table": parseInt(req.body.table) + 1,
		mudding: req.body.mudding
	}

	console.log(data)

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
				var selectedRound = rounds[roll];

				var duration = (new Date()).getTime()- Date.parse(req.cookies["start_test"]);
				var ending = (new Date());
				db(testTable).update({ "selected_round": (roll + 1), "final_payout": selectedRound.payout, "duration": duration, ending: ending }).where("id", parseInt(req.cookies["test_id"])).then(() => {
					res.send("success");
				});
		});
	});
});


module.exports = router;

