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
	access,
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
const accessP = promisify(access);
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

async function openFile (fileName, flags = 'a+') {
	let fd = await openFileP(fileName, flags).catch(error => {
		return errorHandler(error, 'openFile');
	});
	return fd;
}

async function closeFile (fd) {
	await closeFileP(fd).catch(error => {
		return errorHandler(error, 'closeFile');
	});
	return true;
}

async function truncateFile (fd) {
	await ftruncateFileP(fd).catch(error => {
		return errorHandler(error, 'truncateFile');
	});
	return true;
}

async function readFileAsUtf8 (fileName) {
	let str = await readFileP(fileName, 'utf8').catch(error => {
		return errorHandler(error, 'readFileAsUtf8');
	});
	return str;
}

async function readFileBuffer (fileName) {
	let buffer = await readFileP(fileName).catch(error => {
		return errorHandler(error, 'readFileBuffer');
	});
	return buffer;
}

async function saveFile (fileName, data) {
	await writeFileP(fileName, data).catch(error => {
		return errorHandler(error, 'saveFile');
	});
	return true;
}

async function deleteFile (fileName) {
	await deleteFileP(fileName).catch(error => {
		return errorHandler(error, 'deleteFile');
	});
	return true;
}

async function readDirectory (directoryName) {
	let strArray = await readDirP(directoryName).catch(error => {
		return errorHandler(error, 'readDirectory');
	});
	return strArray;
}

async function isAccessible (absolutePath) {
	await accessP(absolutePath, F_OK | R_OK | W_OK).catch(error => {
		return errorHandler(error, 'isAccessible');
	});
	return true;
}

async function stats (absolutePath) {
	const _stat = await statP(absolutePath).catch(error => {
		return errorHandler(error, 'stats');
	});
	return _stat;
}

async function appendToFile (fd, str) {
	await appendFileP(fd, str).catch(error => {
		return errorHandler(error, 'appendToFile');
	});
	return true;
}

async function gzip (sourceData) {
	const zippedData = await gzipP(sourceData).catch(error => {
		return errorHandler(error, 'gzip');
	});
	return zippedData;
}

async function unzip (sourceData) {
	const unZippedData = await unzipP(sourceData).catch(error => {
		return errorHandler(error, 'unzip');
	});
	return unZippedData;
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
	isAccessible,
	stats,
	appendToFile,
	gzip,
	unzip
};
