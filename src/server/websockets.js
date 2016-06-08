'use strict';

function onConnected(socket) {

    function disconnect() {
        console.log('socket disconnected');
    }

    function onSignal(msg) {
        socket.broadcast.emit(msg);
        console.log('Signaling', msg);
    }

    socket.on('disconnect', disconnect);

    socket.on('signal', onSignal);

}

module.exports = onConnected;