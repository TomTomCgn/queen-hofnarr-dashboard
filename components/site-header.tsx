import Link from "next/link";
import { LogOutIcon } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="bg-background/90 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
        <Link href="/" className="flex items-center gap-1.5 font-semibold">
          <span aria-hidden>👑🃏</span>
          <span>Queen &amp; Hofnarr</span>
        </Link>
        <form action={logout} className="ml-auto sm:order-last">
          <Button type="submit" variant="ghost" size="sm">
            <LogOutIcon />
            <span>Abmelden</span>
          </Button>
        </form>
        <MainNav />
      </div>
    </header>
  );
}
