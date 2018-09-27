let express = require('express');
let router = express.Router();
let mturk = require('mturk-api');
let xml = require("xml-parse");
let db = require('../db.js');
let moment = require('moment');
let json2csv = require('json2csv');
let social = require('../data/social.json');
let marketdata = require('../data/marketdata.json');
let questions = require('../data/endsurveyquestions.json');
let marketvalues = require('../data/marketvalues.json');
let percentages = require('../data/social.json');

// console.log(marketvalues)

// let userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
// let testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
// let roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';

let userTable = (process.env.DEBUG) ? 'prod_participants' : 'prod_participants';
let testTable = (process.env.DEBUG) ? 'prod_tests' : 'prod_tests';
let roundTable = (process.env.DEBUG) ? 'prod_rounds' : 'prod_rounds';
let adminTable = (process.env.DEBUG) ? 'prod_rounds' : 'prod_rounds';



let ref = ['category_sort', 'fee_sort',	'price_sort', 'first-year_sort', 'fifth-year_sort', 'stock_filter', 'bond_filter', 'money-market_filter', 'balanced_filter', 'international_filter', 'index_filter', 'active_filter', 'above_filter', 'between_filter', 'below_filter'];
let conditions = ['control', 'tooltip', 'color', 'both'];

function getMTURKData(api, Hit) {
	return new Promise(function (resolve, reject) {
		let assignments = {};
		// Get the submitted assignments for the HIT
		api.req('GetAssignmentsForHIT', { HITId: Hit.HITId, PageSize: Hit.MaxAssignments })
			.then(function(res) {
				if (res.GetAssignmentsForHITResult[0].Assignment) {
					// Loop through those assignments
					for (let i = 0; i < res.GetAssignmentsForHITResult[0].Assignment.length; ++i) {
						// Get the user's survey code
						let surveycode;
						if (xml.parse(res.GetAssignmentsForHITResult[0].Assignment[i].Answer)) {
							const c = xml.parse(res.GetAssignmentsForHITResult[0].Assignment[i].Answer)[1].childNodes[0].childNodes[1].innerXML;
							if (c && typeof c == "string") surveycode = c.replace(' ', '');
						}
						else surveycode = null;
						// Get workerid
						let workerid = res.GetAssignmentsForHITResult[0].Assignment[i].WorkerId;
						// Get assignmentid
						let assignmentid = res.GetAssignmentsForHITResult[0].Assignment[i].AssignmentId;
						// if (!surveycode) console.log(res.GetAssignmentsForHITResult[0].Assignment[i].Answer);
						assignments[surveycode] = { survey: surveycode, worker: workerid, assignment: assignmentid }
					};
					return api.req('GetBonusPayments', { HITId: Hit.HITId });
				}
				else {
					resolve(assignments);
				}
			})
			.then(function (res) {
				if (res) {
					let bonuses = res.GetBonusPaymentsResult[0].BonusPayment;
					//console.log("bonuses", bonuses);
					if (bonuses) {
						for (let il = 0; il < bonuses.length; ++il) {
							for (let jl = 0; jl < assignments.length; ++jl) {
								if (bonuses[il].WorkerId == assignments[jl].worker) assignments[jl].bonused = true;	
							}
						}
					}
				}
				resolve(assignments);
			}, (err) => console.log('b', err));
		})
}

