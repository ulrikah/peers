var Peer = require("simple-peer");
var wrtc = require("wrtc");

var sender = new Peer({ initiator: true, wrtc: wrtc });

sender.on("signal", (data) => {
    console.log("SIGNAL", JSON.stringify(data));
});

sender.on("connect", () => {
    console.log("connection");
    sender.send("hey receiver, how is it going?");
});

sender.on("error", (err) => {
    console.log("[ERROR]", err);
});

sender.on("data", (data) => {
    console.log("[DATA]", JSON.stringify(data));
});
