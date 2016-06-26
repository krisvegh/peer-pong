/*********************************
 *              RTC              *
 ********************************/

var RTC = (function () {
    var thisPeer = undefined;
    var peerOptions = {
        iceServers: [
            { urls: 'stun:stun01.sipphone.com' },
            { urls: 'stun:stun.ekiga.net' },
            { urls: 'stun:stun.fwdnet.net' },
            { urls: 'stun:stun.ideasip.com' },
            { urls: 'stun:stun.iptel.org' },
            { urls: 'stun:stun.rixtelecom.se' },
            { urls: 'stun:stun.schlund.de' },
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:stunserver.org' },
            { urls: 'stun:stun.softjoys.com' },
            { urls: 'stun:stun.voiparound.com' },
            { urls: 'stun:stun.voipbuster.com' },
            { urls: 'stun:stun.voipstunt.com' },
            { urls: 'stun:stun.voxgratia.org' },
            { urls: 'stun:stun.xten.com' },
            {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
            {
                urls: 'turn:192.158.29.39:3478?transport=udp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            },
            {
                urls: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            }
        ]
    };

    function createPeer() {
        return new RTCPeerConnection(peerOptions);
    }

    function createICECandidate(SDP) {
        return new RTCIceCandidate(SDP);
    }

    var publicApi = {
        createPeer,
        createICECandidate,
        thisPeer
    };
    return publicApi;
})();



/*********************************
 *        OFFERER / GAME         *
 ********************************/

var Offerer = (function () {
    var peer = RTC.createPeer();
    var channelId = Math.floor(Math.random()*1000);
    var dataChannel = peer.createDataChannel('position', {
        reliable: false
    });

    function sendOffer() {
        RTC.thisPeer = 'offerer';
        $('body p').text(String(channelId)); // temp
        peer.createOffer()
            .then(function (sdp) {
                peer.setLocalDescription(sdp);
                Signal.send({
                    channelId,
                    sdp
                });
            });
    }
    if (location.pathname === '/') {
        var sendOfferInterval = setInterval(function() {
            sendOffer();
        } , 3000);
    }

    function setRemoteDescription(sdp) {
        peer.setRemoteDescription(new RTCSessionDescription(sdp));
    }

    function addIceCandidate(event) {
        if (RTC.thisPeer === 'offerer') {
            peer.addIceCandidate(RTC.createICECandidate({
                candidate: event.candidate,
                sdpMLineIndex: event.sdpMLineIndex
            }));
        }
    }

    peer.onicecandidate = function offererIceCandidate(event) {
        Signal.send({
            candidate: event.candidate
        });
    };

    dataChannel.onmessage = function () {

    };

    dataChannel.onopen = function (e) {
        console.log(e);
        clearInterval(sendOfferInterval);
    };

    dataChannel.onerror = function () {

    };

    dataChannel.onclose = function () {

    };

    var publicApi = {
        peer,
        sendOffer,
        setRemoteDescription,
        dataChannel,
        addIceCandidate
    };

    return publicApi;
})();



/*********************************
 *       Answerer / Phone        *
 ********************************/

var Answerer = (function () {
    var peer = RTC.createPeer();

    function sendAnswer(offerSDP) {
        RTC.thisPeer = 'answerer';

        function createAnswer() {
            return peer.createAnswer();
        }

        peer.setRemoteDescription(new RTCSessionDescription(offerSDP))
            .then(createAnswer)
            .then(function (answer) {
                Signal.send(answer);
                peer.setLocalDescription(answer);
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    peer.ondatachannel = function (event) {
        var dataChannel = event.channel;

        dataChannel.onmessage = function () {

        };

        dataChannel.onopen = function (e) {
            console.log(e);
        };

        dataChannel.onerror = function () {

        };

        dataChannel.onclose = function () {

        };
    };

    function addIceCandidate(event) {
        if (RTC.thisPeer === 'answerer') {
            peer.addIceCandidate(RTC.createICECandidate({
                candidate: event.candidate,
                sdpMLineIndex: event.sdpMLineIndex
            }));
        }
    }

    var publicApi = {
        peer,
        sendAnswer,
        addIceCandidate
    };

    return publicApi;
})();



/*********************************
 *           SIGNALING           *
 ********************************/

var Signal = (function () {
    var pathId = Number(location.pathname.substring(1));

    var socket = io.connect('http://192.168.1.169:3030');

    socket.on('signal', onsignal);

    function onsignal(message) {
        if (message.candidate) {
            Offerer.addIceCandidate(message.candidate);
            Answerer.addIceCandidate(message.candidate);
        }

        if (message.sdp) {
            try {
                if (message.sdp.type === 'offer' && message.channelId === pathId) {
                    Answerer.sendAnswer(message.sdp);
                }
                if (message.type === 'answer') {
                    Offerer.setRemoteDescription(message);
                }
            }
            catch(err) {
                console.log(err.stack || err);
            }
        }
    }

    function send(msg) {
        socket.emit('signal', msg);
    }

    var publicApi = {
        send
    };

    return publicApi;
})();

$(document).ready(function () {
    $('#offerer').on('click', function() {
        Offerer.sendOffer();
    });
});