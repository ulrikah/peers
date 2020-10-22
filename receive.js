var Peer = require("simple-peer");
var wrtc = require("wrtc");

var receiver = new Peer({ wrtc: wrtc });

receiver.on("signal", (data) => {
    console.log("SIGNAL", JSON.stringify(data));
});

receiver.on("connect", () => {
    // wait for 'connect' event before using the data channel
    receiver.send("hey senderr, how is it going?");
});

receiver.on("data", (data) => {
    console.log("[DATA]", JSON.stringify(data));
});

receiver.on("error", (err) => {
    console.log("[ERROR]", err);
});
