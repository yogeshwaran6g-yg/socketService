const { queryRunner } = require("../config/db.js");

module.exports = {
  //api functions
  fetchGames: async (req, res) => {
    try {
      const rows = await queryRunner("SELECT DISTINCT game_name FROM game_clans");
      res.json(rows.map((row) => row.game_name));
    } catch (error) {
      console.error("Error loading games:", error);
      res.status(500).json({ success: false, message: "Failed to load games" });
    }
  },

  fetchFixedWinners: async (req, res) => {
    try {
      const rows = await queryRunner("SELECT * FROM fixed_winners_settings");
      res.json(rows);
    } catch (error) {
      console.error("Error loading fixed winners:", error);
      res.status(500).json({ success: false, message: "Failed to load fixed winners" });
    }
  },

  updateFixedWinner: async (req, res) => {
    const { id, game_name, fixed_clan, enabled, total_match, completed_match } = req.body;
    try {
      // Check if exists
      const existing = await queryRunner("SELECT id FROM fixed_winners_settings WHERE game_name = ?", [game_name]);
      
      if (existing.length > 0) {
        await queryRunner(
          "UPDATE fixed_winners_settings SET fixed_clan=?, enabled=?, total_match=?, completed_match=? WHERE game_name=?",
          [fixed_clan, enabled, total_match, completed_match, game_name]
        );
      } else {
        await queryRunner(
          "INSERT INTO fixed_winners_settings (game_name, fixed_clan, enabled, total_match, completed_match) VALUES (?, ?, ?, ?, ?)",
          [game_name, fixed_clan, enabled, total_match, completed_match]
        );
      }
      res.json({ success: true, message: "Settings saved" });
    } catch (error) {
      console.error("Error updating fixed winner:", error);
      res.status(500).json({ success: false, message: "Failed to update settings" });
    }
  },

  toggleFixedWinner: async (req, res) => {
    const { game_name, enabled } = req.body;
    try {
       await queryRunner(
          "UPDATE fixed_winners_settings SET enabled=? WHERE game_name=?",
          [enabled, game_name]
        );
      res.json({ success: true, message: "Settings updated" });
    } catch (error) {
      console.error("Error toggling fixed winner:", error);
      res.status(500).json({ success: false, message: "Failed to toggle settings" });
    }
  },


//helpers
  updateCompleMatchForFixedWinner: async (game_name, completed_match, total_match) => {
    try {        
        const next_completed_match = completed_match + 1;
        
        if (next_completed_match >= total_match) {
            
            console.log("matches completed for fixed winners. RESETTING GAME.");            
            await queryRunner(
                "UPDATE fixed_winners_settings SET completed_match = 0, enabled = 0 WHERE game_name = ?",
                [game_name]
            );
        }
        else {            
            await queryRunner(                
                "UPDATE fixed_winners_settings SET completed_match=? WHERE game_name=?",
                [next_completed_match, game_name]
            ); 
        }

    } catch (error) {
        console.error("Error updating completed match for fixed winner:", error);
        throw error;
    }
  },
  isFixedWinner: async function(gameName) {
    try {
      const rows = await queryRunner(
        "SELECT * FROM fixed_winners_settings WHERE game_name = ?",
        [gameName]
      );
    
    if(rows.length>0){
      let isEnabled = rows[0].enabled === 1 ? true :rows[0].enabled === true ? true : false 
      if(isEnabled){
        return {
          isEnabled ,
          winnerClan : rows[0].fixed_clan,
          totalMatch : rows[0].total_match,
          completedMatch : rows[0].completed_match
        }
      }
    }
    return {
      isEnabled : false,
      winnerClan : null,
      totalMatch : null,
      completedMatch : null
    };
        
    } catch (error) {
      console.error("Error updating completed match for fixed winner:", error);
      throw error;
    }
  },


};