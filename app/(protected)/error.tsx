"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Da ist etwas schiefgelaufen</CardTitle>
        <CardDescription>Die Daten konnten gerade nicht geladen werden.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={reset}>Erneut versuchen</Button>
      </CardContent>
    </Card>
  );
}
