const { queryRunner } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { getIO: getIoInstance } = require("../controller/socketController");
const SocketService = require("../service/socketService");
const MatchStore = require("../store/matchStore");
const { gameWinx } = require("../config/index");
require("dotenv").config();

const settingsController = require("../controller/settingsController")
const matchJobService = require("../service/matchService");

// Winner Calculator Helper
function calculateWinner(rows, clanData) {
  // Compute score = total × winx
  const results = rows.map((r) => {
    const clan = r.clan_name;
    const total = Number(r.total);
    const winx = Number(clanData[clan]?.winx || 0);
    return { clan_name: clan, total, winx, score: total * winx };
  });

  console.log("📊 Results:", results);

  // 1️⃣ Lowest score wins
  const minScore = Math.min(...results.map((r) => r.score));
  let potentialWinners = results.filter((r) => r.score === minScore);

  // 2️⃣ If score tie → lowest winx wins
  if (potentialWinners.length > 1) {
    const minWinx = Math.min(...potentialWinners.map((r) => r.winx));
    potentialWinners = potentialWinners.filter((r) => r.winx === minWinx);
  }

  // 3️⃣ If still tied → eliminate highest winx clan globally
  if (
    potentialWinners.length > 1 &&
    potentialWinners.every((w) => w.winx === potentialWinners[0].winx)
  ) {
    console.log("⚖️ All clans tied. Eliminating highest winx clan.");

    const maxWinx = Math.max(...results.map((r) => r.winx));
    const remaining = results.filter((r) => r.winx !== maxWinx);

    if (remaining.length > 0) {
      const minRemainingWinx = Math.min(...remaining.map((r) => r.winx));
      const finalCandidates = remaining.filter(
        (r) => r.winx === minRemainingWinx
      );

      // Final random pick
      const randomIndex = Math.floor(Math.random() * finalCandidates.length);
      potentialWinners = [finalCandidates[randomIndex]];

      console.log(
        `🎯 Selected from remaining lowest winx: ${potentialWinners[0].clan_name}`
      );
    }
  }

  // 4️⃣ Final selection
  if (potentialWinners.length > 1) {
    const randomIndex = Math.floor(Math.random() * potentialWinners.length);
    return potentialWinners[randomIndex].clan_name;
  }

  return potentialWinners[0].clan_name;
}

//init new match in db and in memory store
async function createNewMatch(matchName, clanNames) {
  try {
    //todo make all game match init
    // 1. match uid
    const matchUuid1 = uuidv4();
    const matchName1 = matchName;

    // 2. insert match to db
    // await matchJobService(matchUuid1, matchName1);

    // 3.Initialize in-memory store
    MatchStore.initMatch(matchUuid1, matchName1, clanNames);
    
    //4. to test match uuid using clientTest file
    MatchStore.testMatchuuid = matchUuid1;
    return { matchUuid1, matchName1 };
  } catch (error) {
    console.log("error with creating match ", error.message);
  }
}

async function startMatch(matchUuid) {
  try {
    // 1.store in db
    // await matchJobService.updateMatchStatus(matchUuid)
    
    // 2. Update in-memory store
    MatchStore.matches[matchUuid].matchStatus = "ongoing";
    console.log(` MatchStore: Match ${matchUuid} status set to ongoing`); 
  } catch (error) {
    console.log("error on start match", error.message);
  }

}

