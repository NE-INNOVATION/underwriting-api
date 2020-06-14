const express = require("express");
const health = require("@cloudnative/health-connect");

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

  app.use("/api/underwriting/:quoteId/:pd", (req, res) => {
    if (req.params.pd === "1") {
      quotes[req.params.quoteId] = { code: "UWREF" };
      res.send({
        code: "UWREF",
      });
    } else if (
      quotes[req.params.quoteId] !== undefined &&
      req.params.pd !== "1"
    ) {
      quotes[req.params.quoteId] = undefined;
      res.send({
        code: "UWAPPR",
      });
    } else {
      res.send({
        code: "RATE_SUCC",
      });
    }
  });

  return app;
};
