"use client";

import { useEffect, useState } from "react";

import { getBrowserSupabase } from "@/lib/supabase/browser";

type WithId = { id: string };

/**
 * Hält eine Tabelle per Supabase Realtime aktuell: Inserts/Updates werden
 * per `id` eingepflegt, Deletes entfernt. `initial` kommt vom Server.
 */
export function useRealtimeTable<T extends WithId>(table: string, initial: T[]): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [rows, setRows] = useState<T[]>(initial);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  useEffect(() => {
    let supabase;
    try {
      supabase = getBrowserSupabase();
    } catch (error) {
      console.error(error);
      return;
    }
    const channel = supabase
      .channel(`realtime:${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as Partial<T>).id;
          setRows((current) => current.filter((row) => row.id !== id));
          return;
        }
        const record = payload.new as T;
        setRows((current) => {
          const index = current.findIndex((row) => row.id === record.id);
          if (index === -1) return [...current, record];
          const next = current.slice();
          next[index] = { ...current[index], ...record };
          return next;
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table]);

  return [rows, setRows];
}
