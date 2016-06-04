/**
 * SHIM for RTCconnections
 */
function createPeerConnection(config,optional) {
	if (window.RTCPeerConnection) return new RTCPeerConnection(config,optional);
	else if (window.webkitRTCPeerConnection) return new webkitRTCPeerConnection(config,optional);
	else if (window.mozRTCPeerConnection) return new mozRTCPeerConnection(config,optional);
	throw new Error("RTC Peer Connection not available");
}

function createIceCandidate(candidate) {
	if (window.RTCIceCandidate) return new RTCIceCandidate(candidate);
	else if (window.webkitRTCIceCandidate) return new webkitRTCIceCandidate(candidate);
	else if (window.mozRTCIceCandidate) return new mozRTCIceCandidate(candidate);
	throw new Error("RTC Ice Candidate not available");
}

function createSessionDescription(desc) {
	if (window.RTCSessionDescription) return new RTCSessionDescription(desc);
	else if (window.webkitRTCSessionDescription) return new webkitRTCSessionDescription(desc);
	else if (window.mozRTCSessionDescription) return new mozRTCSessionDescription(desc);
	throw new Error("RTC Session Description not available");
}

//////////////////////////////////////////////////

var offererDataChannel, answererDataChannel;

var peer = createPeerConnection(
	{
		iceServers: [
			{ url: 'stun:stun.l.google.com:19302' },
			{ url: 'stun:stun1.l.google.com:19302' },
			{ url: 'turn:numb.viagenie.ca', username:"wood1y01@gmail.com", credential:"wood1y013321" }
		]
	},
	{
		optional: [
			// FF/Chrome interop? https://hacks.mozilla.org/category/webrtc/as/complete/
			{ DtlsSrtpKeyAgreement: true }
		]
	}
);

var Offerer = {

    createOffer: function () {

        offererDataChannel = peer.createDataChannel('channel', {});
        setChannelEvents(offererDataChannel);

        peer.onicecandidate = function (event) {
            if (event.candidate) {
                // Send_to_Other_Peer(event.candidate);
			}
        };

        peer.createOffer(function (sdp) {
            peer.setLocalDescription(sdp);
            //Send_to_Other_Peer(sdp);
        });

        this.peer = peer;

        return this;
    },

    setRemoteDescription: function (sdp) {
        this.peer.setRemoteDescription(createSessionDescription(sdp));
    },

    addIceCandidate: function (candidate) {
        this.peer.addIceCandidate(createIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: candidate.candidate
        }));
    }
};

var Answerer = {

    createAnswer: function (offerSDP) {

        peer.ondatachannel = function (event) {
            answererDataChannel = event.channel;
            setChannelEvents(answererDataChannel);
        };

        peer.onicecandidate = function (event) {
            if (event.candidate)
                Send_to_Other_Peer(event.candidate);
        };

        peer.setRemoteDescription(createSessionDescription(offerSDP));
        peer.createAnswer(function (sdp) {
            peer.setLocalDescription(sdp);
            Send_to_Other_Peer(sdp);
        });

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

var socket = io.connect('/rtc', {
		"connect timeout": 3000,
		"reconnect": false
	});

function signal(message) {
    if(socket) {
        socket.emit('signal', message);
    }
}

socket.on("hello", function(data){
	//sockets
});

// websocket.onmessage = function (e) {
//     e = JSON.parse(e.data);

//     // Don't get self sent messages
//     if (e.senderid == userid) return;

//     var data = e.data;

//     // if other user created offer; and sent you offer-sdp
//     if (data.offerSDP) {
//         window.answerer = Answerer.createAnswer(data.offerSDP);
//     }

//     // if other user created answer; and sent you answer-sdp
//     if (data.answerSDP) {
//         window.offerer.setRemoteDescription(data.answerSDP);
//     }

//     // if other user sent you ice candidates
//     if (data.ice) {
//         // it will be fired both for offerer and answerer
//         (window.answerer || window.offerer).addIceCandidate(data.ice);
//     }
// };

// var userid = Math.random() * 1000;

// websocket.push = websocket.send;
// websocket.send = function (data) {
//     // wait/loop until socket connection gets open
//     if (websocket.readState != 1) {
//         // websocket connection is not opened yet.
//         return setTimeout(function () {
//             websocket.send(data);
//         }, 500);
//     }

//     // data is stringified because websocket protocol accepts only string data
//     var json_stringified_data = JSON.stringify({
//         senderid: userid,
//         data: data
//     });

//     websocket.push(json_stringified_data);
// };

$(document).ready(function () {
	$('#offerer').on('click', function() {
		Offerer.createOffer();
	});
});