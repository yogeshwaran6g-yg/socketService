const { queryRunner } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const matchStore = require("../store/matchStore");
require("dotenv").config();

module.exports = {
  //match job helpers
  //match init
  insertMatch: async function (matchUuid1, matchName1) {
    try {
      const sql = `
                  INSERT INTO matches (match_uuid, match_name, status, created_at)
                  VALUES (?, ?, 'pending', NOW())`;

      await queryRunner(sql, [matchUuid1, matchName1]);
      console.log(
        `🎮 Created match: ${matchName1}:${matchUuid1} with clans of TIGER TIE DRAGON`
      );
    } catch (err) {
      console.log("err from inert match", err.message);
      throw err;
    }
  },

  //update match status //ongoing completed ....
  updateMatchStatus: async function (matchUuid, status, data = {}) {
    try {
      // 1. Update DB

      if (status === "ongoing") {
        let sql = `
                UPDATE matches
                SET status = 'ongoing', start_time = NOW()
                WHERE match_uuid = ?
                `;
        await queryRunner(sql, [matchUuid]);
      } else if (status === "completed") {
        await queryRunner(
          `UPDATE matches
               SET status='completed', end_time=NOW(), winner_clan=?
               WHERE match_uuid=?`,
          [data.winnerClan, matchUuid]
        );
      }

      console.log(`✅ Match ${status}: ${matchUuid}`);
    } catch (err) {
      console.log("err from updateMatchStatus", err.message);
      throw err;
    }
  },

  //get match bets to calculate winner
  getMatchBets: async function (matchUuid) {
    try {
      const rows = await queryRunner(
        `SELECT clan_name, SUM(bet_amount) AS total
                   FROM bets
                   WHERE match_uuid = ?
                   GROUP BY clan_name`,
        [matchUuid]
      );
      return rows;
    } catch (err) {
      console.log("errfrom getting match bets", err.message);
      throw err;
    }
  },

  addBet: async function (
    match_uuid,
    player_id,
    username,
    clan_name,
    bet_amount
  ) {
    try {
      if (!match_uuid || !player_id || !username || !clan_name || !bet_amount) {
        return false;
      }
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

      return true;
    } catch (err) {
      console.log("error from addBet", err.message);
      throw err;
    }
  },

  getWinnerHistroy :async function (roomName){
    let historyRows = []
    try{  
       historyRows = await queryRunner(
        `SELECT winner_clan, match_uuid, end_time
       FROM matches
       WHERE match_name = ? AND status = 'completed' AND winner_clan IS NOT NULL
       ORDER BY end_time DESC
       LIMIT 10`,
        [roomName]
      );

      return historyRows;
    }catch(err){
      console.log("error from get histroy ", err.messaeg);
      return historyRows;
    }
  },

  sendMatchDataToExternalService: async function (matchUuid) {
    try {
        
      const response = await fetch(`${process.env.EXTERNAL_API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify(matchStore.matches[matchUuid]),
      });

      const result = await response.json();
      console.log(result)
    } catch (error) {
      console.error("POST fetch error:", error);

    //   res.status(500).json({ error: "Request failed" });
    }
  },
};
