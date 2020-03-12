'use strict';

/**
  * @module fileP.js
  * @author John Butler
  * @description promisify wrapper over fs file functions
*/

const zlib = require('zlib');
const { promisify } = require('util');
const {
	open,
	close,
	ftruncate,
	readFile,
	writeFile,
	readdir,
	appendFile,
	unlink,
	stat
} = require('fs');

const { F_OK, R_OK, W_OK } = require('constants');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const ftruncateFileP = promisify(ftruncate);
const deleteFileP = promisify(unlink);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const readDirP = promisify(readdir);
const appendFileP = promisify(appendFile);
const statP = promisify(stat);

const gzipP = promisify(zlib.gzip);
const unzipP = promisify(zlib.unzip);

// set throwError to false to swallow errors
function errorHandler (err, func, throwError = true) {
	const msg = `${func} function failed: ${err}`;
	console.trace(msg);
	if (throwError) throw new Error(msg);
	return false;
}

function openFile (fileName, flags = 'a+') {
	return openFileP(fileName, flags).catch(error => {
		return errorHandler(error, 'openFile');
	});
}

function closeFile (fd) {
	closeFileP(fd).catch(error => {
		return errorHandler(error, 'closeFile');
	});
	return true;
}

function truncateFile (fd) {
	ftruncateFileP(fd).catch(error => {
		return errorHandler(error, 'truncateFile');
	});
	return true;
}

function readFileAsUtf8 (fileName) {
	return readFileP(fileName, 'utf8').catch(error => {
		return errorHandler(error, 'readFileAsUtf8');
	});
}

function readFileBuffer (fileName) {
	return readFileP(fileName).catch(error => {
		return errorHandler(error, 'readFileBuffer');
	});
}

function saveFile (fileName, data) {
	writeFileP(fileName, data).catch(error => {
		return errorHandler(error, 'saveFile');
	});
	return true;
}

function deleteFile (fileName) {
	deleteFileP(fileName).catch(error => {
		return errorHandler(error, 'deleteFile');
	});
	return true;
}

function readDirectory (directoryName) {
	return readDirP(directoryName).catch(error => {
		return errorHandler(error, 'readDirectory');
	});
}

function stats (absolutePath) {
	return statP(absolutePath).catch(error => {
		return errorHandler(error, 'stats');
	});
}

function appendToFile (fd, str) {
	appendFileP(fd, str).catch(error => {
		return errorHandler(error, 'appendToFile');
	});
	return true;
}

function gzip (sourceData) {
	return gzipP(sourceData).catch(error => {
		return errorHandler(error, 'gzip');
	});
}

function unzip (sourceData) {
	return unzipP(sourceData).catch(error => {
		return errorHandler(error, 'unzip');
	});
}

module.exports = {
	openFile,
	closeFile,
	truncateFile,
	readFileAsUtf8,
	readFileBuffer,
	saveFile,
	deleteFile,
	readDirectory,
	stats,
	appendToFile,
	gzip,
	unzip
};
