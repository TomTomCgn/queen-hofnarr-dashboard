import { SiteHeader } from "@/components/site-header";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">{children}</main>
    </>
  );
}
