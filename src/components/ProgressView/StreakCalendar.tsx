import React from 'react';
import { DailyCheckIn } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';

interface StreakCalendarProps {
  checkIns: DailyCheckIn[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ checkIns }) => {
  const currentDate = new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });
  
  const startingDayIndex = getDay(firstDayOfMonth);
  
  const getMoodColor = (date: Date): string => {
    const checkIn = checkIns.find(c => isSameDay(new Date(c.date), date));
    
    if (!checkIn) return 'bg-gray-100';
    
    switch (checkIn.mood) {
      case 'great':
        return 'bg-green-500';
      case 'good':
        return 'bg-emerald-400';
      case 'neutral':
        return 'bg-yellow-300';
      case 'bad':
        return 'bg-orange-400';
      case 'terrible':
        return 'bg-red-500';
      default:
        return 'bg-gray-100';
    }
  };
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">{format(currentDate, 'MMMM yyyy')}</h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-xs text-center text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {days.map(day => {
          const isToday = isSameDay(day, currentDate);
          const hasCheckIn = checkIns.some(c => isSameDay(new Date(c.date), day));
          
          return (
            <div 
              key={day.toString()} 
              className={`aspect-square flex items-center justify-center rounded-full relative ${
                isToday ? 'border-2 border-indigo-500' : ''
              }`}
            >
              <div 
                className={`
                  w-3/4 h-3/4 rounded-full flex items-center justify-center
                  ${hasCheckIn ? getMoodColor(day) : 'bg-gray-100'}
                  ${isToday ? 'border-2 border-white' : ''}
                `}
              >
                <span className={`text-xs font-medium ${hasCheckIn ? 'text-white' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="text-xs text-gray-600 mr-1">Mood:</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">Great</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span className="text-xs text-gray-600">Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          <span className="text-xs text-gray-600">Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <span className="text-xs text-gray-600">Bad</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">Terrible</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;