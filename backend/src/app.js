const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const env = require("./config/env");
const routes = require("./routes");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: env.clientOrigin === "*" ? true : env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Health Kundali backend is running.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
