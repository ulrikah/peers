const ws = require("ws");
const Peer = require("simple-peer");
const wrtc = require("wrtc");
const speedometer = require("speedometer");
const prettierBytes = require("prettier-bytes");
const log = require("./log");

let peer;

const speed = speedometer();

const socket = new ws("ws://localhost:8080");

socket.addEventListener("message", onMessage);

function onMessage(event) {
    const message = event.data;
    if (message.includes("ready")) {
        if (peer) return;
        peer = new Peer({
            initiator: message.includes("initiator") ? true : false,
            wrtc: wrtc,
        });
        peer.on("signal", (signal) => {
            socket.send(JSON.stringify(signal));
        });
        peer.on("data", (msg) => {
            if (msg && msg.toString() && msg.toString().startsWith("[text]")) {
                log(msg.toString());
            }
            speed(msg.length);
        });
        peer.on("connect", () => {
            console.log("CONNECTED");
            peer.send("[text] hi this is receiver");
        });
    } else {
        peer.signal(JSON.parse(message));
    }
}

setInterval(function () {
    console.log(prettierBytes(speed()));
}, 1000);
