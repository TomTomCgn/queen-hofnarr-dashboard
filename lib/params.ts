export type Person = "queen" | "hofnarr";

export const QUEEN_FIELDS = ["emotionality", "fool_is_reason"] as const;
export const FOOL_FIELDS = ["joe_annoyance", "topic_variety", "need_for_rest"] as const;

export type QueenField = (typeof QUEEN_FIELDS)[number];
export type FoolField = (typeof FOOL_FIELDS)[number];
export type ParamKey = QueenField | FoolField;

export const PARAM_LABELS: Record<ParamKey, string> = {
  emotionality: "Emotionalität",
  fool_is_reason: "„Grund ist der Hofnarr“",
  joe_annoyance: "Joe-Genervtheit",
  topic_variety: "Themenvielfalt",
  need_for_rest: "Ruhebedarf",
};

/** Beschriftungen in den Erfassungsmasken */
export const FORM_LABELS: Record<ParamKey, string> = {
  emotionality: "Grad Emotionalität",
  fool_is_reason: "Grad „Grund ist der Hofnarr“",
  joe_annoyance: "Grad der Joe-Genervtheit",
  topic_variety: "Grad der Themenvielfalt",
  need_for_rest: "Grad „Ruhebedarf“",
};

export const PARAM_COLORS: Record<ParamKey, string> = {
  emotionality: "var(--chart-1)",
  fool_is_reason: "var(--chart-2)",
  joe_annoyance: "var(--chart-3)",
  topic_variety: "var(--chart-4)",
  need_for_rest: "var(--chart-5)",
};

/** Zweite Kodierung neben der Farbe (Linienmuster), damit Linien auch ohne Farbsehen unterscheidbar sind. */
export const PARAM_DASH: Record<ParamKey, string | undefined> = {
  emotionality: undefined,
  fool_is_reason: "6 4",
  joe_annoyance: undefined,
  topic_variety: "6 4",
  need_for_rest: "2 3",
};

export const PERSONS: Record<Person, { label: string; emoji: string; table: string; fields: readonly ParamKey[] }> = {
  queen: { label: "Queen", emoji: "👑", table: "queen_entries", fields: QUEEN_FIELDS },
  hofnarr: { label: "Hofnarr", emoji: "🃏", table: "fool_entries", fields: FOOL_FIELDS },
};
