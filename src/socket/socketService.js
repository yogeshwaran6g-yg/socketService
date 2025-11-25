const { queryRunner } = require("../config/db");
const MatchStore = require("./matchStore");



  async function isMatchOngoing(match_uuid) {
    const rows = await queryRunner(
      `SELECT status FROM matches WHERE match_uuid = ?`,
      [match_uuid]
    );

    return rows.length && rows[0].status === "ongoing";
  }

  async function validatePlaceBet(data) {
    const required = ["match_uuid", "player_id", "username", "clan_name", "bet_amount"];

    for (const field of required) {
      if (!data[field]) {
        return { valid: false, message: `Missing field: ${field}` };
      }
    }
    return { valid: true };
  }

  async function inserPlayer({match_uuid, player_id, username, clan_name, bet_amount}){
    
    try{
    await queryRunner(
        `INSERT INTO bets (
          match_uuid,
          player_id, 
          username, 
          clan_name, 
          bet_amount)
       VALUES (?, ?, ?, ?, ?)`,
        [match_uuid, player_id, username, clan_name, bet_amount]
      );

      console.log(`💰 ${username} bet ${bet_amount} on ${clan_name}`);
      const matchStoreResult = MatchStore.addBet(             //add to match store with clans wise 
                                                match_uuid,
                                                player_id, 
                                                username, 
                                                clan_name, 
                                                bet_amount, 
                                                false);
      if(!matchStoreResult){
        return false;
      }
      return true;      
    }catch(err){
      console.log('Error inserting player bet:', err.message);
      throw err;
    }
  }



module.exports = socketService = {
  
  joinRoom: async function (socket, io, { playerId, username, roomName }) {
    try {

      const roomNames = ["TigerDragon", "AndarBahar", "7Up7Down", "JhandiMunda", "CarRoulette"];
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

      // Notify all players in that room
      // io.to(`${roomName}`).emit("playerJoinedRoom", { //removed because the client does not need it
      //   playerId,
      //   username,
      //   message: `${username || "A player"} joined ${roomName}`,
      // });      
    } catch (err) {
      console.error("❌ Error in joinRoom:", err.message);
      socket.emit(
          "error", {
             message: "Failed to join room." 
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
      // 💰 1️⃣ Insert bet record
      //1. Check match status before accepting bets
      const ongoing = await isMatchOngoing(match_uuid);
      if (!ongoing) {
        return socket.emit("error", { 
                  success: false, 
                  message: "Bets are closed for this match." });
      }

      //2. Insert bet into database and update MatchStore
      const insertResult = await inserPlayer({
                                            match_uuid, 
                                            player_id, 
                                            username, 
                                            clan_name, 
                                            bet_amount});
      if(!insertResult){
        return socket.emit("error", {
          success: false,
          message: "Failed to place bet in match store." });
      }
      
      // 3. Acknowledge bet placed to this socket
      socket.emit("betPlaced", {
        success: true,
        message: `You bet ${bet_amount} on ${clan_name}`,
      });

      // 📊 3️⃣ Update In-Memory Store
      //get player total
      const playerTotalBet = MatchStore.getPlayerTotalBet(match_uuid, player_id);

      if (playerTotalBet !== undefined) {
        socket.emit("PlayerTotalBetUpdate", {
          match_uuid,
          player_id,
          totalBet: playerTotalBet,
        });

        console.log(`📢 Updated total bet for player ${username} in ${match_uuid}: ${playerTotalBet}`);
      }
      
    } catch (err) {
      console.error(err);
      socket.emit("error", { message: err.message || "Failed to place bet" });
    }
  },  




  emitLast10History: async function (io, roomName) {
    try {
      // 1️⃣ Get last 10 completed matches for that game type
      const historyRows = await queryRunner(
        `SELECT winner_clan, match_uuid, end_time
       FROM matches
       WHERE match_name = ? AND status = 'completed' AND winner_clan IS NOT NULL
       ORDER BY end_time DESC
       LIMIT 10`,
        [roomName]
      );

      // 2️⃣ If no history found, emit empty
      if (!historyRows.length) {
        io.to(roomName).emit("last10History", {
          success: true,
          message: "No completed matches yet.",
          history: [],
        });
        return;
      }

      // 3️⃣ Format the history
      const formatted = historyRows.map((row) => ({
        match_uuid: row.match_uuid,
        winner_clan: row.winner_clan,
        end_time: row.end_time,
      }));

      // 4️⃣ Emit to all users in the match room (like “TigerDragon”)
      io.to(roomName).emit("last10History", {
        success: true,
        message: "Last 10 completed match results.",
        history: formatted,
      });

      console.log(`📜 Emitted last 10 wins for ${roomName}`);
    } catch (err) {
      io.to(roomName).emit("error", {
        message: "Failed to fetch last 10 history.",
      });
      console.error("❌ Error fetching last 10 history:", err.message);
    }
  },

  winnerDeclare: async function name(params) {
    try {
    } catch (error) {}
  },


  
};
