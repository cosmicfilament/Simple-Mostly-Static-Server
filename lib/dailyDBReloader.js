'use strict';

/**
    * @file loads ephemeral data on a timer once per day
    * @author John Butler
    * @module dailyDBReloader.js
*/
const { performance } = require('perf_hooks');
const { curly } = require('node-libcurl');
const { promisify } = require('util');
const { open, close, ftruncate, writeFile } = require('fs');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const ftruncateFileP = promisify(ftruncate);
const writeFileP = promisify(writeFile);

const logs = require('../util/logs');
const {
	BASE_DIR,
	DB_CURRENT_LOAD_FILE,
	DB_CURRENT_LOAD_FILE_URL,
	DB_DAILY_RELOAD_TIME_ARRAY
} = {
	...require('../util/nodeConfig')
};
const loadHistoricTweets = require('./loadHistoricTweets');
const loadWeeklySentiment = require('./loadWeeklySentiment');
const loadDailySentiment = require('./loadDailySentiment');

const dailyDBReloader = {};

dailyDBReloader.processFile = async () => {
	const { statusCode, data, headers } = await curly.get(DB_CURRENT_LOAD_FILE_URL);
	// save it to a file for restarting of the database
	await dailyDBReloader.updateLatestFile(data);
	await loadHistoricTweets(true);

	let loadArray = [ loadWeeklySentiment(true), loadDailySentiment(true) ];
	const t0 = performance.now();
	const loadSentiments = Promise.all(loadArray);

	loadSentiments.then(() => {
		logs.log(
			`Loading database took ${((performance.now() - t0) / 60000).toFixed(
				4
			)} minutes to perform.`,
			'b',
			'white'
		);
	});
};

dailyDBReloader.updateLatestFile = async data => {
	const fName = `${BASE_DIR}/rawData/${DB_CURRENT_LOAD_FILE}`;

	const fd = await openFileP(fName, 'r+');
	await ftruncateFileP(fd);
	await writeFileP(fd, data);
	await closeFileP(fd);
};

dailyDBReloader.runLoop = () => {
	setInterval(() => {
		DB_DAILY_RELOAD_TIME_ARRAY.forEach(timeValue => {
			const [ hours, mins ] = timeValue.split(':');
			const timeNow = new Date(Date.now());

			if (
				parseInt(hours) === timeNow.getHours() &&
				parseInt(mins) === timeNow.getMinutes()
			) {
				logs.log('loading tweet file from Trump Twitter Archive', 'b', 'cyan');
				dailyDBReloader.processFile().catch(error => {
					logs.log(`Failed to retrieve file from TTA. ${error}`, 'b', 'red');
				});
			}
		});
	}, 57000); //checks every 57 seconds so can only happen once per minute.
};

dailyDBReloader.init = () => {
	if (DB_DAILY_RELOAD_TIME_ARRAY.length) {
		logs.log('dailyDBReloader has started', 'b', 'blue');
		dailyDBReloader.runLoop();
	}
	else {
		logs.log('Bypassing dailyDBloader', 'b', 'blue');
	}
};

module.exports = dailyDBReloader;
