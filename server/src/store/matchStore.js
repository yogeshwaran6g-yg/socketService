class MatchStore {
  constructor() {
    this.matches = {};
    this.dummyIntervals = {};
    this.testMatchuuid = null;
    this.histroy = {
      TigerDragon: [],
      AndarBahar: [],
      "7Up7Down": [],
      JhandiMunda: [],
      CarRoulette: [],
    };
    this.fixedWinners = {
      //for ongoing match
      // matchUuid: "tiger",
    };
    this.fixedTimedWinners = {
      // TigerDragon: {
      //    executeAt: 1700000000,
      //    total: 5,
      //    clans: ["tiger","dragon","tiger","tie","dragon"],
      //    completed: 0
      // }
    };
  }

  //! todo fix the dummy bet total for each clan
  initMatch(matchUuid, matchName, clanNames = []) {
    /*changes {
    match clan keys name changes (realTotal, dummyTotal) => (realBetTotal, dummyBetTotal)
    match users keys name changed (real , dummy) => (dummyUsers, realUsers)
    }*/
    this.matches[matchUuid] = {
      matchUuid,
      matchName,
      matchStatus: "pending",
      winnerClan: "Not calculated",
      clans: {
        // example
        // Tiger: {
        //   realBetTotal: 0,
        //   dummyBetTotal: 20000,
        // },
        // Dragon: {
        //   realBetTotal: 0,
        //   dummyBetTotal: 30000,
        // },
        // Tie: {
        //   realBetTotal: 0,
        //   dummyBetTotal: 20000,
        // },
      },
      users: {
        realUsers: {
          // example
          // userId :{
          //   username: "Alice",
          //   totalBet: 100,
          //   bets: [
          //     { clanName: "tiger", amount: 50, time: 1700000000000 },
          //     { clanName: "dragon", amount: 50, time: 1700000000000 },
          //   ],
          // }
        },
        dummyUsers: {
          totalCount: Math.floor(Math.random() * (600 - 500 + 1)) + 500,
        },
      },
    };

    // Initialize clans with 0 totals
    clanNames.forEach((clan) => {
      this.matches[matchUuid].clans[clan] = {
        realBetTotal: 0,
        dummyBetTotal: Math.floor(Math.random() * (5000 - 10000 + 1)) + 10000,
      };
    });

    console.log(` MatchStore: Initialized match ${matchUuid} - ${matchName}`);
  }

  //  !todo  adjust the dummy data clan name cases
  addBet(matchUuid, userId, username, clanName, amount) {
    const match = this.matches[matchUuid];
    if (!match) {
      console.error(` mtchStore: Match ${matchUuid} not found`);
      return false;
    }

    if (!match.clans[clanName]) {
      console.error(
        ` matchStore: Clan ${clanName} not found in match ${matchUuid}`
      );
      return false;
    }

    amount = Number(amount);

    match.clans[clanName].realBetTotal += amount; //adding real total bet

    // Update Real User Data
    if (!match.users.realUsers[userId]) {
      match.users.realUsers[userId] = {
        // if new user => adding real user data
        username,
        totalBet: 0,
        bets: [],
      };
    }
    match.users.realUsers[userId].totalBet += amount; //adding users total clan bet
    const existingBet = match.users.realUsers[userId].bets.find(
      (bet) => bet.clanName === clanName
    );

    if (existingBet) {
      existingBet.amount += amount;
      existingBet.time = Date.now();
    } else {
      match.users.realUsers[userId].bets.push({
        clanName,
        amount,
        time: Date.now(),
      });
    }

    return true;
  }

  async getMatchTotals(matchUuid) {
    try {
      const match = this.matches[matchUuid];
      if (!match) return null;

      const result = {
        real: {},
        dummy: {},
      };

      for (const [clan, data] of Object.entries(match.clans)) {
        result.real[clan] = data.realBetTotal;
        result.dummy[clan] = data.dummyBetTotal;
      }
      // sample result
      // {
      //   real: {
      //     tiger: 100,
      //     dragon: 200,
      //     tie:300,
      //   },
      //   dummy: {
      //     tiger: 50,
      //     dragon: 150,
      //     tie : 300,
      //   },
      // }
      return result;
    } catch (err) {
      console.log("err from match store get match totals", err.message);
    }
  }

  getPlayerTotalBet(matchUuid, userId) {
    const match = this.matches[matchUuid];
    if (!match) return null;

    if (
      match.users.realUsers[userId] &&
      match.users.realUsers[userId].totalBet
    ) {
      return match.users.real[userId].totalBet;
    }
    throw new Error("failed to get bet data");
  }

  getUsersCount(matchUuid) {
    const match = this.matches[matchUuid];
    if (!match) return null;
    const realusersCount = Object.keys(match.users.realUsers).length;
    const dummyusersCount = match.users.dummyUsers.totalCount;

    return {
      realUsersCount: realusersCount,
      dummyUsersCount: dummyusersCount,
    };
  }

  // inside MatchStore object
  startDummySimulationForMatch(
    matchUuid,
    intervalMs,
    minBetIncrease,
    maxBetIncrease,
    minCountIncrease,
    maxCountIncrease
  ) {
    // If interval exists, clear it first
    if (this.dummyIntervals[matchUuid]) {
      clearInterval(this.dummyIntervals[matchUuid]);
    }

    // Create new interval for this match only
    const interval = setInterval(() => {
      const match = this.matches[matchUuid];
      if (!match) return; // match removed → safely ignore

      // --- Dummy user count ---
      const randomCountIncrease =
        Math.floor(Math.random() * (maxCountIncrease - minCountIncrease + 1)) +
        minCountIncrease;

      match.users.dummyUsers.totalCount += randomCountIncrease;

      // --- Dummy clan bet ---
      // for (const clanName in match.clans) {
      //   const randomClanBetIncrease =
      //     Math.floor(Math.random() * (maxBetIncrease - minBetIncrease + 1)) +
      //     minBetIncrease;

      //   match.clans[clanName].dummyTotal =
      //     Number(match.clans[clanName].dummyTotal) || 0;

      //   match.clans[clanName].dummyTotal += randomClanBetIncrease;
      // }
    }, intervalMs);

    this.dummyIntervals[matchUuid] = interval;

    console.log(`🚀 Dummy simulation started for match ${matchUuid}`);
  }

  stopDummySimulationForMatch(matchUuid) {
    const interval = this.dummyIntervals[matchUuid];
    if (interval) {
      clearInterval(interval);
      delete this.dummyIntervals[matchUuid];
      console.log(`🛑 Dummy simulation stopped for match ${matchUuid}`);
    }
  }

  setFixedWinnerForNextMatch(matchUuid, clanName) {
    try {
      if (!matchUuid || !clanName) {
        return false;
      }
      // todo make find the game find by match uuid then check the given clan is includes the that games or not
      // if(![""].includes(clanName)) return;
      this.fixedWinners[matchUuid] = clanName;
      console.log(`🛠 Fixed Winner set for match ${matchUuid}: ${clanName}`);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  setFixedTimedWinnerForGame(
    gameName,
    totalMatches,
    executeAtTimestamp,
    clanArray
  ) {
    try {
      // todo make find the game find by match uuid then check the given clan is includes the that games or not

      if (
        !gameName ||
        !totalMatches ||
        !executeAtTimestamp ||
        !Array.isArray(clanArray)
      ) {
        console.error("setFixedTimedWinnerForGame: invalid parameters");
        return false;
      }

      if (clanArray.length !== totalMatches) {
        console.error("setFixedTimedWinnerForGame: clans array size mismatch");
        return false;
      }

      this.fixedTimedWinners[gameName] = {
        executeAt: Number(executeAtTimestamp),
        total: Number(totalMatches),
        clans: [...clanArray],
        completed: 0, // how many matches used so far
      };

      console.log(
        `🕒 Multi-Match Timed Winner Scheduled → Game: ${gameName}
       Total: ${totalMatches}
       Execute At: ${new Date(executeAtTimestamp).toISOString()}
       Clans: ${JSON.stringify(clanArray)}`
      );

      return true;
    } catch (error) {
      console.log("error in setFixedTimedWinnerForGame:", error.message);
      return false;
    }
  }

  getFixedWinner(gameName, matchUuid) {
    const now = Date.now();

    // 1. Immediate per-match fixed winner
    if (this.fixedWinners[matchUuid]) {
      return {
        isFixedWinnerEnabled: true,
        winnerClan: this.fixedWinners[matchUuid],
      };
    }

    // 2. Multi-match timed fixed winner (per-game)
    const schedule = this.fixedTimedWinners[gameName];

    if (!schedule) {
      return {
        isFixedWinnerEnabled: false,
        winnerClan: null,
      };
    }

    const { executeAt, total, clans, completed } = schedule;

    // Not time yet → no fixed winner
    if (now < executeAt) {
      return {
        isFixedWinnerEnabled: false,
        winnerClan: null,
      };
    }

    // If schedule already fully consumed
    if (completed >= total) {
      delete this.fixedTimedWinners[gameName];
      return {
        isFixedWinnerEnabled: false,
        winnerClan: null,
      };
    }

    // Determine which winner to use for this match
    const winnerClan = clans[completed];

    // Increment completed count
    this.fixedTimedWinners[gameName].completed += 1;

    // If finished all scheduled matches → remove entry
    if (this.fixedTimedWinners[gameName].completed >= total) {
      delete this.fixedTimedWinners[gameName];
    }

    return {
      isFixedWinnerEnabled: true,
      winnerClan,
    };
  }

  //helpers
  removeMatch(matchUuid) {
    if (this.matches[matchUuid]) {
      delete this.matches[matchUuid];
      console.log(`🗑️ MatchStore: Removed match ${matchUuid}`);
    }
  }

  getMatchStatus(matchUuid) {
    return this.matches[matchUuid].matchStatus || "completed";
  }

  addHistroy(gameName, matchUuid, winnerClan) {
    this.histroy[gameName].push({
      matchUuid,
      winnerClan,
      endTime: Date.now(),
    });
    if (this.histroy[gameName].length > 10) {
      this.histroy[gameName].shift();
    }
  }
}

module.exports = new MatchStore();

// list of functions and purpose in table
/*
| Function Name | Purpose |
|---------------|---------|
|initMatch(
|          matchUuid,
|          matchName, 
|         clanNames) | Initializes a new match in memory with given UUID, name, and clans. |
|
addBet(matchUuid, 
        userId, 
        username, 
        clanName, 
        amount, 
        isDummy) | Adds a bet to the specified match for a user or dummy. |
|getMatchTotals(matchUuid) | Retrieves aggregated totals of bets for broadcasting. |
|removeMatch(matchUuid) | Removes match data from memory. |
|getPlayerTotalBet(matchUuid, userId) | Gets the total bet amount for a specific player in a match. |
|getUsersCount(matchUuid) | Retrieves the count of real and dummy users for a match. |


|startDummySimulation(intervalMs, minBetIncrease, maxBetIncrease, minCountIncrease, maxCountIncrease) | Starts a simulation for dummy bets and user counts across all active matches. |
|stopDummySimulation() | Stops the dummy betting simulation. |

Summary of functions:



*/
