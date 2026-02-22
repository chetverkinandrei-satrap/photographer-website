import { useState, useRef } from 'react';
import Lightbox from './Lightbox';

export default function SeriesCard({ series }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const touchStart = useRef(null);
  const photos = series.photo_urls || [];
  const review = series.reviews?.[0];

  const hasPhotos = photos.length > 0;

  function prevSlide() {
    setCurrentSlide((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function nextSlide() {
    setCurrentSlide((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  function handleTouchStart(e) {
    touchStart.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevSlide();
      else nextSlide();
    }
    touchStart.current = null;
  }

  return (
    <div className="series-card">
      <div
        className="series-card__slider"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasPhotos ? (
          <>
            <img
              src={photos[currentSlide]}
              alt={series.title}
              className="series-card__image"
              onClick={() => setLightboxIndex(currentSlide)}
            />
            {photos.length > 1 && (
              <>
                <button className="slider-arrow slider-arrow--left" onClick={prevSlide}>&#8249;</button>
                <button className="slider-arrow slider-arrow--right" onClick={nextSlide}>&#8250;</button>
                <span className="series-card__photo-count">{currentSlide + 1} / {photos.length}</span>
                <div className="slider-dots">
                  {photos.map((_, i) => (
                    <span
                      key={i}
                      className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="series-card__placeholder">
            <span>Фото скоро появятся</span>
          </div>
        )}
      </div>
      <div className="series-card__info">
        <h3>{series.title}</h3>
        <p>{series.description}</p>
        {review && (
          <blockquote className="series-card__review">
            &laquo;{review.text}&raquo;
          </blockquote>
        )}
        <button
          className="btn btn--outline"
          onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Хочу такую съёмку
        </button>
      </div>

      {lightboxIndex >= 0 && (
        <Lightbox
          images={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onPrev={() => setLightboxIndex((p) => (p === 0 ? photos.length - 1 : p - 1))}
          onNext={() => setLightboxIndex((p) => (p === photos.length - 1 ? 0 : p + 1))}
        />
      )}
    </div>
  );
}
