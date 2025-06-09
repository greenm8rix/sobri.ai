import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
};

export const getTimeFromDate = (date: string | Date | number): string => {
  const dateObj = typeof date === 'number' 
    ? new Date(date) 
    : typeof date === 'string' 
      ? new Date(date) 
      : date;
  
  return format(dateObj, 'h:mm a');
};

export const getCurrentDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const calculateStreakDays = (startDate: string | null, lastCheckIn: string | null): number => {
  if (!startDate || !lastCheckIn) return 0;
  
  const start = parseISO(startDate);
  const lastCheck = parseISO(lastCheckIn);
  const today = new Date();
  
  // If last check-in was more than 1 day ago, streak is broken
  if (differenceInDays(today, lastCheck) > 1) {
    return 0;
  }
  
  return differenceInDays(lastCheck, start) + 1;
};

// Calculate the current streak from an array of check-in dates
export function calculateCurrentStreakFromCheckIns(checkInDates: string[]): number {
  if (!checkInDates || checkInDates.length === 0) return 0;
  // Remove duplicates and sort dates descending
  const uniqueDates = Array.from(new Set(checkInDates.map(d => d.slice(0, 10)))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = new Date();
  let streak = 0;
  let current = new Date(uniqueDates[0]);
  let i = 0;

  // If the most recent check-in is today or yesterday, start streak
  const isToday = uniqueDates[0] === today.toISOString().slice(0, 10);
  const isYesterday = uniqueDates[0] === new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  if (!isToday && !isYesterday) return 0;

  while (i < uniqueDates.length) {
    const expected = new Date(today.getTime() - streak * 86400000).toISOString().slice(0, 10);
    if (uniqueDates[i] === expected) {
      streak++;
      i++;
    } else {
      break;
    }
  }
  return streak;
}