"use client";
import { Button } from "@components/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <section>
        <h1 className="text-4xl font-bold">Welcome to Tiffin Ledger</h1>
        <p className="text-lg">Please sign in to continue 👉 <span>
          <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
        </span></p>
      </section>
      <section>

      </section>
    </div>
  );
}