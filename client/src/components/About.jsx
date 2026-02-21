export default function About() {
  const packages = [
    { name: 'Портрет', duration: '1 час', photos: '20+ фото', price: 'от 5 000 ₽' },
    { name: 'Семейная', duration: '1.5 часа', photos: '40+ фото', price: 'от 8 000 ₽' },
    { name: 'Свадебная', duration: '6-8 часов', photos: '200+ фото', price: 'от 25 000 ₽' },
  ];

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">Обо мне</h2>
        <div className="about__content">
          <div className="about__text">
            <p>
              Привет! Я — фотограф с вниманием к деталям и любовью к естественному свету.
              Мой подход — минимум постановки, максимум живых эмоций. Каждая съёмка —
              это маленькая история, которую мы создаём вместе.
            </p>
          </div>
        </div>
        <h3 className="about__packages-title">Пакеты съёмок</h3>
        <div className="about__packages">
          {packages.map((pkg) => (
            <div key={pkg.name} className="package-card">
              <h4>{pkg.name}</h4>
              <ul>
                <li>{pkg.duration}</li>
                <li>{pkg.photos}</li>
                <li><strong>{pkg.price}</strong></li>
              </ul>
              <button
                className="btn btn--outline"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Хочу такую съёмку
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
