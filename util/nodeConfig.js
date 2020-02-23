'use strict';

/**
    * @file configuration variables and constants specific to nodejs
    * @author John Butler
    * @module nodeConfig.js
*/

require('dotenv').config();

const nodeConfig = {};

// if true outputs lots of debug info to console
nodeConfig.DEBUG = true;
// log file directory
nodeConfig.LOG_DIR = 'logs';
nodeConfig.LOG_ROTATION_CHECK = 1000 * 60 * 59;

// set in .env file which should not be saved to github
nodeConfig.DEPLOYED_TO = String(process.env.DEPLOYED_TO);

// base directory also set in .env
nodeConfig.BASE_DIR =
	nodeConfig.DEPLOYED_TO === 'DEVELOPMENT'
		? process.env.BASE_DIR_DEVELOPMENT
		: process.env.BASE_DIR_PRODUCTION;

// node server port is also set in .env
nodeConfig.NODE_PORT = process.env.NODE_PORT;

module.exports = nodeConfig;
