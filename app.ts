import express = require("express");
import ws = require("ws");
import publicIp = require("public-ip");
import http = require("http");

const PORT = process.env.port || 1234;

publicIp.v4().then((ip) => {
    console.log("Public IP adress", ip);
});

const app: express.Application = express()
    .use(express.static(__dirname + "/static"))
    .get("/", (req, res) => res.sendFile(__dirname + "/static/index.html"));

const server = http.createServer(app);

const clients: ws[] = [];

const socketServer = new ws.Server({ noServer: true });
socketServer.on("connection", (client: ws) => {
    client.on("message", (message) => console.log(message));
    clients.push(client);
    client.on("message", (msg) => {
        console.log("[server]", "received a message", "\n", msg);
        clients
            .filter((s) => s !== client)
            .forEach((client) => client.send(msg));
    });

    client.on("close", () => {
        clients.splice(clients.indexOf(client), 1);
        console.log("client connection closed");
        console.log("current client count", clients.length);
    });

    console.log("received client connection");
    console.log("current client count", clients.length);

    // time to connect the two peers :~)
    if (clients.length === 2) {
        clients.forEach((client, idx) =>
            client.send(`ready ${idx === 0 ? "initiator" : ""}`)
        );
    }
});

server.on("upgrade", (req: http.IncomingMessage, socket, head) => {
    socketServer.handleUpgrade(req, socket, head, (socket) => {
        socketServer.emit("connection", socket, req);
    });
});
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
