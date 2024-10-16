// Handler functions that can be referenced in users.cjs

const mongoose = require("mongoose");

const User = require("../models/userModel");

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
    return res.status(404).json({ error: "User doesn't exist" });
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

// create new user
const createNewUser = async (req, res) => {
  const { firstName, lastName } = req.body;

  // add document to DB:
  try {
    const user = await User.create({ firstName, lastName });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  const user = await User.findOneAndDelete({ _id: id });

  if (!user) {
    return res.status(400).json({ error: "User doesn't exist" });
  }

  res.status(200).json(user);
};

// update user
const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  // 2nd argument in findOneAndUpdate represents updates we want to make
  const user = await User.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

  if (!user) {
    return res.status(400).json({ error: "User doesn't exist" });
  }

  res.status(200).json(user);
};

// export controllers:
module.exports = {
  createNewUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
};
