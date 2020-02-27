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

async function openFile (fileName, flags = 'a+') {
	let fd = await openFileP(fileName, flags).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return fd;
}

async function closeFile (fd) {
	await closeFileP(fd).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return true;
}

async function truncateFile (fd) {
	await ftruncateFileP(fd).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return true;
}

async function readFileAsUtf8 (fileName) {
	let str = await readFileP(fileName, 'utf8').catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return str;
}

async function readFileBuffer (fileName) {
	let buffer = await readFileP(fileName).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return buffer;
}

async function saveFile (fileName, data) {
	await writeFileP(fileName, data).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return true;
}

async function deleteFile (fileName) {
	await deleteFileP(fileName).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return true;
}

async function readDirectory (directoryName) {
	let strArray = await readDirP(directoryName).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return strArray;
}

async function isAccessible (absolutePath) {
	await accessP(absolutePath, F_OK | R_OK | W_OK).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return true;
}

async function stats (absolutePath) {
	const _stat = await statP(absolutePath).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return _stat;
}

async function appendToFile (fd, str) {
	await appendFileP(fd, str).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return true;
}

async function gzip (sourceFile, sourceData) {
	const zippedData = await gzipP(sourceFile, sourceData).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
	});
	return zippedData;
}

async function unzip (sourceData) {
	const unZippedData = await unzipP(sourceData).catch(error => {
		console.log(`File function failed: ${error}`);
		return false;
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
