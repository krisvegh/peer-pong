var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var port = process.env.PORT || 3040;

server.listen(port);

app.use(express.static('./src/client/'));

app.get('/*', function (req, res) {
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

function connection(socket) {

	function disconnect() {
		console.log("disconnected");
	}

	function onSignal(msg) {
		console.log("relaying signal:", msg);
		socket.broadcast.emit("signal", msg);
	}
	socket.on("disconnect",disconnect);
	socket.on("signal",onSignal);
}

io.on('connection', connection);