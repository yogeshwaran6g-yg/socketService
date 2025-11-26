class MatchStore {
  constructor() {
    this.matches = {};
    this.dummyIntervals = {};
    this.testMatchuuid = null;
  }

  //! todo fix the dummy bet total for each clan
  initMatch(matchUuid, matchName, clanNames = []) {
    this.matches[matchUuid] = {
      matchUuid,
      matchName,
      matchStatus: "pending",
      clans: {
        // example
        // Tiger: {
        //   realTotal: 0,
        //   dummyTotal: 20000,
        // },
        // Dragon: {
        //   realTotal: 0,
        //   dummyTotal: 30000,
        // },
        // Tie: {
        //   realTotal: 0,
        //   dummyTotal: 20000,
        // },
      },
      users: {
        real: {
          // example
          // {
          //   username: "Alice",
          //   totalBet: 100,
          //   bets: [
          //     { clanName: "tiger", amount: 50, time: 1700000000000 },
          //     { clanName: "dragon", amount: 50, time: 1700000000000 },
          //   ],
          // }
        },
        dummy: {
          totalCount: Math.floor(Math.random() * (600 - 500 + 1)) + 500,
        },
      },
    };

    // Initialize clans with 0 totals
    clanNames.forEach((clan) => {
      this.matches[matchUuid].clans[clan] = {
        realTotal: 0,
        dummyTotal: Math.floor(Math.random() * (5000 - 10000 + 1)) + 10000
      };
    });

    console.log(` MatchStore: Initialized match ${matchUuid} - ${matchName}`);
  }

  //  !todo  adjust the dummy data clan name cases
  addBet(matchUuid, userId, username, clanName, amount, isDummy = false) {
    const match = this.matches[matchUuid];
    if (!match) {
      console.error(`❌ MatchStore: Match ${matchUuid} not found`);
      return false;
    }

    if (!match.clans[clanName]) {
      console.error(
        `❌ MatchStore: Clan ${clanName} not found in match ${matchUuid}`
      );
      return false;
    }

    amount = Number(amount);

    // Update Clan Totals
    if (isDummy) {
      //fix tis
      return;
      match.clans[clanName].dummyTotal += amount;
      match.users.dummy.totalCount++; // Increment dummy bet count (or user count if tracking distinct dummies)
    } else {
      match.clans[clanName].realTotal += amount; //adding real total bet

      // Update Real User Data
      if (!match.users.real[userId]) {
        match.users.real[userId] = {
          // if new user => adding real user data
          username,
          totalBet: 0,
          bets: [],
        };
      }
      match.users.real[userId].totalBet += amount; //adding users real total clan bet
      match.users.real[userId].bets.push({
        clanName,
        amount,
        time: Date.now(),
      }); //adding users real clan bets
    }

    return true;
  }

  async getMatchTotals(matchUuid) {
    const match = this.matches[matchUuid];
    if (!match) return null;

    const result = {
      real: {},
      dummy: {},
    };

    for (const [clan, data] of Object.entries(match.clans)) {
      result.real[clan] = data.realTotal;
      result.dummy[clan] = data.dummyTotal;
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
  }

  removeMatch(matchUuid) {
    if (this.matches[matchUuid]) {
      delete this.matches[matchUuid];
      console.log(`🗑️ MatchStore: Removed match ${matchUuid}`);
    }
  }

  getPlayerTotalBet(matchUuid, userId) {
    const match = this.matches[matchUuid];
    if (!match) return null;

    if (match.users.real[userId] && match.users.real[userId].totalBet) {
      return match.users.real[userId].totalBet;
    }
    throw new Error("failed to get bet data");
  }

  getUsersCount(matchUuid) {
    const match = this.matches[matchUuid];
    if (!match) return null;
    const realusersCount = Object.keys(match.users.real).length;
    const dummyusersCount = match.users.dummy.totalCount;

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
    if (!match) return;   // match removed → safely ignore

    // --- Dummy user count ---
    const randomCountIncrease =
      Math.floor(Math.random() * (maxCountIncrease - minCountIncrease + 1)) +
      minCountIncrease;

    match.users.dummy.totalCount += randomCountIncrease;

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
