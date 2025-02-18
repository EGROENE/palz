require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");

// Express app:
const app = express();

const mongoose = require("mongoose");

const cors = require("cors");
app.use(cors());

const userRoutes = require("./routes/users.cjs");
const eventRoutes = require("./routes/events.cjs");
const messageRoutes = require("./routes/messages.cjs");

// MIDDLEWARE
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json()); // if any request has data that it sends to the server, this attaches it to request object, so we can access it in request handler

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// ROUTES
app.use("/palz/users", userRoutes);
app.use("/palz/events", eventRoutes);
app.use("/palz/messages", messageRoutes);

// Connect to Mongoose:
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    // Listen for requests only after connecting to DB
    app.listen(process.env.PORT, () => {
      console.log(`Connected to DB & listening on port ${process.env.PORT}!`);
    });
  })
  .catch((error) => console.log(error));
