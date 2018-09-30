var db = require('./db.js');

var adminTable = (process.env.DEBUG) ? 'dev_admin' : 'prod_admin';
var probTable = (process.env.DEBUG) ? 'dev_prob' : 'prod_prob';

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
	max = 0
	maxIndex = 0
	for (var i = 0; i < str.length; ++i)
		if (parseInt(str[i]) > max) {
			max = parseInt(str[i])
			maxIndex = i
		}
	return [max, i]
}


module.exports = function() {
	return new Promise((resolve, reject) => {
		db.select("*").from(adminTable).orderBy('id', 'desc').first()
		.then((settings) => {
			db.select("*").from(probTable).orderBy('prob', 'desc').then((prob) => {
				settings["n-m"] = settings.n - settings.m;
				settings["polygons_text"] = translatePolyString(settings.polygons);
				settings["true_polygons_text"] = translatePolyString(settings["true_polygons"]);
				settings["shapes"] = shapes(settings.polygons);
				settings["true_shapes"] = shapes(settings["true_polygons"]);
				settings.probabilities = prob;

				resolve(settings);
			});
		});
	});
}