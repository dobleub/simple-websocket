'use strict';

var winston = require('winston');
var fs = require('fs');
var env = process.env.NODE_ENV || 'development';
var logDir = 'log';

// create the log directory if it does not exist
if(!fs.existsSync(logDir)){
	fs.mkdirSync(logDir);
}

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ json: false, timestamp: true }),
		new winston.transports.File({ filename: logDir + '/debug.log', json: false })
	],
	exceptionHandlers: [
		new (winston.transports.Console)({ json: false, timestamp: true }),
		new winston.transports.File({ filename: logDir + '/exceptions.log', json: false })
	],
	exitOnError: false
});

module.exports = logger;
