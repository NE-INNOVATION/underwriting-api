const express = require("express");
const bodyParser = require("body-parser");
const health = require("@cloudnative/health-connect");
const router = express.Router();
var rn = require("random-number");

var gen = rn.generator({
  min: 1,
  max: 5,
  integer: true,
});

let quotes = {};

const healthcheck = new health.HealthChecker();

module.exports = () => {
  const app = express();
  app.set("json-spaces", 2);
  app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });

  app.use("/live", health.LivenessEndpoint(healthcheck));
  app.use("/ready", health.ReadinessEndpoint(healthcheck));
  app.use("/health", health.HealthEndpoint(healthcheck));

  app.use("/api/underwriting/:quoteId", (req, res) => {
    quotes[req.params.quoteId] = (quotes[req.params.quoteId] || gen()) + 1;
    if (quotes[req.params.quoteId] % 3 == 0) {
      res.send('RATE_SUCCESS' + JSON.stringify(quotes));
      quotes[req.params.quoteId] = undefined;
    }else{
      res.send('UWREF' + JSON.stringify(quotes));
    }
  });

  return app;
};
