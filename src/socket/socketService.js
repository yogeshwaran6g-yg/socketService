const {queryRunner} =require("../config/db")


module.exports = socketService = {

  joinRoom:async function (socket, io, { playerId, username, roomName}) {
    try {
      if (!roomName || !playerId || !username) {
        return socket.emit("error", {
          message: "roomName and playerId required",
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
      io.to(`${roomName}`).emit("playerJoinedRoom", {
        playerId,
        username,
        message: `${username || "A player"} joined ${roomName}`,
      });
    } catch (err) {
      console.error("❌ Error in joinRoom:", err.message);
      socket.emit("error", { message: "Failed to join room." });
    }
    },

  placeBet: async (socket, io, data) => {
  const { match_uuid, player_id, username, clan_name, bet_amount } = data;

  if (!match_uuid || !player_id || !username || !clan_name || !bet_amount ) {
    return socket.emit("error", { message: "Invalid bet data" });
  }

  try {
    // 💰 1️⃣ Insert bet record

    // Check match status before accepting bets
    const matchStatus = await queryRunner(
      `SELECT status FROM matches WHERE match_uuid = ?`,
      [match_uuid]
    );

    if (!matchStatus.length || matchStatus[0].status !== 'pending') {
      return socket.emit("error", { message: "Bets can only be placed on pending matches." });
    }
    await queryRunner(
      `INSERT INTO bets (match_uuid, player_id, username, clan_name, bet_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [match_uuid, player_id, username, clan_name, bet_amount]
    );

    console.log(`💰 ${username} bet ${bet_amount} on ${clan_name}`);

    // ✅ 2️⃣ Acknowledge bet placed to this socket
    io.to("TigerDragon").emit("betPlaced", {
      success: true,
      message: `You bet ${bet_amount} on ${clan_name}`,
    });

    // 📊 3️⃣ Calculate total bet per clan for this match
    const totalBets = await queryRunner(
      `SELECT clan_name, SUM(bet_amount) AS total_amount 
       FROM bets 
       WHERE match_uuid = ? 
       and player_id = ?
       GROUP BY clan_name`,
      [player_id, match_uuid]
    );

    // 🧠 Transform into a clean object
    const betSummary = {};
    totalBets.forEach(row => {
      betSummary[row.clan_name] = row.total_amount;
    });

    // 🚀 4️⃣ Emit total bet summary to everyone in that match room
    io.to("TigerDragon").emit("PlayerTotalBetUpdate", {
      match_uuid,
      totals: betSummary
    });

    console.log(`📢 Updated total bets for ${match_uuid}:`, betSummary);

  } catch (err) {
    console.error(err);
    socket.emit("error", { message: "Failed to place bet" });
  }
  },

  emitLast10History:async function(io, roomName) {
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


winnerDeclare:async function name(params) {

try {
    
} catch (error) {
  
}
}
    

};

