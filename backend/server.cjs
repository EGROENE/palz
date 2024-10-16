require("dotenv").config();

const express = require("express");

// Express app:
const app = express();

const mongoose = require("mongoose");

const cors = require("cors");
app.use(cors());

const userRoutes = require("./routes/users.cjs");

// MIDDLEWARE
app.use(express.json()); // if any request has data that it sends to the server, this attaches it to request object, so we can access it in request handler

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// ROUTES
app.use("/palz/users", userRoutes);
// app.use("/events", eventRoutes)
// app.use("/messages", messageRoutes)

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
