import express = require("express");
import ws = require("ws");
import publicIp = require("public-ip");
import http = require("http");
import {
    uniqueNamesGenerator,
    adjectives,
    animals,
} from "unique-names-generator";
import Message from "./common/message";

// const generateId = (): string => Math.random().toString(16).substr(2, 4);
const generateId = (): string =>
    uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: "-",
    });
const PORT = process.env.PORT || 1234;

publicIp.v4().then((ip) => {
    console.log("Public IP adress", ip);
});

const app: express.Application = express()
    .use(express.static(__dirname + "/static"))
    .get("/", (req, res) => res.sendFile(__dirname + "/static/index.html"));

const server = http.createServer(app);

interface SocketClient {
    ws: ws;
    id: string;
    name?: string;
}

const clients: SocketClient[] = [];

const socketServer = new ws.Server({ noServer: true });

socketServer.on("connection", (ws: ws) => {
    const socketClient = {
        ws: ws,
        id: generateId(),
    };

    clients.push(socketClient);
    socketClient.ws.send(
        JSON.stringify({
            type: "id",
            timestamp: new Date(),
            id: socketClient.id,
        })
    );
    const logClientStatus = () => {
        console.log(
            `[${clients.length} clients]`,
            clients.map((client) => client.id).join(" ")
        );
    };

    socketClient.ws.on("message", (msg) => {
        let message: Message;
        try {
            message = JSON.parse(msg.toString());
        } catch (SyntaxError) {
            console.error("ERROR Failed parsing message from socket client");
            return;
        }
        if (message.type == "webrtc-connection-attempt") {
            console.log(
                message.initiator ? "🌱" : "",
                message.origin,
                "wants to connect to",
                message.target,
                message.initiator ? "" : "🌱"
            );
        }
        if (message.type == "webrtc-connection-signal") {
            console.log(
                `[signal] forwarding signal from ${message.origin} to ${message.target}`
            );
            const target = clients.find(
                (client) => client.id == message.target
            );
            target.ws.send(JSON.stringify(message));
        }
        // clients
        //     .filter((client) => client !== socketClient)
        //     .forEach((client) => {
        //         client.ws.send(
        //             JSON.stringify({
        //                 type: "message",
        //                 id: socketClient.id,
        //                 msg: msg,
        //             })
        //         );
        //     });
    });

    socketClient.ws.on("close", () => {
        clients.splice(clients.indexOf(socketClient), 1);
        console.log("[disconnect]", socketClient.id);
        logClientStatus();
    });

    console.log("[connect]", socketClient.id);
    logClientStatus();

    // time to connect the peers :~)
    // the initiator is always the first client in the list
    if (clients.length >= 2) {
        clients.forEach((originClient) => {
            const remoteClients = clients.filter(
                (client) => client !== originClient
            );
            remoteClients.forEach((remoteClient) => {
                originClient.ws.send(
                    JSON.stringify({
                        type: "ready",
                        timestamp: new Date(),
                        id: originClient.id,
                        target: remoteClient.id,
                        initiator:
                            clients.indexOf(originClient) <
                            clients.indexOf(remoteClient),
                    })
                );
            });
        });
    }
});

server.on("upgrade", (req: http.IncomingMessage, socket, head) => {
    socketServer.handleUpgrade(req, socket, head, (socket) => {
        socketServer.emit("connection", socket, req);
    });
});
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
