/**
 * Formats a date into a readable string.
 * @param dateString - The date string to format.
 * @returns A formatted date string.
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const showYear = date.getFullYear() !== now.getFullYear();

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(showYear && { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23', // Ensures 24-hour format
  }).replace(/,/g, ''); // Remove any remaining commas
}
export function calculateTimeDifference(startDate: string | Date, endDate: string | Date): string {
  // Convert to Date objects if input is a string
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  // Calculate the difference in milliseconds
  const diffInMs = Math.abs(end.getTime() - start.getTime());
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor((diffInMs / (1000 * 60 * 60)) % 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""}, ${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
  }
  return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
}

export const calculatePostsPerDay = (totalPosts: number, startDate: string | Date, endDate: string | Date): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return days > 0 ? (totalPosts / days).toFixed(1) : totalPosts.toString();
};

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
export function trimString(str: string): string {
  const segments = [...segmenter.segment(str)].slice(0, 9).map(s => s.segment);
  return segments.join('') + (str.length > 9 ? '…' : '');
}