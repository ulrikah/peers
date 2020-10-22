const ws = require("ws");
const Peer = require("simple-peer");
const wrtc = require("wrtc");
const speedometer = require("speedometer");
const prettierBytes = require("prettier-bytes");

var peer;

var speed = speedometer();

var socket = new ws("ws://localhost:8080");

socket.addEventListener("message", onMessage);

function onMessage(event) {
    var message = event.data;
    if (message.includes("ready")) {
        if (peer) return;
        peer = new Peer({
            initiator: message.includes("initiator") ? true : false,
            wrtc: wrtc,
        });
        peer.on("signal", function (signal) {
            socket.send(JSON.stringify(signal));
        });
        peer.on("data", function (message) {
            speed(message.length);
        });
    } else {
        peer.signal(JSON.parse(message));
    }
}

setInterval(function () {
    console.log(prettierBytes(speed()));
}, 1000);
