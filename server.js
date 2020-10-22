const ws = require("ws");

const server = new ws.Server({
    port: 8080,
});

const sockets = [];

server.on("connection", function (socket) {
    sockets.push(socket);

    console.log("received socket connection");
    console.log("current socket count", sockets.length);

    // time to connect the two peers :~)
    if (sockets.length === 2) {
        sockets.forEach((socket, idx) =>
            socket.send(
                `you should connect to the other peer ${Math.abs(1 - idx)}`
            )
        );
    }
});
