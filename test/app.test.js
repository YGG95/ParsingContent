var app = require('../main.js');

var supertest = require('supertest');

var request = supertest(app);
const should = require('should');

describe('Test Connection', function () {

	this.timeout(1000000);

	it("should return 200", function(done) {
		request.post('/')
			.expect(200)
			.end();
	});

});