import "./style.css";
import Peer = require("simple-peer");

let WS_URI: string;
if (location.protocol === "https:") {
    WS_URI = `wss://${location.hostname}:${location.port}`;
} else {
    WS_URI = `ws://${location.hostname}:${location.port}`;
}

// dev mode
if (location.port === "4321") {
    WS_URI = `ws://${location.hostname}:1234`;
}
console.log("Attempting to get web socket server at", WS_URI);

let socket: WebSocket;
let peer: Peer.Instance;
let button = document.createElement("button");
button.innerText = "STREAM";
const isInitiator = location.hash == "#sender";

const renderUI = () => {
    const element = document.createElement("div");
    const heading = document.createElement("h1");
    const username = document.createElement("h2");
    const video = document.createElement("video");

    video.controls = true;

    heading.textContent = `${isInitiator ? "INITIATOR 🌀" : "RECEIVER 🐚"}`;
    username.textContent = "USER: "+Math.random().toString(16).substr(2, 4);

    element.appendChild(heading);
    element.appendChild(username);
    element.appendChild(video);
    element.appendChild(button);

    document.body.appendChild(element);

    const loggerContainer = document.createElement("div");
    loggerContainer.className = "logger";
    document.body.appendChild(loggerContainer);

    return;
};

const log = (message: string) => {
    const loggerContainer = document.querySelector(".logger");

    const logEntry = document.createElement("div");
    const timestamp = document.createElement("span");
    timestamp.textContent = new Date().toTimeString().split(" ")[0];
    timestamp.className = "timestamp";
    logEntry.className = "logMessage";

    const speechBubble = document.createElement("span");
    speechBubble.innerText = "💬 ";
    const logMsg = document.createElement("span");
    logMsg.innerText = ` ${message}`;
    logEntry.appendChild(speechBubble);
    logEntry.appendChild(timestamp);
    logEntry.appendChild(logMsg);

    loggerContainer.appendChild(logEntry);
};

const onMessage = (event: MessageEvent) => {
    const message = event.data;
    log(message);
    console.log("Received message", message);
    if (message.includes("ready")) {
        if (peer) return;
        peer = new Peer({
            initiator: message.includes("initiator") ? true : false,
        });
        peer.on("signal", (signal: Peer.SignalData) => {
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
                if (msg.toString().startsWith("[stream]")) {
                    peer.send("[ping]");
                    console.log(msg.toString());
                }
            }
        });

        peer.on("stream", (stream) => {
            console.log("Received stream");
            const video = document.querySelector("video");

            if (message.includes("initiator")) {
                video.className = "mirrored-video";
            }
            video.srcObject = stream;

            video.play();
        });

        peer.on("connect", () => {
            button.addEventListener("click", () => {
                peer.send("[stream]");
            });
            peer.send("[text] hi this is receiver");
        });
        // get video/voice stream
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream: MediaStream) => {
                peer.addStream(stream);
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
    socket = new window.WebSocket(socketUrl);
    socket.addEventListener("message", onMessage);

    socket.onopen = (event: Event) => {
        socket.send(`[ping] from ${isInitiator ? "INITIATOR" : "RECEIVER"}`);
    };
};

renderUI();

connectToSocket(WS_URI);
