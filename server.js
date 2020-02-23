'use strict';

/**
    * @file nodejs server entry point
    * @author John Butler
    * @module server.js
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
const logWorker = require('./lib/logWorker');

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

// need to implement the 404 handler on the client for a react web app
// uncomment this code for react app.
// comment out this code for non react web app
/* app.get('/*', (req, res) => {
	res.sendFile(path.join(BASE_DIR, 'build', 'index.html'));
}); */

// error handling
app.use((req, res, next) => {
	const error = new HttpError('404 - Page not found.', 404);
	throw error;
});

app.use((error, req, res, next) => {
	logs.log(` Error: ${error.message}`, 'b', 'red');
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
	setInterval(() => {
		process.exit(0);
	}, 1000 * 2);
};

/* TODO -- test this functionality */
process.on('SIGINT', function () {
	db.stop(function (err) {
		process.exit(err ? 1 : 0);
	});
});

// startup
app.Run = async () => {
	try {
		const t0 = performance.now();

		let loadArray = [
			logWorker.init(),
			/* add other modules like database initialization here */
			app.listen(NODE_PORT, () =>
				logs.log(`Server started on port ${NODE_PORT}.`, 'b', 'blue')
			)
		];
		const loaded = Promise.all(loadArray);
		loaded.then(() => {
			logs.log(
				`Loading server took ${((performance.now() - t0) / 60000).toFixed(
					4
				)} minutes to perform.`,
				'b',
				'white'
			);
		});
		loaded.then(() => {
			logs.log('All startup processes are loaded and running.', 'b', 'green');
		});

		loaded.catch(error => {
			app.continueStartup = false;
			logs.log(`Aborting... ${error}`, 'b', 'red');
		});
	} catch (error) {
		app.continueStartup = false;
		logs.log(`aborting... ${error}`, 'b', 'red');
		app.shutdown();
	}
};

app.Run(app);
