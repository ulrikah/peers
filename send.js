const ws = require("ws");
const Peer = require("simple-peer");
const wrtc = require("wrtc");
const stream = require("stream");
const log = require("./log");

const buf = Buffer.alloc(10000);

const endless = new stream.Readable({
    read: function () {
        this.push(buf);
    },
});

let peer;

const socket = new ws("ws://localhost:8080");

socket.addEventListener("message", onMessage);

function onMessage(event) {
    const message = event.data;
    if (message.includes("ready")) {
        if (peer) return;
        peer = new Peer({ initiator: true, wrtc: wrtc });
        peer.on("signal", function (signal) {
            socket.send(JSON.stringify(signal));
        });
        peer.on("connect", function () {
            endless.pipe(peer);
        });
        peer.on("data", (msg) => {
            if (msg && msg.toString() && msg.toString().startsWith("[text]")) {
                log(msg.toString());
                peer.send("[text] hi this is sender");
            }
        });
    } else {
        peer.signal(JSON.parse(message));
    }
}
