'use client';

import { useState } from 'react';
import Image from 'next/image';
import { List, X, GooglePlayLogo } from '@phosphor-icons/react';

const PLAY = 'https://play.google.com/store/apps/details?id=com.modogym.app';

const LINKS = [
  { href: '#funciones', label: 'Funciones' },
  { href: '#app', label: 'La App' },
  { href: '#instalar', label: 'Instalar' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl glass px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <Image src="/icons/icon-192.png" alt="MODO GYM" width={40} height={40} className="rounded-xl bg-white" />
          <div className="leading-tight">
            <p className="font-display text-lg font-black tracking-wide">MODO GYM</p>
            <p className="text-[10px] font-semibold tracking-widest text-white/50">MENTE + CORAZÓN + FUERZA</p>
          </div>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-white/70 transition hover:text-white">
              {l.label}
            </a>
          ))}
          <a
            href={PLAY}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-modo-orange to-modo-red px-4 py-2 text-sm font-bold shadow-lg transition hover:scale-[1.03]"
          >
            <GooglePlayLogo size={18} weight="fill" />
            Descargar
          </a>
        </div>

        <button
          aria-label="Menú"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-white md:hidden"
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl glass p-4 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-white/80"
            >
              {l.label}
            </a>
          ))}
          <a
            href={PLAY}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-modo-orange to-modo-red px-4 py-3 text-sm font-bold"
          >
            <GooglePlayLogo size={18} weight="fill" />
            Descargar en Play Store
          </a>
        </div>
      )}
    </header>
  );
}
