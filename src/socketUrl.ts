let SOCKET_URL: string;
if (location.protocol === "https:") {
    SOCKET_URL = `wss://${location.hostname}:${location.port}`;
} else {
    SOCKET_URL = `ws://${location.hostname}:${location.port}`;
}

// dev mode
if (location.port === "4321") {
    SOCKET_URL = `ws://${location.hostname}:1234`;
}

export default SOCKET_URL;
