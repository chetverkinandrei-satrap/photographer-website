import { useState, useEffect } from 'react';
import { fetchSeries, fetchSeriesById } from '../api';
import SeriesCard from './SeriesCard';

export default function Portfolio() {
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchSeries();
        const detailed = await Promise.all(list.map((s) => fetchSeriesById(s.id)));
        setSeriesList(detailed);
      } catch (err) {
        console.error('Failed to load series:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section id="portfolio" className="portfolio">
      <div className="container">
        <h2 className="section-title">Портфолио</h2>
        {loading ? (
          <p className="loading-text">Загрузка...</p>
        ) : seriesList.length === 0 ? (
          <p className="loading-text">Серии пока не добавлены</p>
        ) : (
          <div className="portfolio__grid">
            {seriesList.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
