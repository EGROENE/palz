// Handler functions that can be referenced in users.cjs

const mongoose = require("mongoose");

//const bcrypt = require("bcrypt");

const User = require("../models/userModel");

const getUserByUsernamePhoneNumberOrEmailAddress = async (req, res) => {
  try {
    const {
      emailAddress,
      phoneCountryCode,
      username,
      phoneNumberWithoutCountryCode,
      _id,
    } = req.body;

    // Check that id is a valid MongoDB ObjectId:
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Bad request (invalid id)" });
    }

    const currentUser = await User.findById(_id);

    const userWithUsername = await User.findOne({ username });

    const userWithEmail = await User.findOne({ emailAddress });

    const userWithPhoneNumber = await User.findOne({
      phoneCountryCode: phoneCountryCode,
      phoneNumberWithoutCountryCode: phoneNumberWithoutCountryCode,
    });

    if (
      userWithUsername &&
      userWithEmail &&
      userWithPhoneNumber &&
      userWithUsername._id.toString() !== currentUser._id.toString() &&
      userWithEmail._id.toString() !== currentUser._id.toString() &&
      userWithPhoneNumber._id.toString() !== currentUser._id.toString()
    ) {
      res.statusMessage = "ALL TAKEN";
      return res.status(401).end();
    }

    if (
      userWithUsername &&
      userWithUsername._id.toString() !== currentUser._id.toString()
    ) {
      res.statusMessage = "USERNAME TAKEN";
      return res.status(401).end();
    }

    if (userWithEmail && userWithEmail._id.toString() !== currentUser._id.toString()) {
      res.statusMessage = "EMAIL TAKEN";
      return res.status(401).end();
    }

    if (
      userWithPhoneNumber &&
      userWithPhoneNumber._id.toString() !== currentUser._id.toString()
    ) {
      res.statusMessage = "PHONE NUMBER TAKEN";
      return res.status(401).end();
    }

    return res.status(200).json({ currentUser });
  } catch (error) {
    res.statusMessage = "Something went wrong";
    return res.status(500).end();
  }
};

// Used to assign index to new users
const getAllUsers = async (req, res) => {
  // .sort({createdAt: -1}) could be added to sort most recently added to earliest added, for example

  const allUsers = await User.find({});

  res.status(200).json(allUsers);
};

// get single user by id:
const getUser = async (req, res) => {
  // Get id from request parameters:
  const { id } = req.params;

  // Check that id is a valid MongoDB ObjectId:
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Bad request (invalid id)" });
  }

  const user = await User.findById(id);

  // If no user document matches...
  if (!user) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  // If there is a match...
  res.status(200).json(user);
};

const getUserByUsername = async (req, res) => {
  // Get id from request parameters:
  const { username } = req.params;

  const user = await User.findOne({ username });

  // If no user document matches...
  if (!user) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  // If there is a match...
  res.status(200).json(user);
};

// get single user by username or email address:
const getUserByUsernameOrEmailAddress = async (req, res) => {
  try {
    const { username, emailAddress, password } = req.body;

    const user = username
      ? await User.findOne({ username })
      : await User.findOne({ emailAddress });

    // If no existing user has input e-mail address or username:
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    // Check if the provided password matches the stored password
    if (user.password === password) {
      return res.status(200).json({ user });
    } else {
      if (username) {
        res.statusMessage = "USERNAME OR PASSWORD IS WRONG";
        return res.status(401).end();
      }
      if (emailAddress) {
        res.statusMessage = "EMAIL OR PASSWORD IS WRONG";
        return res.status(401).end();
      }
    }
  } catch (error) {
    res.statusMessage = "Something went wrong";
    res.status(500).end();
  }
};

