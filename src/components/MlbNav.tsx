'use client';

import Image from 'next/image';
import Link from 'next/link';

const BADGER_HOME = 'https://badger-bets.com';
const FIGHT_URL = 'https://fight.badger-bets.com';
const TRAX_URL = 'https://trax.badger-bets.com';

export function MlbNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/badger-logo.png"
            alt="Badger"
            width={28}
            height={28}
            className="rounded-sm"
            priority
          />
          <span className="font-display tracking-[0.18em] text-sm text-foreground/90 group-hover:text-primary transition-colors hidden sm:inline">
            BADGER
          </span>
          <span className="text-muted-foreground/50 hidden sm:inline">/</span>
          <span className="font-display tracking-[0.18em] text-sm text-primary">MLB</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-5 text-sm">
          <a
            href={FIGHT_URL}
            className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="font-display tracking-[0.15em] text-xs">FIGHT</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={TRAX_URL}
            className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="font-display tracking-[0.15em] text-xs">TRAX</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={BADGER_HOME}
            className="text-muted-foreground hover:text-primary transition-colors text-xs uppercase tracking-wider"
          >
            ← Badger
          </a>
        </nav>
      </div>
    </header>
  );
}
