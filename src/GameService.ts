import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { generateFakeChallenges } from "../utils/challengeUtils";

export interface Player {
  id: string;
  name: string;
  challenge?: string;
  guesses?: Record<string, boolean>; // challengeId -> isReal guess
  score?: number;
}

export interface Challenge {
  id: string;
  text: string;
  playerId?: string; // If null, it's a fake challenge
  isReal: boolean;
}

export interface Game {
  id: string;
  hostId: string;
  players: Player[];
  status: "waiting" | "submitting" | "guessing" | "results";
  challenges?: Challenge[];
  created: Date;
}

// Generate a random 5-letter code
export const generateGameCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const createGame = async (hostName: string): Promise<Game> => {
  const playerId = crypto.randomUUID();
  const gameId = generateGameCode();

  const gameRef = doc(db, "games", gameId);

  const newGame: Game = {
    id: gameId,
    hostId: playerId,
    players: [
      {
        id: playerId,
        name: hostName,
      },
    ],
    status: "waiting",
    created: new Date(),
  };

  await setDoc(gameRef, newGame);
  return newGame;
};

export const joinGame = async (
  gameId: string,
  playerName: string
): Promise<{ game: Game; playerId: string }> => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    throw new Error("Game not found");
  }

  const game = gameDoc.data() as Game;

  if (game.status !== "waiting") {
    throw new Error("Cannot join game in progress");
  }

  const playerId = crypto.randomUUID();
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
  };

  await updateDoc(gameRef, {
    players: arrayUnion(newPlayer),
  });

  return { game, playerId };
};

export const submitChallenge = async (
  gameId: string,
  playerId: string,
  challenge: string
): Promise<void> => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    throw new Error("Game not found");
  }

  const game = gameDoc.data() as Game;
  const playerIndex = game.players.findIndex((p) => p.id === playerId);

  if (playerIndex === -1) {
    throw new Error("Player not found in game");
  }

  // Update the player's challenge
  const updatedPlayers = [...game.players];
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    challenge,
  };

  await updateDoc(gameRef, {
    players: updatedPlayers,
  });

  // Check if all players have submitted
  const allSubmitted = updatedPlayers.every((p) => p.challenge);

  if (allSubmitted) {
    // Create challenge list
    const realChallenges: Challenge[] = updatedPlayers.map((player) => ({
      id: player.id,
      text: player.challenge!,
      playerId: player.id,
      isReal: true,
    }));

    // Generate fake challenges (same number as real ones)
    const fakeChallenges = generateFakeChallenges(realChallenges.length);

    // Combine and shuffle
    const allChallenges = [...realChallenges, ...fakeChallenges].sort(
      () => Math.random() - 0.5
    );

    await updateDoc(gameRef, {
      status: "guessing",
      challenges: allChallenges,
    });
  }
};

export const submitGuesses = async (
  gameId: string,
  playerId: string,
  guesses: Record<string, boolean>
): Promise<void> => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    throw new Error("Game not found");
  }

  const game = gameDoc.data() as Game;
  const playerIndex = game.players.findIndex((p) => p.id === playerId);

  if (playerIndex === -1) {
    throw new Error("Player not found in game");
  }

  // Calculate score
  let score = 0;
  for (const [challengeId, isRealGuess] of Object.entries(guesses)) {
    const challenge = game.challenges?.find((c) => c.id === challengeId);
    if (challenge && challenge.isReal === isRealGuess) {
      score++;
    }
  }

  // Update the player's guesses and score
  const updatedPlayers = [...game.players];
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    guesses,
    score,
  };

  await updateDoc(gameRef, {
    players: updatedPlayers,
  });

  // Check if all players have submitted guesses
  const allGuessed = updatedPlayers.every((p) => p.guesses);

  if (allGuessed) {
    await updateDoc(gameRef, {
      status: "results",
    });
  }
};

export const listenToGame = (
  gameId: string,
  callback: (game: Game) => void
): (() => void) => {
  const gameRef = doc(db, "games", gameId);

  return onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      const game = doc.data() as Game;
      callback(game);
    }
  });
};

export const getGame = async (gameId: string): Promise<Game | null> => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    return null;
  }

  return gameDoc.data() as Game;
};
