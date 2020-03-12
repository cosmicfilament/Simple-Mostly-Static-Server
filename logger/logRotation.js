'use strict';

/**
  * @module logRotation.js
  * @author John Butler
  * @description rotates the log file daily
*/

const logs = require('./logs');
const nodeConfig = require('../util/nodeConfig');

async function rotateLogs (init = false) {
	// grab today's log file name
	const dateNow = new Date(Date.now());
	const todaysLogs = `${dateNow.getFullYear()}_${nodeConfig.MONTH[
		dateNow.getMonth()
	]}_${dateNow.getDate()}`;

	const fileList = await logs.list(false);
	!init && logs.info('Calling rotateLogs.');
	init && logs.info('Archiving logs during initialization');

	if (fileList) {
		for (let fileName of fileList) {
			// only compress previous day's log file
			if (fileName !== todaysLogs) {
				const logId = fileName.replace('.log', '');
				const newLogId = fileName.replace('.log', `-${Date.now()}`);
				// compress the new log
				let result = await logs.compress(logId, newLogId);
				// delete the old log file
				if (result) {
					(await logs.delete(logId)) &&
						logs.info(`Successfully rotated file: ${fileName}`);
				}
				else {
					logs.console(`Rotating logs failed for file: ${fileName}`);
				}
			}
		}
	}
	return true;
}

function loop () {
	setInterval(() => {
		return rotateLogs();
	}, nodeConfig.LOG_ROTATION_CHECK);
}

function initLogRotation () {
	logs.info('Log rotation background worker has started.');
	rotateLogs(true);
	//Call the log compression loop
	loop();
	return true;
}

module.exports = initLogRotation;
