

function onConnection(socket, io) {
    const user = socket.request._query;
    console.log("user: " + Object.keys(user));
}




module.exports = onConnection;