import { Challenge } from "../services/GameService";

// Fake work challenges to use when needed
const fakeChallengeTexts = [
  "Had to use my desk phone as a paperweight for 3 days when the AC broke",
  "Boss asked me to translate our entire website into Klingon",
  "Spent 4 hours manually renaming files because the client wanted them 'more professional'",
  "Had to explain to my manager why we can't just 'add AI' to the coffee machine",
  "Client requested we make their logo 'pop more' 17 times in one project",
  "Debugged an issue for 2 days only to discover someone unplugged the server",
  "Had to create a PowerPoint presentation about why PowerPoint presentations are ineffective",
  "CEO asked me to make the database 'more secure' by changing all passwords to the company name",
  "Client wanted their website to play music automatically 'like MySpace'",
  "Had to attend a 3-hour meeting about reducing meeting times",
  "Manager wanted me to create a 'pivot to blockchain' strategy overnight",
  "Received a bug report that said only 'it's broken' with no other details",
  "Had to explain why we can't just 'download more server space'",
  "Client asked for a website that 'works like Amazon but better' with a $500 budget",
  "Spent a week implementing a feature that was removed the day after launch",
  "Manager insisted all code comments should be written in haiku format",
  "Had to create documentation for software that was already deprecated",
  "Required to use company's custom programming language that only one person understood",
  "Asked to make mobile app compatible with a Nokia phone from 2002",
  "Told to optimize website load time while adding 15 tracking scripts",
];

export const generateFakeChallenges = (count: number): Challenge[] => {
  // Shuffle the fake challenge texts
  const shuffled = [...fakeChallengeTexts].sort(() => 0.5 - Math.random());

  // Take as many as needed
  return shuffled.slice(0, count).map((text, index) => ({
    id: `fake-${index}`,
    text,
    isReal: false,
  }));
};
