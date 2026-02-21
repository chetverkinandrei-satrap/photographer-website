export default function Hero() {
  function scrollToBooking() {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="hero" className="hero">
      <div className="hero__overlay">
        <h1 className="hero__title">Сохраню ваши лучшие моменты</h1>
        <p className="hero__subtitle">Фотосъёмка, которая рассказывает историю</p>
        <button className="btn btn--primary" onClick={scrollToBooking}>
          Забронировать съёмку
        </button>
      </div>
    </section>
  );
}
