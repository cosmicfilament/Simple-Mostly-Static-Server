'use strict';

/**
    * @module nodeConfig.js
    * @author John Butler
    * @description configuration constants
*/

require('dotenv').config();

const nodeConfig = {};

nodeConfig.MONTH = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

// log file directory
nodeConfig.LOG_DIR = 'logs';
nodeConfig.LOG_ROTATION_CHECK = 1000 * 60 * 59;

// base directory also set in .env
nodeConfig.BASE_DIR =
	process.env.COMPUTERNAME === 'MIZAR'
		? process.env.BASE_DIR_DEVELOPMENT_MIZAR
		: process.env.COMPUTERNAME === 'WHALESHARK'
			? process.env.BASE_DIR_DEVELOPMENT_WHALESHARK
			: process.env.BASE_DIR_PRODUCTION;

// node server port is also set in .env
nodeConfig.NODE_PORT = process.env.NODE_PORT;

module.exports = nodeConfig;
