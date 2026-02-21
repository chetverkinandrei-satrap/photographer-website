import { useState, useEffect } from 'react';
import { fetchBookedDates } from '../api';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

export default function Calendar({ selected, onSelect }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [booked, setBooked] = useState([]);

  useEffect(() => {
    fetchBookedDates().then(setBooked).catch(() => {});
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button type="button" onClick={prevMonth}>&#8249;</button>
        <span>{MONTHS[month]} {year}</span>
        <button type="button" onClick={nextMonth}>&#8250;</button>
      </div>
      <div className="calendar__days">
        {DAYS.map((d) => <div key={d} className="calendar__day-name">{d}</div>)}
      </div>
      <div className="calendar__grid">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="calendar__cell calendar__cell--empty" />;
          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
          const isPast = dateStr < todayStr;
          const isBooked = booked.includes(dateStr);
          const isSelected = selected === dateStr;
          const disabled = isPast || isBooked;

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              className={`calendar__cell ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''} ${isPast ? 'past' : ''}`}
              onClick={() => !disabled && onSelect(dateStr)}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="calendar__legend">
        <span><span className="legend-dot legend-dot--available" /> Свободно</span>
        <span><span className="legend-dot legend-dot--booked" /> Занято</span>
      </div>
    </div>
  );
}
