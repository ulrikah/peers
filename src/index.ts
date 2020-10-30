import "./style.css";
import Peer = require("simple-peer");

let WS_URI: string;
if (location.protocol === "https:") {
    WS_URI = `wss://${location.hostname}:${location.port}`;
} else {
    WS_URI = `ws://${location.hostname}:${location.port}`;
}
console.log("Attempting to get web socket server at", WS_URI);

let socket: WebSocket;
let peer: Peer.Instance;
let video = document.createElement("video");
video.controls = true;
let logger = document.createElement("p");
let button = document.createElement("button");
button.innerText = "PING";
const isInitiator = location.hash == "#sender";

const component = () => {
    const element = document.createElement("div");
    const heading = document.createElement("h1");

    heading.textContent = `${isInitiator ? "INITIATOR 🌀" : "RECEIVER 🐚"}`;

    element.appendChild(heading);
    element.appendChild(video);
    element.appendChild(button);
    element.appendChild(logger);

    return element;
};

const onMessage = (event: MessageEvent) => {
    console.log("Received message");
    console.log(event);
    const message = event.data;
    logger.textContent = message;
    if (message.includes("ready")) {
        // get video/voice stream
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream: MediaStream) => {
                if (peer) return;
                peer = new Peer({
                    initiator: message.includes("initiator") ? true : false,
                    stream: stream,
                });

                peer.on("signal", (signal) => {
                    socket.send(JSON.stringify(signal));
                });
                peer.on("data", (msg) => {
                    if (msg && msg.toString()) {
                        if (msg.toString().startsWith("[text]")) {
                            console.log(msg.toString());
                        }
                        if (msg.toString().startsWith("[ping]")) {
                            peer.send("[pong]");
                            console.log(msg.toString());
                        }
                        if (msg.toString().startsWith("[pong]")) {
                            peer.send("[ping]");
                            console.log(msg.toString());
                        }
                    }
                });

                peer.on("stream", (stream) => {
                    const video = document.querySelector("video");
                    video.srcObject = stream;

                    video.play();
                });

                peer.on("connect", () => {
                    console.log("CONNECTED");
                    button.addEventListener("click", () => {
                        console.log("PINGING");
                        peer.send("[ping]");
                    });
                    peer.send("[text] hi this is receiver");
                });
            })
            .catch((error) => {
                console.log("Error fetching media stream");
                console.error(error);
            });
    } else {
        peer.signal(JSON.parse(message));
    }
};

const connectToSocket = (socketUrl: string) => {
    socket = new window.WebSocket(WS_URI);
    socket.addEventListener("message", onMessage);

    socket.onopen = (event: Event) => {
        socket.send(`[ping] from ${isInitiator ? "INITIATOR" : "RECEIVER"}`);
    };
};

document.body.appendChild(component());

connectToSocket(WS_URI);
