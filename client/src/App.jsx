import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import BookingForm from './components/BookingForm';
import Contacts from './components/Contacts';
import Footer from './components/Footer';
import Admin from './pages/Admin';

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Portfolio />
      <BookingForm />
      <Contacts />
    </>
  );
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </div>
  );
}
