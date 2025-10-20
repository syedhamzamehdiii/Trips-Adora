import React, { useState } from 'react';

const Calendar = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [selectedDate, setSelectedDate] = useState(1);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isWeekend: false
      });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      days.push({
        day,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
      });
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isWeekend: false
      });
    }

    return days;
  };

  const getWeekNumbers = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    
    // Calculate week numbers for October 2025
    const weekNumbers = [36, 37, 38, 39, 40, 41];
    return weekNumbers;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      setSelectedDate(day.day);
    }
  };

  if (!isOpen) return null;

  const days = getDaysInMonth(currentDate);
  const weekNumbers = getWeekNumbers(currentDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* Previous Month Button */}
          <button
            onClick={handlePreviousMonth}
            className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Year and Month Selectors */}
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
              {currentDate.getFullYear()}
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
              {months[currentDate.getMonth()]}
            </div>
          </div>

          {/* Next Month Button */}
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div></div> {/* Empty space for week numbers */}
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-medium py-2 ${
                index >= 5 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-2">
              {/* Week Number */}
              <div className="bg-gray-800 text-white text-sm font-medium rounded-lg flex items-center justify-center py-2">
                {weekNumbers[weekIndex]}
              </div>

              {/* Days */}
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => handleDateClick(day)}
                  className={`text-sm font-medium py-2 rounded-lg transition-colors ${
                    day.day === selectedDate && day.isCurrentMonth
                      ? 'bg-blue-600 text-white'
                      : day.isCurrentMonth
                      ? day.isWeekend
                        ? 'text-blue-500 hover:bg-blue-50'
                        : 'text-gray-500 hover:bg-gray-50'
                      : 'text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day.day}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
