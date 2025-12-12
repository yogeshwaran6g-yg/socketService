const { queryRunner } = require("../config/db");
const MatchStore = require("../store/matchStore");
const matchService = require("../service/matchService");

async function isMatchOngoing(match_uuid) {
  // const rows = await queryRunner(
  //   `SELECT status FROM matches WHERE match_uuid = ?`,
  //   [match_uuid]
  // );

  // return rows.length && rows[0].status === "ongoing";
  let result = MatchStore.getMatchStatus(match_uuid);
  return result === "ongoing";
}

async function validatePlaceBet(data) {
  const required = [
    "match_uuid",
    "player_id",
    "username",
    "clan_name",
    "bet_amount",
  ];

  for (const field of required) {
    if (!data[field]) {
      return { valid: false, message: `Missing field: ${field}` };
    }
  }
  return { valid: true };
}

async function inserPlayer({
  match_uuid,
  player_id,
  username,
  clan_name,
  bet_amount,
}) {
  try {
    /* const addBetDbResult = await  matchService.addBet(match_uuid,
                                                        player_id, 
                                                        username, 
                                                        clan_name, 
                                                        bet_amount
                                                        )*/

    const matchStoreResult = MatchStore.addBet(
      //add to match store with clans wise
      match_uuid,
      player_id,
      username,
      clan_name,
      bet_amount
    );
    if (!matchStoreResult) {
      return false;
    }
    return true;
  } catch (err) {
    console.log("Error inserting player bet:", err.message);
    throw err;
  }
}

