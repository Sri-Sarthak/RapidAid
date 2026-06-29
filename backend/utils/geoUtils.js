const { EARTH_RADIUS_KM } = require("../config/constants");

/**
 * Returns a MongoDB $geoWithin / $centerSphere filter that matches
 * documents whose `location` field (GeoJSON Point) lies within
 * `radiusKm` kilometres of [lng, lat].
 */
const withinRadius = (lng, lat, radiusKm) => ({
  location: {
    $geoWithin: {
      $centerSphere: [[lng, lat], radiusKm / EARTH_RADIUS_KM],
    },
  },
});

/**
 * Great-circle distance between two [lng, lat] points, in kilometres.
 * Uses the Haversine formula.
 */
const haversineDistanceKm = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Validates a [lng, lat] coordinate pair.
 */
const isValidCoordinates = (coords) =>
  Array.isArray(coords) &&
  coords.length === 2 &&
  typeof coords[0] === "number" &&
  typeof coords[1] === "number" &&
  coords[0] >= -180 &&
  coords[0] <= 180 &&
  coords[1] >= -90 &&
  coords[1] <= 90 &&
  !(coords[0] === 0 && coords[1] === 0);

module.exports = { withinRadius, haversineDistanceKm, isValidCoordinates };
