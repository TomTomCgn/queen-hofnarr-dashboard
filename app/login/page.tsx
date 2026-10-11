import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Anmelden · Queen & Hofnarr" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl" aria-hidden>
            👑🃏
          </div>
          <CardTitle className="text-xl">Queen &amp; Hofnarr</CardTitle>
          <CardDescription>Bitte mit dem gemeinsamen Passwort anmelden.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next ?? "/"} />
        </CardContent>
      </Card>
    </main>
  );
}
