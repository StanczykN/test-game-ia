import React, { useState } from "react";
import { createGame, joinGame } from "../services/GameService";

interface JoinScreenProps {
  onGameJoined: (gameId: string, playerId: string) => void;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ onGameJoined }) => {
  const [playerName, setPlayerName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const game = await createGame(playerName);
      onGameJoined(game.id, game.hostId);
    } catch (err) {
      setError("Failed to create game. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { game, playerId } = await joinGame(
        gameCode.toUpperCase(),
        playerName
      );
      onGameJoined(game.id, playerId);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to join game. Please check the code and try again."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-screen">
      <h1>Real or Fake Work Challenges</h1>

      <div className="form-group">
        <label htmlFor="playerName">Your Name</label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          disabled={isLoading}
        />
      </div>

      <div className="action-buttons">
        <button
          onClick={handleCreateGame}
          disabled={isLoading}
          className="primary-button"
        >
          Create New Game
        </button>

        <div className="divider">or</div>

        <div className="join-section">
          <div className="form-group">
            <label htmlFor="gameCode">Join with Code</label>
            <input
              type="text"
              id="gameCode"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="Enter 5-letter code"
              maxLength={5}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleJoinGame}
            disabled={isLoading}
            className="secondary-button"
          >
            Join Game
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default JoinScreen;
