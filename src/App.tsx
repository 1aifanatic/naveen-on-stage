import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import VideoGallery from './components/VideoGallery';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
      <a
        href="#speeches"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:font-ui focus:text-xs focus:font-semibold focus:tracking-widest focus:text-bg focus:uppercase"
      >
        Skip to talks
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <VideoGallery />
      </main>
      <Footer />
    </div>
  );
}
