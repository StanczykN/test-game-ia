import React, { useState } from "react";
import { Challenge, submitGuesses } from "../services/GameService";

interface GamePlayScreenProps {
  gameId: string;
  playerId: string;
  challenges: Challenge[];
  playerNames: Record<string, string>;
}

const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  gameId,
  playerId,
  challenges,
  playerNames,
}) => {
  const [guesses, setGuesses] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGuessChange = (challengeId: string, isReal: boolean) => {
    setGuesses((prev) => ({
      ...prev,
      [challengeId]: isReal,
    }));
  };

  const handleSubmit = async () => {
    // Check if all challenges have been guessed
    const allGuessed = challenges.every(
      (challenge) =>
        challenge.playerId === playerId || guesses[challenge.id] !== undefined
    );

    if (!allGuessed) {
      setError("Please guess for all challenges");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitGuesses(gameId, playerId, guesses);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit guesses. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="game-play-screen">
        <h2>Guesses Submitted!</h2>
        <p>Waiting for other players to submit their guesses...</p>
      </div>
    );
  }

  return (
    <div className="game-play-screen">
      <h2>Real or Fake?</h2>
      <p className="instruction">
        For each challenge, guess whether it's a real experience someone had or
        a fake one!
      </p>

      <div className="challenges-list">
        {challenges.map((challenge) => {
          // Skip challenges created by the current player
          const isOwnChallenge = challenge.playerId === playerId;

          if (isOwnChallenge) {
            return (
              <div key={challenge.id} className="challenge-card own-challenge">
                <p className="challenge-text">"{challenge.text}"</p>
                <div className="challenge-status">
                  <em>This is your challenge - no need to guess</em>
                </div>
              </div>
            );
          }

          return (
            <div key={challenge.id} className="challenge-card">
              <p className="challenge-text">"{challenge.text}"</p>
              <div className="guess-buttons">
                <button
                  className={guesses[challenge.id] === true ? "selected" : ""}
                  onClick={() => handleGuessChange(challenge.id, true)}
                  disabled={isSubmitting}
                >
                  Real ✓
                </button>
                <button
                  className={guesses[challenge.id] === false ? "selected" : ""}
                  onClick={() => handleGuessChange(challenge.id, false)}
                  disabled={isSubmitting}
                >
                  Fake ✗
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="primary-button"
      >
        {isSubmitting ? "Submitting..." : "Submit Guesses"}
      </button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default GamePlayScreen;
