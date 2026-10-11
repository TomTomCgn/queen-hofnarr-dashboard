import type { Person } from "@/lib/params";

export type QueenEntry = {
  id: string;
  entry_date: string;
  emotionality: number;
  fool_is_reason: number;
  created_at: string;
  updated_at: string;
};

export type FoolEntry = {
  id: string;
  entry_date: string;
  joe_annoyance: number;
  topic_variety: number;
  need_for_rest: number;
  created_at: string;
  updated_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  created_by: Person;
  done: boolean;
  created_at: string;
  updated_at: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
