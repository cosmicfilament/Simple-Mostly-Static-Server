'use strict';

/**
    * @file 
    * @author John Butler
    * @module 
*/

const { promisify } = require('util');
const { readFile } = require('fs');
const readFileP = promisify(readFile);

const { BASE_DIR, DB_CURRENT_LOAD_FILE_ARRAY } = {
	...require('../util/nodeConfig')
};
const TweetDB = require('../models/tweet');
const logs = require('../util/logs');
const helpers = require('../util/helpers');

const loadHistoricTweets = async reload => {
	if (reload) {
		try {
			// drop the current collection cause we are reloading the whole set of files
			await TweetDB.bulkWrite([ { deleteMany: { filter: { id_str: { $gt: '' } } } } ]);
			// and iterate thru the list of filenames
			for (const fileName of DB_CURRENT_LOAD_FILE_ARRAY) {
				const fileNameWithPath = `${BASE_DIR}/rawData/${fileName}`;

				if (fileName) {
					const tweets = await readFileP(fileNameWithPath, 'utf8');
					if (!helpers.validateString(tweets)) {
						throw 'Could not parse tweets file into json';
					}
					const tweetsObj = helpers.parseJsonToObject(tweets);

					// bulk insert into the database
					await TweetDB.insertMany(tweetsObj);

					logs.log(`Tweets database loaded from file: ${fileNameWithPath}.`, 'b', 'cyan');
				}
			}
		} catch (err) {
			logs.log('Error loading Historic tweets from file.', 'b', 'red');
			throw err;
		}
	}
	else {
		logs.log('Bypassing loading Historic tweets from file(s).', 'b', 'blue');
	}
	return true;
};

module.exports = loadHistoricTweets;
