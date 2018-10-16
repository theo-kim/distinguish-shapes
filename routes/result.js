var express = require('express');
var router = express.Router();
var db = require('../db.js');

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + s4();

}

var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
var userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
var roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.cookies.round && req.cookies.round > 0) {
		var usercode = guid();
		var totalreturn = req.cookies.payout;
		db.select(['id', 'surveycode']).from(userTable).where('id', req.cookies['user_id']).first()
			.then((result) => {
				db.select('final_payout', 'selected_round', 'polygons', 'selection').from(testTable).join(roundTable, roundTable + '.testid', testTable + '.id').where(testTable + '.id', req.cookies['test_id']).first()
				.then((t) => {
					console.log(result)
					if (!result.surveycode) {
						db(userTable).update({'surveycode': usercode, }).where('id', result.id)
							.then((r) => {
								res.render('result', {code: usercode, total: t["final_payout"], round: t['selected_round'], polygons: result.polygons, selection: result.selection});	
							})
					}
					else res.render('result', {code: result.surveycode, total: t["final_payout"], round: t['selected_round'], polygons: result.polygons, selection: result.selection});
				})
			});
	}
	else {
		next();
	}
});

module.exports = router;
