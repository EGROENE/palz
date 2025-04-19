// Handler functions that can be referenced in users.cjs

const mongoose = require("mongoose");
//import mongoose from "mongoose";

//const bcrypt = require("bcrypt");
//import bcrypt from "bcrypt";

const User = require("../models/userModel");
//import User from "../models/userModel.js";

// get all users:
const getAllUsers = async (req, res) => {
  // leave obj in .find() blank, as all users are being fetched
  // .sort({createdAt: -1}) could be added to sort most recently added to earliest added, for example
  const allUsers = await User.find({});

  res.status(200).json(allUsers);
};

// get single user:
const getUser = async (req, res) => {
  // Get id from request parameters:
  const { id } = req.params;

  // Check that id is a valid MongoDB ObjectId:
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Bad request (invalid id)" });
  }

  // assign user to document in DB that has id that matches the id defined in this method:
  const user = await User.findById(id);

  // If no user document matches...
  if (!user) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  // If there is a match...
  res.status(200).json(user);
};

// login user:
const loginUser = async (req, res) => {
  try {
    const { password } = req.body;

    const username = req.body.username;
    const emailAddress = req.body.emailAddress;

    // Check if the user exists
    const userWithMatchingEmailAddress = req.body.emailAddress
      ? await User.findOne({ emailAddress })
      : undefined;
    const userWithMatchingUsername = req.body.username
      ? await User.findOne({ username })
      : undefined;

    if (!userWithMatchingEmailAddress && !userWithMatchingUsername) {
      res.statusMessage = "User not found";
      return res.status(401).end();
    }

    // Check if the provided password matches the stored password
    if (
      userWithMatchingEmailAddress?.password === password ||
      userWithMatchingUsername?.password === password
    ) {
      if (userWithMatchingUsername) {
        return res.status(200).json({
          message: "Login successful",
          user: {
            username: userWithMatchingUsername.username,
          },
        });
      }
      return res.status(200).json({
        message: "Login successful",
        user: {
          email: userWithMatchingEmailAddress.email,
        },
      });
    } else {
      if (username) {
        res.statusMessage = "Invalid username or password";
        return res.status(401).end();
      }
      if (emailAddress) {
        res.statusMessage = "Invalid e-mail address or password";
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

    if (existingUserWithSameUsername) {
      res.statusMessage = "Username already in use";
      return res.status(409).end();
    }

    if (existingUserWithSameEmailAddress) {
      res.statusMessage = "E-mail address already in use";
      return res.status(409).end();
    }

    // Encrypt password:
    /* const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    password = hashedPassword; */

    const user = await User.create({
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

// export controllers:
module.exports = {
  loginUser,
  createNewUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
};
