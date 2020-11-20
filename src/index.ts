import "./style.css";
// import Peer from "simple-peer";
import Participant from "./participant";
import SOCKET_URL from "./socketUrl";

console.log("Attempting to get web socket server at", SOCKET_URL);

let socket: WebSocket;
// let peer: Peer.Instance;
let userId: string;

const renderUI = () => {
    const pingButton = document.createElement("button");
    pingButton.className = "ping-button";
    pingButton.innerText = "PING";

    const destroyButton = document.createElement("button");
    destroyButton.className = "destroy-button";
    destroyButton.innerText = "Disconnect";

    const videoContainer = document.createElement("div");
    videoContainer.className = "videoContainer";
    const heading = document.createElement("h1");
    const username = document.createElement("h2");
    username.className = "username";

    heading.textContent = "PEER 🐚";

    videoContainer.appendChild(heading);
    videoContainer.appendChild(username);
    videoContainer.appendChild(pingButton);
    videoContainer.appendChild(destroyButton);

    document.body.appendChild(videoContainer);

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

// const onMessage = (event: MessageEvent) => {
//     const message = event.data;
//     log(message);

//     if (message.includes("[ID]")) {
//         const id = message.split(" ")[1];
//         console.log("Received ID", id);
//         userId = id;
//         document.querySelector(".username").textContent = id;
//     }

//     if (message.includes("ready")) {
//         peer = new Peer({
//             initiator: message.includes("initiator") ? true : false,
//         });
//         peer.on("signal", (signal: Peer.SignalData) => {
//             socket.send(JSON.stringify(signal));
//         });
//         peer.on("data", (msg) => {
//             if (msg && msg.toString()) {
//                 if (msg.toString().startsWith("[text]")) {
//                     log(msg.toString());
//                 }
//                 if (msg.toString().startsWith("[ping]")) {
//                     peer.send("[pong]");
//                     log(msg.toString());
//                 }
//                 if (msg.toString().startsWith("[pong]")) {
//                     log(msg.toString());
//                 }
//             }
//         });

//         peer.on("stream", (stream: MediaStream) => {
//             log("🌀 Received stream");
//             const videoContainer = document.querySelector(".videoContainer");
//             const video = document.createElement("video");
//             video.controls = true;
//             videoContainer.appendChild(video);

//             if (message.includes("initiator")) {
//                 video.className = "mirrored-video";
//             }
//             video.srcObject = stream;

//             video.play();
//         });

//         peer.on("connect", () => {
//             const destroyButton = document.querySelector(".destroy-button");
//             const pingButton = document.querySelector(".ping-button");

//             const ping = () => peer.send("[ping]");
//             pingButton.addEventListener("click", ping);

//             destroyButton.addEventListener("click", () => {
//                 log("💀 Destroying peer connection");
//                 peer.destroy();
//                 pingButton.removeEventListener("click", ping);
//             });
//             peer.send(`[text] hi this is peer ${userId}`);
//         });

//         peer.on("close", () => {
//             log("Peer connection closed. Destroying connection 💀");
//             peer.destroy();
//         });

//         // get video/voice stream
//         navigator.mediaDevices
//             .getUserMedia({
//                 video: true,
//                 audio: true,
//             })
//             .then((stream: MediaStream) => {
//                 peer.addStream(stream);
//             })
//             .catch((error) => {
//                 console.log("Error fetching media stream");
//                 console.error(error);
//             });
//     } else {
//         if (peer && peer.signal) {
//             peer.signal(JSON.parse(message));
//         }
//     }
// };

// const connectToSocket = (socketUrl: string) => {
//     socket = new window.WebSocket(socketUrl);
//     socket.addEventListener("message", onMessage);

//     socket.onopen = (event: Event) => {
//         socket.send(`[ping] from peer ${userId}`);
//     };
// };

renderUI();

// connectToSocket(SOCKET_URL);
const participant = new Participant(SOCKET_URL);
