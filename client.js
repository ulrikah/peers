const ws = require("ws");

const socket = new ws("ws://localhost:8080");

socket.on("open", () => {
    console.log("Opening socket");
});

socket.on("message", (msg) => {
    console.log("[msg]", msg);
});
