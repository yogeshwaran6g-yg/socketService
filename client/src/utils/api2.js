import axios from "axios";
import { toast } from "react-toastify";
import {io} from "socket.io-client"

// let baseURL = "http://localhost:4000"
// let baseURL = "https://brandby.shop"
let baseURL = "http://147.79.71.9:4000"


const endPoints = {

}

export let socketInstance;




export const initSocketConnection = async function () {
    return new Promise((resolve, reject) => {
        try {
            const socket = io(baseURL, {
                transports: ["websocket", "polling"],
                auth: {
                 adminKey: "abcd"
                },
            });

            socket.on("connectionAcknowledged", () => {
                console.log("SOCKET CONNECTED:", socket.id);
                socketInstance = socket;
                resolve(socket);
            });

            socket.on("connect_error", reject);

        } catch (err) {
            reject(err);
        }
    });
};

export const getSocket = ()=>{
    return socketInstance;
}

export const joinRoom = async function (roomName) {
  return new Promise((resolve , reject)=>{

  if (!socketInstance) {
    console.error("Socket not initialized");
    return;
  }

  const data = {
    playerId: 11,
    username: "admin",
    roomName,
  };

  console.log("EMIT JOIN:", data);

  socketInstance.off("joinRoom", data);

  socketInstance.once("roomJoined", (data) => {
    console.log(data.message);
    resolve(true)
  });
  socketInstance.emit("joinRoom", data);
  })

};

export const leftRoom = function (roomName) {
  return new Promise((resolve) => {
    const data = { roomName };

    console.log("left room ", roomName);

    socketInstance.off("leftRoom", data);

    socketInstance.once("leftRoomSuccess", (data) => {
      console.log(data.message);
      resolve(true); 
    });
    socketInstance.emit("leftRoom", data);
  });
};

export const placeBet = async function (matchUuid){
  return new Promise(resolve=>{

  let data = {
        match_uuid:matchUuid,
        player_id : 2,
        username:"boss",
        clan_name : "tiger",
        bet_amount:200
  }
  console.log("bet placeing", data);
  socketInstance.emit("placeBet",data);
  socketInstance.on("betPlaced",(data)=>{
    resolve(true);
  })
})
  
}


export const setSelectedFixedWinner = async function (winnerClan, matchUuid) {
  return new Promise((resolve, reject) => {
    if (!socketInstance) return reject("Socket not connected");

    console.log("fixed winner call");
    const data = { winnerClan, matchUuid };

    // Remove any old listeners to avoid duplicates
    socketInstance.off("setFixedWinnerResult");
    
    socketInstance.once("setFixedWinnerResult", (response) => {
      if (response.success) {
        toast.success("Winner side set successfully");
        resolve(true);
      } else {
        toast.error(response.message || "Failed to set winner");
        reject(false);
      }
    });

    
    socketInstance.emit("setFixedWinner", data);
  });
};

export const setSelectedFixedTimedWinner = async function (data) {
  return new Promise((resolve, reject) => {
    if (!socketInstance) return reject("Socket not connected");

    console.log("fixedtimedwinner call");
    
    // Remove any old listeners to avoid duplicates
    socketInstance.off("setFixedTimedWinnerResult");
    
    socketInstance.once("setFixedTimedWinnerResult", (response) => {
      console.table("from setFixedTimedWinnerResult");
      if (response.success) {
        toast.success("Timed Winner side set successfully");
        resolve(true);
      } else {
        toast.error(response.message || "Failed to set Timedwinner side");
        reject(false);
      }
    });

    
    socketInstance.emit("setFixedTimedWinner", data);
  });
};