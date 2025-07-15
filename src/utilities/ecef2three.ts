import * as THREE from "three";

/**
 * Converts Earth-Centered, Earth-Fixed (ECEF) coordinates to Three.js space.
 * ECEF coordinates are typically in meters, with the origin at the Earth's center.
 * The conversion adjusts the axes to match Three.js's coordinate system.
 *
 * @param {Object} ecef - The ECEF coordinates with properties x, y, and z.
 * @returns {THREE.Vector3} - The converted Three.js Vector3 coordinates.
 */
export function ecef2three(ecef: {
  x: number;
  y: number;
  z: number;
}): THREE.Vector3 {
  // Convert ECEF coordinates to Three.js Vector3
  return new THREE.Vector3(-ecef.x, ecef.z, ecef.y);
}
