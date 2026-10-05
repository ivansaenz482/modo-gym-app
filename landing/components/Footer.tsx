import Image from 'next/image';

const PLAY = 'https://play.google.com/store/apps/details?id=com.modogym.app';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <Image src="/icons/icon-192.png" alt="MODO GYM" width={44} height={44} className="rounded-xl bg-white" />
          <div className="text-left leading-tight">
            <p className="font-display text-lg font-black">MODO GYM</p>
            <p className="text-[10px] font-semibold tracking-widest text-white/40">EL PODER ESTÁ EN TU INTERIOR</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
          <a href="#funciones" className="transition hover:text-white">Funciones</a>
          <a href="#app" className="transition hover:text-white">La App</a>
          <a href="#instalar" className="transition hover:text-white">Instalar</a>
          <a href={PLAY} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Play Store</a>
        </div>

        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} MODO GYM · Diseñado por Ing. Iván Teneta · Propiedad de Esther Angélica Acosta García
        </p>
      </div>
    </footer>
  );
}
