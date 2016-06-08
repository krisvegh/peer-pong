var iceServers = {
    iceServers: [{
        url: 'stun:stun.l.google.com:19302'
    }]
};
var offererDataChannel, answererDataChannel;

var Offerer = {
    createOffer: function () {
        var peer = new RTCPeerConnection(iceServers);

        offererDataChannel = peer.createDataChannel('channel', {});
        setChannelEvents(offererDataChannel);

        peer.onicecandidate = function (event) {
            if (event.candidate)
                Send_to_Other_Peer(event.candidate);
        };

        var offer = peer.createOffer();
        offer.then(function(data) {
            console.log(data);
        });

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
        var peer = new RTCPeerConnection(iceServers);
        peer.ondatachannel = function (event) {
            answererDataChannel = event.channel;
            setChannelEvents(answererDataChannel);
        };

        peer.onicecandidate = function (event) {
            if (event.candidate)
                Send_to_Other_Peer(event.candidate);
        };

        peer.setRemoteDescription(new RTCSessionDescription(offerSDP));
        peer.createAnswer(function (sdp) {
            peer.setLocalDescription(sdp);
            Send_to_Other_Peer(sdp);
        });

        this.peer = peer;

        return this;
    },
    addIceCandidate: function (candidate) {
        this.peer.addIceCandidate(new RTCIceCandidate({
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

///////////////////

var websocket = io.connect('/rtc', {
		"connect timeout": 3000,
		"reconnect": false
	});

websocket.onmessage = function (e) {
    e = JSON.parse(e.data);

    // Don't get self sent messages
    if (e.senderid == userid) return;

    var data = e.data;

    // if other user created offer; and sent you offer-sdp
    if (data.offerSDP) {
        window.answerer = Answerer.createAnswer(data.offerSDP);
    }

    // if other user created answer; and sent you answer-sdp
    if (data.answerSDP) {
        window.offerer.setRemoteDescription(data.answerSDP);
    }

    // if other user sent you ice candidates
    if (data.ice) {
        // it will be fired both for offerer and answerer
        (window.answerer || window.offerer).addIceCandidate(data.ice);
    }
};

var userid = Math.random() * 1000;

websocket.push = websocket.send;
websocket.send = function (data) {
    // wait/loop until socket connection gets open
    if (websocket.readState != 1) {
        // websocket connection is not opened yet.
        return setTimeout(function () {
            websocket.send(data);
        }, 500);
    }

    // data is stringified because websocket protocol accepts only string data
    var json_stringified_data = JSON.stringify({
        senderid: userid,
        data: data
    });

    websocket.push(json_stringified_data);
};

///////////////////

$(document).ready(function () {
	$('#offerer').on('click', function() {
		Offerer.createOffer();
	});
});