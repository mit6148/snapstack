

function onConnection(socket, io) {
    const user = socket.request.user;
    console.log("user: " + user.name);
}




module.exports = onConnection;