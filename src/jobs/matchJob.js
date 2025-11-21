const { queryRunner } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { getIO: getIoInstance } = require("../socket/socketController");
const SocketService = require("../socket/socketService");
const MatchStore = require("../socket/matchStore");
require("dotenv").config();

async function createNewMatch() {
  try {
    //todo make all game match init

    // 1.tiger and dragon match init
    const matchUuid1 = uuidv4();
    // const matchName1 = `DragonTiger ${new Date().toISOString().slice(11, 19)}`;
    const matchName1 = `TigerDragon`;
    // 1. create match
    const sql = `
      INSERT INTO matches (match_uuid, match_name, status, created_at)
      VALUES (?, ?, 'pending', NOW())
    `;
    await queryRunner(sql, [matchUuid1, matchName1]);

    // 2. add clans
    // Random clans
    // const clans = ["Tiger", "Dragon", "Tie"];
    // const chosen = clans.sort(() => 0.5 - Math.random()).slice(0, 2);

    // for (const clan of chosen) {
    //     await queryRunner(
    //     `INSERT INTO match_clans (match_uuid, clan_name) VALUES (?, ?)`,
    //     [matchUuid1, clan]
    //     );
    // }

    console.log(
      `🎮 Created match: ${matchName1}:${matchUuid1} with clans of TIGER TIE DRAGON`
    );

    // Initialize in-memory store
    MatchStore.initMatch(matchUuid1, matchName1, ["tiger", "dragon", "tie"]);

    return { matchUuid1, matchName1 };
  } catch (error) {
    console.log("error with creating match ", error.message);
  }
}

/**
 * ⚡ Start a match (sets status & start_time)
 **/

async function startMatch(matchUuid) {
  try {
    const sql = `
      UPDATE matches
      SET status = 'ongoing', start_time = NOW()
      WHERE match_uuid = ?
    `;
    await queryRunner(sql, [matchUuid]);
    console.log(`✅ Match started: ${matchUuid}`);
  } catch (error) {
    console.log("error on start match", error.message);
  }
}

/**
 * 🏁 End a match (sets status & end_time)
 **/
 
// ! newlly added lowest winx return
async function endMatch(matchUuid, matchName) {
  try {
    console.log(`🏁 Ending match: ${matchUuid} (${matchName})`);

    const matchData = {
      TigerDragon: {
        clanData: {
          clanNames: ["tiger", "dragon", "tie"],
          tiger: { winx: "2" },
          dragon: { winx: "2" },
          tie: { winx: "9" },
          lowestWinx: "tiger",
          highestWinx: "tie",
        },
      },
      TeenPati: {},
    };

    const matchConfig = matchData[matchName];
    if (!matchConfig) {
      console.log("❌ Match config not found");
      return null;
    }

    const { clanData } = matchConfig;

    // 1️⃣ Fetch total bets per clan
    const rows = await queryRunner(
      `SELECT clan_name, SUM(bet_amount) AS total
       FROM bets
       WHERE match_uuid = ?
       GROUP BY clan_name`,
      [matchUuid]
    );
    if (!rows.length) {
      console.log("❌ No bets placed. Selecting random winner...");

      const clans = clanData.clanNames; // ["tiger", "dragon", "tie"]
      const winnerClan = clans[Math.floor(Math.random() * clans.length)];

      console.log(`🎯 Random winner selected: ${winnerClan}`);

      await queryRunner(
        `UPDATE matches
     SET status='completed', end_time=NOW(), winner_clan=?
     WHERE match_uuid=?`,
        [winnerClan, matchUuid]
      );

      const io = getIoInstance();
      await SocketService.emitLast10History(io, matchName);

      return winnerClan;
    }

    // Compute score = total × winx
    const results = rows.map((r) => {
      const clan = r.clan_name;
      const total = Number(r.total);
      const winx = Number(clanData[clan]?.winx || 0);
      return { clan_name: clan, total, winx, score: total * winx };
    });

    console.log("📊 Results:", results);

    // 3️⃣ Find the lowest score
    const minScore = Math.min(...results.map((r) => r.score));
    let potentialWinners = results.filter((r) => r.score === minScore);

    // 4️⃣ If tie by score, choose those with lowest winx
    if (potentialWinners.length > 1) {
      const minWinx = Math.min(...potentialWinners.map((r) => r.winx));
      potentialWinners = potentialWinners.filter((r) => r.winx === minWinx);
    }

    // 5️⃣ If all still tied (same score + same winx)
    if (
      potentialWinners.length > 1 &&
      potentialWinners.every((w) => w.winx === potentialWinners[0].winx)
    ) {
      console.log(
        "⚖️ All clans completely tied. Eliminating highest winx clan."
      );

      // Find the highest winx overall
      const maxWinx = Math.max(...results.map((r) => r.winx));

      // Remove the highest winx clan(s)
      const remainingClans = results.filter((r) => r.winx !== maxWinx);

      if (remainingClans.length > 0) {
        const minRemainingWinx = Math.min(...remainingClans.map((r) => r.winx));
        const finalCandidates = remainingClans.filter(
          (r) => r.winx === minRemainingWinx
        );

        // Random pick from lowest remaining winx clans
        const randomIndex = Math.floor(Math.random() * finalCandidates.length);
        potentialWinners = [finalCandidates[randomIndex]];

        console.log(
          `🎯 All tied → eliminated highest winx (${maxWinx}) → selected from remaining lowest winx: ${potentialWinners[0].clan_name}`
        );
      }
    }

    // 6️⃣ Final winner (if still tie, random fallback)
    let winnerClan;
    if (potentialWinners.length > 1) {
      const randomIndex = Math.floor(Math.random() * potentialWinners.length);
      winnerClan = potentialWinners[randomIndex].clan_name;
      console.log(`🎲 Random pick among remaining: ${winnerClan}`);
    } else {
      winnerClan = potentialWinners[0].clan_name;
      console.log(`🏆 Final Winner: ${winnerClan}`);
    }

    // 7️⃣ Update DB
    await queryRunner(
      `UPDATE matches
       SET status='completed', end_time=NOW(), winner_clan=?
       WHERE match_uuid=?`,
      [winnerClan, matchUuid]
    );

    console.log(`✅ Match ${matchUuid} completed. Winner: ${winnerClan}`);
    
    // Cleanup memory
    MatchStore.removeMatch(matchUuid);

    const io = getIoInstance();
    await SocketService.emitLast10History(io, matchName);
    return winnerClan;
  } catch (err) {
    console.error("❌ Error in endMatch:", err.message);
    return null;
  }
}

