import "./style.css";
// import Peer from "simple-peer";
import Participant from "./participant";
import SOCKET_URL from "./socketUrl";

console.log("Attempting to get web socket server at", SOCKET_URL);

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

renderUI();

const participant = new Participant(SOCKET_URL);
