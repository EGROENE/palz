require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");

// Express app:
const app = express();

const mongoose = require("mongoose");

const cors = require("cors");
app.use(cors());

const User = require("./models/userModel");

const userRoutes = require("./routes/users.cjs");
const eventRoutes = require("./routes/events.cjs");
const chatRoutes = require("./routes/chats.cjs");

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
app.use("/palz/chats", chatRoutes);

app.get("/palz/find-palz", async (req, res) => {
  const { user, start, limit } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  // Find way to return users who are potential friends of currentUser
  // Find way to start at certain index. Or, maybe get all that meet current filters (no .limit at end), then return sliced of that. sliced version could also be returned by request. limit & start wouldn't be needed as queries, just user.
  // OR, add index to each user document. start w/ 0, then onward. find way to add correct number for new users, too.
  const potentialFriends = await User.find({
    // index is equal to or greater than 'start':
    index: { $gte: Number(start) },
    // _id isn't that of currentUser:
    _id: { $ne: currentUser._id.toString() },
    // friends doesn't contain currentUser:
    friends: { $nin: currentUser._id.toString() },
    // blockedUsers doesn't contain currentUser:
    blockedUsers: { $nin: currentUser._id.toString() },
    // blockedBy doesn't contain currentUser:
    blockedBy: { $nin: currentUser._id.toString() },
    // profileVisibleTo isn't set to 'nobody':
    profileVisibleTo: { $ne: "nobody" },
  }).limit(Number(limit));

  // return array of other users w/ certain fields excluded (each should match TOtherUser)
  res.status(200).json(potentialFriends);
});

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
