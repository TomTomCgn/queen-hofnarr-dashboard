"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Controller, useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";

import { loadEntry, saveEntry, type EntryValues } from "@/app/actions/entries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatDate, todayIso } from "@/lib/dates";
import { FORM_LABELS, PERSONS, type ParamKey, type Person } from "@/lib/params";
import { foolEntrySchema, queenEntrySchema } from "@/lib/validation";

const DEFAULT_LEVEL = 5;
const schemas = { queen: queenEntrySchema, hofnarr: foolEntrySchema } as const;

type FormValues = FieldValues & { entry_date: string };

function toFormValues(fields: readonly ParamKey[], date: string, values: EntryValues | null): FormValues {
  const result: FormValues = { entry_date: date };
  for (const field of fields) result[field] = values?.[field] ?? DEFAULT_LEVEL;
  return result;
}

export function EntryForm({
  person,
  initialDate,
  initialValues,
}: {
  person: Person;
  initialDate: string;
  initialValues: EntryValues | null;
}) {
  const { label, emoji, fields } = PERSONS[person];
  const [exists, setExists] = useState(initialValues !== null);
  const [loadingDate, startLoading] = useTransition();
  const [saving, startSaving] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schemas[person]) as unknown as Resolver<FormValues>,
    defaultValues: toFormValues(fields, initialDate, initialValues),
  });
  const entryDate = form.watch("entry_date");

  function handleDateChange(date: string) {
    form.setValue("entry_date", date, { shouldValidate: true });
    if (!date || date > todayIso()) return;
    startLoading(async () => {
      const result = await loadEntry(person, date);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setExists(result.data !== null);
      form.reset(toFormValues(fields, date, result.data));
    });
  }

  function onSubmit(values: FormValues) {
    startSaving(async () => {
      const result = await saveEntry(person, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setExists(true);
      toast.success(
        result.data.updated
          ? `Werte für den ${formatDate(values.entry_date)} aktualisiert.`
          : `Werte für den ${formatDate(values.entry_date)} gespeichert.`,
        {
          action: (
            <Link href="/" className="ml-auto text-sm font-medium underline underline-offset-4">
              Zum Dashboard
            </Link>
          ),
        },
      );
    });
  }

  const dateError = form.formState.errors.entry_date?.message;

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">
          <span aria-hidden>{emoji}</span> Erfassung {label}
        </CardTitle>
        <CardDescription>Ein Eintrag pro Tag – erneutes Speichern aktualisiert den Tag.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="entry_date">Tagesdatum</Label>
            <Input
              id="entry_date"
              type="date"
              max={todayIso()}
              value={entryDate}
              onChange={(e) => handleDateChange(e.target.value)}
              aria-invalid={Boolean(dateError)}
              className="w-full sm:w-56"
            />
            {dateError ? (
              <p role="alert" className="text-destructive text-sm">
                {String(dateError)}
              </p>
            ) : (
              entryDate && <p className="text-muted-foreground text-xs">{formatDate(entryDate)}</p>
            )}
          </div>

          {exists && !loadingDate && (
            <div
              role="status"
              data-testid="existing-entry-hint"
              className="bg-muted flex items-start gap-2 rounded-md p-3 text-sm"
            >
              <InfoIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                Für den {formatDate(entryDate)} gibt es schon Werte. Sie sind unten geladen; Speichern
                überschreibt sie.
              </span>
            </div>
          )}

          <fieldset disabled={loadingDate} className="grid gap-6 disabled:opacity-60">
            {fields.map((field) => (
              <Controller
                key={field}
                control={form.control}
                name={field}
                render={({ field: f, fieldState }) => (
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between gap-4">
                      <Label id={`${field}-label`}>{FORM_LABELS[field]}</Label>
                      <output
                        data-testid={`${field}-value`}
                        className="bg-primary text-primary-foreground min-w-10 rounded-md px-2 py-1 text-center text-lg font-semibold tabular-nums"
                      >
                        {f.value}
                      </output>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[Number(f.value)]}
                      onValueChange={([v]) => f.onChange(v)}
                      onBlur={f.onBlur}
                      aria-labelledby={`${field}-label`}
                      aria-label={FORM_LABELS[field]}
                    />
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>1</span>
                      <span>10</span>
                    </div>
                    {fieldState.error && (
                      <p role="alert" className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            ))}
          </fieldset>

          <Button type="submit" size="lg" disabled={saving || loadingDate}>
            {saving ? "Speichern …" : exists ? "Werte aktualisieren" : "Speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