async function runSingleMatchCycle() {
  const io = getIoInstance();

  return new Promise(async (resolve) => {
    // 🆕 Start a new match
    const { matchUuid1, matchName1: matchName } = await createNewMatch();
    await startMatch(matchUuid1);
    const roomId = matchUuid1;

    // ENV configs
    const FULL_MATCH_TIME = Number(process.env.MATCH_FULL_TIME || 60); 
    const BET_COUNTDOWN = Number(process.env.MATCH_BET_COUNTDOWN || 40); 
    const TICK_INTERVAL = Number(process.env.COUNTDOWN_INTERVAL || 1000);

    if (!FULL_MATCH_TIME || !BET_COUNTDOWN)
      throw new Error("MATCH_FULL_TIME or MATCH_BET_COUNTDOWN missing");

    let remaining = FULL_MATCH_TIME;
    let betRemaining = BET_COUNTDOWN;

    let winnerClan = null;
    let winnerCalculated = false;

    // 🔵 Announce match start
    io.to("TigerDragon").emit("matchStatus", {
      matchUuid1,
      status: "match_started",
      fullTime: FULL_MATCH_TIME,
      betTime: BET_COUNTDOWN,
    });

    // 🔥 MAIN MATCH TIMER
    const interval = setInterval(async () => {
      // Emit full timer tick
      const currentTotals = MatchStore.getMatchTotals(matchUuid1) || {
        real: { tiger: 0, dragon: 0, tie: 0 },
        dummy: { tiger: 0, dragon: 0, tie: 0 },
      };
      const usersCount = MatchStore.getUsersCount(matchUuid1);

      io.to("TigerDragon").emit("matchTimerTick", {
        matchUuid1,
        remaining,
        betRemaining: betRemaining > 0 ? betRemaining : 0,
        totalBet: {
          real: currentTotals.real,
          dummy: currentTotals.dummy,
        },
        usersCount,
      });

      // ----------------------------------
      // 🟡 BET COUNTDOWN
      // ----------------------------------
      if (betRemaining > 0) {
        betRemaining--;

        if (betRemaining === 0) {
          io.to("TigerDragon").emit("matchStatus", {
            matchUuid1,
            status: "bet_closed",
          });

          io.to("TigerDragon").emit("matchStatus", {
            matchUuid1,
            status: "calculating",
          });

          
        }
      }

      // ----------------------------------
      // 🔴 MATCH ENDS
      // ----------------------------------
      // Calculate winner ONCE
      if(remaining ===10){
        winnerClan = await endMatch(matchUuid1, matchName);
        winnerCalculated = true;
      }
      
      if (remaining <= 0) {
        clearInterval(interval);

        io.to("TigerDragon").emit("matchStatus", {
          matchUuid1,
          status: "ended",
          winner: winnerClan,
        });

        return resolve(winnerClan); // <-- FIXED
      }

      remaining--;
    }, TICK_INTERVAL);
  });
}


/**
 * 🔁 Job function that runs when app starts
 * Creates → starts → ends a match (demo flow)
 **/

async function startMatchScheduler() {
  console.log("🕒 Match scheduler started...");

  const GAP_BETWEEN_MATCHES = Number(process.env.MATCH_GAP || 5); // seconds

  async function loop() {
    console.log("🚀 Starting new match cycle...");
    await runSingleMatchCycle();  // wait fully
    console.log("🏁 Match finished. Waiting for next cycle...");
    await new Promise(res => setTimeout(res, GAP_BETWEEN_MATCHES * 1000));
    loop(); // repeat
  }

  loop();
}

module.exports = {
  startMatchScheduler,
  createNewMatch,
  startMatch,
  endMatch,
};
