'use strict';

/**
    * @module apiRouter
    * @author John Butler
    * @module default express router file
*/

const express = require('express');
const router = express.Router();

const logs = require('../logger/logs');

router.get('/get', (req, res) => router.getSomething(req, res));

router.post('/post', (req, res) => router.postSomething(req, res));

router.getSomething = async (req, res) => {
	const query = req.query;
	logs.resp(`getSomething query: ${JSON.stringify(query)}`);
	res.json({ msg: 'Get Something', query });
};

router.postSomething = async (req, res) => {
	const body = req.body;
	logs.resp(`postSomething body: ${JSON.stringify(body)}`);
	res.json({ msg: 'Post Something', body });
};

module.exports = router;
