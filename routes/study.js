var express = require('express');
var router = express.Router();


// Random Social:

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round || !req.cookies.rand) { 
		next();
	}
	else {
		social = {}
		social[parseInt(req.cookies.round)] = {
			category: getRandomInt(100),
			fee: getRandomInt(100),
			price: getRandomInt(100),
			'first-year': getRandomInt(100),
			'fifth-year': getRandomInt(100),
		};


		let arr = Object.values(social[parseInt(req.cookies.round)]);
		let min = Math.min(...arr);
		let max = Math.max(...arr);

		social[parseInt(req.cookies.round)]['sort-max'] = max;
		social[parseInt(req.cookies.round)]['sort-min'] = min;

		console.log(arr)

		if (parseInt(req.cookies.round) < 10) 
			res.render('study', {
				data: finData,
				round: parseInt(req.cookies.round),
				social: social,
				rand: parseInt(req.cookies.rand),
				test: req.cookies.test,
				user: req.cookies.user,
				marketvalues: marketvalues,
				text: headertext[parseInt(req.cookies.rand)],
				retur: parseFloat(req.cookies.return)
			});
		else
			res.redirect('/endsurvey');
	}
});

module.exports = router;
