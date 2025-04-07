import React from "react";

interface GameCodeDisplayProps {
  gameId: string;
  playerCount: number;
}

const GameCodeDisplay: React.FC<GameCodeDisplayProps> = ({
  gameId,
  playerCount,
}) => {
  return (
    <div className="game-code-display">
      <h2>Game Code</h2>
      <div className="code-box">{gameId}</div>
      <p className="players-count">
        {playerCount} player{playerCount !== 1 ? "s" : ""} in lobby
      </p>
      <p className="share-instruction">
        Share this code with friends to join the game
      </p>
    </div>
  );
};

export default GameCodeDisplay;
