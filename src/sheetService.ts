import axios from "axios";

// Your Sheet.best API URL
const API_URL =
  "https://api.sheetbest.com/sheets/c033f754-2838-4c1c-8401-645bfce2bb84";

// Add a new player to the sheet
export const addPlayer = async (player: {
  game_code: string;
  player_name: string;
}) => {
  return axios.post(API_URL, player);
};

// Get all players in a specific game
export const getPlayers = async (game_code: string) => {
  const response = await axios.get(`${API_URL}?game_code=${game_code}`);
  return response.data;
};

// Submit a challenge for a player
export const submitChallenge = async (player: {
  game_code: string;
  player_name: string;
  challenge: string;
}) => {
  return axios.post(API_URL, player);
};

export const updatePlayerScore = async (
  playerName: string,
  gameCode: string,
  score: number
) => {
  try {
    await axios.post("/updateScore", {
      player_name: playerName,
      game_code: gameCode,
      score,
    });
  } catch (error) {
    console.error("Error updating player score:", error);
  }
};
