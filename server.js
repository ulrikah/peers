const ws = require("ws");
const publicIp = require("public-ip");

publicIp.v4().then((ip) => {
    console.log("Public IP adress", ip);
});

const server = new ws.Server({
    port: 1234,
});

const clients = [];

server.on("connection", (client) => {
    clients.push(client);
    client.on("message", (msg) => {
        console.log("[server]", "received a message", "\n", msg);
        clients
            .filter((s) => s !== client)
            .forEach((client) => client.send(msg));
    });
    client.on("close", () => {
        clients.splice(clients.indexOf(client), 1);
        console.log("client connection closed");
        console.log("current client count", clients.length);
    });

    console.log("received client connection");
    console.log("current client count", clients.length);

    // time to connect the two peers :~)
    if (clients.length === 2) {
        clients.forEach((client, idx) =>
            client.send(`ready ${idx === 0 ? "initiator" : ""}`)
        );
    }

    setInterval(() => {
        clients.forEach((client) => {
            client.send(new Date().toTimeString());
        });
    }, 1000);
});
