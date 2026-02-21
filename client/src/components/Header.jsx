import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  function scrollTo(id) {
    setMenuOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__logo" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Photographer
        </a>
        <button className={`header__burger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <nav className={`header__nav ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => scrollTo('hero')}>Главная</button>
          <button onClick={() => scrollTo('about')}>Обо мне</button>
          <button onClick={() => scrollTo('portfolio')}>Портфолио</button>
          <button onClick={() => scrollTo('booking')}>Бронирование</button>
          <button onClick={() => scrollTo('contacts')}>Контакты</button>
        </nav>
      </div>
    </header>
  );
}
