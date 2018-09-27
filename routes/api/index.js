var express = require('express');
var router = express.Router();
var iplocation = require('iplocation')
var db = require('../../db.js');
var adminAPI = require('./admin.js');

var userTable = (process.env.DEBUG) ? 'prod_participants' : 'prod_participants';
var testTable = (process.env.DEBUG) ? 'prod_tests' : 'prod_tests';
var roundTable = (process.env.DEBUG) ? 'prod_rounds' : 'prod_rounds';


module.exports = router;
