'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const SHOTS = [
  { src: '/screenshots/01_inicio.png', label: 'Inicio' },
  { src: '/screenshots/02_ejercicios.png', label: 'Ejercicios' },
  { src: '/screenshots/03_rutinas.png', label: 'Rutinas' },
  { src: '/screenshots/04_dieta.png', label: 'Dieta' },
  { src: '/screenshots/05_tienda.png', label: 'Tienda' },
];

export default function Showcase() {
  return (
    <section id="app" className="relative py-24">
      <div className="mx-auto mb-12 max-w-6xl px-5 text-center">
        <p className="mb-3 text-xs font-bold tracking-[0.3em] text-modo-purple">LA APP</p>
        <h2 className="font-display text-4xl font-black sm:text-5xl">
          Así se ve <span className="text-gradient">MODO GYM</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">
          Interfaz oscura, moderna y en español. Todo lo que necesitás para entrenar, comer y medir tu progreso.
        </p>
      </div>

      <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SHOTS.map((s, i) => (
          <motion.div
            key={s.src}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="shrink-0"
          >
            <div className="relative h-[540px] w-[260px] overflow-hidden rounded-[2.4rem] border-4 border-white/10 bg-black shadow-2xl">
              <Image src={s.src} alt={s.label} fill className="object-cover" sizes="260px" />
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-white/60">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
