var express = require('express');
var router = express.Router();

const admin = require('./admin.js');
const study = require('./study.js');
const survey = require('./survey.js');
const welcome = require('./welcome.js');
const practice = require('./practice.js');
const result = require('./result.js');
const end = require('./end.js');
const api = require('./api/');

router.use('/api', api);

router.use('/admin', admin);
router.use('/welcome', welcome);
router.use('/survey', survey);
router.use('/practice', practice);
router.use('/result', result);
router.use('/end', end);
router.use('/', study);

module.exports = router;
