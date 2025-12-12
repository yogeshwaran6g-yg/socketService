require("dotenv").config()

module.exports={
    authenticator: function(socket, next)  {
    const key = socket.handshake.auth?.adminKey;

    const isAdmin = key === process.env.ADMIN_SECRET_KEY;

    socket.isAdmin = isAdmin; // set admin flag

    return next();
}
}