// create new user
const createNewUser = async (req, res) => {
  let {
    _id,
    lastLogin,
    index,
    firstName,
    lastName,
    password,
    city,
    stateProvince,
    country,
    phoneCountry,
    phoneCountryCode,
    phoneNumberWithoutCountryCode,
    instagram,
    facebook,
    x,
    interests,
    about,
    friendRequestsReceived,
    friendRequestsSent,
    blockedUsers,
    hostingCredits,
    profileImage,
    profileVisibleTo,
    whoCanMessage,
    subscriptionType,
    whoCanAddUserAsOrganizer,
    whoCanInviteUser,
    username,
    friends,
    emailAddress,
    whoCanSeeLocation,
    displayFriendCount,
    whoCanSeeFriendsList,
    whoCanSeePhoneNumber,
    whoCanSeeEmailAddress,
    whoCanSeeFacebook,
    whoCanSeeX,
    whoCanSeeInstagram,
    whoCanSeeEventsOrganized,
    whoCanSeeEventsInterestedIn,
    whoCanSeeEventsInvitedTo,
  } = req.body;

  // add document to DB:
  try {
    const existingUserWithSameUsername = await User.findOne({ username: username });
    const existingUserWithSameEmailAddress = await User.findOne({
      emailAddress: emailAddress,
    });

    if (existingUserWithSameUsername && existingUserWithSameEmailAddress) {
      res.statusMessage = "USERNAME & EMAIL TAKEN";
      return res.status(409).end();
    }

    if (existingUserWithSameUsername) {
      res.statusMessage = "USERNAME TAKEN";
      return res.status(409).end();
    }

    if (existingUserWithSameEmailAddress) {
      res.statusMessage = "EMAIL TAKEN";
      return res.status(409).end();
    }

    // Encrypt password:
    /* const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    password = hashedPassword; */

    const user = await User.create({
      _id,
      lastLogin,
      index,
      firstName,
      lastName,
      password,
      city,
      stateProvince,
      country,
      phoneCountry,
      phoneCountryCode,
      phoneNumberWithoutCountryCode,
      instagram,
      facebook,
      x,
      interests,
      about,
      friendRequestsReceived,
      friendRequestsSent,
      blockedUsers,
      whoCanMessage,
      hostingCredits,
      profileImage,
      profileVisibleTo,
      subscriptionType,
      whoCanAddUserAsOrganizer,
      whoCanInviteUser,
      username,
      friends,
      emailAddress,
      whoCanSeeLocation,
      displayFriendCount,
      whoCanSeeFriendsList,
      whoCanSeePhoneNumber,
      whoCanSeeEmailAddress,
      whoCanSeeFacebook,
      whoCanSeeX,
      whoCanSeeInstagram,
      whoCanSeeEventsOrganized,
      whoCanSeeEventsInterestedIn,
      whoCanSeeEventsInvitedTo,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Bad request (invalid id)" });
  }

  const user = await User.findOneAndDelete({ _id: id });

  if (!user) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  res.status(200).json(user);
};

// update user
const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Bad request (invalid id)" });
  }

  // 2nd argument in findOneAndUpdate represents updates we want to make
  const user = await User.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

  if (!user) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  res.status(200).json(user);
};

const getAllUserInterests = async (req, res) => {
  const allUserInterests = await User.find({}, { "interests": 1, "_id": 0 });

  res.status(200).json(allUserInterests);
};

const getInterestUsers = async (req, res) => {
  const { interest, limit, start, user } = req.query;

  const username = user;
  const currentUser = await User.findOne({ username });

  const interestUsers = await User.find({
    index: { $gte: Number(start) },
    _id: { $ne: currentUser._id.toString() },
    blockedUsers: { $nin: currentUser._id.toString() },
    blockedBy: { $nin: currentUser._id.toString() },
    profileVisibleTo: { $ne: "nobody" },
    interests: { $in: interest },
  }).limit(Number(limit));

  res.status(200).json(interestUsers);
};

// export controllers:
module.exports = {
  getInterestUsers,
  getAllUserInterests,
  getUserByUsername,
  getUserByUsernameOrEmailAddress,
  getUserByUsernamePhoneNumberOrEmailAddress,
  createNewUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
};
