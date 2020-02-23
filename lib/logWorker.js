'use strict';

const fDb = require('../util/fileDb');
const logs = require('./../util/logs');
const helpers = require('./../util/helpers');
const nodeConfig = require('../util/nodeConfig');

const workers = {};
/**
 * @summary rotateLogs
 * @description Rotates (compresses) the log files
 */
workers.rotateLogs = async function () {
	// List all the (non compressed) log files

	// grab today's log file name
	const dateNow = new Date(Date.now());
	const todaysLogs = `${dateNow.getFullYear()}${dateNow.getMonth() +
		1}${dateNow.getDate()}`;

	const fileList = await logs.list(false).catch(() => {
		return false;
	});
	logs.log('Calling rotateLogs.', 'b', 'green');
	if (fileList) {
		for (let fileName of fileList) {
			// only compress previous day's log file
			if (fileName !== todaysLogs) {
				const logId = fileName.replace('.log', '');
				const newLogId = fileName.replace('.log', `-${Date.now()}`);
				// compress the new log
				let result = await logs.compress(logId, newLogId).catch(() => {
					return false;
				});
				// delete the old log file
				if (result) {
					result = await logs.delete(logId).catch(() => {
						return false;
					});
				}
				else {
					helpers.log('red', `Rotating logs failed for file: ${fileName}`);
				}
				if (result) {
					helpers.log('green', `Successfully rotated file: ${fileName}`);
				}
			} // end if
		} // end for of
	} // end if
	return true;
};

/**
 * @summary logRotationLoop
 * @description Timer to execute the log-rotation process once per day. Runs every 5 minutes and checks the time. Hey what do you want?
 */
workers.logRotationLoop = () => {
	setInterval(() => {
		return workers
			.rotateLogs()
			.catch(err =>
				helpers.log('red', `Log rotation failed with error: ${err}`)
			);
	}, nodeConfig.LOG_ROTATION_CHECK);
};
/**
 * @summary init
 * @description starts the worker loops
 */
workers.init = () => {
	logs.log('Log rotation background worker has started.', 'b', 'blue');

	//Call the log compression loop
	workers.logRotationLoop();
};

module.exports = workers;
