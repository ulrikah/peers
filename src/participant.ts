import Peer, { SimplePeerData } from "simple-peer";
import debug from "debug";
import Message from "../common/message";
const log = debug("participant");

interface PeerConnection {
    origin: string;
    target: string;
    timestamp: Date;
}

export default class Participant {
    socket: WebSocket;
    connections: PeerConnection[];
    participantId: string;
    peer: Peer.Instance;
    id: string;
    constructor(socketUrl: string) {
        this.socket = this.connectToSocket(socketUrl);
        this.connections = [];
    }

    greeting = () => {
        return JSON.stringify({
            type: "greeting",
            origin: this.id,
            timestamp: new Date(),
        });
    };

    connectToPeer = (targetId: string) => {
        console.log("HELLO");
    };

    connectToSocket = (socketUrl: string) => {
        const socket = new window.WebSocket(socketUrl);
        socket.addEventListener("message", this.onMessage);
        return socket;
    };

    onMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        if (message.type == "id") {
            console.log("Assigned ID", message.id);
            this.id = message.id;
        }

        if (message.type == "webrtc-connection-signal") {
            try {
                this.peer.signal(message.signal);
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

            this.peer = new Peer({ initiator: initiator });

            this.socket.send(
                JSON.stringify({
                    type: "webrtc-connection-attempt",
                    origin: origin,
                    target: target,
                    initiator: initiator,
                    timestamp: new Date(),
                })
            );

            this.peer.on("signal", (signal) => {
                console.log("📡 received signal");
                if (
                    !this.connections.find(
                        (connection) => connection.target == target
                    )
                ) {
                    this.socket.send(
                        JSON.stringify({
                            type: "webrtc-connection-signal",
                            origin: origin,
                            target: target,
                            signal: signal,
                            timestamp: new Date(),
                        })
                    );
                } else {
                    console.log("Connection already exists");
                }
            });

            this.peer.on("data", (data: ArrayBuffer) => {
                const peerMessage: Message = JSON.parse(data.toString());
                if (
                    peerMessage.type == "greeting" &&
                    !this.connections.find(
                        (connection) => connection.target == peerMessage.origin
                    )
                ) {
                    this.connections.push({
                        origin: this.id,
                        target: peerMessage.origin,
                        timestamp: peerMessage.timestamp,
                    });
                    console.log("New connection. List of connected peers:");
                    this.peer.send(this.greeting());
                    this.connections.map((connection) =>
                        console.log("🤝", connection.target)
                    );
                }
            });

            this.peer.on("connect", (connection) => {
                this.peer.send(this.greeting());
            });
        }
    };
}
