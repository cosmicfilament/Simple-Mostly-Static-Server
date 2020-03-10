'use strict';

const logs = require('./../util/logs');
const nodeConfig = require('../util/nodeConfig');

async function rotateLogs (initial = false) {
	// grab today's log file name
	const dateNow = new Date(Date.now());
	const todaysLogs = `${dateNow.getFullYear()}_${nodeConfig.MONTH[
		dateNow.getMonth()
	]}_${dateNow.getDate()}`;

	const fileList = await logs.list(false);
	!initial && logs.log('Calling rotateLogs.', 'green');
	initial && logs.log('Archiving logs during initialization', 'green');

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
						logs.console(`Successfully rotated file: ${fileName}`, 'green');
				}
				else {
					logs.console(`Rotating logs failed for file: ${fileName}`);
				}
			}
		}
	}
	return true;
}

function logRotationLoop () {
	setInterval(() => {
		return rotateLogs();
	}, nodeConfig.LOG_ROTATION_CHECK);
}

function initLogs () {
	logs.log('Log rotation background worker has started.', 'blue');
	rotateLogs(true);
	//Call the log compression loop
	logRotationLoop();
	return true;
}

module.exports = initLogs;
