const express = require("express");
const health = require("@cloudnative/health-connect");

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
  app.use("/liveness", health.LivenessEndpoint(healthcheck));

  app.use("/api/underwriting/:quoteId/:pd", (req, res) => {
    if (req.params.pd === "1") {
      res.send({
        status: "UWREF",
      });
    } else {
      res.send({
        status: "RATE_SUCC",
      });
    }
  });

  return app;
};
