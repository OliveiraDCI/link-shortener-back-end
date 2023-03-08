require("dotenv").config();
const db = require("./config/db");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

// Use helmet to set security headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
    },
  })
);
app.use(helmet.hsts());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());

// Set up rate limiting for all routes
const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests
  message: "Too many requests from this IP, please try again later",
});
app.use(rateLimiter);

app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/linkRoutes"));

// Connect to the database before listening
db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
  });
});
