let express = require('express');
let router = express.Router();
let xml = require("xml-parse");
let db = require('../db.js');
let settingsM = require('../settings.js');
let moment = require('moment');
let json2csv = require('json2csv');

let userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
let testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
let roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';
let adminTable = (process.env.DEBUG) ? 'dev_admin' : 'prod_admin';

router.get('/', (req, res, next) => {
	settingsM().then((settings) => {
		delete settings.id
		delete settings['n-m']
		delete settings['polygons_text']
		delete settings['true_polygons_text']
		delete settings['max_payout']

		res.render("admin", { settings: settings });
	})
})



module.exports = router;