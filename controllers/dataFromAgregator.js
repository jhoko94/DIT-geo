const axios = require("axios");
const jwt = require("jsonwebtoken");

const { upstreamApiAgregator } = require("../config/dotenv");
const {
  getToken,
  loginAgregator,
  setToken,
} = require("../services/agregatorLogin");
const haversineService = require("../services/haversineService");

exports.FindDevicebyLatLon = async (req, res) => {
  const { latitude, longitude, type } = req.body;

  const decodedToken = jwt.decode(getToken(), { complete: true });
  const { payload } = decodedToken;
  const { exp } = payload;

  if (triggerOneHourBeforeExpiration(exp)) {
    const agregatorToken = await loginAgregator();
    setToken(agregatorToken);
  }

  if (!latitude || !longitude || !type) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const requestBody = {
      latitude,
      longitude,
      type,
    };

    const headers = {
      Authorization: `Bearer ${getToken()}`,
    };

    const response = await axios.post(
      `${upstreamApiAgregator}/aggregator/FindDevicebyLatLon`,
      requestBody,
      { headers }
    );

    const locations = response.data.data;

    // Calculate distances for 'darat'
    const distanceResultsDarat = await hitungDarat(
      requestBody.latitude,
      requestBody.longitude,
      locations
    );

    distanceResultsDarat.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );

    // Calculate distances for 'udara' only after 'darat' is complete
    const distanceResultsUdara = hitungUdara(
      requestBody.latitude,
      requestBody.longitude,
      locations
    );

    distanceResultsUdara.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );

    const nearestLocations = {
      darat: distanceResultsDarat.slice(0, 5),
      udara: distanceResultsUdara.slice(0, 5),
    };

    res.json(nearestLocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.FindDevicebyLatLonUdara = async (req, res) => {
  const { latitude, longitude, type } = req.body;

  if (!latitude || !longitude || !type) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const requestBody = {
      latitude,
      longitude,
      type,
    };

    const headers = {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzAyLCJ1c2VybmFtZSI6InVzZXJfdGVzdDAxIiwibWFza2luZyI6MCwiaWF0IjoxNzI4ODgwMDMzLCJleHAiOjE3Mjg5NjY0MzN9.zQGDoVlqG1yTMM-_fHYEl0OebsFgVZCfrr_fgnzmA5M",
    };

    const response = await axios.post(
      `${upstreamApiAgregator}/aggregator/FindDevicebyLatLon`,
      requestBody,
      { headers }
    );

    const locations = response.data.data;

    // Calculate distances for 'udara' only after 'darat' is complete
    const distanceResultsUdara = hitungUdara(
      requestBody.latitude,
      requestBody.longitude,
      locations
    );

    distanceResultsUdara.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );

    const nearestLocations = distanceResultsUdara.slice(0, 5);

    res.json(nearestLocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.FindDevicebyLatLonDarat = async (req, res) => {
  const { latitude, longitude, type } = req.body;

  if (!latitude || !longitude || !type) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const requestBody = {
      latitude,
      longitude,
      type,
    };

    const headers = {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzAyLCJ1c2VybmFtZSI6InVzZXJfdGVzdDAxIiwibWFza2luZyI6MCwiaWF0IjoxNzI4ODgwMDMzLCJleHAiOjE3Mjg5NjY0MzN9.zQGDoVlqG1yTMM-_fHYEl0OebsFgVZCfrr_fgnzmA5M",
    };

    const response = await axios.post(
      `${upstreamApiAgregator}/aggregator/FindDevicebyLatLon`,
      requestBody,
      { headers }
    );

    const locations = response.data.data;

    // Calculate distances for 'darat'
    const distanceResultsDarat = await hitungDarat(
      requestBody.latitude,
      requestBody.longitude,
      locations
    );

    distanceResultsDarat.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );

    const nearestLocations = distanceResultsDarat.slice(0, 5);

    res.json(nearestLocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hitungDarat(latitude, longitude, params) {
  const origin = `${longitude},${latitude}`;
  let distanceResults = [];

  for (let index = 0; index < params.length; index++) {
    const location = params[index];
    const destination = `${location.LONGITUDE},${location.LATITUDE}`;
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false&geometries=geojson`;

    try {
      const response = await axios.get(osrmUrl);
      const routeDistance = response.data.routes[0].distance / 1000;

      distanceResults.push({
        device_name: location.DEVICE_NAME,
        latitude: location.LATITUDE,
        longitude: location.LONGITUDE,
        distance: routeDistance.toFixed(2) + " km",
      });
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error("Rate limit exceeded. Retrying after delay...");
        await delay(2000);
        index--;
      } else {
        console.error("Error fetching route:", error.message);
      }
    }
  }

  return distanceResults;
}

function hitungUdara(latitude, longitude, params) {
  const distances = params.map((loc) => ({
    device_name: loc.DEVICE_NAME,
    latitude: loc.LATITUDE,
    longitude: loc.LONGITUDE,
    distance:
      haversineService
        .haversine(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(loc.LATITUDE),
          parseFloat(loc.LONGITUDE)
        )
        .toFixed(2) + " km",
  }));

  return distances;
}

function triggerOneHourBeforeExpiration(expTimeInMs) {
  const oneHourInMs = 60 * 60 * 1000;
  const currentTime = Date.now();

  const timeUntilTrigger = expTimeInMs - oneHourInMs - currentTime;

  if (timeUntilTrigger > 0) {
    return true;
  } else {
    return false;
  }
}
