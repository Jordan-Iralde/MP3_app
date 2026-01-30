/**
 * Formats duration from seconds to mm:ss format.
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted string in mm:ss format
 * 
 * @example
 * formatDuration(125) // returns "02:05"
 * formatDuration(61) // returns "01:01"
 * formatDuration(0) // returns "00:00"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
