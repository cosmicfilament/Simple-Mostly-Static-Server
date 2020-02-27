'use strict';

/**
    * @module apiRouter
    * @author John Butler
    * @module default express router file
*/

const express = require('express');
const router = express.Router();

const logs = require('../util/logs');

router.get('/get', (req, res) => router.getSomething(req, res));

router.post('/post', (req, res) => router.postSomething(req, res));

router.getSomething = async (req, res) => {
	const query = req.query;
	logs.log(`getSomething query: ${JSON.stringify(query)}`, 'green');
	res.json({ msg: 'Get Something', query });
};

router.postSomething = async (req, res) => {
	const body = req.body;
	logs.log(`postSomething body: ${JSON.stringify(body)}`, 'green');
	res.json({ msg: 'Post Something', body });
};

module.exports = router;
