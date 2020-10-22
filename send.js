const ws = require("ws");
const Peer = require("simple-peer");
const wrtc = require("wrtc");
var stream = require("readable-stream");

var buf = Buffer.alloc(10000);

var endless = new stream.Readable({
    read: function () {
        this.push(buf);
    },
});

var peer;

var socket = new ws("ws://localhost:8080");

socket.addEventListener("message", onMessage);

function onMessage(event) {
    var message = event.data;
    if (message.includes("ready")) {
        if (peer) return;
        peer = new Peer({ initiator: true, wrtc: wrtc });
        peer.on("signal", function (signal) {
            socket.send(JSON.stringify(signal));
        });
        peer.on("connect", function () {
            endless.pipe(peer);
        });
    } else {
        peer.signal(JSON.parse(message));
    }
}
