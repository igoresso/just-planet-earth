import { deg2rad, utc2jd } from "@/utilities";

/**
 * Compute the Sun’s geocentric position in the J2000 Earth‑Centered Inertial (ECI) frame.
 *
 * @param date - UTC date/time for which to compute the Sun’s position.
 * @returns An object `{ x, y, z }` giving the **unit** direction vector from Earth’s center to the Sun:
 *   - `x, y, z` are the direction cosines along the J2000 ECI axes.
 *
 * Uses the NOAA/USNO first‑order solar position algorithm, accurate to ≈0.01° in longitude for dates 1950–2050.
 *
 * Reference:
 *   – U.S. Naval Observatory & H.M. Nautical Almanac Office, *Astronomical Almanac 2010*, p. C5.
 */
export function getSunDirectionECI(date: Date): {
  x: number;
  y: number;
  z: number;
} {
  // Days since J2000.0
  const JD = utc2jd(date);
  const D = JD - 2451545.0;

  // Mean anomaly of the Sun (g) and mean longitude (q), in radians
  const g = deg2rad((357.529 + 0.98560028 * D) % 360);
  const q = deg2rad((280.459 + 0.98564736 * D) % 360);

  // Ecliptic longitude lambda ≈ q + 1.915°·sin(g) + 0.020°·sin(2g)
  const lambda =
    q + deg2rad(1.915) * Math.sin(g) + deg2rad(0.02) * Math.sin(2 * g);

  // Obliquity epsilon ≈ 23.439° – 0.00000036°·D
  const epsilon = deg2rad(23.439 - 0.00000036 * D);

  // Convert from ecliptic → equatorial coordinates
  const x = Math.cos(lambda);
  const y = Math.cos(epsilon) * Math.sin(lambda);
  const z = Math.sin(epsilon) * Math.sin(lambda);

  // Normalize
  const len = Math.hypot(x, y, z);
  return { x: x / len, y: y / len, z: z / len };
}

/**
 * Compute the Sun’s geocentric direction vector in the Earth‑Centered Earth‑Fixed (ECEF) frame.
 *
 * @param date - UTC date/time for which to compute the Sun’s position.
 * @returns An object `{ x, y, z }` giving the **unit** direction vector from Earth’s center to the Sun:
 *   - `x` points toward the prime meridian at the equator, `y` 90° eastward, `z` toward the north pole.
 *
 * Rotates the inertial ECI vector by the Greenwich Mean Sidereal Time (GMST)
 * to account for Earth’s rotation.
 *
 * References:
 *   – U.S. Naval Observatory & H.M. Nautical Almanac Office, *Astronomical Almanac 2010*, p. C5.
 */
export function getSunDirectionECEF(date: Date): {
  x: number;
  y: number;
  z: number;
} {
  const { x: ex, y: ey, z: ez } = getSunDirectionECI(date);

  // Julian Date & centuries from J2000.0
  const JD = utc2jd(date);
  const T = (JD - 2451545.0) / 36525;

  // Greenwich Mean Sidereal Time and rotation angle
  const GMST =
    280.46061837 +
    360.98564736629 * (JD - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  const theta = deg2rad(((GMST % 360) + 360) % 360);

  // Rotate the ECI vector by the Greenwich Mean Sidereal Time and normalize
  const x = Math.cos(theta) * ex + Math.sin(theta) * ey;
  const y = -Math.sin(theta) * ex + Math.cos(theta) * ey;
  const z = ez;
  const len = Math.hypot(x, y, z);

  return { x: x / len, y: y / len, z: z / len };
}
