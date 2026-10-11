"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { createEvent, deleteEvent, updateEvent } from "@/app/actions/events";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatTimestamp } from "@/lib/dates";
import { filterEvents, sortEvents, type EventFilter } from "@/lib/events";
import { PERSONS, type Person } from "@/lib/params";
import type { EventItem } from "@/lib/types";
import { useRealtimeTable } from "@/lib/use-realtime";
import { cn } from "@/lib/utils";
import { createEventSchema, eventTitleSchema, type CreateEventInput } from "@/lib/validation";

const FILTERS: { value: EventFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "open", label: "Offen" },
  { value: "done", label: "Erledigt" },
];

function PersonSelect({
  value,
  onChange,
  ...props
}: { value: Person; onChange: (v: Person) => void } & Omit<React.ComponentProps<"select">, "value" | "onChange">) {
  return (
    <NativeSelect value={value} onChange={(e) => onChange(e.target.value as Person)} {...props}>
      <option value="queen">{PERSONS.queen.emoji} Queen</option>
      <option value="hofnarr">{PERSONS.hofnarr.emoji} Hofnarr</option>
    </NativeSelect>
  );
}

function NewEventForm({ onCreated }: { onCreated: (event: EventItem) => void }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema) as Resolver<CreateEventInput>,
    defaultValues: { title: "", created_by: "queen" },
  });
  const createdBy = form.watch("created_by");

  function onSubmit(values: CreateEventInput) {
    startTransition(async () => {
      const result = await createEvent(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onCreated(result.data);
      form.reset({ title: "", created_by: values.created_by });
      toast.success("Event angelegt.");
    });
  }

  const error = form.formState.errors.title?.message;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Neues Event …"
          aria-label="Eventbezeichnung"
          maxLength={200}
          aria-invalid={Boolean(error)}
          className="sm:flex-1"
          {...form.register("title")}
        />
        <div className="flex gap-2">
          <PersonSelect
            aria-label="Erfasst durch"
            value={createdBy}
            onChange={(v) => form.setValue("created_by", v)}
            className="sm:w-36"
          />
          <Button type="submit" disabled={pending} className="h-10 shrink-0">
            <PlusIcon />
            Hinzufügen
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </form>
  );
}

function EventRow({
  event,
  onChange,
  onDeleted,
}: {
  event: EventItem;
  onChange: (next: EventItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [, startTransition] = useTransition();

  // Externe Änderungen (Realtime) übernehmen, solange nicht gerade getippt wird
  if (!editingTitle && title !== event.title) setTitle(event.title);

  function save(changes: Partial<Pick<EventItem, "title" | "created_by" | "done">>) {
    const previous = event;
    onChange({ ...event, ...changes });
    startTransition(async () => {
      const result = await updateEvent({ id: event.id, ...changes });
      if (!result.ok) {
        toast.error(result.error);
        onChange(previous);
        return;
      }
      onChange(result.data);
    });
  }

  function commitTitle() {
    setEditingTitle(false);
    const parsed = eventTitleSchema.safeParse(title);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      setTitle(event.title);
      return;
    }
    if (parsed.data !== event.title) save({ title: parsed.data });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteEvent(event.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onDeleted(event.id);
      toast.success("Event gelöscht.");
    });
  }

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center" data-testid="event-row">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Checkbox
          checked={event.done}
          onCheckedChange={(checked) => save({ done: checked === true })}
          aria-label={event.done ? "Als offen markieren" : "Als erledigt markieren"}
        />
        <Input
          value={title}
          maxLength={200}
          aria-label="Eventbezeichnung bearbeiten"
          onFocus={() => setEditingTitle(true)}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setTitle(event.title);
              setEditingTitle(false);
              requestAnimationFrame(() => (e.target as HTMLInputElement).blur());
            }
          }}
          className={cn(
            "h-9 border-transparent shadow-none hover:border-input focus-visible:border-ring dark:bg-transparent",
            event.done && "text-muted-foreground line-through",
          )}
        />
      </div>
      <div className="flex items-center gap-2 pl-8 sm:pl-0">
        <PersonSelect
          aria-label="Erfasst durch"
          value={event.created_by}
          onChange={(v) => save({ created_by: v })}
          className="h-9 w-32"
        />
        <span className="text-muted-foreground w-20 text-xs tabular-nums" title="Erstellt am">
          {formatTimestamp(event.created_at)}
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Event löschen" className="ml-auto sm:ml-0">
              <Trash2Icon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Event löschen?</AlertDialogTitle>
              <AlertDialogDescription>„{event.title}“ wird endgültig gelöscht.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

export function EventList({ initialEvents }: { initialEvents: EventItem[] }) {
  const [events, setEvents] = useRealtimeTable<EventItem>("events", initialEvents);
  const [filter, setFilter] = useState<EventFilter>("all");

  const visible = useMemo(() => sortEvents(filterEvents(events, filter)), [events, filter]);
  const openCount = events.filter((e) => !e.done).length;

  function upsert(next: EventItem) {
    setEvents((current) =>
      current.some((e) => e.id === next.id) ? current.map((e) => (e.id === next.id ? next : e)) : [...current, next],
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-muted-foreground text-sm">
            {openCount} offen · {events.length - openCount} erledigt
          </p>
        </div>
        <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as EventFilter)} aria-label="Filter">
          {FILTERS.map((f) => (
            <ToggleGroupItem key={f.value} value={f.value}>
              {f.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Card className="py-4">
        <CardContent className="grid gap-2">
          <NewEventForm onCreated={upsert} />
          {visible.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {events.length === 0 ? "Noch keine Events – leg oben das erste an." : "Keine Events in diesem Filter."}
            </p>
          ) : (
            <ul className="divide-y">
              {visible.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onChange={upsert}
                  onDeleted={(id) => setEvents((current) => current.filter((e) => e.id !== id))}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
