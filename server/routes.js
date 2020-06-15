const express = require("express");
const health = require("@cloudnative/health-connect");
const OktaJwtVerifier = require('@okta/jwt-verifier');
const config = require('./authConfiguration.js');

let quotes = {};

const healthcheck = new health.HealthChecker();

module.exports = () => {
  const oktaJwtVerifier = new OktaJwtVerifier({
    clientId: config.server.oidc.clientId,
    issuer: config.server.oidc.issuer,
    assertClaims: config.server.assertClaims
  })

  function authenticationRequired(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);

    if (!match) {
      res.status(401);
      return next('Unauthorized');
    }

    const accessToken = match[1];
    const audience = config.server.assertClaims.aud;
    return oktaJwtVerifier.verifyAccessToken(accessToken, audience)
      .then((jwt) => {
        req.jwt = jwt;
        next();
      })
      .catch((err) => {
        res.status(401).send(err.message);
      });
  }

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

  app.use("/api/underwriting/:quoteId/:pd",authenticationRequired,(req, res) => {
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
