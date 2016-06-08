var offererDataChannel, answererDataChannel;

var peerOptions = 	{
        iceServers: [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'stun:stun1.l.google.com:19302' },
            { url: 'turn:numb.viagenie.ca', username:"wood1y01@gmail.com", credential:"wood1y013321" }
        ]
    };

var Offerer = {

    createOffer: function () {

        var peer = new RTCPeerConnection(peerOptions);

        var offer = peer.createOffer();

        offer.then(function(sdp) {
            peer.setLocalDescription(sdp);
            signal(sdp);
            console.log('Offer:', sdp);
        });

        // offererDataChannel = peer.createDataChannel('channel', {});
        // // console.log('OfferDataChannel: ', offererDataChannel);
        // setChannelEvents(offererDataChannel);

        // peer.onicecandidate = function (event) {
        //     if (event.candidate) {
        //         // Send_to_Other_Peer(event.candidate);
        //     }
        // };

        this.peer = peer;
        return this;
    },

    setRemoteDescription: function (sdp) {
        this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
    },

    addIceCandidate: function (candidate) {
        this.peer.addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: candidate.candidate
        }));
    }
};

var Answerer = {

    createAnswer: function (offerSDP) {

        var peer = new RTCPeerConnection(peerOptions);

        function createRemoteDescription() {
            return peer.setRemoteDescription(new RTCSessionDescription(offerSDP));
        }

        function createAnswer() {
            return peer.createAnswer();
        }

        createRemoteDescription()
            .then(function() {
                peer.createAnswer().then(function(answer) {
                    signal(answer);
                });
            })
            .catch(function(err) {
                console.log(err);
            });

        // answer.then(function(sdp) {
        //     peer.setLocalDescription(sdp);
        //     signal(sdp);
        //     console.log('Answer:', sdp);
        // })
        // .catch(function(err) {
        //     console.log(err);
        // });

        // peer.ondatachannel = function (event) {
        //     answererDataChannel = event.channel;
        //     setChannelEvents(answererDataChannel);
        // };

        // peer.onicecandidate = function (event) {
        //     if (event.candidate)
        //         Send_to_Other_Peer(event.candidate);
        // };

        this.peer = peer;

        return this;
    },
    addIceCandidate: function (candidate) {
        this.peer.addIceCandidate(createIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: candidate.candidate
        }));
    }
};

function setChannelEvents(channel) {
    channel.onmessage = function (event) {
        var data = JSON.parse(event.data);
        console.log(data);
    };
    channel.onopen = function () {
        channel.push = channel.send;
        channel.send = function (data) {
            channel.push(JSON.stringify(data));
        };
    };

    channel.onerror = function (e) {
        console.error('channel.onerror', JSON.stringify(e, null, '\t'));
    };

    channel.onclose = function (e) {
        console.warn('channel.onclose', JSON.stringify(e, null, '\t'));
    };
}

/////////////////////  SIGNALING /////////////////

var socket = io.connect('http://192.168.1.169:3030');

function signal(msg) {
    socket.emit('signal', msg);
}

function onSignal(message) {
    if (message.sdp) {
        try {
            console.log('Getting SDP');
            Answerer.createAnswer(message);
        }
        catch (err) {
            console.log(err.stack || err);
        }
    }
    console.log(message);
}

socket.on('signal', onSignal);


$(document).ready(function () {
    $('#offerer').on('click', function() {
        Offerer.createOffer();
    });
});