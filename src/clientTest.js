const { io } = require("socket.io-client");
const MatchStore = require("./socket/matchStore");
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // Example emits
  socket.emit("joinRoom", { roomName: "TigerDragon", playerId: 1, "username": "PlayerOne"});
});

let betPlaced = false;

socket.on("matchTimerTick", (data) => {
  if (!betPlaced && data.matchUuid1) {
    console.log("🎲 Match found:", data.matchUuid1);
    socket.emit("placeBet", { 
      match_uuid: data.matchUuid1, 
      player_id: 1, 
      username: "PlayerOne", 
      clan_name: "Tiger", 
      bet_amount: 100 
    });
    betPlaced = true;
  }
});

socket.onAny((event, data) => {
  console.log("📨 Server event:", event, data);
});






//  playerId, username, roomName
// { match_uuid, player_id, username, clan_name, bet_amount } = data;
