'use client';
import React, { useState } from 'react';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const months = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

function NoofDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function FirstDay(year: number, month: number) {
  const day = new Date(year, month, 1).getDay(); // Sunday = 0
  return day === 0 ? 6 : day - 1; // Convert to Monday = 0
}

function generateCalendar(year: number, month: number) {
  const daysInMonth = NoofDays(year, month);
  const firstDay = FirstDay(year, month);

  const calendar: { day: number | null }[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendar.push({ day: null });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendar.push({ day: i });
  }

  while (calendar.length < 42) {
    calendar.push({ day: null });
  }

  return calendar;
}

export default function Page() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [events, setEvents] = useState<{ [key: string]: string[] }>({});
  const [newEvent, setNewEvent] = useState('');

  const calendar = generateCalendar(year, month);

  function addEvent() {
    if (selectedDate === null || newEvent.trim() === '') return;

    const key = `${year}-${month}-${selectedDate}`;
    setEvents((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newEvent],
    }));

    setNewEvent('');
    setSelectedDate(null); // hide modal or input
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  return (
    <main className="flex h-[100svh] items-center justify-center p-5 text-white">
      <div className="flex w-[100svw] gap-4 p-1">
        {/* Calendar Section */}
        <div className="flex h-[100svh] w-[70svw] flex-col rounded-xl p-4">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-light text-5xl text-[#3A3A3A]">{year}</h2>
            <h2 className="font-light text-5xl text-[#3A3A3A]">
              {months[month]}
            </h2>
          </div>

          {/* Weekday Names */}
          <div className="mb-4 grid grid-cols-7 text-center font-medium text-gray-400 text-lg">
            {days.map((day) => (
              <div className="py-2" key={day}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid flex-1 grid-cols-7 gap-3">
            {calendar.map((cell, idx) => {
              const isToday =
                cell.day === currentDate.getDate() &&
                month === currentDate.getMonth() &&
                year === currentDate.getFullYear();

              const isSelected = cell.day === selectedDate;

              return (
                <div
                  className={`flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl font-medium text-2xl transition-colors ${
                    cell.day === null
                      ? 'bg-transparent'
                      : isToday
                        ? 'bg-white text-black'
                        : isSelected
                          ? 'bg-blue-500'
                          : 'border-4 border-[#393939] bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                  key={idx}
                  onClick={() => cell.day && setSelectedDate(cell.day)}
                >
                  {cell.day ?? ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="h-[100svh] w-[30svw] rounded-xl bg-[#151313] p-6">
          {/* Header Controls */}
          <div className="flex justify-between">
            <div className="mb-6 flex items-center justify-start gap-4">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700 text-white transition-colors hover:bg-zinc-600"
                onClick={() => navigateMonth('prev')}
              >
                ←
              </button>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700 text-white transition-colors hover:bg-zinc-600"
                onClick={() => navigateMonth('next')}
              >
                →
              </button>
            </div>

            <div className="text-right">
              <span className="text-gray-300 text-lg">Hola :)</span>
            </div>
          </div>

          {/* Add Event */}
          <div className="mt-8">
            <div className="mb-4">
              <input
                className="w-full rounded-md bg-zinc-700 p-2 text-white outline-none placeholder:text-[#f7eee3]"
                onChange={(e) => setNewEvent(e.target.value)}
                placeholder="Add event..."
                type="text"
                value={newEvent}
              />
            </div>
            <button
              className="w-full rounded-md bg-[#D2D2D2] p-2 text-white hover:bg-blue-500"
              onClick={addEvent}
            >
              Add Event
            </button>
          </div>

          {/* Event List */}
          {selectedDate !== null && (
            <div className="mt-6">
              <h3 className="mb-2 font-bold text-lg text-white">
                Events on {selectedDate} {months[month]} {year}
              </h3>
              <ul className="list-disc pl-5 text-white">
                {(events[`${year}-${month}-${selectedDate}`] || []).map(
                  (event, idx) => (
                    <li key={idx}>{event}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
