export default function Contacts() {
  return (
    <section id="contacts" className="contacts">
      <div className="container">
        <h2 className="section-title">Контакты</h2>
        <div className="contacts__grid">
          <div className="contacts__item">
            <h4>Телефон</h4>
            <a href="tel:+79991234567">+7 (999) 123-45-67</a>
          </div>
          <div className="contacts__item">
            <h4>Email</h4>
            <a href="mailto:photo@example.com">photo@example.com</a>
          </div>
          <div className="contacts__item">
            <h4>Telegram</h4>
            <a href="https://t.me/photographer" target="_blank" rel="noopener noreferrer">
              @photographer
            </a>
          </div>
          <div className="contacts__item">
            <h4>Instagram</h4>
            <a href="https://instagram.com/photographer" target="_blank" rel="noopener noreferrer">
              @photographer
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
