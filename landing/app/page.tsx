import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Showcase from '@/components/Showcase';
import InstallCTA from '@/components/InstallCTA';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <main className="aurora relative min-h-screen">
      <Nav />
      <Hero />
      <Features />
      <Showcase />
      <InstallCTA />
      <Footer />
    </main>
  );
}
