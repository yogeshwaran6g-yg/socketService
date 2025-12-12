import React, { useState } from "react";
import { toast } from "react-toastify";

const GAME_CLANS = {
  TigerDragon: ["tiger", "dragon", "tie"],
  AndarBahar: ["andar", "bahar"],
  "7Up7Down": ["lessThan7", "equalTo7", "moreThan7"],
  JhandiMunda: ["fig1", "fig2", "fig3", "fig4", "fig5", "fig6"],
  CarRoulette: [
    "ferrari",
    "lamborghini",
    "porsche",
    "mercedes",
    "bmw",
    "audi",
    "mahindra",
    "tataMotors",
  ],
};

const CreateCronModal = ({ onClose, onSubmit }) => {
  const [newJob, setNewJob] = useState({
    game_name: "TigerDragon",
    execute_at: "",
    total_matches: 1,
  });

  const [tempClanArray, setTempClanArray] = useState([]);
  const [selectedClan, setSelectedClan] = useState("");

  const handleAddClan = () => {
    if (!selectedClan || selectedClan === "") {
      toast.error("Select clan first", "warning");
      return;
    }
    setTempClanArray((prev) => [...prev, selectedClan]);
    setSelectedClan("");
  };

  const handleUndo = () => {
    setTempClanArray((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setTempClanArray([]);
  };

  const handleSave = async () => {
    if (tempClanArray.length === 0) {
      toast.error("Add clans first", "error");
      return;
    }

    if (!newJob.execute_at) {
      toast.error("Set execution time", "error");
      return;
    }

    const payload = {
      ...newJob,
      fixed_clan: tempClanArray,
      execute_at: newJob.execute_at.replace("T", " ") + ":00",
    };

    const result = await onSubmit(payload);
    // if (result.sucsess) {
    //   toast.success("cron job added succesfully");
    // } else {
    //   toast.error(result?.message || `unable to add cron job`);
    // }
  };

  const handleClose=()=>{
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 backdrop-blur  flex items-center justify-center z-40 p-4">
        <div className="bg-white/5 text-white max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-white/20 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Create Cron Job</h2>
            <p className="text-blue-100 text-sm mt-1">
              Schedule automated game results
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Game Selector */}
            <div>
              <label className="block text-sm font-semibold text-white-700 mb-2">
                Game Name
              </label>
              <select
                value={newJob.game_name}
                className="w-full border-2 border-black/5 px-4 py-2.5 rounded-lg focus:border-grey-500 focus:outline-none transition-colors bg-white/10 text-white"
                onChange={(e) => {
                  setNewJob((p) => ({ ...p, game_name: e.target.value }));
                  setTempClanArray([]);
                  setSelectedClan("");
                }}
             
              >
                {Object.keys(GAME_CLANS).map((game) => (
                  <option key={game} value={game}
                  className="bg-white/10 text-white" 
                    style={{
                      backgroundColor: "rgba(226, 25, 25, 0.1)",
                      color: "black" 
                    }}
    
                  >
                    {game}
                  </option>
                ))}
              </select>
            </div>

            {/* Clan Display */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Winning Side Clans Sequence
              </label>
              <div className="bg-white/10 text-white border-gray-200 p-4 rounded-lg min-h-[80px] flex flex-wrap gap-2">
                {tempClanArray.length ? (
                  tempClanArray.map((clan, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                        {i + 1}. {clan}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 italic self-center mx-auto">
                    No clans added yet
                  </span>
                )}
              </div>
            </div>

            {/* Clan Controls */}
            <div className="flex gap-2">
              <select
                value={selectedClan}
                className=" border-gray-300 px-4 py-2.5 rounded-lg flex-1 focus:border-blue-500 focus:outline-none transition-colors bg-white/10 text-white"
                onChange={(e) => setSelectedClan(e.target.value)}
              >
                <option value="">Select Clan</option>
                {GAME_CLANS[newJob.game_name].map((clan) => (
                  <option key={clan} value={clan}
                    style={{
                      backgroundColor: "rgba(226, 25, 25, 0.1)",
                      color: "black" 
                    }}
    
                  >
                    {clan}
                  </option>
                ))}
              </select>

            
              <button
                              onClick={handleAddClan}
              className="flex h-12 items-center justify-center rounded-lg border-2  text-base font-bold text-white transition-all  
                            border-blue-500 bg-blue-500/20 hover:bg-blue-500/30 "
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "3px",
                paddingBottom: "3px",
              }}
            >
             
             Add
            </button>

              <button
                              onClick={handleUndo}
              className="flex h-12 items-center justify-center rounded-lg border-2  text-base font-bold text-white transition-all  
                            border-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/30 "
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "3px",
                paddingBottom: "3px",
              }}
            >
             
             Undo
            </button>

              <button
                              onClick={handleClear}
              className="flex h-12 items-center justify-center rounded-lg border-2  text-base font-bold text-white transition-all  
                            border-red-500 bg-red-500/20 hover:bg-red-500/30 "
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "3px",
                paddingBottom: "3px",
              }}
            >
             
             Clear
            </button>

            </div>

            {/* Execute At */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Execute At
              </label>
              <input
                type="datetime-local"
                className="w-full  border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white/10 text-white"
                value={newJob.execute_at}
                onChange={(e) =>
                  setNewJob((p) => ({ ...p, execute_at: e.target.value }))
                }
              />
            </div>

            {/* Total Matches */}
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Matches
              </label>
              <input
                type="number"
                min="1"
                className="w-full border-2 border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-900"
                value={newJob.total_matches}
                onChange={(e) => setNewJob((p) => ({ ...p, total_matches: Number(e.target.value) }))}
              />
            </div> */}
          </div>

          {/* Footer Actions */}
          <div className="bg-white/20 px-6 py-4 flex justify-end gap-3 ">
            <button
              onClick={handleClose}
              className="flex h-12 items-center justify-center rounded-lg border-2  text-base font-bold text-white transition-all  
                            border-red-500 bg-red-500/20 hover:bg-red-500/30 "
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "3px",
                paddingBottom: "3px",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
   style={{
                  paddingRight:"3px"
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex h-12 items-center justify-center rounded-lg border-2  text-base font-bold text-white transition-all  
                            border-green-500 bg-green-500/20 hover:bg-green-500/30"
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "3px",
                paddingBottom: "3px",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  paddingRight:"3px"
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCronModal;
