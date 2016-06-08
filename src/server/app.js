var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3030);

app.use(express.static('./src/client/'));

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