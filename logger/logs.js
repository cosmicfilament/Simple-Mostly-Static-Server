'use strict';

/** 
 * @module logs.js
 * @author John Butler
 * @description functions for logging and compressing and uncompressing log files
 */

const {
	openFile,
	appendToFile,
	saveFile,
	closeFile,
	deleteFile,
	readDirectory,
	readFileAsUtf8,
	gzip,
	unzip
} = require('../util/fileP');

const nodeConfig = require('../util/nodeConfig');
// log directory
const logDirectory = `${nodeConfig.BASE_DIR}/${nodeConfig.LOG_DIR}`;

const INFO = 'INFO: ',
	REQ = 'REQ: ',
	RESP = 'RESP: ',
	WARN = 'WARNING: ',
	ERROR = 'ERROR: ';

// file in current or target directory
const makeFName = (fName, logFile = true) => {
	if (logFile) {
		return `${logDirectory}/${fName}.log`;
	}
	else {
		return `${logDirectory}/${fName}.gz.b64`;
	}
};

const logs = {};

logs.append = async function (file, str) {
	const fName = makeFName(file);

	try {
		// open file for appending
		const fd = await openFile(fName, 'a');
		// append log entry to the file
		fd && (await appendToFile(fd, `${str}\n`));

		return await closeFile(fd);
	} catch (error) {
		console.trace(`logs.append failed: ${error}`);
		return false;
	}
};

logs.list = async function (includeCompressedLogs) {
	let logData = null;

	try {
		//read the directory contents
		logData = await readDirectory(logDirectory);
	} catch (error) {
		console.trace(`logs.list failed: ${error}`);
	}

	let trimmedFileNames = [];
	if (logData) {
		for (let fileName of logData) {
			if (fileName && fileName.indexOf('.log') > -1) {
				trimmedFileNames.push(fileName.replace('.log', ''));
			}
			else if (fileName && fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
				//gobble up the zipped files too
				trimmedFileNames.push(fileName.replace('.gz.b64', ''));
			}
		} // end for
	} // end if
	// returns list of file names
	return trimmedFileNames ? trimmedFileNames : [];
};

logs.compress = async function (logId, newFileId) {
	const sourceFile = makeFName(logId);
	const destFile = makeFName(newFileId, false);

	try {
		let sourceData = await readFileAsUtf8(sourceFile);
		let sourceDataZipped = await gzip(sourceData);
		let fd = await openFile(destFile, 'wx');

		await saveFile(fd, sourceDataZipped.toString('base64'));
		return await closeFile(fd);
	} catch (error) {
		console.trace(`logs.compress failed: ${error}`);
	}
};

logs.decompress = async function (fileId) {
	const file = makeFName(fileId);
	try {
		const sourceData = await readFileAsUtf8(file);
		return await unzip(sourceData);
	} catch (error) {
		console.trace(`logs.decompress failed: ${error}`);
		return null;
	}
};

logs.delete = async function (logId) {
	try {
		return await deleteFile(makeFName(logId));
	} catch (error) {
		console.trace(`logs.delete failed: ${error}`);
		return false;
	}
};

logs._log = async function (logData, level) {
	const timeNow = new Date(Date.now());
	// Convert the data to a string
	const logString = `${level}${timeNow.toLocaleTimeString('en-US')}: ${logData}`;
	const color =
		level === INFO
			? 'blue'
			: level === REQ
				? 'white'
				: level === RESP ? 'green' : level === WARN ? 'yellow' : 'red';

	logs.console(logString, color);

	// Determine the name of the currently active log file
	const logFileName = `${timeNow.getFullYear()}_${nodeConfig.MONTH[
		timeNow.getMonth()
	]}_${timeNow.getDate()}`;

	// pop this new entry onto the current log file.
	return await logs.append(logFileName, logString);
};

logs.console = (msg, color = 'red') => {
	switch (color) {
		case 'red':
			color = '\x1b[31m%s';
			break;
		case 'green':
			color = '\x1b[32m%s';
			break;
		case 'blue':
			color = '\x1b[34m%s';
			break;
		case 'yellow':
			color = '\x1b[33m%s';
			break;
		case 'black':
			color = '\x1b[30m%s';
			break;
		case 'white':
			color = '\x1b[37m%s';
			break;
		case 'cyan':
			color = '\x1b[36m%s';
			break;
		case 'magenta':
			color = '\x1b[35m%s';
			break;
	}
	console.log(color, msg);
	console.log('\x1b[37m%s', '');
};

logs.info = logData => logs._log(logData, INFO);
logs.req = logData => logs._log(logData, REQ);
logs.resp = logData => logs._log(logData, RESP);
logs.warning = logData => logs._log(logData, WARN);
logs.error = logData => logs._log(logData, ERROR);

module.exports = logs;
