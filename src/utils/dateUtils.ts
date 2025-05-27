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