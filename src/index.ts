import "./style.css";
import Participant from "./participant";
import SOCKET_URL from "./socketUrl";

console.log("Attempting to get web socket server at", SOCKET_URL);

const renderUI = () => {
    const videoContainer = document.createElement("div");
    videoContainer.className = "videoContainer";
    const heading = document.createElement("h1");
    const username = document.createElement("h2");
    username.className = "username";

    heading.textContent = "PEER 🐚";

    document.body.appendChild(heading);
    document.body.appendChild(username);
    document.body.appendChild(videoContainer);

    return;
};

renderUI();

const participant = new Participant(SOCKET_URL);
