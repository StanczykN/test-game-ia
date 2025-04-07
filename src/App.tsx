import { useEffect, useState } from "react";
import "./index.css";
import {
  addPlayer,
  getPlayers,
  submitChallenge,
  updatePlayerScore,
} from "./sheetService";

interface Player {
  player_name: string;
  game_code: string;
  challenge?: string;
}

const fakeChallenges = [
  "☕ Our coffee machine keeps breaking down",
  "🎉 Too many team building activities",
  "🖨️ Printer jammed during a client presentation",
  "📅 Meeting about meetings every Monday",
  "🗂️ Someone renamed all the folders on the server",
];

const getChallengeEmoji = (challenge: string): string => {
  const lc = challenge.toLowerCase();
  if (lc.includes("coffee")) return "☕";
  if (lc.includes("printer")) return "🖨️";
  if (lc.includes("meeting")) return "💼";
  if (lc.includes("folders")) return "📂";
  if (lc.includes("team")) return "🤝";
  return "🏢";
};

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function App() {
  const [screen, setScreen] = useState<
    "join" | "lobby" | "challenge" | "waiting" | "play"
  >("join");
  const [name, setName] = useState("");
  const [gameCode] = useState("ABCDE");
  const [players, setPlayers] = useState<Player[]>([]);
  const [challenge, setChallenge] = useState("");
  const [mixedChallenges, setMixedChallenges] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: "real" | "fake" }>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleJoin = async () => {
    if (!name) return alert("Enter a nickname to join");
    await addPlayer({ player_name: name, game_code: gameCode });
    const allPlayers = await getPlayers(gameCode);
    setPlayers(allPlayers);
    setScreen("lobby");
  };

  const handleStartChallenge = () => {
    setScreen("challenge");
  };

  const handleSubmitChallenge = async () => {
    if (!challenge || !name || !gameCode) return;
    const formatted = capitalizeFirst(challenge.trim());
    await submitChallenge({
      player_name: name,
      game_code: gameCode,
      challenge: formatted,
    });
    setScreen("waiting");
  };

  useEffect(() => {
    if (screen !== "waiting") return;

    const interval = setInterval(async () => {
      const updatedPlayers = await getPlayers(gameCode);
      const currentPlayers = updatedPlayers.filter(
        (p) => p.game_code === gameCode
      );
      setPlayers(currentPlayers);

      const allSubmitted = currentPlayers.every(
        (p) => p.challenge && p.challenge.trim().length > 0
      );
      if (allSubmitted) {
        clearInterval(interval);
        const real = [
          ...new Set(
            currentPlayers.map((p) => capitalizeFirst(p.challenge!.trim()))
          ),
        ];
        const mixed = [...real, ...fakeChallenges].sort(
          () => Math.random() - 0.5
        );
        setMixedChallenges(mixed);
        setScreen("play");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [screen, gameCode]);

  const handleSelect = (challenge: string, choice: "real" | "fake") => {
    setAnswers((prev) => ({ ...prev, [challenge]: choice }));
  };

  const handleSubmitAnswers = async () => {
    const realChallenges = players.map((p) =>
      capitalizeFirst(p.challenge!.trim())
    );
    let newScore = 0;
    Object.entries(answers).forEach(([challenge, guess]) => {
      const isReal = realChallenges.includes(challenge);
      if ((isReal && guess === "real") || (!isReal && guess === "fake")) {
        newScore++;
      }
    });
    setScore(newScore);
    setSubmitted(true);

    // Store the score in the Google Spreadsheet
    try {
      await updatePlayerScore(name, gameCode, newScore);
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  return (
    <div className="container">
      <h1>🎓 Innovation Academy Challenge Game!</h1>

      {screen === "join" && (
        <div className="game-area">
          <p>
            🤝 Enter your nickname and join your peers to share real challenges
            you have faced during the Innovation Academy course.
          </p>
          <input
            type="text"
            placeholder="Your Nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p>
            Game Code: <strong>{gameCode}</strong>
          </p>
          <button className="btn btn-block" onClick={handleJoin}>
            Join Game
          </button>
        </div>
      )}

      {screen === "lobby" && (
        <div className="game-area">
          <h2>Ready to share?</h2>
          <p>When everyone is in, click below to start the challenge round.</p>
          <button className="btn btn-block" onClick={handleStartChallenge}>
            Start Challenge Round
          </button>
        </div>
      )}

      {screen === "challenge" && (
        <div className="game-area">
          <h2>
            📝 What’s a challenge you faced during the Innovation Academy
            course?
          </h2>
          <p>
            This will become part of the game — anonymised and mixed with fake
            ones created by AI.
          </p>
          <textarea
            rows={4}
            placeholder="Type your real challenge here..."
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
          />
          <button className="btn btn-block" onClick={handleSubmitChallenge}>
            Submit Challenge
          </button>
        </div>
      )}

      {screen === "waiting" && (
        <div className="game-area">
          <h2>⏳ Waiting for other players to submit their challenges...</h2>
          <p>The game will continue automatically once everyone is ready.</p>
        </div>
      )}

      {screen === "play" && (
        <div className="game-area">
          <h2>🔍 Can You Spot the Real Challenges?</h2>
          <p>
            Some of these are real challenges from your peers, others were
            created by AI. Can you guess which is which?
          </p>
          {!submitted ? (
            <>
              <div className="card-grid">
                {mixedChallenges.map((c, i) => (
                  <div
                    key={i}
                    className={`card ${
                      answers[c] === "real"
                        ? "highlight-real"
                        : answers[c] === "fake"
                        ? "highlight-fake"
                        : ""
                    }`}
                  >
                    <div className="emoji" style={{ fontSize: "3rem" }}>
                      {getChallengeEmoji(c)}
                    </div>
                    <p>{c}</p>
                    <div className="choices">
                      <button
                        className={`btn ${
                          answers[c] === "real" ? "selected" : ""
                        }`}
                        onClick={() => handleSelect(c, "real")}
                      >
                        Real
                      </button>
                      <button
                        className={`btn ${
                          answers[c] === "fake" ? "selected" : ""
                        }`}
                        onClick={() => handleSelect(c, "fake")}
                      >
                        Fake
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-block" onClick={handleSubmitAnswers}>
                Submit Answers
              </button>
            </>
          ) : (
            <div>
              <h3>🎉 Game Over!</h3>
              <p>
                You scored {score} out of {mixedChallenges.length}!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
