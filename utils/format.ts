/**
 * Formats a date into a readable string.
 * @param dateString - The date string to format.
 * @returns A formatted date string.
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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