/* GET home page. */
router.get('/', (req, res, next) => {
	let average = {};

	db.select().from(userTable).whereNotNull('usercode').join(testTable, userTable + '.id', testTable + '.userid').orderBy(testTable + '.start', 'desc')
		.then((r) => {
			console.log('start')
			let g = {};
			let t = Object.keys(r[0]);
			g['userid'] = 0;
			g['condition'] = 0;
			for (let i = 0; i < t.length; ++i) {
				if (t[i] === "start") { 
					g["duration (s)"] = 0;
					for (let j = 0; j < r.length; ++j) {
						r[j]["duration (s)"] = "Unfinished";
						if (r[j]["ending"] != null) {
							let s = moment(r[j]["start"]);
							let e = moment(r[j]["ending"]);
							r[j]["duration (s)"] = moment.duration(e.diff(s)).asSeconds();
						}
					}
				}
				g[t[i]] = i;
			}
			function recu (i) {
				db.select().from(roundTable).where('test', r[i].id)
					.then((data) => { 
						for (let j = 0; j < data.length; ++j) {
							let k = Object.keys(data[j]);
							for (let o = 0; o < k.length; ++o) {
								if (k[o] === "category" || k[o] === "fee" || k[o] === "price" ) {
									let n = k[o];
									if (data[j][k[o]]) {
										r[i][((2017 + j) + '_' + k[o] + '_sort_%')] = data[j][k[o]] + '%';
									}
								}
								else if (k[o] === "first_year" || k[o] === "fifth_year") {
									if (data[j][k[o]]) {
										let n = k[o].replace('_', '-').replace('first', 'one').replace('fifth', 'five');
										r[i][((2017 + j) + '_' + n + '_sort_%')] = data[j][k[o]] + '%';
									}
								}
								else if (k[o] === "start") {
									let s = moment(data[j]["start"]);
									let e = moment(data[j]["ending"]);
									r[i][(2017 + j) + "_time"] = moment.duration(e.diff(s)).asSeconds();
									g[(2017 + j) + "_time"] = data[j][k[o]] = 0;
								}
								else if (k[o] === "ending") { }
								else if (k[o] === "type") {
									g['condition'] = "0";
									r[i]['condition'] = conditions[data[j]['type']];
								}
								else if (k[o] === "selection") {
									let actions = data[j][k[o]].split(':');
									for (let w = 0; w < actions.length; ++w) {
										if (w < 5) {
											let n = ref[w].replace('first', 'one');
											n = n.replace('fifth', 'five');
											let sel = (2017 + j) + '_' + n;
											g[sel] = 0;
											g[sel + '_%'] = 0;
											g[2017 + j + "_color"] = "0";
											if (data[j].type > 1) r[i][2017 + j + "_color"] = "Yes";
											else r[i][2017 + j + "_color"] = "No";
											if (data[j].type > 0) {
												if (!r[i][sel + "_%"]) r[i][sel + "_%"] = social[j + 1][ref[w].replace('_sort', '')] + '%';
											}
											else
												r[i][sel + "_%"] = "N/A";
											if (actions[w] == '')
												r[i][sel] = 'none';
											else {
												r[i][sel] = {ascending: '', descending: ''};
												let be = actions[w].split(',');
												for (let b = 0; b < be.length; ++b) {
													if (be[b].includes('a')) r[i][sel].ascending += be[b].replace('a', '') + ',';
													else if (be[b].includes('d')) r[i][sel].descending += be[b].replace('d', '') + ',';
												}
												if (r[i][sel].ascending == '') r[i][sel].ascending = 'none';
												if (r[i][sel].descending == '') r[i][sel].descending = 'none';
											}
										}
										// Remove filtering functionality

										// else {
										// 	let s = "";
										// 	if (data[j].type > 0) 
										// 		r[i][(2017 + j) + "_" + ref[w] + "_%"] = social[j + 1][ref[w].replace('_filter', '')] + '%'
										// 	else
										// 		r[i][(2017 + j) + "_" + ref[w] + "_%"] = "N/A";
										// 	if (data[j][k[o]][w] == '0')
										// 		r[i][(2017 + j) + "_" + ref[w]] = 'none';
										// 	else if (data[j][k[o]][w] == '1')
										// 		r[i][(2017 + j) + "_" + ref[w]] = 'filtered';
										// }
									}
								}
								else if (k[o] == "allocation") {
									if (!average[(2017 + j)]) average[(2017 + j)] = { l: 0 }
									else {
										let allocations = data[j][k[o]].split(',');
										for (let i = 0; i < allocations.length; ++i) {
											let y = allocations[i].split(':');
											if (y[0] != ' ') {
												if (average[(2017 + j)][y[0]]) {
													let al = average[(2017 + j)][y[0]].l + 1;
													average[(2017 + j)][y[0]].v = (y[1] * (1 / al)) + (average[(2017 + j)][y[0]].v * ((al - 1) / al));
													average[(2017 + j)][y[0]].l++;
												}
												else 
													average[(2017 + j)][y[0]] = { v: (y[1]), l : 1};
												average[(2017 + j)].l++;
											}
										}
									} 
								}
								else {
									r[i][(2017 + j) + "_" + k[o]] = data[j][k[o]];
									g[(2017 + j) + "_" + k[o]] = data[j][k[o]] = 0;
								}
							} 
						} 
						if (i + 1 < r.length)
							recu(i + 1);
						else {							 
							try {
							  	let result = json2csv({ data: r, fields: Object.keys(g) });
							  	console.log('mturk')
								mturk.createClient(config).then(function (api) {
									let page = res;
									let PromiseStack = [];
									let hitStack = [];
									api.req('SearchHITs', { PageSize: 15 })
										.then(function(res) {											
											// Check for HITS in Jan or Feb
											for (let i = 0; i < res.SearchHITsResult[0].HIT.length; ++i) {
												if (parseInt(moment(res.SearchHITsResult[0].HIT[i].CreationTime).format("M")) < 3) {
													hitStack.push(res.SearchHITsResult[0].HIT[i]);
													PromiseStack.push(getMTURKData(api, res.SearchHITsResult[0].HIT[i]));
												}
											}
											return Promise.all(PromiseStack);
										})
										.then((rawAss) => {
											let assignments = {};
											for (let i = 0; i < rawAss.length; ++i) {
												assignments = Object.assign(assignments, rawAss[i]);
											}

											// console.log(r.length)
											for (var i = 0; i < r.length; ++i) {
												if (!r[i].workerid) {

													if (assignments[r[i].usercode]) {
														let worker = assignments[r[i].usercode];
														r[i].workerid = worker.worker;
														r[i].assignment = worker.assignment;
														r[i].bonus = worker.bonused;
														// db(userTable).update({ workerid: assignments[j].worker }).where('usercode', assignments[j].survey).then(() => {});		
														if (!r[i].bonus) {
															// Automatic bonusing
															// api.req('GrantBonus', 
															// 	{ AssignmentId: assignments[j].assignment, BonusAmount: { Amount: Math.round(r[i]['total_return']) / 100 + '', CurrencyCode: 'USD' }, WorkerId: assignments[j].worker, Reason: "Investment Study Bonus" });	
															// r[i].bonus = true;
														}
														break;
													}
													else {
														// console.log(r[i].usercode);
													}

												}
												else {
													r[i].bonus = true;
												}
											}

											let res = Object.keys(assignments);
											for (let i = 0; i < res.length; ++i) {
												// console.log(res[i])
											}

											page.render('admin', {
										  		social: social,
										  		marketdata: marketdata,
										  		users: r,
										  		headers: Object.keys(g),
										  		moment: moment, 
										  		csv: result,
										  		questions: questions,
										  		marketvalues: marketvalues,
										  		percentages: percentages,
										  		average: average
										  	});
										});
								});
							} catch (err) {
							  console.error(err);
							}
						}
					});
			}
			recu(0);
		})
		.then((j) => {
		})

});

module.exports = router;


/*

														  	*/
