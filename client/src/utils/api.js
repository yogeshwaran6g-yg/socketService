import axios from "axios";
import { toast } from "react-toastify";

const endPoints ={
    fixedWinner : "http://localhost:4000/api/settings/fixed-winner",
    games: "http://localhost:4000/api/settings/games"
}

export const fetchGames = async (set) => {
      try {
        const res = await axios.get(`${endPoints.games}`);
        return res.data;
      } catch (err) {
        toast.error("Failed to load games");
      }
    };

export const fetchFixedWinnersSettings = async () => {
  try {
    const res = await axios.get(`${endPoints.fixedWinner}`);
    return res.data;
  } catch (err) {
    toast.error("Failed to load fixed winner settings");
    return [];
  }
};

export const updateFixedWinnerSetting = async (data) => {
  try {
    const res = await axios.post(`${endPoints.fixedWinner}`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const toggleFixedWinnerSetting = async (data) => {
  try {
    const res = await axios.post(`${endPoints.fixedWinner}/toggle`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export default fetchGames;