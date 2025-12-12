import React, { useState, useEffect } from "react";
import {
  initSocketConnection,
  getSocket,
  joinRoom,
  leftRoom,
  socketInstance,
  placeBet,
  setSelectedFixedWinner,
  setSelectedFixedTimedWinner
} from "../utils/api2";
import DashboardSkeleton from "./DashboardSkeleton";
import { toast } from "react-toastify";
import {constants} from "../config/Constants"
import  Modal from "./NewModal.jsx"


const DragonTigerAdminDashboard = () => {
  const [selectedWinner, setSelectedWinner] = useState("Select Winner");
  const [roundId, setRoundId] = useState("");

  //
  const [isDisabled, setIsDisabled] = useState(true);
  const gameWinx = constants.gameWinx;
  const clanColors = constants.clanColors;
  const [selectedGame, setSelectedGame] = useState("TigerDragon");
  const [previousSelectedGame, setPreviousSelectedGame] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fixedWinner, setFixedWinner] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const games = [
    "TigerDragon",
    "AndarBahar",
    "7Up7Down",
    "JhandiMunda",
    "CarRoulette",
  ];


  const clans = gameWinx[selectedGame].clanData.clanNames;
  const [matchInfo, setMatchInfo] = useState({
    matchUuid: 0,
    status: "pending",
    winner: "Not calculated",
    matchRemainingTime: 0,
    betRemainingTime: 0,
    totalBet: { real: {}, dummy: {} },
    usersCount: 0,
  });
  const realBets = matchInfo.totalBet.real || {};
  const [matchHistory, setMatchHistory] = useState([]);
 
  async function connectAndJoinRoom() {
    try {
      await initSocketConnection();
      await joinRoom(selectedGame);
      setIsLoading(false);
    } catch (err) {
      toast.error("unable to connect server");
    }
  }
  useEffect(() => {
    connectAndJoinRoom();
  }, []);

  async function change() {
    setIsLoading(true);
    setMatchInfo({
    matchUuid: 0,
    status: "pending",
    winner: "Not calculated",
    matchRemainingTime: 0,
    betRemainingTime: 0,
    totalBet: { real: {}, dummy: {} },
    usersCount: 0,
    })
    setMatchHistory([])
    await leftRoom(previousSelectedGame); // waits for server response
    await joinRoom(selectedGame); // runs only after leaving is confirmed
    // await placeBet(matchInfo.matchUuid)

    setIsLoading(false);
  }

  useEffect(() => {
    if (!socketInstance) return;
    if (previousSelectedGame) change();
  }, [selectedGame]);

  const onTick = (data) => {
    // Example transformed payload
    setMatchInfo({
      matchUuid: data.matchUuid1,
      status: data.status,
      winner: data.winner,
      matchRemainingTime: data.matchRemainingTime,
      betRemainingTime: data.betRemainingTime,
      totalBet: data.totalBet,
      usersCount: data.usersCount,
    });
    
    if (data.matchRemainingTime <= 15) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const onHistory = (data) => {
    console.log("from history", data);
    setMatchHistory(data.history || []);

  };

  useEffect(()=>{
    
    
  },[selectedGame])


  useEffect(() => {
    if (!socketInstance) return;
    const event1 = "matchTimerTick";
    const event2  = "last10History"
    // Clear previous listeners
    socketInstance.off(event1, onTick);
    socketInstance.off(event2, onHistory);
    // Register new listener
    socketInstance.on(event1, onTick);
    socketInstance.on(event2, onHistory);
    console.log("Listening for matchTimerTick in", selectedGame);
    console.log("Listening for last10History in", selectedGame);
    return () => {
      socketInstance.off(event1, onTick);
      socketInstance.off(event2, onHistory);
    };
  }, [selectedGame, socketInstance]);

  



  const handleGameOnclick = function (game) {
    setPreviousSelectedGame(selectedGame);
    setSelectedGame(game);
  };

  const handleWinnerSelect = (winner) => {
    console.log(`Setting current round winner to: ${winner}`);
    // Add your logic here
  };

  const handleSetPredefinedOutcome = async () => {
    console.log(`Setting winner ${selectedWinner} for round ${roundId}`);
    if(selectedWinner === "selectedWinner") return 
    if(!clans.includes(selectedWinner)){
      console.log("wrong winner selected")
      return 
    }
    await setSelectedFixedWinner(selectedWinner, matchInfo.matchUuid);
  };

  const recentRounds = [
    "D",
    "T",
    "T",
    "D",
    "D",
    "T",
    "D",
    "T",
    "T",
    "T",
    "D",
    "T",
    "D",
    "D",
    "T",
    "T",
    "T",
    "D",
    "T",
    "D",
  ];



const getRoundColor = (clan, selectedGame) => {
  if (!clan || !selectedGame) return "bg-gray-500"; // default color

  const gameColorMap = clanColors[selectedGame];
  if (!gameColorMap) return "bg-gray-500"; // fallback if game missing

  const normalizedClan = clan.toString().trim().toLowerCase();

  // match key regardless of case
  const foundKey = Object.keys(gameColorMap).find(
    (key) => key.toLowerCase() === normalizedClan
  );

  return foundKey ? gameColorMap[foundKey] : "bg-gray-500";
};


  const getRoundTitle = (result, index) => {
    if (result === "D") return "Dragon Win";
    // Based on your original HTML, the Tie appears at specific positions
    // Adjust this logic based on your actual data
    if (index === 2 || index === 9 || index === 15) return "Tie";
    return "Tiger Win";
  };

  //loading tested
  // useEffect(()=>{
  //   const interval = setTimeout(()=>{
  //   setIsLoading(false);
  //   },5000)

  //   return interval;

  // },[])
  const [currentTime, setCurrentTime] = useState("");

useEffect(() => {
  const updateTime = () => {
    const now = new Date();
    const formatted = now
      .toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/:/g, "-"); // Converts HH:MM:SS → HH-MM-SS

    setCurrentTime(formatted);
  };

  updateTime(); // run immediately
  const interval = setInterval(updateTime, 1000);

  return () => clearInterval(interval);
}, []);


  if (isLoading) return <DashboardSkeleton />;
  return (
    <div className="light">
      <div className="bg-background-light dark:bg-background-dark font-display text-[#E5E5E5] min-h-screen">
        <div className="relative flex min-h-screen w-full flex-col items-center">
          <div className="layout-container flex h-full w-full max-w-7xl grow flex-col p-4 md:p-6 lg:p-8">
            
            {/* Header */}
            <header className="flex w-full items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="size-6 text-primary">
                  <svg
                    fill="none"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_6_535)">
                      <path
                        clipRule="evenodd"
                        d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                        fill="currentColor"
                        fillRule="evenodd"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_6_535">
                        <rect fill="white" height="48" width="48"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <h1 className="text-white text-xl font-bold leading-tight tracking-tight">
                  {selectedGame} Admin
                </h1>
                <button                     
                      className="flex w-[120px] px-3 py-3 items-center justify-center rounded-lg text-base font-bold text-white border-2 transition-all 
                         h-12 border-blue-500 bg-blue-500/20 hover:bg-blue-500/30"                      
                    >
                      {currentTime}
            </button>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="text-sm text-white/70"
                  title={matchInfo.matchUuid}
                >
                  Round ID: {matchInfo.matchUuid}
                </span>
                {/* <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => console.log("History clicked")}
                >
                  <span className="material-symbols-outlined text-base">
                    history
                  </span>
                </button> */}
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .11-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.027 7.027 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 14.31 2h-4.62a.5.5 0 0 0-.49.42l-.36 2.54c-.6.24-1.15.55-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.3 8.48a.5.5 0 0 0 .11.64L4.44 10.7c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.11.64l1.92 3.32c.13.23.4.33.61.22l2.39-.96c.47.39 1.02.7 1.62.94l.36 2.54c.04.24.25.42.49.42h4.62c.24 0 .45-.18.49-.42l.36-2.54c.6-.24 1.15-.55 1.62-.94l2.39.96c.21.11.48.01.61-.22l1.92-3.32a.5.5 0 0 0-.11-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z" />
                  </svg>
                  {/* Add cron */}
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
              {/* game sections */}
              <div className="flex flex-1 flex-row justify-center gap-8 py-8">
                <h1 className="text-2xl text-white">
                  Select the game to continue
                </h1>
                <br></br>
                <div className="mt-2 grid md:grid-cols-5 sm:grid-cols-1 gap-5">
                  {games.map((game, index) => (
                    <button
                      key={index}
                      onClick={() => handleGameOnclick(game)}
                      className={`flex w-[120px] px-3 py-3 items-center justify-center rounded-lg text-base font-bold text-white border-2 transition-all ${
                        selectedGame === game
                          ? "h-12  scale-115  border-green-500 bg-green-500/20 hover:bg-green-500/30"
                          : "h-12 border-blue-500 bg-blue-500/20 hover:bg-blue-500/30"
                      }`}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex w-full max-w-4xl flex-wrap gap-4 md:gap-6">
                {clans.map((clan) => (
                  <div
                    key={clan}
                    className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl border-2 border-transparent bg-white/5 p-6"
                  >
                    <p className="text-base font-medium leading-normal text-white/80 capitalize">
                      {clan} Bets
                    </p>

                    <p className="tracking-light text-3xl font-bold leading-tight text-white">
                      {realBets?.[clan] ?? 0}
                    </p>
                  </div>
                ))}
              </div>

              {/* Timer */}
              <div className="flex w-full max-w-sm flex-col items-center gap-4 py-6">
                <p className="text-sm font-medium uppercase tracking-widest text-white/60">
                  Time Remaining
                </p>
                <div className="flex w-full items-center justify-center gap-4">
                  <div className="flex grow basis-0 flex-col items-stretch gap-2">
                    <div className="flex h-20 grow items-center justify-center rounded-lg bg-white/5 text-4xl font-black">
                      00
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-xs font-normal leading-normal text-white/50">
                        Hours
                      </p>
                    </div>
                  </div>
                  <span className="mb-5 text-4xl font-black text-white/30">
                    :
                  </span>
                  <div className="flex grow basis-0 flex-col items-stretch gap-2">
                    <div className="flex h-20 grow items-center justify-center rounded-lg bg-white/5 text-4xl font-black">
                      00
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-xs font-normal leading-normal text-white/50">
                        Minutes
                      </p>
                    </div>
                  </div>
                  <span className="mb-5 text-4xl font-black text-primary">
                    :
                  </span>
                  <div className="flex grow basis-0 flex-col items-stretch gap-2">
                    <div className="flex h-20 grow items-center justify-center rounded-lg bg-primary/20 text-4xl font-black text-primary">
                      {matchInfo.matchRemainingTime}
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-xs font-normal leading-normal text-white/50">
                        Seconds
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Panels */}
              <div className="grid w-full max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Manual Outcome Control */}
                <div className="flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-bold text-white">
                    Manual Outcome Control
                  </h3>
                  <p className="text-sm text-white/60">
                    Select the winner for the current or next round.
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {clans.map((clan, index) => (
                      /* <button
                      onClick={() => handleWinnerSelect("Dragon")}
                      className="flex h-12 items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-500/20 text-base font-bold text-white transition-all hover:bg-blue-500/30"
                    >
                      Dragon
                    </button> */
                      <button
                        key={index}
                        onClick={() => setFixedWinner(clan)}
                        className={`flex h-12 items-center justify-center rounded-lg border-2  text-base font-bold text-white transition-all  
                        ${
                          fixedWinner === clan
                            // ? "scale-105 border-green-500 bg-green-500/20 hover:bg-green-500/30"
                            ? "border-red-500 bg-red-500/20 hover:bg-red-500/30"
                            : "border-red-500 bg-red-500/20 hover:bg-red-500/30"

                        }`}
                        style={{
                          paddingLeft: "3px",
                          paddingright: "3px",
                        }}
                      >
                        {clan.toUpperCase()}
                      </button>
                      /* <button
                      onClick={() => handleWinnerSelect("Tie")}
                      className="flex h-12 items-center justify-center rounded-lg border-2 border-green-500 bg-green-500/20 text-base font-bold text-white transition-all hover:bg-green-500/30"
                    >
                      Tie
                    </button> */
                    ))}
                  </div>
                </div>

                {/* Set Predefined Outcome */}
                <div className="flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-bold text-white">
                    Set Predefined Outcome
                  </h3>
                  <p className="text-sm text-white/60">
                    Configure winning side for a future game round.
                  </p>
                  <div className="mt-2 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1 border-black">
                      <select
                        className="h-12 w-full appearance-none rounded-lg border-black bg-transparent pl-10 pr-4 text-white placeholder-white/40 focus:border-primary focus:ring-primary"
                        value={selectedWinner}
                        onChange={(e) => setSelectedWinner(e.target.value)}
                      >
                        <option className="bg-background-dark">
                          Select Winner
                        </option>       
                        {clans.map((clan, index)=>(
                          <option 
                          key ={index}
                          className="bg-background-dark">{clan}</option>
                        ))
                        }
                      </select>
                    </div>
                  </div>
                  <button
                    disabled={isDisabled}
                    onClick={handleSetPredefinedOutcome}
                    className={`
                      mt-2 flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden 
                      rounded-lg  px-5 text-base font-bold leading-normal tracking-[0.015em] text-white
                      shadow-lg shadow-primary/20 transition-all hover:bg-red-700 active:scale-95 ${!isDisabled ?
                         "bg-primary": "bg-[#941515]"}`}
                  > 
                    <span className="truncate">Set Winning Side</span>
                  </button>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/80">
                  Recent Rounds
                </h3>
                {/* <a
                  className="text-sm font-medium text-primary/80 hover:text-primary"
                  href="#"
                >
                  View All
                </a> */}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {matchHistory.map((data, index) => (
                  <div
                    key={index}
                    className={`flex h-8 w-8 items-center justify-center rounded-full 
                      ${getRoundColor(data.winnerClan, selectedGame)}
                       text-sm font-bold text-white shadow-inner shadow-black/20`}
                    title={`${data.winnerClan} winner`}
                  >
                    {data.winnerClan.trim().charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </footer>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <Modal
          onClose={() => {
            console.log("onclose clicked", isMenuOpen);
            setIsMenuOpen(false)
          }}
          onSubmit={
            async (payload) => {
            try {
              console.log(payload);
              setSelectedFixedTimedWinner(payload);
            } catch (err) {
              toast.error("Create failed");
              // window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
};

export default DragonTigerAdminDashboard;
