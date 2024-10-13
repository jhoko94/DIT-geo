const express = require("express");
const dotenv = require("./config/dotenv");
const cors = require("cors");

const dataRoutes = require("./routes/dataRoutes");
const gedungRoutes = require("./routes/gedungRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const lokasiterdekatRoutes = require("./routes/lokasiterdekatRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/data", dataRoutes);
app.use("/api/gedung", gedungRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/lokasiterdekat", lokasiterdekatRoutes);

const PORT = dotenv.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
