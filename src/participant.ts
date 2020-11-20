import Peer, { SimplePeerData } from "simple-peer";
import debug from "debug";
import Message from "../common/message";
const log = debug("participant");

interface PeerConnection {
    peer: Peer.Instance;
    connected: boolean;
    connectedAt?: string;
}

export default class Participant {
    socket: WebSocket;
    connections: Map<string, PeerConnection>;
    participantId: string;
    id: string;
    constructor(socketUrl: string) {
        this.socket = this.connectToSocket(socketUrl);
        this.connections = new Map<string, PeerConnection>();
    }

    greeting = () => {
        return JSON.stringify({
            type: "greeting",
            origin: this.id,
            timestamp: new Date().getTime().toString(),
        });
    };

    connectToSocket = (socketUrl: string) => {
        const socket = new window.WebSocket(socketUrl);
        socket.addEventListener("message", this.onMessage);
        return socket;
    };

    onMessage = (event: MessageEvent) => {
        const message: Message = JSON.parse(event.data);

        if (message.type == "id") {
            console.log("Assigned ID", message.id);
            this.id = message.id;
        }

        if (message.type == "webrtc-connection-signal") {
            try {
                console.log("Oppfordring om å signalisere til", message.origin);
                // if (this.connections.has(message.origin))
                console.log(this.connections);
                this.connections
                    .get(message.origin)
                    .peer.signal(message.signal);
                // this.peer.signal(message.signal);
            } catch (error) {
                console.error("ERROR message didn't contain signal", error);
                console.error("Message", message);
            }
        }

        if (message.type == "ready") {
            const origin = message.id;
            const target = message.target;
            const initiator = message.initiator;
            console.log(
                "I'm ready to connect to",
                target,
                "as the",
                initiator ? "initiator 🌱 " : "receiver 🍄"
            );

            const peer = new Peer({ initiator: initiator });

            // create new connection if there doesn't already exists one
            if (!this.connections.has(target)) {
                this.connections.set(target, {
                    peer: peer,
                    connectedAt: undefined,
                    connected: false,
                });
            }

            this.socket.send(
                JSON.stringify({
                    type: "webrtc-connection-attempt",
                    origin: origin,
                    target: target,
                    initiator: initiator,
                    timestamp: new Date().getTime().toString(),
                })
            );

            peer.on("signal", (signal) => {
                if (!this.connections.get(target).connected) {
                    console.log(`📡 received signal from ${target}`);
                    this.socket.send(
                        JSON.stringify({
                            type: "webrtc-connection-signal",
                            origin: origin,
                            target: target,
                            signal: signal,
                            timestamp: new Date().getTime().toString(),
                        })
                    );
                } else {
                    console.log("Connection already exists");
                }
            });

            peer.on("data", (data: ArrayBuffer) => {
                const peerMessage: Message = JSON.parse(data.toString());
                if (peerMessage.type == "ping") {
                    peer.send(
                        JSON.stringify({
                            type: "pong",
                            origin: this.id,
                            message: `[pong] from ${this.id}`,
                            timestamp: new Date().getTime().toString(),
                        })
                    );
                }

                if (peerMessage.type == "pong") {
                    console.log(peerMessage.message);
                    console.log(
                        `[connection] to ${peerMessage.origin} established`
                    );
                    console.log("New connection. List of connected peers:");
                    this.connections.get(peerMessage.origin).connected = true;
                    this.connections.get(peerMessage.origin).connectedAt =
                        peerMessage.timestamp;

                    for (let [
                        targetId,
                        connection,
                    ] of this.connections.entries()) {
                        if (connection.connected) {
                            console.log("🤝", targetId, connection);
                        }
                    }
                }
            });

            peer.on("connect", () => {
                peer.send(
                    JSON.stringify({
                        type: "ping",
                        origin: this.id,
                        message: `[ping] from ${this.id}`,
                        timestamp: new Date(),
                    })
                );
                console.log("[ping] from", this.id, "(me)");
            });
        }
    };
}
