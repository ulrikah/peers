import Peer, { SignalData } from "simple-peer";
import Message from "../common/message";

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

    connectToSocket = (socketUrl: string) => {
        const socket = new window.WebSocket(socketUrl);
        socket.addEventListener("message", this.onMessage);
        return socket;
    };

    onMessage = (event: MessageEvent) => {
        const message: Message = JSON.parse(event.data);

        if (message.type == "id") {
            // TO DO: put the ID somewhere in the GUI
            console.log("Assigned ID", message.id);
            this.id = message.id;
            document.querySelector(".username").innerHTML = this.id;
            document.title = `Peers | ${this.id}`;
        }

        if (message.type == "webrtc-connection-signal") {
            try {
                this.connections
                    .get(message.origin)
                    .peer.signal(message.signal);
            } catch (error) {
                console.error("ERROR message didn't contain signal", error);
                console.error("Message", message);
            }
        }

        if (message.type == "ready") {
            const origin = message.id;
            const target = message.target;
            const initiator = message.initiator;

            if (this.connections.has(target)) {
                console.log("Peer already has connection to target");
                console.log("origin:", origin, "target:", target);
                return;
            }
            // create new connection if there doesn't already exists one
            console.log(
                origin,
                "I'm ready to connect to",
                target,
                "as the",
                initiator ? "initiator 🌱 " : "receiver 🍄"
            );
            const peer = new Peer({ initiator: initiator });
            this.connections.set(target, {
                peer: peer,
                connectedAt: undefined,
                connected: false,
            });
            peer.on("signal", (signal: SignalData) => {
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
                    /*
                        in the case where an established connection is extended with
                        more signal data, i.e. with an additional stream channel, 
                        then we don't want it to be treated as a new connection
                    */
                    if (this.connections.get(peerMessage.origin).connected)
                        return;

                    console.log(`[connected] to ${peerMessage.origin}`);
                    this.connections.get(peerMessage.origin).connected = true;
                    this.connections.get(peerMessage.origin).connectedAt =
                        peerMessage.timestamp;

                    console.log("New connection. List of connected peers:");
                    for (let [
                        targetId,
                        connection,
                    ] of this.connections.entries()) {
                        if (connection.connected) {
                            console.log("🤝", targetId, connection);
                        }
                    }

                    navigator.mediaDevices
                        .getUserMedia({
                            video: true,
                            audio: true,
                        })
                        .then((stream: MediaStream) => {
                            this.connections.forEach((connection, id) => {
                                if (connection.connected) {
                                    connection.peer.addStream(stream);
                                }
                            });
                        })
                        .catch((error) => {
                            console.log("Error fetching media stream");
                            console.error(error);
                        });
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

            peer.on("stream", (stream: MediaStream) => {
                console.log("🌀 Received stream from", target);
                const existingStream = document.querySelector(`#${target}`);
                if (!existingStream) {
                    const videoWrapper = document.createElement("div");
                    videoWrapper.id = target;
                    videoWrapper.className = "videoWrapper";
                    const video = document.createElement("video");
                    video.controls = true;
                    video.srcObject = stream;
                    video.muted = true;
                    video.play();
                    videoWrapper.appendChild(video);
                    const p = document.createElement("p");
                    p.innerText = target;
                    videoWrapper.appendChild(p);
                    document
                        .querySelector(".videoContainer")
                        .appendChild(videoWrapper);
                }
            });
        }

        if (message.type == "close") {
            console.log("Receiving closing message");
            if (message.origin !== this.id) {
                console.log("¯_(ツ)_/¯");
            }
            console.log("Destroying connection to", message.target);
            this.connections.get(message.target).peer.destroy();
            this.connections.delete(message.target);
            console.log(
                "Remaining connections",
                Array.from(this.connections.keys())
            );
            document.querySelector(`#${message.target}`).remove();
        }
    };
}
