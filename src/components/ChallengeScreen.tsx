import React, { useState } from "react";
import { submitChallenge } from "../services/GameService";

interface ChallengeScreenProps {
  gameId: string;
  playerId: string;
}

const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  gameId,
  playerId,
}) => {
  const [challenge, setChallenge] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!challenge.trim()) {
      setError("Please enter a work challenge");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitChallenge(gameId, playerId, challenge);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit challenge. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="challenge-screen">
        <h2>Challenge Submitted!</h2>
        <p>Waiting for other players to submit their challenges...</p>
        <div className="submitted-challenge">
          <h3>Your Challenge:</h3>
          <p>"{challenge}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-screen">
      <h2>Submit a Work Challenge</h2>
      <p className="instruction">
        Share a REAL challenging or ridiculous situation you've faced at work.
        Other players will try to guess if it's real or fake!
      </p>

      <div className="form-group">
        <label htmlFor="challenge">Your Work Challenge:</label>
        <textarea
          id="challenge"
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          placeholder="Example: Had to rebuild an entire website because the client changed their mind about the font..."
          rows={4}
          disabled={isSubmitting}
        />
        <p className="char-count">{challenge.length}/200 characters</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !challenge.trim()}
        className="primary-button"
      >
        {isSubmitting ? "Submitting..." : "Submit Challenge"}
      </button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ChallengeScreen;
