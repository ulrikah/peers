import "./style.css";
import Peer from "simple-peer";

const WS_URL = "ws://localhost:8080";

let socket: WebSocket;
let peer: Peer.Instance;
let logger = document.createElement("p");
let button = document.createElement("button");
button.innerText = "PING";
const isInitiator = location.hash == "#sender";

const component = () => {
    const element = document.createElement("div");
    const heading = document.createElement("h1");

    heading.textContent = `${isInitiator ? "INITIATOR 🌀" : "RECEIVER 🐚"}`;

    element.appendChild(heading);
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
        if (peer) return;
        peer = new Peer({
            initiator: message.includes("initiator") ? true : false,
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
        peer.on("connect", () => {
            console.log("CONNECTED");
            button.addEventListener("click", () => {
                console.log("PINGING");
                peer.send("[ping]");
            });
            peer.send("[text] hi this is receiver");
        });
    } else {
        peer.signal(JSON.parse(message));
    }
};

const connectToSocket = (socketUrl: string) => {
    socket = new window.WebSocket(WS_URL);
    socket.addEventListener("message", onMessage);

    socket.onopen = (event: Event) => {
        socket.send(`[ping] from ${isInitiator ? "INITIATOR" : "RECEIVER"}`);
    };
};

document.body.appendChild(component());

connectToSocket(WS_URL);
