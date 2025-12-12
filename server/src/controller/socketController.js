//socketController 
const { Server } = require("socket.io");
const socketService = require("../service/socketService")
let {authenticator} = require("../middleware/authenticator")

let ioInstance;


async function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: [ 
              // "http://localhost:3000",
              "*"  
            ],
      methods: ["GET", "POST"],
    },
  });
  console.log("⚙️ Socket.IO initialized");
  ioInstance.use(authenticator)
  ioInstance.on("connection", (socket) => {

    console.log(`🟢 New client connected: ${socket.id}`);
    socket.emit("connectionAcknowledged", {
      success: true,
      socketId: socket.id,
      message: "Successfully connected to server"
    });

    // 1.
    socket.on("joinRoom", async function(data){
      await socketService.joinRoom(socket, ioInstance, data);      

    });

    // 2.
    socket.on("placeBet",async function (data){
        await socketService.placeBet(socket, ioInstance, data);
    });

    // 3.
    socket.on("disconnect", () => {
        console.log(`socket ${socket.id} disconnected`);
    });


    socket.on("leftRoom",async function (data){
        await socketService.leaveRoom(socket, data)
    })

    socket.on("setFixedWinner", async function (data){
       if(!socket?.isAdmin){
           return socket.emit("setFixedWinnerResult", {
            success: false,
            message: "Unauthorized admin key"
        });       
       }

        await socketService.setFixedWinner(socket, data);
    })

    socket.on("setFixedTimedWinner", async function (data){
       if(!socket?.isAdmin){
           return socket.emit("setFixedTimedWinnerResult", {
            success: false,
            message: "Unauthorized admin key"
        });       
       }

        await socketService.setFixedTimedWinner(socket, data);
    })
    // ? old sockets 
    // 1 join room
    //   socket.on("joinMatch", (data) => {
    //   try {
    //     const { matchId, playerId, username } = data;

    //     if (!matchId || !playerId) {
    //       return socket.emit("error", { message: "matchId and playerId required" });
    //     }

    //     // Join socket room
    //     socket.join(`match:${matchId}`);
    //     console.log(`✅ Player ${username || playerId} joined match:${matchId}`);

    //     // Initialize match data in memory if not exists
    //     if (!matchData[matchId]) {
    //       matchData[matchId] = {
    //         players: [],
    //         clans: {},
    //         startTime: Date.now(),
    //       };
    //     }

    //     // Add player if not already added
    //     if (!matchData[matchId].players.includes(playerId)) {
    //       matchData[matchId].players.push(playerId);
    //     }

    //     // Notify the player
    //     socket.emit("matchJoined", {
    //       success: true,
    //       matchId,
    //       message: `Joined match room: match:${matchId}`,
    //     });

    //     // Notify all players in the match
    //     ioInstance.to(`match:${matchId}`).emit("playerJoined", {
    //       playerId,
    //       username,
    //       players: matchData[matchId].players,
    //       message: `${username || "A player"} joined match ${matchId}`,
    //     });

    //     // ✅ (Optional: save to DB later)
    //   } catch (err) {
    //     console.error("❌ Error in joinMatch:", err.message);
    //     socket.emit("error", { message: "Failed to join match." });
    //   }
    // });


    //old
    // socket.on("joinRoom", (data) => {
    //   const { roomId, username } = data;
    //   if (!roomId) return;

    //   socket.join(roomId);
    //   console.log(`👥 ${username || socket.id} joined room: ${roomId}`);

    //   // Notify others in the room
    //   socket.to(roomId).emit("userJoined", {
    //     message: `${username || "A user"} joined ${roomId}`,
    //     roomId,
    //   });
    // });
    
    // 2. leave room
    // socket.on("leaveRoom", (data) => {
    //   const { roomId, username } = data;
    //   socket.leave(roomId);
    //   console.log(`👋 ${username || socket.id} left room: ${roomId}`);
    //   socket.to(roomId).emit("userLeft", {
    //     message: `${username || "A user"} left ${roomId}`,
    //     roomId,
    //   });
    // });

    // // 3.room public message
    // socket.on("roomMessage", (data) => {
    //   const { roomId, message, username } = data;
    //   if (!roomId || !message) return;
    //   console.log(`💬 [${roomId}] ${username || "User"}: ${message}`);
    //   ioInstance.to(roomId).emit("roomMessage", {
    //     roomId,
    //     username,
    //     message,
    //   });
    // });
    


    
  });
}


function getIO() {
  if (!ioInstance) throw new Error("Socket.IO not initialized yet!");
  return ioInstance;
}

module.exports = { initSocket, getIO };
