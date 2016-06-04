'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var http = require('http');
var https = require('https');

var port = process.env.PORT || 3030;

app.use(express.static('./src/client/'));

// https.createServer({
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// }, app).listen(port, function () {
//     console.log('Server running on port: ' + port);
// });

function connection(socket) {

	function disconnect() {
		console.log("Client disconnected!");
	}
	socket.on("disconnect", disconnect);
}

server.listen(port, function () {
    console.log('Server running on port: ' + port);
});

io.of("/rtc").on("connection",connection);
