'use client';

import { motion } from 'framer-motion';
import { Flash, Video, Apple, Chart2, Timer, Wallet } from 'iconsax-react';

const FEATURES = [
  { Icon: Flash, color: '#ff7a18', title: 'Rutinas con IA', desc: 'Elige tu nivel (Principiante, Intermedio o Pro) y la app arma tu rutina con la cantidad de ejercicios y pesos ideales.' },
  { Icon: Video, color: '#a855f7', title: '+1.300 ejercicios', desc: 'Catálogo con video/GIF en bucle, filtros por músculo, búsqueda e idioma ES/EN.' },
  { Icon: Apple, color: '#22d3ee', title: 'Dieta semanal', desc: 'Plan alimenticio personalizado según tu objetivo: bajar, ganar músculo o definir.' },
  { Icon: Chart2, color: '#10b981', title: 'Progreso total', desc: 'Calorías, sesiones y músculos con resumen semanal, mensual y anual. Historial de ejercicios.' },
  { Icon: Timer, color: '#e10600', title: 'Cronómetro y cardio', desc: 'Tiempo en el gym y cardio por tiempo. Sigue contando aunque salgas de la app, con aviso al terminar.' },
  { Icon: Wallet, color: '#ffd60a', title: 'Membresía y alertas', desc: 'Registra tu membresía y recibe avisos de vencimiento. Tienda y contacto del gym incluidos.' },
];

export default function Features() {
  return (
    <section id="funciones" className="relative mx-auto max-w-6xl px-5 py-24">
      <div className="mb-14 text-center">
        <p className="mb-3 text-xs font-bold tracking-[0.3em] text-modo-orange">FUNCIONES</p>
        <h2 className="font-display text-4xl font-black sm:text-5xl">
          Todo tu gimnasio en <span className="text-gradient">una sola app</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/60">
          Entrenamiento, nutrición y seguimiento con inteligencia artificial, en un diseño moderno y oscuro.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-3xl glass p-6 transition hover:-translate-y-1"
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
              style={{ background: f.color }}
            />
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}55)` }}
            >
              <f.Icon size={28} variant="Bulk" color="#0a0a0f" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-white/60">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
