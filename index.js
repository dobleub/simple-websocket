var fs = require('fs');
var https = require('https');
var express = require('express');
var app = express();
var logger = require('./bin/logger');

// global vars
var serverOptions = {
        key : fs.readFileSync('/home/osorio_edd/server.key'),
        cert : fs.readFileSync('/home/osorio_edd/server.crt'),
        passphrase : 'GRACIAS.'
};
var messages = [{
	id: 1,
        text: 'Bienvenido',
        author: 'Server'
}];
var serverPort = 8000;
var serverAddress = '104.154.250.123';

// socket
var server = https.createServer(serverOptions, app);
var io = require('socket.io')(server);

// middleware
io.use(function(socket, next){
	var handshake = socket.handshake;
	var remoteIp = socket.request.connection.remoteAddress;
	// log
	logger.info('IP: ' + remoteIp + ' - Query: ');
	logger.info(handshake.query);
	// return the result of next() to accept the connection
	if (handshake.query.foo == 'bar') {
		return next();
	}
	// call next() with an Error if you need to reject the connection
	// next(new Error('Authentication error'));
	next(logger.warn('IP: ' + remoteIp + ' - Authentication error'));
});
app.use(express.static('public'));

// verbs
app.get('/', function(request, response){
	var remoteIp = request.connection.remoteAddress;
	//response.status(200).send('Hola mundo');
	// log
	logger.info('IP: ' + remoteIp + ' - Access to index.html');
	response.status(200).redirect('index.html');
});

// getting data from socket
io.on('connection', function(socket){
	// log
	logger.info('Socket connected at http://' + serverAddress + ':' + serverPort);
	
	socket.emit('messages', messages);
	socket.on('new-message', function(data){
		messages.push(data);
		// emit messages array for all sockets connections
		io.sockets.emit('messages', messages);
		// emit message for current connection
		socket.emit('sent-message');
	});
});

// listening
server.listen(serverPort, function(){ 
	// log
	logger.info('Server running at http://' + serverAddress + ':' + serverPort); 
	// check if we are running as root
	if(process.getgid() === 0){
		process.setgid('nobody');
		process.setuid('nobody');
		// log
		logger.info('Global process setted by nobody');
	}
});

// for daemon process
process.on('SIGTERM', function(){
	if(server == undefined) return;
	server.close(function(){
		// disconnect from cluster master
		process.disconnect && process.disconnect();
	});
	// log
	logger.info('Global process closed');
});