// ! newlly added lowest winx return
async function endMatch(gameName, matchUuid, matchName) {
  try {
    console.log(`🏁 Ending match: ${matchUuid} (${matchName})`);
    // const fixedWinerEnableCheckData = await settingsController.isFixedWinner(gameName);//get fixed winner data for game
    //end db match and store , select winner & emit history  if fixed enabnled for this match
    
    /*if(fixedWinerEnableCheckData.isEnabled){
      console.log("fixed winner enabled here the game name and data ",fixedWinerEnableCheckData )
      const  result = await settingsController.
                        updateCompleMatchForFixedWinner(
                                                        gameName, 
                                                        fixedWinerEnableCheckData.completedMatch,
                                                        fixedWinerEnableCheckData.totalMatch
                                                      );//update completed match count for fixed winner and if the completed match matches the total match the fixed winner disabled 

      let winnerClan = fixedWinerEnableCheckData.winnerClan[Number(fixedWinerEnableCheckData.completedMatch)];
      console.log(`🎯 fixed winner selected: ${winnerClan}`);
      
      //update db status
      // await matchJobService.updateMatchStatus(matchUuid, "completed",{winnerClan} )

      //update store status
      MatchStore.matches[matchUuid].winnerClan  = winnerClan;
      MatchStore.matches[matchUuid].matchStatus = "completed"
      
      const io = getIoInstance();
      await SocketService.emitLast10History(io, matchName);
      return winnerClan;
    }*/
    const fixedWinnerResult = MatchStore.getFixedWinner(gameName, matchUuid);
    console.log("fixed winner check result ",fixedWinnerResult);
    if(fixedWinnerResult.isFixedWinnerEnabled) {
      let winnerClan = fixedWinnerResult.winnerClan      
      console.log("fixed winner setted for ", gameName, "and the winner clan is ",winnerClan);
      
      MatchStore.matches[matchUuid].winnerClan = winnerClan;
      MatchStore.matches[matchUuid].matchStatus = "completed"
      const io = getIoInstance();
      await SocketService.emitLast10History(io, matchName);     
      return winnerClan;
    }

    const matchConfig = gameWinx[matchName];
    if (!matchConfig) {
      console.log("❌ Match config not found");
      return null;
    }


    const clanData = matchConfig.clanData;  
    // const rows = await matchJobService.getMatchBets(matchUuid);// Fetch total bets per clan
    
    const storeRows =  await MatchStore.getMatchTotals(matchUuid);
    console.log(storeRows);
    const rows = Object.entries(storeRows.real).map(([clan_name, total]) => ({
                   clan_name,
                   total
                 }));
    console.log(rows);
    // If no bets → random winner  ,end  db match and store, emit history and select winner
    if (!rows.length) {
      const clans = clanData.clanNames;
      const winnerClan =
        clans[Math.floor(Math.random() * clans.length)];

      console.log(`🎯 Random winner selected: ${winnerClan}`);

      //update match status and mark winner 
      // await matchJobService.updateMatchStatus(matchUuid, "completed",{winnerClan})

      //update store status
      MatchStore.matches[matchUuid].winnerClan = winnerClan;
      MatchStore.matches[matchUuid].matchStatus = "completed"

      const io = getIoInstance();
      await SocketService.emitLast10History(io, matchName);
      return winnerClan;
    }

    // Use helper to compute winner bsed on bets
    const winnerClan = calculateWinner(rows, clanData);  
    console.log(`🏆 Final Winner: ${winnerClan}`);
    
    //update db match status
    // await matchJobService.updateMatchStatus(matchUuid, "completed", {winnerClan})
    
    //update store status
    MatchStore.matches[matchUuid].winnerClan = winnerClan;
    MatchStore.matches[matchUuid].matchStatus = "completed"

    const io = getIoInstance();
    await SocketService.emitLast10History(io, matchName);
    return winnerClan;

  } catch (err) {
    console.error("❌ Error in endMatch:", err.message);
    // return null;
  }
}

