const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // Example emits
  socket.emit("joinRoom", { roomName: "TigerDragon", playerId: 1, "username": "PlayerOne"});

  socket.emit("placeBet", { match_uuid: "42b0ddbd-17da-45e8-a2a0-92deb57da895", player_id: 1, username: "PlayerOne", clan_name: "Tiger", bet_amount: 100 });

  
});

socket.onAny((event, data) => {
  console.log("📨 Server event:", event, data);
});






//  playerId, username, roomName
// { match_uuid, player_id, username, clan_name, bet_amount } = data;
