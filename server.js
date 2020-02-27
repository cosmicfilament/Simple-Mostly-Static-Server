'use strict';

/**
    * @module server.js
    * @author John Butler
    * @description main entry point for the server
*/

const express = require('express');
const path = require('path');
const { performance } = require('perf_hooks');

const apiRouter = require('./routes/apiRouter');
const HttpError = require('./util/http-error');
const { NODE_PORT, BASE_DIR } = {
	...require('./util/nodeConfig')
};
const logs = require('./util/logs');
const initLogs = require('./lib/logWorker');
const runServer = process.env.RUN_TESTS === undefined;

const app = express();
// replaces body-parser
app.use(express.json());
app.use(
	express.urlencoded({
		extended: false
	})
);
// CORS
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

	next();
});

// put your http request routing here
app.use('/api', apiRouter);

// static route
app.use(express.static(path.join(BASE_DIR, 'build')));
app.use(express.static(path.join(BASE_DIR, 'build', 'js')));
app.use(express.static(path.join(BASE_DIR, 'build', 'css')));

// uncomment this if using react.
/* app.get('/*', (req, res) => {
	res.sendFile(path.join(BASE_DIR, 'build', 'index.html'));
}); */

// error handling
app.use((req, res, next) => {
	const error = new HttpError('404 - Page not found.', 404);
	throw error;
});

app.use((error, req, res, next) => {
	logs.log(` Error: ${error.message}`, 'red');
	return next(error);
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || 'An unknown error occurred!' });
});

// orderly shutdown if during startup have critical failure
app.continueStartup = true;
app.shutdown = () => {
	app.continueStartup = false;
	console.log('gracefully exiting');
	setInterval(() => {
		process.exit(0);
	}, 1000 * 2);
};

// put anything that you want to shutdown gracefully on CTRL+C here
process.on('SIGINT', function () {
	console.log('SIGINT triggered');
	app.shutdown();
});

// startup
app.Run = async () => {
	try {
		const t0 = performance.now();

		let loadArray = [
			initLogs()
			/* add other modules like database initialization here */
		];

		Promise.all(loadArray).catch(error => {
			app.continueStartup = false;
			logs.log(`Aborting... ${error}`, 'red');
		});

		// don't start server if running test suite
		// or array'd startup functions fail
		if (runServer && app.continueStartup) {
			app.listen(NODE_PORT, () =>
				logs.log(`Server started on port ${NODE_PORT}.`, 'blue')
			);
			logs.log(
				`Loading server took ${((performance.now() - t0) / 60000).toFixed(
					4
				)} minutes to perform.`,
				'white'
			);
			logs.log('All startup processes are loaded and running.', 'green');
		}
	} catch (error) {
		app.continueStartup = false;
		logs.log(`aborting... ${error}`, 'red');
		app.shutdown();
	}
};

app.Run(app);

module.exports = app;
