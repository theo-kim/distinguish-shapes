let express = require('express');
let router = express.Router();
let xml = require("xml-parse");
let db = require('../db.js');
let settingsM = require('../settings.js');
let moment = require('moment');
let json2csv = require('json2csv');
let fs = require('fs');

let u = (process.env.DEBUG) ? 'prod_participants' : 'prod_participants';
let t = (process.env.DEBUG) ? 'prod_tests' : 'prod_tests';
let r = (process.env.DEBUG) ? 'prod_rounds' : 'prod_rounds';

settingsM().then(function(settings) {
	router.get('/', (req, res, next) => {
		let columnLabel = {}
		let out = []
		let currTest = -1;
		let firstRound = -1;
		let roundStarts = {};

		let selectionRef = ["Action A", "Action B", "Action C"]

		db(r).join(t, r + '.testid', '=', t + '.id').join(u, t + '.userid', u + '.id').select(t + '.duration as test_duration', r + '.duration as round_duration', t+'.*', u + '.*', r + '.*')
			.orderBy(r + '.id', 'asc')
			.then((rows) => {
				columnLabel = [
					"testid", "round", "test_duration", "round_duration", "mudding", "selection", "used_table", "age", "gender", "final_payout", "surveycode", "welcome_time", "ipaddress", "city", "country", "start", "ending", "selected_round"  
				]
				for (let i = 0; i < rows.length; ++i) {
					if (roundStarts[rows[i]['testid']] == null) roundStarts[rows[i]['testid']] = 1;
					else roundStarts[rows[i]['testid']] += 1;
					for ( field in rows[i] ) {
						rows[i]['round'] = roundStarts[rows[i]['testid']];
						if (field == 'polygons') {
							let polies = rows[i]['polygons'].split(",")
							for (let j = 0; j < polies.length; ++j) {
								rows[i][settings.shapes[j] + "-sided shape"] = polies[j].replace("[", "").replace("]", "");
								if (columnLabel.indexOf(settings.shapes[j] + "-sided shape") == -1)
									columnLabel.push(settings.shapes[j] + "-sided shape");
							}
						}
						else if (field == 'selection') {
							rows[i]['selection'] = selectionRef[rows[i]['selection']];
						}
						else if (field == 'test_duration') {
							rows[i]['test_duration'] = (rows[i]['test_duration'] / 1000) + "s";
						}
						else if (field == 'round_duration') {
							rows[i]['round_duration'] = (rows[i]['round_duration'] / 1000) + "s";
						}
						else if (field == 'welcome_time') {
							rows[i]['welcome_time'] = (rows[i]['welcome_time'] / 1000) + "s";
						}
						else if (field == 'prob') {
							rows[i]['probability'] = rows[i]['prob'] + "%";
						}
						else if (field == 'final_payout') {
							rows[i]['final_payout'] = "$" + rows[i]['final_payout'];
						}
						else if (field == 'phishing') {
							if (rows[i]['phishing']) {
								rows[i]['phishing'] = 'phishing';
								rows[i]['isphishing'] = true;
							} 
							else { 
								rows[i]['phishing'] = 'normal';
								rows[i]['isphishing'] = false;
							} 
						}
						else if (field == 'scenario') {
							rows[i]['scenarioIndex'] = rows[i]['scenario'];
							rows[i]['scenario'] = scenarioRef[rows[i]['scenario']]
						}
						else if (field == 'sound' && rows[i][field] == "") {
							rows[i][field] = 'silence'	
						}
						else if (field == 'email_index') {
							let scenarioIndex = rows[i].scenarioIndex;
							let s = emails[scenarioIndex];
							let type = (parseInt(rows[i][field]) < s.phishing.length) ? 'phishing' : 'normal';
							let index = (parseInt(rows[i][field]) < s.phishing.length) ? parseInt(rows[i][field]) : parseInt(rows[i][field]) - s.phishing.length;
							let selEmail = s[type][index];

							rows[i]['email_type'] = selEmail.category;
							if (rows[i].isphishing) rows[i]['phishing_type'] = selEmail.strategy;
							else rows[i]['phishing_type'] = 'N/A';
						}

						rows[i]['result'] = (rows[i]['selection'] == rows[i]['phishing']) ? 'correct' : 'incorrect'
					}
					out.push(rows[i]);
				}
				let csv = json2csv({ data: out, fields: columnLabel });
				res.setHeader('Content-disposition', 'attachment; filename=data.csv');
				res.setHeader('Content-type', 'text/plain');
				res.charset = 'UTF-8';
				res.write(csv);
				res.end();
			});

	});
});

module.exports = router;