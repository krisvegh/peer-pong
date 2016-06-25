var offererDataChannel, answererDataChannel;

var peerOptions = 	{
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'turn:numb.viagenie.ca', username:"wood1y01@gmail.com", credential:"wood1y013321" }
        ]
    };

function createICECandidate(answerSDP) {
    return new RTCIceCandidate(answerSDP);
}

var Offerer = {
    createOffer: function () {
        var peer = new RTCPeerConnection(peerOptions);
        offererDataChannel = peer.createDataChannel('channel', {});
        setChannelEvents(offererDataChannel);
        var offer = peer.createOffer({
            mandatory: {
                OfferToReceiveAudio: true
            }
        });
        offer.then(function(sdp) {
            peer.setLocalDescription(sdp);
            signal(sdp);
            console.log('Offer:', sdp);
        });


        peer.onicecandidate = function offerIceCandidate(event) {
            signal({
                candidate: event.candidate
            });
        };
        this.peer = peer;
        return this;
    },

    setRemoteDescription: function (sdp) {
        this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
    },

    addIceCandidate: function (event) {
        if (this.peer) {
            this.peer.addIceCandidate(createICECandidate({
                candidate: event.candidate,
                sdpMLineIndex: event.sdpMLineIndex
            }));
        }
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

        Promise.resolve()
            .then(createRemoteDescription)
            .then(createAnswer)
            .then(function(answer) {
                signal(answer);
                peer.setLocalDescription(answer);
                console.log(answer);
            })
            .catch(function(err) {
                console.log(err);
            });

        peer.ondatachannel = function (event) {
            answererDataChannel = event.channel;
            setChannelEvents(answererDataChannel);
        };

        peer.onicecandidate = function offerIceCandidate(event) {
            signal({
                candidate: event.candidate
            });
        };

        this.peer = peer;

        return this;
    },
    addIceCandidate: function (event) {
        if (this.peer) {
            this.peer.addIceCandidate(createICECandidate({
                candidate: event.candidate,
                sdpMLineIndex: event.sdpMLineIndex
            }));
        }
    }
};

function setChannelEvents(channel) {
    channel.onmessage = function (event) {
        var data = JSON.parse(event.data);
        console.log(data);
    };
    channel.onopen = function () {
        console.log(channel, ' Opened');
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
    if (message.candidate) {
        Answerer.addIceCandidate(message.candidate);
        Offerer.addIceCandidate(message.candidate);
    }

    if (message.sdp) {
        try {
            if (message.type === 'offer') {
                Answerer.createAnswer(message);
            }
            else if (message.type === 'answer') {
                Offerer.setRemoteDescription(message);
            }
        }
        catch (err) {
            console.log(err.stack || err);
        }
    }
}

socket.on('signal', onSignal);


$(document).ready(function () {
    $('#offerer').on('click', function() {
        Offerer.createOffer();
    });
});