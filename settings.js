var db = require('./db.js');
var _ = require('underscore');

var adminTable = (process.env.DEBUG) ? 'dev_admin' : 'prod_admin';
var tableTable = (process.env.DEBUG) ? 'dev_tables' : 'prod_tables';
var actionTable = (process.env.DEBUG) ? 'dev_actions' : 'prod_actions';

var numRef = 	["zero", "one", "two", "three", "four", "five", "six", "seven",
				"eight", "nine", "ten", "eleven", "twelve", "thirteen"];

var shapeRef = ["", "", "", "three", "four", "five", "six", "seven",
				"eight", "nine", "ten"];

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

function shapes(input) {
	var output = [];
	for (i = 0; i < input.length; ++i)
		if (input[i] == "1")
			output.push(shapeRef[input.length - i]);
	output.reverse()
	return output
}

function maxInString(str) {
	console.log(str.length)
	max = 0
	maxIndex = 0
	for (var i = 0; i < str.length; ++i)
		if (parseInt(str[i]) > max) {
			max = parseInt(str[i])
			maxIndex = i
		}
	return [max, maxIndex]
}


module.exports = function() {
	return new Promise((resolve, reject) => {
		db.select("*").from(adminTable).orderBy('id', 'desc').first()
		.then((settings) => {
			db.select("*").from(tableTable).join(actionTable, actionTable + '.tableid', tableTable + '.id')
			.orderBy('tableid', 'asc').orderBy('action', 'asc').orderBy('shape', 'asc').then((actions) => {
				settings["n-m"] = settings.n - settings.m;
				settings["polygons_text"] = translatePolyString(settings.polygons);
				settings["true_polygons_text"] = translatePolyString(settings["true_polygons"]);
				settings["shapes"] = shapes(settings.polygons);
				settings["true_shapes"] = shapes(settings["true_polygons"]);

				// decode actions and figure out which action is best
				var used = {};
				var actions = Object.values(_.groupBy(actions, "tableid"));
				var best = new Array(actions.length);
				for (var i = 0; i < actions.length; ++i) {
					actions[i] = (Object.values(_.groupBy(actions[i], "action")));
					best[i] = new Array(actions[i].length);
					for (var j = 0; j < actions[i].length; ++j) {
						var max = 0;
						var maxAction = 0;
						for (var k = 0; k < actions[i][j].length; ++k) {
							if (actions[i][j][k].payout > max && !(actions[i][j][k].shape in used)) {
								max = actions[i][j][k].payout;
								maxAction = actions[i][j][k].shape;
							}
						}
						best[i][j] = maxAction;
						used[maxAction] = 0;
					}
					used = {};
				}

				settings["action_weights"] = actions;
				settings["correct"] = best;

				settings.getTableForRound = function(round) {
					var type = 0;
					for (var i = 0; i < settings["action_weights"].length; ++i) {
						console.log("start", settings["action_weights"][i][0][0]["start_round"]);
						if ((settings["action_weights"][i][0][0]["start_round"]) <= round && (settings["action_weights"][i][0][0]["end_round"]) >= round) {
							type = settings["action_weights"][i][0][0].tableid - 1;
						}
					}
					return type;
				}
				console.log(settings["action_weights"][0][0])
				resolve(settings);
			});
		});
	});
}
