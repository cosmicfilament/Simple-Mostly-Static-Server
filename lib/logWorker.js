'use strict';

const logs = require('./../util/logs');
const nodeConfig = require('../util/nodeConfig');

async function rotateLogs () {
	// grab today's log file name
	const dateNow = new Date(Date.now());
	const todaysLogs = `${dateNow.getFullYear()}${dateNow.getMonth() + 1}${dateNow.getDate()}`;

	const fileList = await logs.list(false);
	logs.log('Calling rotateLogs.', 'green');

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
	//Call the log compression loop
	logRotationLoop();
	return true;
}

module.exports = initLogs;
