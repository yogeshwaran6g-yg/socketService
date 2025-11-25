🧾 Summary — End-to-End Flow
Step	Event	Server Action
1	joinMatch	Add to match room, send clan list
2	joinClan	Add to chosen clan, update DB
3	clanJoined	Broadcast updated clan counts
4	timeout	Evaluate winner (smallest clan)
5	matchResult	Broadcast winner + stats
6	—	Clean up match memory



ex:
1️⃣ Player A joins match:101
2️⃣ Player B joins match:101
3️⃣ Player A → clanA
4️⃣ Player B → clanB
5️⃣ Timer ends → clanA (1 player) vs clanB (1 player)
   ✅ Both same → random winner or tie
6️⃣ Winner broadcast to room + DB updated









<!-- Player connects
   ↓
Joins match room → match:101
   ↓
Server sends available clans (or auto-creates)
   ↓
Player selects (or auto-joins) a clan
   ↓
Clan membership stored (in-memory + DB)
   ↓
All clients see updated clan counts
   ↓
Match timer ends → smallest clan wins
   ↓
Winner broadcast + DB updated
   ↓
Room cleaned up -->



//new logic 


request to start macth 
   |
match init and clan init[Tiger, Dragon, Tie]
   |
count //5s
   |
match  Start (start timer )
   |
match  End (timer ended)
   |
calculate lowest bet 
   |
emit and store winner



add dummy data in tick not condition(done)
and in the fist return ,make the return data of dummy
winneer emit in tick    (done ) {iitial not calculated the   winner clan }
make dummy user data drop slighlly (done)  (initial 500 to 600 then increase by 1 to 6)



match winx config

module.exports = {
  TigerDragon: {
    clans: ["Tiger", "Dragon", "Tie"],
    winx: {
      Tiger: 2,
      Dragon: 2,
      Tie: 9,
    },
  },

  TeenPatti: {
    clans: ["Player", "Dealer"],
    winx: {
      Player: 2,
      Dealer: 2
    }
  },

  AndarBahar: {
    clans: ["Andar", "Bahar"],
    winx: {
      Andar: 2,
      Bahar: 2
    }
  },

  Roulette: {
    clans: ["Red", "Black", "Odd", "Even"],
    winx: {
      Red: 2,
      Black: 2,
      Odd: 2,
      Even: 2
    }
  },

  Poker: {
    clans: ["High", "Low"],
    winx: {
      High: 2,
      Low: 2
    }
  }
};


<!-- const roomNames = ["TigerDragon", "AndarBahar", "7Up7Down", "JhandiMunda", "CarRoulette"]; -->