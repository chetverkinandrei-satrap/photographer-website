import { useEffect, useCallback, useRef } from 'react';

export default function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const touchStart = useRef(null);

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  function handleTouchStart(e) {
    touchStart.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onPrev();
      else onNext();
    }
    touchStart.current = null;
  }

  if (index < 0 || !images.length) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <div
        className="lightbox__content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button className="lightbox__close" onClick={onClose}>&times;</button>
        <button className="lightbox__arrow lightbox__arrow--left" onClick={onPrev}>&#8249;</button>
        <img src={images[index]} alt="" className="lightbox__img" />
        <button className="lightbox__arrow lightbox__arrow--right" onClick={onNext}>&#8250;</button>
        <div className="lightbox__counter">{index + 1} / {images.length}</div>
      </div>
    </div>
  );
}
