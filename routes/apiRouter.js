'use strict';

/**
    * @file 
    * @author John Butler
    * @module 
*/

const express = require('express');
const router = express.Router();

const logs = require('../util/logs');

// http://yourURL/api/get?a&b...
router.get('/get', (req, res) => router.getSomething(req, res));
// http://yourURL/api/post
router.post('/post', (req, res) => router.postSomething(req, res));

router.getSomething = async (req, res) => {
	const query = req.query;
	logs.log(`getSomething query: ${JSON.stringify(query)}`, 'b', 'green');
	res.json({ msg: 'Here yah go homie.', query });
};

router.postSomething = async (req, res) => {
	const body = req.body;
	logs.log(`postSomething body: ${JSON.stringify(body)}`, 'b', 'green');
	res.json({ msg: 'post successful', body });
};

module.exports = router;
