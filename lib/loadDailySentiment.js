'use strict';

/**
    * @file 
    * @author John Butler
    * @module loadDailySentiment.js
*/

const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const { TWEET_START_DATE } = {
	...require('../util/nodeConfig')
};
const DailySentimentDB = require('../models/dailySentiment');
const TweetDB = require('../models/tweet');
const logs = require('../util/logs');
const helpers = require('../util/helpers');

const loadDailySentiment = async reload => {
	if (reload) {
		try {
			logs.log('Starting to load daily Sentiment database.', 'b', 'cyan');
			//
			let lastTweetDate = await TweetDB.find().sort({ created_at: -1 }).limit(1);
			lastTweetDate = new Date(lastTweetDate[0].created_at);

			const sentiments = [];
			for (
				// starts on sunday right before dipshit started tweeting
				let currentTweetDate = new Date(TWEET_START_DATE);
				currentTweetDate <= lastTweetDate;
				currentTweetDate.setDate(currentTweetDate.getDate() + 1)
			) {
				let tomorrow = new Date(currentTweetDate);
				tomorrow.setDate(tomorrow.getDate() + 1);

				let text = '';
				// find all of the tweets for the current day
				const tweets = await TweetDB.find(
					{
						created_at: {
							$gte: currentTweetDate,
							$lt: tomorrow
						}
					},
					{ text: 1, created_at: 1 }
				);
				for (let tweet of tweets) {
					text += tweet.text;
				}
				const tweetsCount = tweets.length;

				// score it
				let {
					score,
					comparative,
					calculation,
					tokens,
					words,
					positive,
					negative
				} = sentiment.analyze(text);
				// and push onto an array of objects
				sentiments.push({
					year: parseInt(currentTweetDate.getFullYear()),
					end_date: new Date(currentTweetDate),
					score,
					comparative,
					calculation,
					tokens,
					words,
					positive,
					negative,
					tweetsCount
				});
			}
			// drop the current collection cause we are reloading
			await DailySentimentDB.bulkWrite([
				{ deleteMany: { filter: { end_date: { $gt: '2009-05-01' } } } }
			]);
			// store the array in the database
			if (helpers.validateArray(sentiments)) {
				await DailySentimentDB.insertMany(sentiments);
				logs.log(
					`*** Daily Sentiment database loaded with ${sentiments.length} records. ***\n`,
					'b',
					'cyan'
				);
			}
			else {
				throw 'Error validating daily sentiments array.';
			}
		} catch (error) {
			logs.log('Error loading daily historic sentiment data.', 'b', 'red');
			throw error;
		}
	}
	else {
		logs.log('Bypassing loading daily Historic sentiment data.', 'b', 'blue');
	}
	return true;
};

module.exports = loadDailySentiment;
