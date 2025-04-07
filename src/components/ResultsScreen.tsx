import React from "react";
import { Challenge, Player } from "../services/GameService";

interface ResultsScreenProps {
  players: Player[];
  challenges: Challenge[];
  playerId: string;
  onPlayAgain: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  players,
  challenges,
  playerId,
  onPlayAgain,
}) => {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  // Find current player's rank
  const currentPlayerRank =
    sortedPlayers.findIndex((p) => p.id === playerId) + 1;

  return (
    <div className="results-screen">
      <h2>Game Results</h2>

      <div className="player-rank">
        {currentPlayerRank === 1 ? (
          <h3>🏆 You won! 🏆</h3>
        ) : (
          <h3>Your Rank: #{currentPlayerRank}</h3>
        )}
        <p>
          You got {players.find((p) => p.id === playerId)?.score || 0} correct
          guesses
        </p>
      </div>

      <div className="leaderboard">
        <h3>Leaderboard</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr
                key={player.id}
                className={player.id === playerId ? "current-player" : ""}
              >
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.score || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="challenge-reveals">
        <h3>Challenge Reveals</h3>
        {challenges.map((challenge) => {
          const challengePlayer = challenge.playerId
            ? players.find((p) => p.id === challenge.playerId)
            : null;

          return (
            <div key={challenge.id} className="challenge-card reveal">
              <p className="challenge-text">"{challenge.text}"</p>
              <div
                className={`challenge-status ${
                  challenge.isReal ? "real" : "fake"
                }`}
              >
                {challenge.isReal ? (
                  <>
                    <span className="status-badge real">REAL</span>
                    <span className="player-name">
                      by {challengePlayer?.name}
                    </span>
                  </>
                ) : (
                  <span className="status-badge fake">FAKE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onPlayAgain} className="primary-button">
        Play Again
      </button>
    </div>
  );
};

export default ResultsScreen;
