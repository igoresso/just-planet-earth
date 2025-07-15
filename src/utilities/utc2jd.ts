/**
 * Converts a UTC date/time to Julian Date.
 *
 * @param date - UTC date/time for which to compute the Julian Date.
 * @returns {number} - The Julian Date corresponding to the given UTC date.
 *
 * The Julian Date is the number of days since the epoch J2000.0 (January 1, 2000).
 */
export function utc2jd(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}
