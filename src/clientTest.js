const { io } = require("socket.io-client");

// ---------------------------
// CONFIG: Add any game here
// ---------------------------
const GAME_TEST_CONFIG = {
  games: [
    { roomName: "TigerDragon", playerId: 1, username: "TD_Player" },
    { roomName: "AndarBahar", playerId: 2, username: "AB_Player" },
    { roomName: "ColourPrediction", playerId: 3, username: "CP_Player" },
    { roomName: "Mines", playerId: 4, username: "MN_Player" }
  ],
  betAmount: 100,
  autoPlaceBet: true,
};

let currentGameIndex = 0;
let betPlaced = false;
let socket = null;

// ---------------------------
// Start Testing
// ---------------------------
function startGameTest() {
  if (currentGameIndex >= GAME_TEST_CONFIG.games.length) {
    console.log("\n🎉 ALL GAME TESTS COMPLETED.\n");
    process.exit(0);
    return;
  }

  const game = GAME_TEST_CONFIG.games[currentGameIndex];
  betPlaced = false;

  console.log(`\n\n========== 🧪 TESTING GAME: ${game.roomName} ==========\n`);

  connectToServer(game);
}

// ---------------------------
// Create socket connection
// ---------------------------
function connectToServer(game) {
  socket = io("http://localhost:4000", { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log(`✅ Connected: ${socket.id}`);
    console.log(`➡️ Joining room: ${game.roomName}`);

    socket.emit("joinRoom", {
      roomName: game.roomName,
      playerId: game.playerId,
      username: game.username,
    });
  });

  // Bet placement on timer event
  socket.on("matchTimerTick", (data) => {
    if (GAME_TEST_CONFIG.autoPlaceBet && !betPlaced && data.matchUuid1) {
      console.log("🎲 Match found:", data.matchUuid1);

      socket.emit("placeBet", {
        match_uuid: data.matchUuid1,
        player_id: game.playerId,
        username: game.username,
        clan_name: "Tiger", // default for testing
        bet_amount: GAME_TEST_CONFIG.betAmount,
      });

      betPlaced = true;
      console.log("💰 Bet placed:", GAME_TEST_CONFIG.betAmount);
    }
  });

  socket.on("betPlaced", (res) => {
    console.log("✅ Bet Confirmed:", res);
  });

  socket.on("matchResult", (res) => {
    console.log("🏆 Match Result:", res);
    console.log(`\n➡️ FINISHED TESTING ${game.roomName}`);

    // Move to next game after result
    socket.disconnect();
    currentGameIndex++;
    setTimeout(startGameTest, 1500);
  });

  socket.onAny((event, data) => {
    console.log("📨 Event:", event, data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected.");
  });
}

// Start testing all games
startGameTest();
