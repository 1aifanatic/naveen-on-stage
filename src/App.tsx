import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import VideoGallery from './components/VideoGallery';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
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