async function runSingleMatchCycle(gameName) {
  const io = getIoInstance();

  return new Promise(async (resolve) => {

    // 🆕 Start a new match
    const { matchUuid1, matchName1: matchName } = await createNewMatch(gameName, gameWinx[gameName].clanData.clanNames);
    await startMatch(matchUuid1);

    // -----------------------------
    // ⭐ Start dummy simulation (per match)
    // -----------------------------
    if (
      process.env.INTERVALMS &&
      process.env.MINBETINCREASE &&
      process.env.MAXBETINCREASE &&
      process.env.MINCOUNTINCREASE &&
      process.env.MAXCOUNTINCREASE
    ) {
      MatchStore.startDummySimulationForMatch(
        matchUuid1,
        Number(process.env.INTERVALMS),
        Number(process.env.MINBETINCREASE),
        Number(process.env.MAXBETINCREASE),
        Number(process.env.MINCOUNTINCREASE),
        Number(process.env.MAXCOUNTINCREASE)
      );
    }

    // -----------------------------
    // Environment configs
    // -----------------------------
    const FULL_MATCH_TIME = Number(process.env.MATCH_FULL_TIME || 60);
    const BET_COUNTDOWN = Number(process.env.MATCH_BET_COUNTDOWN || 45);
    const TICK_INTERVAL = Number(process.env.COUNTDOWN_INTERVAL || 1000);

    if (!FULL_MATCH_TIME || !BET_COUNTDOWN)
      throw new Error("MATCH_FULL_TIME or MATCH_BET_COUNTDOWN missing");

    let remaining = FULL_MATCH_TIME;
    let betRemaining = BET_COUNTDOWN;
    let winnerClan = "Not calculated";
    let winnerCalculated = false;

    // 🔵 Announce match start
    // io.to("TigerDragon").emit("matchStatus", {
      //   matchUuid1,
      //   status: "match_started",
    //   fullTime: FULL_MATCH_TIME,
    //   betTime: BET_COUNTDOWN,
    // });

    // -----------------------------------
    // Pre-fetch store references
    // -----------------------------------
    const matchTotals = await MatchStore.getMatchTotals(matchUuid1);
    const usersCountInitial = MatchStore.getUsersCount(matchUuid1);

    // -----------------------------------
    // 🔥 MAIN MATCH TIMER
    // -----------------------------------
    const interval = setInterval(async () => {

      // Always fetch updated totals for accurate dummy data      
        const currentTotals =  matchTotals;
      const usersCount = MatchStore.getUsersCount(matchUuid1) || usersCountInitial;

      io.to(`${gameName}`).emit(`matchTimerTick`, {
        matchUuid1,
        winner: winnerClan,
        matchRemainingTime: remaining,
        status:
          remaining <= 10
            ? "MATCH_RESULT"
            : remaining === FULL_MATCH_TIME
            ? "MATCH_STARTED"
            : betRemaining > 0
            ? "BET_OPEN"
            : "BET_CLOSED",
        betRemainingTime: betRemaining > 0 ? betRemaining : 0,
        totalBet:
          (remaining === FULL_MATCH_TIME || remaining === 59)
            ? {
                real: currentTotals.real,
                dummy: currentTotals.dummy
                
              }
            : {
                real: currentTotals.real,
                dummy: currentTotals.dummy                                  
              },

        usersCount,
      });
      // console.log(remaining)
      // ----------------------------------
      // 🟡 BET COUNTDOWN
      // ----------------------------------
      if (betRemaining > 0) {
        betRemaining--;

        // if (betRemaining === 0) {
        //   io.to("TigerDragon").emit("matchStatus", {
        //     matchUuid1,
        //     status: "bet_closed",
        //   });

        //   io.to("TigerDragon").emit("matchStatus", {
        //     matchUuid1,
        //     status: "calculating",
        //   });
        // }
      }

      // ----------------------------------
      // 🔴 CALCULATE WINNER ONCE
      // ----------------------------------
      if (remaining === 10 && !winnerCalculated) {
        winnerClan = await endMatch(gameName, matchUuid1, matchName);
        winnerCalculated = true;
      }

      // ----------------------------------
      // 🛑 MATCH END
      // ----------------------------------
      if (remaining <= 0) {
        clearInterval(interval);

        // io.to("TigerDragon").emit("matchStatus", {
        //   matchUuid1,
        //   status: "ended",
        //   winner: winnerClan,
        // });

        // Stop dummy data
        MatchStore.stopDummySimulationForMatch(matchUuid1);
        MatchStore.addHistroy(gameName, matchUuid1, winnerClan)
        // Cleanup memory for match
        MatchStore.removeMatch(matchUuid1);
        delete MatchStore.fixedWinners[matchUuid1]; // 

        return resolve(winnerClan);
      }
      // if(remaining === 3 ){
      //   await  matchJobService.sendMatchDataToExternalService(matchUuid1);
      // }

      remaining--;
    }, TICK_INTERVAL);
  });
}

async function startMatchScheduler(gameName) {
  console.log(`🕒 Match scheduler started for ${gameName}`);

  const GAP_BETWEEN_MATCHES = Number(process.env.MATCH_GAP || 3);
  let running = false;

  async function loop() {
    if (running) return; // safety protection
    running = true;

    try {
      console.log("🚀 Starting new match cycle...");
      await runSingleMatchCycle(gameName); // wait fully
      console.log(`🏁 Match finished. Waiting ${GAP_BETWEEN_MATCHES}s...`);
      await new Promise(res => setTimeout(res, GAP_BETWEEN_MATCHES * 1000));
    } catch (err) {
      console.error("❌ Match cycle error:", err);
    } finally {
      running = false;
      setTimeout(loop, 0); 
    }
  }

  loop();
}

async function parentAllGameScheduler() {
  console.log("🔥 Starting ALL game schedulers...");
  const gameNames = Object.keys(gameWinx);
  // const gameNames = ["JhandiMunda"]
  gameNames.forEach((gameName) => {
    console.log(`🎮 Starting scheduler for: ${gameName}`);
    startMatchScheduler(gameName);
  });

  console.log("🚀 All game cycles are now running.");
}




module.exports = {
  startMatchScheduler,
  createNewMatch,
  startMatch,
  endMatch,
  calculateWinner,
  parentAllGameScheduler
};
