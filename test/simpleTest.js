'use strict';

/**
  * @module simpleTest.js
  * @author John Butler
  * @description tests loading a web page plus get and post api calls.
*/
const request = require('supertest');
const app = require('../server');

const _get = '/api/get?dog=woof&cat=meow';
const _post = '/api/post';
const _data = {
	dog: {
		speak: 'woof'
	},
	cat: {
		speak: 'meow'
	}
};

describe('Running 4 Tests on the Simple Server', () => {
	it('First load static web page', done => {
		request(app).get('/').expect(200).end((err, res) => {
			if (err) {
				console.log(`Error: ${err}`);
				done(err);
			}
			else done();
		});
	});

	it('Second test 404 not found response', done => {
		request(app).get('/bad').expect(404).end((err, res) => {
			if (err) {
				console.log(`Error: ${err}`);
				done(err);
			}
			else done();
		});
	});

	it('Third /GET request to api route', done => {
		request(app)
			.get(_get)
			.expect(200, { msg: 'Get Something', query: { dog: 'woof', cat: 'meow' } })
			.end((err, res) => {
				if (err) {
					console.log(`Error: ${err}`);
					done(err);
				}
				else done();
			});
	});

	it('Last /POST request to api route', done => {
		request(app)
			.post(_post)
			.send(_data)
			.set('Accept', 'application/json')
			.expect(200, {
				msg: 'Post Something',
				body: { dog: { speak: 'woof' }, cat: { speak: 'meow' } }
			})
			.end((err, res) => {
				if (err) {
					console.log(`Error: ${err}`);
					done(err);
				}
				else done();
			});
	});

	app.shutdown();
});
