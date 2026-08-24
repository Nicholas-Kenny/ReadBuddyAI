export interface BloomOption {
  id: string;
  text: string;
  emojiFallback: string;
  bgColor: string;
  score: number;
}

export interface C2MatchPair {
  id: string;
  causeText: string;
  causeEmoji: string;
  effectText: string;
  effectEmoji: string;
  weight: number;
}

export interface StoryQuest {
  id: string;
  grade: string;
  title: string;
  origin: string;
  passageText: string;
  wordCount: number;
  c1: { weight: 15; prompt: string; options: BloomOption[] };
  c2: { weight: 25; prompt: string; pairs: C2MatchPair[] };
  c3: { weight: 30; scenario: string; options: BloomOption[] };
  c4: { weight: 30; scenario: string; options: BloomOption[] };
}

export const VIETNAM_MANGROVE_QUEST: StoryQuest = {
  id: "vn_mangrove_g2",
  grade: "Grade 2",
  title: "Minh and the Muddy Mangrove",
  origin: "Can Gio, Vietnam 🇻🇳",
  passageText:
    "Minh and his classmates visited the coastal river in Can Gio. The salty tide was low, and the soft mud was deep. The teacher handed each child a small green mangrove sapling. Minh carefully placed the young roots into the wet soil to protect the village from big storm waves. Suddenly, a tiny mudskipper fish jumped near his boots! Minh laughed and patted the soil firmly around his little tree.",
  wordCount: 78,
  c1: {
    weight: 15,
    prompt:
      "Where did Minh carefully place the roots of the young mangrove sapling?",
    options: [
      {
        id: "c1_1",
        text: "Into the wet coastal mud by the river",
        emojiFallback: "🌱",
        bgColor: "from-emerald-100 to-teal-50",
        score: 15,
      },
      {
        id: "c1_2",
        text: "On top of a dry mountain rock",
        emojiFallback: "🪨",
        bgColor: "from-slate-100 to-slate-200",
        score: 0,
      },
      {
        id: "c1_3",
        text: "Inside a plastic bucket in class",
        emojiFallback: "🪣",
        bgColor: "from-sky-100 to-blue-50",
        score: 0,
      },
    ],
  },
  c2: {
    weight: 25,
    prompt: "Match each story Action to its resulting Outcome:",
    pairs: [
      {
        id: "p1",
        causeText: "Planting deep mangrove roots in mud",
        causeEmoji: "🌱",
        effectText: "Protects the village from storm waves",
        effectEmoji: "🌊",
        weight: 12.5,
      },
      {
        id: "p2",
        causeText: "A tiny mudskipper jumped near his boots",
        causeEmoji: "🐟",
        effectText: "Made Minh laugh and pat the soil happily",
        effectEmoji: "😄",
        weight: 12.5,
      },
    ],
  },
  c3: {
    weight: 30,
    scenario:
      "How can you and your friends practice caring for the environment at your school?",
    options: [
      {
        id: "c3_1",
        text: "Join together to plant trees and clean up litter",
        emojiFallback: "🌳",
        bgColor: "from-emerald-100 to-teal-50",
        score: 30,
      },
      {
        id: "c3_2",
        text: "Pick up rubbish only when the teacher is looking",
        emojiFallback: "👀",
        bgColor: "from-amber-100 to-orange-50",
        score: 15,
      },
      {
        id: "c3_3",
        text: "Leave snack wrappers on the playground grass",
        emojiFallback: "🚯",
        bgColor: "from-rose-100 to-red-50",
        score: 0,
      },
    ],
  },
  c4: {
    weight: 30,
    scenario:
      "Why was it crucial for children to wear protective boots while planting in coastal mud?",
    options: [
      {
        id: "c4_1",
        text: "To protect feet from sharp shells, broken wood, and debris",
        emojiFallback: "🥾",
        bgColor: "from-amber-100 to-yellow-50",
        score: 30,
      },
      {
        id: "c4_2",
        text: "Just to keep their socks looking clean and neat",
        emojiFallback: "✨",
        bgColor: "from-purple-100 to-indigo-50",
        score: 15,
      },
      {
        id: "c4_3",
        text: "Because rubber boots make them run faster in deep water",
        emojiFallback: "🏃",
        bgColor: "from-blue-100 to-cyan-50",
        score: 0,
      },
    ],
  },
};
