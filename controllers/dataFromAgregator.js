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

    const nearestLocations = distanceResultsDarat.slice(0, 5);

    res.json(nearestLocations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

async function hitungDarat(latitude, longitude, params) {
  const origin = `${latitude},${longitude}`;

  const distanceResults = await Promise.all(
    params.map(async (location) => {
      const destination = `${location.LATITUDE},${location.LONGITUDE}`;
      const graphHooperUrl = `http://10.62.125.116:8989/route?point=${origin}&point=${destination}&profile=car`
      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false&geometries=geojson`;

      try {
        const response = await axios.get(osrmUrl);
        const routeDistance = response.data.routes[0].distance / 1000;
        return {
          ...location,
          DISTANCE_DARAT_OSRM: `${routeDistance.toFixed(2)} km`,
        };
      } catch (error) {
        try {
          const response = await axios.get(graphHooperUrl);
          const routeDistance = response.data.paths[0].distance / 1000
          return {
            ...location,
            DISTANCE_DARAT_GRAPHOOPER: `${routeDistance.toFixed(2)} km`,
          };
        } catch (error) {
          console.error(`Error fetching route for ${location}:`, error.message);
          return { ...location, DISTANCE_DARAT: "Error" };
        }
      }
    })
  );

  return distanceResults;
}

function hitungUdara(latitude, longitude, params) {
  let distance = [];
  for (let index = 0; index < params.length; index++) {
    const loc = params[index];
    const objTemp = {
      DISTANCE_UDARA: `${haversineService
        .haversine(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(loc.LATITUDE),
          parseFloat(loc.LONGITUDE)
        )
        .toFixed(2)} km`,
    };

    distance.push({ ...loc, ...objTemp });
  }

  return distance;
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
