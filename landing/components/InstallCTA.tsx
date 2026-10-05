'use client';

import Image from 'next/image';
import { GooglePlayLogo, Globe, DeviceMobile } from '@phosphor-icons/react';

const PLAY = 'https://play.google.com/store/apps/details?id=com.modogym.app';
const WEB_APP = process.env.NEXT_PUBLIC_APP_URL || PLAY;

export default function InstallCTA() {
  return (
    <section id="instalar" className="relative mx-auto max-w-6xl px-5 py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] glass p-8 sm:p-12">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-modo-orange/30 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-modo-purple/30 blur-[90px]" />

        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-modo-orange">INSTALAR</p>
            <h2 className="font-display text-4xl font-black sm:text-5xl">
              Llevá MODO GYM <span className="text-gradient">a tu teléfono</span>
            </h2>
            <p className="mt-4 max-w-lg text-white/60">
              Descargala en Google Play o instalala como <strong className="text-white">app web (PWA)</strong> en
              Android, iPhone o PC — sin tiendas ni esperas.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={PLAY}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-orange flex items-center gap-3 rounded-2xl bg-gradient-to-r from-modo-orange to-modo-red px-6 py-4 font-bold transition hover:scale-[1.03]"
              >
                <GooglePlayLogo size={24} weight="fill" />
                Play Store
              </a>
              <a
                href={WEB_APP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl glass px-6 py-4 font-bold transition hover:scale-[1.03]"
              >
                <Globe size={24} weight="bold" className="text-modo-cyan" />
                Abrir app web
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
              <DeviceMobile size={16} />
              En iPhone: Safari → Compartir → “Añadir a pantalla de inicio”.
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative h-64 w-64 sm:h-72 sm:w-72">
              <Image
                src="/icons/icon-maskable-512.png"
                alt="MODO GYM"
                fill
                className="floaty rounded-[2rem] bg-white object-contain p-6 shadow-2xl"
                sizes="288px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
