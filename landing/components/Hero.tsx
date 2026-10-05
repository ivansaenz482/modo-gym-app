'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GooglePlayLogo, ArrowRight, Star } from '@phosphor-icons/react';

const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

const PLAY = 'https://play.google.com/store/apps/details?id=com.modogym.app';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 lg:grid-cols-2">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold text-white/80"
          >
            <span className="flex h-2 w-2 rounded-full bg-modo-orange" />
            Disponible en Google Play
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl font-black leading-[0.95] sm:text-7xl"
          >
            El poder está
            <br />
            en tu <span className="text-gradient">interior</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-lg text-lg text-white/60"
          >
            MODO GYM combina <strong className="text-white">mente, corazón y fuerza</strong>: rutinas con IA,
            más de 1.300 ejercicios con video, dieta personalizada y seguimiento de tu progreso.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href={PLAY}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-orange flex items-center gap-3 rounded-2xl bg-gradient-to-r from-modo-orange to-modo-red px-6 py-4 font-bold transition hover:scale-[1.03]"
            >
              <GooglePlayLogo size={26} weight="fill" />
              Descargar en Play Store
            </a>
            <a
              href="#instalar"
              className="flex items-center gap-2 rounded-2xl glass px-6 py-4 font-bold text-white/90 transition hover:text-white"
            >
              Instalar app web
              <ArrowRight size={18} weight="bold" />
            </a>
          </motion.div>

          <div className="mt-8 flex items-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Star size={16} weight="fill" className="text-modo-gold" /> 4.9 valoración
            </span>
            <span>+1.300 ejercicios</span>
            <span>Gratis</span>
          </div>
        </div>

        <div className="relative h-[380px] w-full sm:h-[520px]">
          <div className="absolute inset-0 -z-0 rounded-full bg-modo-orange/20 blur-[100px]" />
          <Hero3D />
        </div>
      </div>
    </section>
  );
}