module.exports = socketService = {
  joinRoom: async function (socket, io, { playerId, username, roomName }) {
    try {
      const roomNames = [
        "TigerDragon",
        "AndarBahar",
        "7Up7Down",
        "JhandiMunda",
        "CarRoulette",
      ];
      if (!roomName || !playerId || !username) {
        return socket.emit("error", {
          message: "roomName and playerId required",
        });
      }

      if (!roomNames.includes(roomName)) {
        return socket.emit("error", {
          message: "Invalid room name",
        });
      }

      socket.join(`${roomName}`);
      console.log(`✅ Player ${username || playerId} joined room: ${roomName}`);

      // Send confirmation to the player
      socket.emit("roomJoined", {
        success: true,
        message: `player: ${playerId} Joined the ${roomName}`,
      });

      const historyRows = MatchStore.histroy[roomName];
      // 2️⃣ If no history found, emit empty
      if (!historyRows.length) {
        socket.emit("last10History", {
          success: true,
          message: "No completed matches yet.",
          history: [],
        });
        return;
      }

      //  Format the history for db
      // const formatted = historyRows.map((row) => ({
      //   match_uuid: row.match_uuid,
      //   winner_clan: row.winner_clan,
      //   end_time: row.end_time,
      // }));

      // 4️⃣ Emit to all users in the match room (like “TigerDragon”)
      socket.emit("last10History", {
        success: true,
        message: "Last 10 completed match results.",
        history: historyRows,
      });

      // Notify all players in that room
      // io.to(`${roomName}`).emit("playerJoinedRoom", { //removed because the client does not need it
      //   playerId,
      //   username,
      //   message: `${username || "A player"} joined ${roomName}`,
      // });
    } catch (err) {
      console.error("❌ Error in joinRoom:", err.message);
      socket.emit("error", {
        message: "Failed to join room.",
      });
    }
  },

  placeBet: async (socket, io, data) => {
    const { match_uuid, player_id, username, clan_name, bet_amount } = data;
    const validation = await validatePlaceBet(data); //helper to validate data

    if (!validation.valid) {
      return socket.emit("error", { message: validation.message });
    }
    try {
      // Insert bet record
      // Check match status before accepting bets
      const ongoing = await isMatchOngoing(match_uuid);
      if (!ongoing) {
        return socket.emit("error", {
          success: false,
          message: "Bets are closed for this match.",
        });
      }

      // Insert bet intto database and update MatchStore
      const insertResult = await inserPlayer({
        match_uuid,
        player_id,
        username,
        clan_name,
        bet_amount,
      });
      if (!insertResult) {
        return socket.emit("error", {
          success: false,
          message: "Failed to place bet in match store.",
        });
      }

      //  Acknowledge bet placed to this socket
      socket.emit("betPlaced", {
        success: true,
        message: `You bet ${bet_amount} on ${clan_name}`,
      });

      //Update In-Memory Store
      //get player total bet
      const playerTotalBet = MatchStore.getPlayerTotalBet(
        match_uuid,
        player_id
      );

      if (playerTotalBet !== undefined) {
        socket.emit("PlayerTotalBetUpdate", {
          match_uuid,
          player_id,
          totalBet: playerTotalBet,
        });

        console.log(
          `📢 Updated total bet for player ${username} in ${match_uuid}: ${playerTotalBet}`
        );
      }
    } catch (err) {
      console.error(err);
      socket.emit("error", { message: err.message || "Failed to place bet" });
    }
  },

  emitLast10History: async function (io, roomName) {
    try {
      // 1️ Get last 10 completed matches for that game type
      // const historyRows = await  matchService.getWinnerHistroy();

      const historyRows = MatchStore.histroy[roomName];
      // 2️⃣ If no history found, emit empty
      if (!historyRows.length) {
        io.to(roomName).emit("last10History", {
          success: true,
          message: "No completed matches yet.",
          history: [],
        });
        return;
      }

      //  Format the history for db
      // const formatted = historyRows.map((row) => ({
      //   match_uuid: row.match_uuid,
      //   winner_clan: row.winner_clan,
      //   end_time: row.end_time,
      // }));

      // 4️⃣ Emit to all users in the match room (like “TigerDragon”)
      console.log(`📜 Emitted last 10 wins for ${roomName}`);
      return io.to(roomName).emit("last10History", {
        success: true,
        message: "Last 10 completed match results.",
        history: historyRows,
      });

    } catch (err) {
      console.error("❌ Error fetching last 10 history:", err.message);
      return io.to(roomName).emit("error", {
        success: false,
        message: "Failed to fetch last 10 history.",
      });
    }
  },

  winnerDeclare: async function (params) {
    try {
    } catch (error) {}
  },

  leaveRoom: async function (socket, { roomName }) {
  try {
      const roomNames = [
        "TigerDragon",
        "AndarBahar",
        "7Up7Down",
        "JhandiMunda",
        "CarRoulette",
      ];
      if (!roomNames.includes(roomName)) {
        return socket.emit("error", {
          success: false,
          message: "Invalid room name",
        });
      }
      socket.leave(roomName);
      
      console.log(`User ${socket.id} left ${roomName}`);
      return  socket.emit("leftRoomSuccess", {
        success: true,
        message: `You left ${roomName}`,
      });
  
  } catch (error) {
    console.log("error from leave room", error.message)
    return socket.emit("error", {
        success: false,
        message: `failed to left  ${roomName}`,
      });
  }
  },

  setFixedWinner: async function (socket, { matchUuid, winnerClan }) {
    try {
      if (!matchUuid || !winnerClan) {
        return socket.emit("setFixedWinnerResult", {
          success: false,
          message: "invalid parameters",
        });
      }
      const matchStoreResult = MatchStore.setFixedWinnerForNextMatch(
        matchUuid,
        winnerClan
      );
      if (!matchStoreResult.success) {
        return socket.emit("setFixedWinnerResult", {
          success: false,
          message: "failed to set winner side fixed",
        });
      }
      return socket.emit("setFixedWinnerResult", {
        success: true,
        message: "winner side fixed successfully",
      });
    } catch (error) {
      console.log("error from setFixedWinner");
      return socket.emit("setFixedWinnerResult", {
        success: false,
        message: "failed to set winner side",
      });
    }
  },

  setFixedTimedWinner: async function (
    socket,
    { game_name , execute_at , fixed_clan }
  ) {
    console.log("data")
 
    if(!game_name || !execute_at || fixed_clan.length==0){
      return socket.emit("setFixedTimedWinnerResult", {
        success: false,
        message: "failed to set timedwinner side",
      }); 
    }    
    let totalMatch = fixed_clan.length;
    try {
      const result = MatchStore.setFixedTimedWinnerForGame(
       game_name, 
       totalMatch,
       execute_at, 
       fixed_clan
      );
      if(!result){
        return socket.emit("setFixedTimedWinnerResult", {
        success: false,
        message: "failed to set timedwinner side",
       });        
      }

      return socket.emit("setFixedTimedWinnerResult", {
        success: true,
        message: "failed to set timedwinner side",
      });
    } catch (error) {
      console.log("error from setTimedWinner SocketService", error.message);
      return socket.emit("setFixedTimedWinnerResult", {
        success: false,
        message: "failed to set timedwinner side",
      });    
    }
  },
};
