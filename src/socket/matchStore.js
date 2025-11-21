class MatchStore {
  constructor() {
    this.matches = {};
  }

  /**
   * Initialize a new match in memory
   * @param {string} matchUuid
   * @param {string} matchName
   * @param {string[]} clanNames
   */
  initMatch(matchUuid, matchName, clanNames = []) {
    this.matches[matchUuid] = {
      matchUuid,
      matchName,
      clans: {
        // example
        // tiger:{
        //   realTotal: 0,
        //   dummyTotal: 0,
        // }    
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

          totalCount: 0,
        },
      },
    };

    // Initialize clans with 0 totals
    clanNames.forEach((clan) => {
      this.matches[matchUuid].clans[clan] = {
        realTotal: 0,
        dummyTotal: 0,
      };
    });

    console.log(` MatchStore: Initialized match ${matchUuid}`);
  }

  /**
   * Add a bet to the match
   * @param {string} matchUuid
   * @param {string} userId
   * @param {string} username
   * @param {string} clanName
   * @param {number} amount
   * @param {boolean} isDummy
   */

//  !todo  adjust the dummy case change the clan dummy dats
  addBet(matchUuid, userId, username, clanName, amount, isDummy = false) {
    const match = this.matches[matchUuid];
    if (!match) {
      console.error(`❌ MatchStore: Match ${matchUuid} not found`);
      return false;
    }

    if (!match.clans[clanName]) {
      console.error(`❌ MatchStore: Clan ${clanName} not found in match ${matchUuid}`);
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
        match.users.real[userId] = {// if new user => adding real user data
          username,
          totalBet: 0,
          bets: [],
        };
      }
      match.users.real[userId].totalBet += amount; //adding users real total clan bet
      match.users.real[userId].bets.push({ clanName, amount, time: Date.now() }); //adding users real clan bets
    }

    return true;
  }

  /**
   * Get aggregated totals for broadcasting
   * @param {string} matchUuid
   */
  getMatchTotals(matchUuid) {
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

  /**
   * Remove match data from memory
   * @param {string} matchUuid
   */
  removeMatch(matchUuid) {
    if (this.matches[matchUuid]) {
      delete this.matches[matchUuid];
      console.log(`🗑️ MatchStore: Removed match ${matchUuid}`);
    }
  }

  /**
   * Get player total bet for broadcasting
   * @param {string} matchUuid
   * @param {string} userId
   */   
  getPlayerTotalBet(matchUuid, userId) {
    const match = this.matches[matchUuid];
    if (!match) return null;

    return match.users.real[userId].totalBet;
  }



  getUsersCount(matchUuid){
    const match = this.matches[matchUuid];
    if (!match) return null;
    const realusersCount = Object.keys(match.users.real).length;
    const dummyusersCount = match.users.dummy.totalCount;

    return{
        realUsersCount:realusersCount,
        dummyUsersCount:dummyusersCount,
    }
}
  /**
   * Starts a simulation for dummy bets and user counts across all active matches.
   * @param {number} intervalMs - The interval in milliseconds for the simulation to run.
   * @param {number} minBetIncrease - Minimum amount to increase total dummy bets.
   * @param {number} maxBetIncrease - Maximum amount to increase total dummy bets.
   * @param {number} minCountIncrease - Minimum amount to increase total dummy user count.
   * @param {number} maxCountIncrease - Maximum amount to increase total dummy user count.
   */
  startDummySimulation(intervalMs, minBetIncrease, maxBetIncrease, minCountIncrease, maxCountIncrease) {
    if (this.dummyInterval) {
      clearInterval(this.dummyInterval);
      console.log('🔄 MatchStore: Restarting dummy simulation interval.');
    }

    this.dummyInterval = setInterval(() => {
      for (const matchUuid in this.matches) {
        const match = this.matches[matchUuid];
        if (!match) continue;

        
        
        const randomCountIncrease = Math.floor(Math.random() * (maxCountIncrease - minCountIncrease + 1)) + minCountIncrease;
        
        for (const clanName in match.clans) {
          const randomClanBetIncrease = Math.floor(Math.random() * (maxBetIncrease - minBetIncrease + 1)) + minBetIncrease;
          match.clans[clanName].dummyTotal += randomClanBetIncrease;
        }
        match.users.dummy.totalCount += randomCountIncrease;


      }
    }, intervalMs);

    console.log(`🚀 MatchStore: Dummy simulation started with interval ${intervalMs}ms.`);
  }

  /**
   * Stops the dummy betting simulation.
   */
  stopDummySimulation() {
    if (this.dummyInterval) {
      clearInterval(this.dummyInterval);
      this.dummyInterval = null;
      console.log('MatchStore: Dummy simulation stopped.');
    }
  }

}

module.exports = new MatchStore();


// paka