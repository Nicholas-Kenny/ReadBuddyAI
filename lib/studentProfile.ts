export const INTEREST_CATEGORIES = [
  {
    title: "Folklore & Legends",
    emoji: "🐉",
    description: "ASEAN folklore & legends",
  },
  {
    title: "Nature & Mangroves",
    emoji: "🌿",
    description: "Coastal nature & conservation",
  },
  {
    title: "Marine Life & Islands",
    emoji: "🌊",
    description: "Coral reefs & island ecosystems",
  },
  {
    title: "Science & Wildlife",
    emoji: "🔬",
    description: "Science & wildlife exploration",
  },
] as const;

export const GRADE_LEVELS = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"];

export type ActivityKey = "oralReading" | "c1" | "c2" | "c3" | "c4";

export type ActivityPlan = Record<ActivityKey, boolean>;

export const EMPTY_ACTIVITY_PLAN: ActivityPlan = {
  oralReading: false,
  c1: false,
  c2: false,
  c3: false,
  c4: false,
};

export const FULL_ACTIVITY_PLAN: ActivityPlan = {
  oralReading: true,
  c1: true,
  c2: true,
  c3: true,
  c4: true,
};

export function normalizeActivityPlan(value: unknown): ActivityPlan {
  if (!value || typeof value !== "object") return EMPTY_ACTIVITY_PLAN;
  const plan = value as Partial<ActivityPlan>;
  return {
    oralReading: Boolean(plan.oralReading),
    c1: Boolean(plan.c1),
    c2: Boolean(plan.c2),
    c3: Boolean(plan.c3),
    c4: Boolean(plan.c4),
  };
}

export function activityCount(value: unknown) {
  return Object.values(normalizeActivityPlan(value)).filter(Boolean).length;
}
