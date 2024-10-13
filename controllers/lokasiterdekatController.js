const pool = require("../config/db");
const haversineService = require("../services/haversineService");
const axios = require("axios");

function hitungUdara(latitude, longitude, params) {
  const distances = params.map((loc) => ({
    device_name: loc.device_name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    distance:
      haversineService
        .haversine(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(loc.latitude),
          parseFloat(loc.longitude)
        )
        .toFixed(2) + " km",
  }));

  return distances;
}

async function hitungDarat(latitude, longitude, params) {
  const origin = `${longitude},${latitude}`;
  let distanceResults = [];

  for (const location of params) {
    const destination = `${location.longitude},${location.latitude}`;

    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false&geometries=geojson`;

    const response = await axios.get(osrmUrl);

    const routeDistance = response.data.routes[0].distance / 1000;

    distanceResults.push({
      device_name: location.device_name,
      latitude: location.latitude,
      longitude: location.longitude,
      distance: routeDistance.toFixed(2) + " km",
    });
  }

  return distanceResults;
}

exports.getLokasiTerdekatDaratUdara = async (req, res) => {
  const { latitude, longitude, golongan } = req.body;

  try {
    const result = await pool.query(
      "SELECT device_name, latitude, longitude FROM tbl_device_loc"
    );
    const locations = result.rows;

    let distanceResults = [];
    if (golongan == "darat") {
      distanceResults = await hitungDarat(latitude, longitude, locations);
    } else if (golongan == "udara") {
      distanceResults = hitungUdara(latitude, longitude, locations);
    } else {
      return res.json({ message: "golongan belum di isi" });
    }

    distanceResults.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );
    const nearestLocations = distanceResults.slice(0, 5);

    res.json(nearestLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getLokasiTerdekatDarat = async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      "SELECT device_name, latitude, longitude FROM tbl_device_loc"
    );
    const locations = result.rows;

    const origin = `${longitude},${latitude}`;
    let distanceResults = [];

    for (const location of locations) {
      const destination = `${location.longitude},${location.latitude}`;

      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false&geometries=geojson`;

      const response = await axios.get(osrmUrl);

      const routeDistance = response.data.routes[0].distance / 1000;

      distanceResults.push({
        device_name: location.device_name,
        latitude: location.latitude,
        longitude: location.longitude,
        distance: routeDistance.toFixed(2) + " km",
      });
    }

    distanceResults.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );
    const nearestLocations = distanceResults.slice(0, 5);

    res.json(nearestLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getLokasiTerdekatUdara = async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      "SELECT device_name, latitude, longitude FROM tbl_device_loc"
    );
    const locations = result.rows;

    const distances = locations.map((loc) => ({
      device_name: loc.device_name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      distance:
        haversineService
          .haversine(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(loc.latitude),
            parseFloat(loc.longitude)
          )
          .toFixed(2) + " km",
    }));

    distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    const nearestLocations = distances.slice(0, 5);

    res.json(nearestLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
