const ws = require("ws");

const server = new ws.Server({
    port: 8080,
});

const sockets = [];

server.on("connection", (socket) => {
    sockets.push(socket);
    socket.on("message", (msg) => {
        console.log("[server]", "received a message", "\n", msg);
        sockets
            .filter((s) => s !== socket)
            .forEach((socket) => socket.send(msg));
    });
    socket.on("close", () => {
        sockets.splice(sockets.indexOf(socket), 1);
        console.log("socket connection closed");
        console.log("current socket count", sockets.length);
    });

    console.log("received socket connection");
    console.log("current socket count", sockets.length);

    // time to connect the two peers :~)
    if (sockets.length === 2) {
        sockets.forEach((socket, idx) =>
            socket.send(`ready ${idx === 0 ? "initiator" : ""}`)
        );
    }
});
